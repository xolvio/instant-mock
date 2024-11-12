import { execSync, spawn } from "child_process";
import { format } from "date-fns";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";

dotenv.config();

async function waitForServerReady(containerName: string): Promise<boolean> {
  return new Promise((resolve) => {
    const logs = spawn("docker", ["logs", "-f", containerName]);

    logs.stdout.on("data", (data) => {
      const output = data.toString();
      console.log(output);
      if (output.includes("Server running on")) {
        logs.kill();
        resolve(true);
      }
    });

    logs.stderr.on("data", (data) => console.error(data.toString()));

    setTimeout(() => {
      logs.kill();
      resolve(false);
    }, 30000);
  });
}

function getLatestFixtureTimestamp(): string | null {
  const fixturePath = path.join("test", "e2e", "fixtures");
  if (!fs.existsSync(fixturePath)) {
    return null;
  }

  const directories = fs
    .readdirSync(fixturePath, { withFileTypes: true })
    .filter((dirent) => dirent.isDirectory())
    .map((dirent) => dirent.name)
    .sort()
    .reverse();

  return directories.length > 0 ? directories[0] : null;
}

async function runE2ETests() {
  const mode = process.argv[2] || "test";

  let timestamp: string;
  if (mode === "test") {
    const latestFixture = getLatestFixtureTimestamp();
    if (!latestFixture) {
      throw new Error(
        "No fixtures found. Please run in 'record' mode to create a fixture.",
      );
    }
    timestamp = latestFixture;
    console.log(`Using latest fixture: ${timestamp}`);
  } else {
    timestamp = format(new Date(), "yyyyMMddHHmmss");
    console.log(
      `Creating new fixture for recording with timestamp: ${timestamp}`,
    );
  }

  const fixtureDir = path.join("test", "e2e", "fixtures", timestamp);
  if (mode === "record") {
    fs.mkdirSync(fixtureDir, { recursive: true });
  }

  const envVars = {
    FIXTURE_TIMESTAMP: timestamp,
    ...(mode === "record" && process.env.APOLLO_API_KEY
      ? { APOLLO_API_KEY: process.env.APOLLO_API_KEY }
      : {}),
  };

  try {
    console.log("Starting play server...");
    execSync(
      `docker compose -f docker-compose.e2e.yml up -d instant-mock-e2e-play --build`,
      { stdio: "inherit", env: { ...process.env, ...envVars } },
    );

    const playHealthy = await waitForServerReady("instant-mock-e2e-play");
    if (!playHealthy) {
      throw new Error("Play server failed to start properly");
    }

    if (mode === "record") {
      console.log("Starting record server...");
      execSync(
        `docker compose -f docker-compose.e2e.yml up -d instant-mock-e2e-record --build`,
        { stdio: "inherit", env: { ...process.env, ...envVars } },
      );

      const recordHealthy = await waitForServerReady("instant-mock-e2e-record");
      if (!recordHealthy) {
        throw new Error("Record server failed to start properly");
      }
    }

    const baseUrl =
      mode === "record" ? process.env.RECORD_PORT : process.env.PLAY_PORT;
    console.log(`Running Cypress tests against port ${baseUrl}...`);
    execSync(
      `CYPRESS_BASE_URL=http://localhost:${baseUrl} npx cypress run --spec 'cypress/e2e/basic-functionality.cy.ts'`,
      { stdio: "inherit", env: { ...process.env, ...envVars } },
    );
  } catch (error) {
    console.error("E2E test execution failed:", error);
    process.exit(1);
  } finally {
    console.log("Shutting down Docker containers...");
    execSync("docker-compose -f docker-compose.e2e.yml down", {
      stdio: "inherit",
    });
    console.log("Docker containers shut down.");
    process.exit(0);
  }
}

runE2ETests().catch((error) => {
  console.error("Failed to run E2E tests:", error);
  process.exit(1);
});

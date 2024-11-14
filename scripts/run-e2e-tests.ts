import { execSync, spawn } from "child_process";
import { format } from "date-fns";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";

dotenv.config();

const FIXTURE_BASE_PATH = path.join("test", "e2e", "fixtures");

async function waitForServerReady(containerName: string): Promise<boolean> {
  return new Promise((resolve) => {
    const logs = spawn("docker", ["logs", "-f", containerName]);

    logs.stdout.on("data", (data) => {
      const output = data.toString();
      console.log(output);
      if (output.includes("Server running")) {
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
  if (!fs.existsSync(FIXTURE_BASE_PATH)) {
    return null;
  }

  const directories = fs
    .readdirSync(FIXTURE_BASE_PATH, { withFileTypes: true })
    .filter((dirent) => dirent.isDirectory())
    .map((dirent) => dirent.name)
    .sort()
    .reverse();

  return directories.length > 0 ? directories[0] : null;
}

function setupFixtureDirectory(mode: string): string {
  const timestamp =
    mode === "record"
      ? format(new Date(), "yyyyMMddHHmmss")
      : getLatestFixtureTimestamp();

  if (!timestamp) {
    throw new Error(
      "No fixtures found. Please run in 'record' mode to create a fixture.",
    );
  }

  const fixtureDir = path.join(FIXTURE_BASE_PATH, timestamp);

  if (mode === "record") {
    fs.mkdirSync(fixtureDir, { recursive: true });
  }

  console.log(
    `${mode === "record" ? "Creating" : "Using"} fixture: ${timestamp}`,
  );
  return timestamp;
}

function startDockerService(service: string, envVars: NodeJS.ProcessEnv) {
  console.log(`Starting ${service} server...`);
  execSync(
    `docker compose -f docker-compose.e2e.yml up -d ${service} --build`,
    { stdio: "inherit", env: { ...process.env, ...envVars } },
  );
}

async function runTests(mode: string, timestamp: string) {
  const baseEnvVars = { FIXTURE_TIMESTAMP: timestamp };

  // Start the play server in both modes, with additional APOLLO_API_KEY in record mode
  const playEnvVars =
    mode === "record" && process.env.APOLLO_API_KEY
      ? { ...baseEnvVars, APOLLO_API_KEY: process.env.APOLLO_API_KEY }
      : baseEnvVars;

  startDockerService("instant-mock-e2e-play", playEnvVars);
  const playHealthy = await waitForServerReady("instant-mock-e2e-play");
  if (!playHealthy) {
    throw new Error("Play server failed to start properly");
  }

  // Additional setup for 'record' and 'test' modes
  if (mode === "record") {
    startDockerService("instant-mock-e2e-record", baseEnvVars);
    const recordHealthy = await waitForServerReady("instant-mock-e2e-record");
    if (!recordHealthy) {
      throw new Error("Record server failed to start properly");
    }
  } else if (mode === "test") {
    startDockerService("instant-mock-e2e-test", baseEnvVars);
    const testHealthy = await waitForServerReady("instant-mock-e2e-test");
    if (!testHealthy) {
      throw new Error("Test server failed to start properly");
    }
  }

  // Determine Cypress base URL based on mode
  const baseUrl =
    mode === "record" ? process.env.RECORD_PORT : process.env.TEST_PORT;
  console.log(`Running Cypress tests against port ${baseUrl}...`);
  execSync(
    `CYPRESS_BASE_URL=http://localhost:${baseUrl} npx cypress run --spec 'cypress/e2e/basic-functionality.cy.ts'`,
    { stdio: "inherit", env: { ...process.env, ...baseEnvVars } },
  );
}

function shutdownDocker() {
  console.log("Shutting down Docker containers...");
  execSync("docker compose -f docker-compose.e2e.yml down", {
    stdio: "inherit",
  });
  console.log("Docker containers shut down.");
}

async function main() {
  const mode = process.argv[2] || "test";

  try {
    const timestamp = setupFixtureDirectory(mode);
    await runTests(mode, timestamp);
  } catch (error) {
    console.error("E2E test execution failed:", error);
    process.exit(1);
  } finally {
    shutdownDocker();
    process.exit(0);
  }
}

main().catch((error) => {
  console.error("Failed to run E2E tests:", error);
  process.exit(1);
});

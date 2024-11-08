import { execSync } from "child_process";
import { format } from "date-fns";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";

dotenv.config();

const mode = process.argv[2] || 'test';
const timestamp = format(new Date(), "yyyyMMddHHmmss");
const fixtureDir = path.join("test", "e2e", "fixtures", timestamp);

fs.mkdirSync(fixtureDir, { recursive: true });

const env = [
    `FIXTURE_TIMESTAMP=${timestamp}`,
    mode === 'record' && process.env.APOLLO_API_KEY
        ? `APOLLO_API_KEY=${process.env.APOLLO_API_KEY}`
        : "",
].filter(Boolean).join(" ");

console.log(`Mode: ${mode}`);
console.log(`Using fixture timestamp: ${timestamp}`);
console.log(`Fixture directory: ${fixtureDir}`);

try {
    if (mode === 'record') {
        execSync(
            `${env} docker-compose -f docker-compose.e2e.yml up -d instant-mock-e2e-record`,
            { stdio: "inherit" }
        );
        execSync("cypress run --config baseUrl=http://localhost:3035", {
            stdio: "inherit",
        });
    } else {
        execSync(
            `${env} docker-compose -f docker-compose.e2e.yml up -d instant-mock-e2e-play instant-mock-e2e-test`,
            { stdio: "inherit" }
        );
        execSync("cypress run --config baseUrl=http://localhost:3036", {
            stdio: "inherit",
        });
    }
} catch (error) {
    console.error("E2E test execution failed:", error);
    process.exit(1);
} finally {
    execSync("docker-compose -f docker-compose.e2e.yml down", {
        stdio: "inherit",
    });
}

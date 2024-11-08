import { defineConfig } from "cypress";

export default defineConfig({
  e2e: {
    setupNodeEvents(on, config) {
      on("before:run", () => {
        console.log("Before running tests");
      });
      return config;
    },
    specPattern: "cypress/e2e/**/*.cy.ts",
    baseUrl: "http://localhost:3033",
  },
});

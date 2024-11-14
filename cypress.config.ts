import { defineConfig } from "cypress";

export default defineConfig({
  e2e: {
    setupNodeEvents(on, config) {
      on("task", {
        log(message) {
          console.log(message);
          return null;
        },
      });
      return config;
    },
    specPattern: "cypress/e2e/**/*.cy.ts",
    chromeWebSecurity: false,
    viewportWidth: 1280,
    viewportHeight: 800,
    defaultCommandTimeout: 10000,
    requestTimeout: 10000,
    supportFile: false,
  },
});

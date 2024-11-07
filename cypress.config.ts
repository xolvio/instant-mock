import {defineConfig} from "cypress";

export default defineConfig({
  e2e: {
    setupNodeEvents(on, config) {
      // Example: setting up a custom plugin
      on('before:run', () => {
        console.log("Before running tests");
      });

      // Optionally, you could return the updated config
      return config;
    },
    specPattern: "cypress/e2e/**/*.cy.ts", // set up spec file pattern with TypeScript
    baseUrl: "http://localhost:3000", // set your app's base URL
  },
});

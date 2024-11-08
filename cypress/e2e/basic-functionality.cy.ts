import "cypress-iframe";

describe("InstantMock Basic Tests", () => {
  beforeEach(() => {
    cy.task("log", "Starting test setup...");
    cy.visit("/");
    cy.intercept("GET", "**/api/seedGroups").as("seedGroups");
    cy.intercept("GET", "**/api/graphs").as("graphs");
    cy.task("log", "Intercepts set up");
  });

  it("verifies Apollo Studio iframe loads and can interact with specific editors", () => {
    cy.task("log", "STARTING IFRAME VERIFICATION AND LOGGING");

    cy.wait(["@seedGroups", "@graphs"]).then(() => {
      cy.task("log", "Network requests completed");
    });

    cy.get("#graph-select", { timeout: 3000 })
      .should("be.visible")
      .click()
      .then(() => cy.task("log", "Graph select clicked successfully"));

    cy.contains('div[role="option"]', "Instant Mock Test", { timeout: 3000 })
      .should("be.visible")
      .click()
      .then(() => cy.task("log", "Selected Instant Mock Test"));

    // Find and log the iframe, ensuring it has loaded
    cy.get("iframe")
      .should("exist")
      .then((iframe) => {
        cy.task("log", `Iframe found with src: ${iframe.prop("src")}`);
      });

    // Wait for iframe to be ready and check for textarea presence within iframe
    cy.iframe()
      .find("textarea", { timeout: 3000 })
      .should("be.visible")
      .then((textareas) => {
        cy.task("log", `Found ${textareas.length} textareas in iframe.`);

        // Log each textarea and attempt typing
        textareas.each((index, textarea) => {
          cy.wrap(textarea)
            .type(`Sample text ${index}`, { force: true })
            .then(() =>
              cy.task("log", `Typed into textarea #${index} in iframe.`),
            );
        });
      });
  });
});

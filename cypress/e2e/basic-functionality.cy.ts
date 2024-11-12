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

    cy.wait(6000);

    cy.iframe()
      .find("textarea", { timeout: 3000 })
      .then((textareas) => {
        cy.task("log", `Found ${textareas.length} textareas in iframe.`);
        expect(textareas.length).to.eq(
          4,
          "Expected 4 textareas to be found in the iframe.",
        );

        // TODO: make this not so flaky lol -- we are relying on monaco in
        // an iframe's curly brace autocomplete strategy
        textareas.each((index, textarea) => {
          if (index === 1)
            cy.wrap(textarea)
              .type(Cypress.platform === "darwin" ? "{cmd}a" : "{ctrl}a", {
                force: true,
              })
              .type(
                `query Product($productId: ID!) {
product(id: $productId) {
  name
  package
}`, // TODO: add a curly here when we arent relying on typing in monaco
                { force: true },
              )
              .then(() => cy.task("log", `Typed operation into textarea`));
          if (index === 2)
            cy.wrap(textarea)
              .clear({ force: true })
              .type(
                `{
  "productId": "1"`,
                { force: true },
              )
              .then(() => cy.task("log", `Typed variables into textarea`));
        });
      });

    cy.wait(1000);

    cy.iframe()
      .find('[data-testid="run_operation_button"]')
      .should("be.visible") // Ensure the button is visible
      .click({ force: true })
      .then(() => cy.task("log", `Clicked Run Operation button`));

    cy.wait(1000);

    cy.get("#create-seed-from-response")
      .should("be.visible")
      .click()
      .then(() => cy.task("log", `Clicked Create Seed From Response button`));

    cy.get('[name="seedResponse"]').clear().type(`{
  "data": {
    "product": {
      "name": "Goodbye World",
      "package": "Goodbye World Again!",
      "__typename": "Product"
    },
    "__typename": "Query"
  }
}`);

    cy.get("#save-seed-button")
      .should("be.visible")
      .click()
      .then(() => cy.task("log", `Clicked Save Seed button`));

    cy.get('button[role="tab"]')
      .contains("SANDBOX")
      .click()
      .then(() => cy.task("log", "clicked sandbox tab button"));
  });
});

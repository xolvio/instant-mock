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

    cy.wait(["@seedGroups", "@graphs"], { timeout: 15000 }).then(() => {
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

    cy.wait(15000);

    cy.iframe()
      .find("textarea", { timeout: 3000 })
      .then((textareas) => {
        cy.task("log", `Found ${textareas.length} textareas in iframe.`);
        expect(textareas.length).to.eq(
          4,
          "Expected 4 textareas to be found in the iframe.",
        );

        // Log each textarea and attempt typing
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
}`,
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

    const seedResponse = `{
  "data": {
    "product": {
      "name": "Goodbye World",
      "package": "Goodbye World Again!",
      "__typename": "Product"
    },
    "__typename": "Query"
  }
}`;
    cy.get('[name="seedResponse"]').clear().type(seedResponse);

    cy.get("#save-seed-button")
      .should("be.visible")
      .click()
      .then(() => cy.task("log", `Clicked Save Seed button`));

    cy.get('button[role="tab"]')
      .contains("SANDBOX")
      .click()
      .then(() => cy.task("log", "clicked sandbox tab button"));

    cy.wait(6000);

    cy.iframe()
      .find('[data-testid="run_operation_button"]')
      .should("be.visible") // Ensure the button is visible
      .click({ force: true })
      .then(() => cy.task("log", `Clicked Run Operation button again`));

    cy.wait(1000);

    // Assuming iframe is loaded and accessible

    // Access the iframe content
    cy.get("iframe").then(($iframe) => {
      const doc = $iframe.contents();

      // Select all .view-line elements within the iframe
      cy.wrap(doc)
        .find('div[data-testid="result_pane"] .view-lines .view-line')
        .then(($lines) => {
          const actualResponseText = Array.from($lines)
            .map((line) => line.innerText)
            .join("")
            .replace(/\u00A0/g, " ")
            .replace(/\s+/g, " ");

          const actualResponseJson = JSON.parse(actualResponseText);
          const expectedResponseJson = JSON.parse(seedResponse);

          cy.task(
            "log",
            `Actual response JSON is: ${JSON.stringify(actualResponseJson)}`,
          );
          expect(actualResponseJson).to.deep.equal(expectedResponseJson);
        });
    });
  });
});

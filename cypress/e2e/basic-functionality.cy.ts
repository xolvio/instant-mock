import "cypress-iframe";

describe("InstantMock Basic Tests", () => {
  beforeEach(() => {
    cy.task("log", "Visiting the main page...");
    cy.visit("/");
    cy.intercept("GET", "**/api/seedGroups").as("seedGroups");
    cy.intercept("GET", "**/api/graphs").as("graphs");
  });

  it("verifies Apollo Studio iframe loads and logs valuable information", () => {
    cy.task("log", "STARTING IFRAME VERIFICATION AND LOGGING");

    // Wait for the network requests to complete
    cy.wait(["@seedGroups", "@graphs"]);

    // Confirm that the main container is visible
    cy.get(".studio-2iiqpx", { timeout: 15000 }).should("be.visible");

    // Additional wait to ensure the iframe content is fully loaded
    cy.wait(15000);

    // Access the iframe and find all textareas with data-mprt="6"
    cy.iframe()
      .find('textarea[data-mprt="6"]')
      .then(($textareas) => {
        cy.task(
          "log",
          `Found ${$textareas.length} textareas with data-mprt="6"`,
        );

        // Loop through each textarea and log details
        $textareas.each((index, textarea) => {
          const $textarea = Cypress.$(textarea); // Wrap in Cypress to use jQuery methods

          // Log properties of each textarea
          cy.task("log", `Textarea ${index + 1}:`);
          cy.task("log", `  Class: ${textarea.className}`);
          cy.task("log", `  Visible: ${$textarea.is(":visible")}`);
          cy.task(
            "log",
            `  Dimensions: ${$textarea.width()}x${$textarea.height()}`,
          );
          cy.task("log", `  Placeholder: ${textarea.placeholder || "N/A"}`);
          cy.task(
            "log",
            `  Aria Label: ${textarea.getAttribute("aria-label")}`,
          );

          //TODO: first click on Instant Mock Test graph, and then type a products query, and type some arguments, and then create a seed, assert seed button appears, and then assert that seeds ui is working
          //
          //TODO: once this journey is complete running directly (npm run cypress;basic) we then need to 1/ run in RECORD mode, and then run in TEST mode to see if the instant mock PLAY server is correctly sending mocked apollo platform api respojsese and if it is we can port to GITHUB ACTIONS for that to run, based on fixtures folder, in CI
          //

          // // Try typing with parseSpecialCharSequences disabled
          // if ($textarea.is(":visible")) {
          //   cy.wrap($textarea).type("query ExampleQuery { id }", {
          //     delay: 100,
          //     force: true,
          //     parseSpecialCharSequences: false, // Prevent Cypress from interpreting {}
          //   });
          //   cy.task("log", `Typed into Textarea ${index + 1}`);
          // } else {
          //   cy.task(
          //     "log",
          //     `Textarea ${index + 1} is not visible, skipping typing`,
          //   );
          // }
        });
      });
  });
});

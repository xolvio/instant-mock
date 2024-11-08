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
        cy.get(".studio-2iiqpx", {timeout: 15000}).should("be.visible");
        // Open the popover by clicking the button
        // Open the select dropdown by clicking on the trigger

        cy.wait(1000);
        cy.get('#graph-select') // Adjust the selector if necessary
            .click();

        // Locate the select item with text "swagshop" and click it
        cy.contains('div[role="option"]', 'Instant Mock Test') // Find the item with the text "swagshop"
            .should('be.visible') // Ensure it's visible
            .click();

        // Additional wait to ensure the iframe content is fully loaded
        cy.wait(15000);

        // Access the iframe and find all textareas with data-mprt="6"
        cy.iframe()
            .find('textarea[data-mprt="6"]')
            .then(($textareas) => {
                $textareas.each((index, textarea) => {
                    // const $textarea = Cypress.$(textarea);
                    // TODO this is bad, but I couldn't make first() work
                    cy.task("log", `Index is: ${index}`);
                    cy.wrap(textarea)
                        .clear({force: true})
                        .type("query AllProducts { allProducts { name sku id } }", {
                            force: true,
                            parseSpecialCharSequences: false,
                        })
                });
            });

        cy.wait(4000);

        // After typing, find and click the button inside the iframe
        cy.iframe()
            .find('[data-testid="run_operation_button"]')
            .should("be.visible") // Ensure the button is visible
            .click({force: true}); // Click the button with force if needed

        // TODO wait until the response div is not empty, this is not ideal
        cy.wait(1000);

        cy.get('#create-seed-from-response')
            .should('be.visible')
            .click()

        cy.get('#save-seed-button')
            .should('be.visible')
            .click()
    });
});

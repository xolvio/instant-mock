describe('Component Test Suite', () => {
    beforeEach(() => {
        // Visit the main page where the component is mounted
        cy.visit('/');
    });

    it('should render the component correctly', () => {
        // Assert that the component renders and contains expected text/content

        cy.get('#graph-select', { timeout: 10000 }).should('be.visible').click();
    });

});

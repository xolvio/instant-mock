describe("Home Component Test Suite", () => {
  beforeEach(() => {
    cy.visit("/");
  });

  it("should render the component correctly", () => {
    cy.get("#graph-select", { timeout: 10000 }).should("be.visible").click();
    cy.get("#variant-select").should("be.visible");
    cy.contains("SANDBOX").should("be.visible");
    cy.contains("SEEDS").should("be.visible");
    cy.contains("NARRATIVES").should("be.visible");
  });

  it("should allow switching tabs", () => {
    cy.contains("SEEDS").click();
    cy.contains("Create new seed").should("be.visible");
    cy.contains("NARRATIVES").click();
    cy.contains("Get more from InstantMock").should("be.visible");
    cy.contains("SANDBOX").click();
    cy.get(".studio-2iiqpx", { timeout: 10000 }).should("be.visible");
  });

  it("should handle graph and variant selection", () => {
    cy.get("#graph-select", { timeout: 10000 }).click();
    cy.get(".SelectItem").should("have.length.greaterThan", 0).first().click();

    cy.get("#variant-select").click();
    cy.get(".SelectItem").should("have.length.greaterThan", 0).first().click();
  });

  it("should open the Create Seed dialog", () => {
    cy.contains("SEEDS").click();
    cy.get(".CreateSeedButton", { timeout: 10000 })
      .should("be.visible")
      .click();
    cy.contains("Operation name").should("be.visible");
    cy.contains("Response (JSON)").should("be.visible");
  });

  it("should populate the form with operation details", () => {
    cy.get('input[placeholder="Operation name..."]').type("TestOperation");
    cy.get('textarea[placeholder="Matching arguments ..."]').type(
      '{"arg1": "value1"}',
    );
    cy.get('textarea[placeholder="Response..."]').type(
      '{"data": "test response"}',
    );
    cy.contains("Save seed").click();
    cy.contains("Seed Created Successfully!").should("be.visible");
  });

  it("should add a new seed group", () => {
    cy.get("#seed-group-select", { timeout: 10000 }).click();
    cy.contains("Add new seed group").click();
    cy.get('input[id="name"]').type("New Seed Group");
    cy.contains("Add Group").click();
    cy.contains("New seed group added successfully!").should("be.visible");
    cy.get("#seed-group-select").click();
    cy.contains("New Seed Group").should("be.visible");
  });
});

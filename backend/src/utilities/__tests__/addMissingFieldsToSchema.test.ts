// @ts-nocheck
import {
  buildASTSchema,
  buildSchema,
  GraphQLSchema,
  parse,
  print,
  printSchema,
} from 'graphql';
import {
  addMissingFieldsToSchemaWithVisitor,
  createProposedSubgraphsFromOperationsMissingFields,
  findSubgraphForMissingTypes,
  MissingFieldInfo,
} from '../operationToSchema';

describe('addMissingFieldsToSchemaWithVisitor', () => {
  const schemaString1 = `
    scalar FieldSet
    directive @key(fields: FieldSet!, resolvable: Boolean = true) repeatable on OBJECT | INTERFACE

    type Query {
      product: Product
    }

    type Product @key(fields:"id"){
      id: String
      name: String
    }
  `;

  const schemaString2 = `
    type Query {
      category: Category
    }

    type Category {
      id: String
      title: String
    }
  `;

  const schema1 = buildASTSchema(parse(schemaString1));
  const schema2 = buildASTSchema(parse(schemaString2));

  const subgraph1 = {name: 'subgraph1', schema: schema1};
  const subgraph2 = {name: 'subgraph2', schema: schema2};

  it('should successfully add missing fields and new types', () => {
    const missingFields: Array<MissingFieldInfo> = [
      {
        parentTypeName: 'Product',
        fieldName: 'price',
        hasGeneratedParentType: false,
      },
      {
        parentTypeName: 'Category',
        fieldName: 'description',
        hasGeneratedParentType: true,
      },
    ];

    const updatedSubgraph = addMissingFieldsToSchemaWithVisitor(
      subgraph1,
      missingFields
    );

    expect(print(parse(updatedSubgraph.updatedSchemaString))).toEqual(
      print(
        parse(`
      scalar FieldSet

      directive @key(fields: FieldSet!, resolvable: Boolean = true) repeatable on OBJECT | INTERFACE

      type Query {
        product: Product
      }

      type Product @key(fields:"id"){
        id: String
        name: String
        price: String
      }

      type Category {
        description: String
      }
    `)
      )
    );
  });

  it('should not create new types when hasGeneratedParentType is false (Fail Test)', () => {
    const missingFields: Array<MissingFieldInfo> = [
      {
        parentTypeName: 'NonExistentType',
        fieldName: 'someField',
        hasGeneratedParentType: false,
      },
    ];

    const updatedSubgraph = addMissingFieldsToSchemaWithVisitor(
      subgraph1,
      missingFields
    );
    const expectedSchemaString = `
      type Query {
        product: Product
      }

      type Product {
        id: String
        name: String
      }
    `;

    expect(updatedSubgraph.updatedSchemaString.trim()).toBe(
      printSchema(buildASTSchema(parse(expectedSchemaString))).trim()
    );
  });

  it('should return the subgraph and grouped missing fields', () => {
    const missingFields = [
      {
        parentTypeName: 'Product',
        fieldName: 'theNewField',
        hasGeneratedParentType: false,
      },
      {
        parentTypeName: 'Category',
        fieldName: 'newCategoryField',
        hasGeneratedParentType: false,
      },
      {
        parentTypeName: 'NonExistentType',
        fieldName: 'someField',
        hasGeneratedParentType: true,
      },
    ];

    const result = findSubgraphForMissingTypes(
      [subgraph1, subgraph2],
      missingFields
    );

    // Assert that the result contains the correct subgraphs and missing fields mapping
    expect(result.length).toBe(2); // Assuming 'Product' and 'Category' exist in different subgraphs

    const [firstMapping, secondMapping] = result;
    expect(Array.isArray(firstMapping.missingFields)).toBe(true);
  });

  it('should return updated subgraph inputs with missing fields added, including the use of a supergraph', () => {
    // Step 1: Set up the input data

    // Define two sample subgraphs
    const subgraph1Schema: GraphQLSchema = buildSchema(`
      type Query {
        product: Product
      }

      type Product {
        id: ID!
        name: String
      }
    `);

    const subgraph2Schema: GraphQLSchema = buildSchema(`
      type Query {
        category: Category
      }

      type Category {
        id: ID!
        name: String
      }
    `);

    // Combine subgraph SDLs to create a supergraph SDL
    const supergraphSDL = `
      type Query {
        product: Product
        category: Category
      }

      type Product {
        id: ID!
        name: String
      }

      type Category {
        id: ID!
        name: String
      }
    `;
    const supergraph: GraphQLSchema = buildSchema(supergraphSDL);

    const subgraphs = [
      {name: 'subgraph1', schema: subgraph1Schema},
      {name: 'subgraph2', schema: subgraph2Schema},
    ];

    // Define an operation that includes fields not currently in the schema
    const operation = `
      query GetProductAndCategory {
        product {
          id
          name
          description
        }
        category {
          id
          name
          summary
        }
      }
    `;

    // Step 2: Call the function
    const result = createProposedSubgraphsFromOperationsMissingFields(
      supergraph,
      subgraphs,
      operation
    );

    // Step 3: Expected output
    const expectedOutput = [
      {
        name: 'subgraph1',
        activePartialSchema: {
          sdl: expect.stringContaining(`
            type Query {
              product: Product
            }

            type Product {
              id: ID!
              name: String
              description: String
            }
          `),
        },
      },
      {
        name: 'subgraph2',
        activePartialSchema: {
          sdl: expect.stringContaining(`
            type Query {
              category: Category
            }

            type Category {
              id: ID!
              name: String
              summary: String
            }
          `),
        },
      },
    ];

    // Step 4: Assertions
    expect(result).toHaveLength(2);
    expect(result).toEqual(expect.arrayContaining(expectedOutput));
  });
});

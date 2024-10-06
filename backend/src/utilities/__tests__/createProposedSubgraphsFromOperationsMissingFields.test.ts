import {buildASTSchema, parse} from 'graphql';
import {createProposedSubgraphsFromOperationsMissingFields} from '../operationToSchema';

describe('createProposedSubgraphsFromOperationsMissingFields', () => {
  it('should successfully add missing fields even when arguments are present on existing parent field', () => {
    const supergraph = buildASTSchema(
      parse(`
      schema {
        query: Query
      }

      type Product {
        id: ID!
        sku: String
        name: String
        package: String
        createdBy: User
        hidden: String
        reviewsScore: Float!
        oldField: String
      }

      type Query {
        allProducts: [Product]
        product(id: ID!): Product
        users: [User]
        user(billingAccountNumber: String!): User
      }

      type User {
        email: ID!
        billingAccountNumber: String!
        name: String
        amountDue: Float
        balance: Float
      }
    `)
    );

    const subgraphs = [
      {
        name: 'users',
        schema: buildASTSchema(
          parse(
            `schema @link(url: "https://specs.apollo.dev/federation/v2.7", import: ["@key"]) {
            query: Query
          }

          directive @link(url: String!, as: String, for: link__Purpose, import: [link__Import]) repeatable on SCHEMA

          directive @key(fields: FieldSet!, resolvable: Boolean = true) repeatable on OBJECT | INTERFACE

          scalar FieldSet

          scalar link__Import

          enum link__Purpose {
            """
            \`SECURITY\` features provide metadata necessary to securely resolve fields.
            """
            SECURITY
            """
            \`EXECUTION\` features provide metadata necessary for operation execution.
            """
            EXECUTION
          }

          type Query {
            users: [User]
            user(billingAccountNumber: String!): User
          }

          type User @key(fields: "email") {
            email: ID!
            billingAccountNumber: String!
            name: String
            amountDue: Float
            balance: Float
          }`
          )
        ),
      },
      {
        name: 'products',
        schema: buildASTSchema(
          parse(
            `schema @link(url: "https://specs.apollo.dev/federation/v2.7", import: ["@key"]) {
            query: Query
          }

          directive @link(url: String!, as: String, for: link__Purpose, import: [link__Import]) repeatable on SCHEMA

          directive @key(fields: FieldSet!, resolvable: Boolean = true) repeatable on OBJECT | INTERFACE

          scalar FieldSet

          scalar link__Import

          enum link__Purpose {
            """
            \`SECURITY\` features provide metadata necessary to securely resolve fields.
            """
            SECURITY
            """
            \`EXECUTION\` features provide metadata necessary for operation execution.
            """
            EXECUTION
          }

          type Query {
            allProducts: [Product]
            product(id: ID!): Product
          }

          type Product {
            id: ID!
            sku: String
            name: String
            package: String
            createdBy: User
            hidden: String
            reviewsScore: Float!
            oldField: String
          }

          type User @key(fields: "email", resolvable: false) {
            email: ID!
          }`
          )
        ),
      },
    ];

    const operation = `query SwagShopExperience {
                        product(id:"foo") {
                            image 
                            foo
                            happy
                            fun
                        }
                    }`;

    const result = createProposedSubgraphsFromOperationsMissingFields(
      supergraph,
      subgraphs,
      operation
    );

    expect(result).toEqual([
      {
        name: 'products',
        activePartialSchema: {
          sdl: `schema @link(url: "https://specs.apollo.dev/federation/v2.7", import: ["@key"]) {
  query: Query
}

type Query {
  allProducts: [Product]
  product(id: ID!): Product
}

type Product {
  id: ID!
  sku: String
  name: String
  package: String
  createdBy: User
  hidden: String
  reviewsScore: Float!
  oldField: String
  image: String
  foo: String
  happy: String
  fun: String
}

type User @key(fields: "email", resolvable: false) {
  email: ID!
}`,
        },
      },
    ]);
  });

  it('should successfully add missing fields to root query', () => {
    const supergraph = buildASTSchema(
      parse(`
      schema {
        query: Query
      }

      type Query {
        product: Product
      }

      type Product {
        id: ID!
      }
    `)
    );

    const subgraphs = [
      {
        name: 'products',
        schema: buildASTSchema(
          parse(`
          schema {
            query: Query
          }

          type Query {
            product: Product
          }

          type Product {
            id: ID!
          }
        `)
        ),
      },
    ];

    const operation = `
      query GetProduct {
        product {
          name
        }
      }
    `;

    const result = createProposedSubgraphsFromOperationsMissingFields(
      supergraph,
      subgraphs,
      operation
    );

    expect(result).toEqual([
      {
        name: 'products',
        activePartialSchema: {
          sdl: `schema {
  query: Query
}

type Query {
  product: Product
}

type Product {
  id: ID!
  name: String
}`,
        },
      },
    ]);
  });

  it('should successfully multiple levels of nested types', () => {
    const supergraph = buildASTSchema(
      parse(`
      schema {
        query: Query
      }

      type Query {
        product: Product
      }

      type Product {
        id: ID!
      }
    `)
    );

    const subgraphs = [
      {
        name: 'products',
        schema: buildASTSchema(
          parse(`
          schema {
            query: Query
          }

          type Query {
            product: Product
          }

          type Product {
            id: ID!
          }
        `)
        ),
      },
    ];

    const operation = `
      query GetProduct {
        new {
          nested {
            andMoreNesting {
              andEvenMore
            }
          } 
        }
      }
    `;

    const result = createProposedSubgraphsFromOperationsMissingFields(
      supergraph,
      subgraphs,
      operation
    );

    expect(result).toEqual([
      {
        name: 'products',
        activePartialSchema: {
          sdl: `schema {
  query: Query
}

type Query {
  product: Product
  new: New
}

type Product {
  id: ID!
}

type New {
  nested: Nested
}

type Nested {
  andMoreNesting: AndMoreNesting
}

type AndMoreNesting {
  andEvenMore: String
}`,
        },
      },
    ]);
  });
});

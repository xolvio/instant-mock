import {buildASTSchema, parse} from 'graphql';
import {
  createProposedSubgraphsFromOperationsMissingFields,
  MissingFieldInfo,
} from '../operationToSchema';

describe('createProposedSubgraphsFromOperationsMissingFields', () => {
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
          'schema @link(url: "https://specs.apollo.dev/federation/v2.7", import: ["@key"]) {\n  query: Query\n}\n\ndirective @link(url: String!, as: String, for: link__Purpose, import: [link__Import]) repeatable on SCHEMA\n\ndirective @key(fields: FieldSet!, resolvable: Boolean = true) repeatable on OBJECT | INTERFACE\n\nscalar FieldSet\n\nscalar link__Import\n\nenum link__Purpose {\n  """\n  `SECURITY` features provide metadata necessary to securely resolve fields.\n  """\n  SECURITY\n  """\n  `EXECUTION` features provide metadata necessary for operation execution.\n  """\n  EXECUTION\n}\n\ntype Query {\n  users: [User]\n  user(billingAccountNumber: String!): User\n}\n\ntype User @key(fields: "email") {\n  email: ID!\n  billingAccountNumber: String!\n  name: String\n  amountDue: Float\n  balance: Float\n}'
        )
      ),
    },
    {
      name: 'products',
      schema: buildASTSchema(
        parse(
          'schema @link(url: "https://specs.apollo.dev/federation/v2.7", import: ["@key"]) {\n  query: Query\n}\n\ndirective @link(url: String!, as: String, for: link__Purpose, import: [link__Import]) repeatable on SCHEMA\n\ndirective @key(fields: FieldSet!, resolvable: Boolean = true) repeatable on OBJECT | INTERFACE\n\nscalar FieldSet\n\nscalar link__Import\n\nenum link__Purpose {\n  """\n  `SECURITY` features provide metadata necessary to securely resolve fields.\n  """\n  SECURITY\n  """\n  `EXECUTION` features provide metadata necessary for operation execution.\n  """\n  EXECUTION\n}\n\ntype Query {\n  allProducts: [Product]\n  product(id: ID!): Product\n}\n\ntype Product {\n  id: ID!\n  sku: String\n  name: String\n  package: String\n  createdBy: User\n  hidden: String\n  reviewsScore: Float!\n  oldField: String\n}\n\ntype User @key(fields: "email", resolvable: false) {\n  email: ID!\n}'
        )
      ),
    },
  ];

  const operation =
    'query SwagShopExperience {\n    product(id:"foo") {\n        image \n        foo\n        happy\n        fun\n    }\n}';

  it('should successfully add missing fields and new types (Pass Test)', () => {
    const result = createProposedSubgraphsFromOperationsMissingFields(
      supergraph,
      subgraphs,
      operation
    );
    expect(result).toEqual([
      {
        name: 'products',
        activePartialSchema: {
          sdl: 'schema @link(url: "https://specs.apollo.dev/federation/v2.7", import: ["@key"]) {\n  query: Query\n}\n\ntype Query {\n  allProducts: [Product]\n  product(id: ID!): Product\n}\n\ntype Product {\n  id: ID!\n  sku: String\n  name: String\n  package: String\n  createdBy: User\n  hidden: String\n  reviewsScore: Float!\n  oldField: String\n  image: String\n  foo: String\n  happy: String\n  fun: String\n}\n\ntype User @key(fields: "email", resolvable: false) {\n  email: ID!\n}',
        },
      },
    ]);
  });
});

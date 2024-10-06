// import {buildASTSchema, parse} from 'graphql';
// import {
//   createProposedSubgraphsFromOperationsMissingFields,
//   MissingFieldInfo,
// } from '../operationToSchema';
//
// describe('createProposedSubgraphsFromOperationsMissingFields', () => {
//   const supergraph = buildASTSchema(
//     parse(`
//       schema {
//         query: Query
//       }
//
//       type Product {
//         id: ID!
//         sku: String
//         name: String
//         package: String
//         createdBy: User
//         hidden: String
//         reviewsScore: Float!
//         oldField: String
//       }
//
//       type Query {
//         allProducts: [Product]
//         product(id: ID!): Product
//         users: [User]
//         user(billingAccountNumber: String!): User
//       }
//
//       type User {
//         email: ID!
//         billingAccountNumber: String!
//         name: String
//         amountDue: Float
//         balance: Float
//       }
//     `)
//   );
//
//   const subgraphs = [
//     {
//       name: 'users',
//       schema: buildASTSchema(
//         parse(
//           'schema @link(url: "https://specs.apollo.dev/federation/v2.7", import: ["@key"]) {\n  query: Query\n}\n\ndirective @link(url: String!, as: String, for: link__Purpose, import: [link__Import]) repeatable on SCHEMA\n\ndirective @key(fields: FieldSet!, resolvable: Boolean = true) repeatable on OBJECT | INTERFACE\n\nscalar FieldSet\n\nscalar link__Import\n\nenum link__Purpose {\n  """\n  `SECURITY` features provide metadata necessary to securely resolve fields.\n  """\n  SECURITY\n  """\n  `EXECUTION` features provide metadata necessary for operation execution.\n  """\n  EXECUTION\n}\n\ntype Query {\n  users: [User]\n  user(billingAccountNumber: String!): User\n}\n\ntype User @key(fields: "email") {\n  email: ID!\n  billingAccountNumber: String!\n  name: String\n  amountDue: Float\n  balance: Float\n}'
//         )
//       ),
//     },
//     {
//       name: 'products',
//       schema: buildASTSchema(
//         parse(
//           'schema @link(url: "https://specs.apollo.dev/federation/v2.7", import: ["@key"]) {\n  query: Query\n}\n\ndirective @link(url: String!, as: String, for: link__Purpose, import: [link__Import]) repeatable on SCHEMA\n\ndirective @key(fields: FieldSet!, resolvable: Boolean = true) repeatable on OBJECT | INTERFACE\n\nscalar FieldSet\n\nscalar link__Import\n\nenum link__Purpose {\n  """\n  `SECURITY` features provide metadata necessary to securely resolve fields.\n  """\n  SECURITY\n  """\n  `EXECUTION` features provide metadata necessary for operation execution.\n  """\n  EXECUTION\n}\n\ntype Query {\n  allProducts: [Product]\n  product(id: ID!): Product\n}\n\ntype Product {\n  id: ID!\n  sku: String\n  name: String\n  package: String\n  createdBy: User\n  hidden: String\n  reviewsScore: Float!\n  oldField: String\n}\n\ntype User @key(fields: "email", resolvable: false) {\n  email: ID!\n}'
//         )
//       ),
//     },
//   ];
//
//   const operation =
//     'query SwagShopExperience {\n    product(id:"foo") {\n        image \n        foo\n        happy\n        fun\n    }\n}';
//
//   it('should successfully add missing fields and new types (Pass Test)', () => {
//     const result = createProposedSubgraphsFromOperationsMissingFields(
//       supergraph,
//       subgraphs,
//       operation
//     );
//     expect(result).toEqual([
//       {
//         name: 'products',
//         activePartialSchema: {
//           sdl: 'schema @link(url: "https://specs.apollo.dev/federation/v2.7", import: ["@key"]) {\n  query: Query\n}\n\ntype Query {\n  allProducts: [Product]\n  product(id: ID!): Product\n}\n\ntype Product {\n  id: ID!\n  sku: String\n  name: String\n  package: String\n  createdBy: User\n  hidden: String\n  reviewsScore: Float!\n  oldField: String\n  image: String\n  foo: String\n  happy: String\n  fun: String\n}\n\ntype User @key(fields: "email", resolvable: false) {\n  email: ID!\n}',
//         },
//       },
//     ]);
//   });
// });
//
//
// describe('integration bug test', () => {
//   const supergraph = buildASTSchema(
//     parse(`
//       schema {
//         query: Query
//       }
//
//       type SwagShopExperience {
//         slug: String
//         header: Header
//         categoryBar: CategoryBar
//         productDetails: ProductDetails
//         similarProducts: SimilarProducts
//         subscribeBar: SubscribeBar
//         footer: Footer
//       }
//
//       type Query {
//         swagShopExperience: SwagShopExperience
//       }
//
//       type Header {
//         cart: Cart
//       }
//
//       type Cart {
//         itemCount: Int
//       }
//
//       type CategoryBar {
//         categories: [Category!]!
//       }
//
//       type Category {
//         label: String!
//         url: String!
//       }
//
//       type ProductDetails {
//         breadcrumbs: String!
//         product: Product!
//       }
//
//       type Product {
//         title: String!
//         image: String!
//         price: Float!
//         description: String!
//         altImages: [AltImage!]!
//         options: ProductOptions!
//         inventory: Inventory!
//         shipping: Shipping!
//       }
//
//       type AltImage {
//         image: String!
//       }
//
//       type ProductOptions {
//         colors: [Color!]!
//         sizes: [Size!]!
//       }
//
//       type Color {
//         name: String!
//       }
//
//       type Size {
//         label: String!
//       }
//
//       type Inventory {
//         inStock: Boolean!
//       }
//
//       type Shipping {
//         minPrice: Float!
//         minDeliveryDate: String!
//         orderDeadline: String!
//         freeReturns: Boolean!
//       }
//
//       type SimilarProducts {
//         products: [SimilarProduct!]!
//       }
//
//       type SimilarProduct {
//         liked: Boolean!
//         image: String!
//         title: String!
//         price: Float!
//         options: ProductOptions
//       }
//
//       type SubscribeBar {
//         content: SubscriptionContent
//       }
//
//       type SubscriptionContent {
//         header: String!
//         copy: String!
//       }
//
//       type Footer {
//         categories: [FooterCategory!]!
//         phone: String
//         email: String
//         copyrights: String!
//         address: String!
//       }
//
//       type FooterCategory {
//         category: String
//         links: [FooterLink!]!
//       }
//
//       type FooterLink {
//         label: String!
//         url: String!
//       }
//     `)
//   );
//
//   const subgraphs = [
//     {
//       name: 'customer-engagement',
//       schema: buildASTSchema(
//         parse(
//           'schema @link(url: "https://specs.apollo.dev/federation/v2.0", import: ["@key", "@shareable"]) {\n  query: Query\n}\n\ntype Query {\n  swagShopExperience: SwagShopExperience\n}\n\ntype SwagShopExperience @key(fields: "slug") {\n  slug: String\n  header: Header\n  categoryBar: CategoryBar\n  productDetails: ProductDetails\n  similarProducts: SimilarProducts\n  subscribeBar: SubscribeBar\n  footer: Footer\n}\n\ntype Header {\n  cart: Cart\n}\n\ntype Cart {\n  itemCount: Int\n}\n\ntype CategoryBar {\n  categories: [Category!]!\n}\n\ntype Category {\n  label: String!\n  url: String!\n}\n\ntype ProductDetails {\n  breadcrumbs: String!\n  product: Product!\n}\n\ntype Product {\n  title: String!\n  image: String!\n  price: Float!\n  description: String!\n  altImages: [AltImage!]!\n  options: ProductOptions!\n  inventory: Inventory!\n  shipping: Shipping!\n}\n\ntype AltImage {\n  image: String!\n}\n\ntype ProductOptions {\n  colors: [Color!]!\n  sizes: [Size!]!\n}\n\ntype Color {\n  name: String!\n}\n\ntype Size {\n  label: String!\n}\n\ntype Inventory {\n  inStock: Boolean!\n}\n\ntype Shipping {\n  minPrice: Float!\n  minDeliveryDate: String!\n  orderDeadline: String!\n  freeReturns: Boolean!\n}\n\ntype SimilarProducts {\n  products: [SimilarProduct!]!\n}\n\ntype SimilarProduct {\n  liked: Boolean!\n  image: String!\n  title: String!\n  price: Float!\n  options: ProductOptions\n}\n\ntype SubscribeBar {\n  content: SubscriptionContent\n}\n\ntype SubscriptionContent {\n  header: String!\n  copy: String!\n}\n\ntype Footer {\n  categories: [FooterCategory!]!\n  phone: String\n  email: String\n  copyrights: String!\n  address: String!\n}\n\ntype FooterCategory {\n  category: String\n  links: [FooterLink!]!\n}\n\ntype FooterLink {\n  label: String!\n  url: String!\n}'
//         )
//       ),
//     },
//   ];
//
//   const operation = `
//     query GetSwagShopExperience {
//       swagShopExperience {
//         productDetails {
//           breadcrumbs
//         }
//         producto {
//           foo
//           bar
//         }
//       }
//     }
//   `;
//
//   it('should successfully add missing fields and new types (Pass Test)', () => {
//     const result = createProposedSubgraphsFromOperationsMissingFields(
//       supergraph,
//       subgraphs,
//       operation
//     );
//     expect(result).toEqual([
//       {
//         name: 'customer-engagement',
//         activePartialSchema: {
//           sdl: 'schema @link(url: "https://specs.apollo.dev/federation/v2.0", import: ["@key", "@shareable"]) {\n  query: Query\n}\n\ntype Query {\n  swagShopExperience: SwagShopExperience\n}\n\ntype SwagShopExperience @key(fields: "slug") {\n  slug: String\n  header: Header\n  categoryBar: CategoryBar\n  productDetails: ProductDetails\n  similarProducts: SimilarProducts\n  subscribeBar: SubscribeBar\n  footer: Footer\n  producto: Producto\n}\n\ntype Producto {\n  foo: String\n  bar: String\n}\n\ntype Header {\n  cart: Cart\n}\n\ntype Cart {\n  itemCount: Int\n}\n\ntype CategoryBar {\n  categories: [Category!]!\n}\n\ntype Category {\n  label: String!\n  url: String!\n}\n\ntype ProductDetails {\n  breadcrumbs: String!\n  product: Product!\n}\n\ntype Product {\n  title: String!\n  image: String!\n  price: Float!\n  description: String!\n  altImages: [AltImage!]!\n  options: ProductOptions!\n  inventory: Inventory!\n  shipping: Shipping!\n}\n\ntype AltImage {\n  image: String!\n}\n\ntype ProductOptions {\n  colors: [Color!]!\n  sizes: [Size!]!\n}\n\ntype Color {\n  name: String!\n}\n\ntype Size {\n  label: String!\n}\n\ntype Inventory {\n  inStock: Boolean!\n}\n\ntype Shipping {\n  minPrice: Float!\n  minDeliveryDate: String!\n  orderDeadline: String!\n  freeReturns: Boolean!\n}\n\ntype SimilarProducts {\n  products: [SimilarProduct!]!\n}\n\ntype SimilarProduct {\n  liked: Boolean!\n  image: String!\n  title: String!\n  price: Float!\n  options: ProductOptions\n}\n\ntype SubscribeBar {\n  content: SubscriptionContent\n}\n\ntype SubscriptionContent {\n  header: String!\n  copy: String!\n}\n\ntype Footer {\n  categories: [FooterCategory!]!\n  phone: String\n  email: String\n  copyrights: String!\n  address: String!\n}\n\ntype FooterCategory {\n  category: String\n  links: [FooterLink!]!\n}\n\ntype FooterLink {\n  label: String!\n  url: String!\n}',
//         },
//       },
//     ]);
//   });
// });

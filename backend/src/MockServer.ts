import {ApolloServer} from '@apollo/server';
import {buildSubgraphSchema} from '@apollo/subgraph';
import {
  buildASTSchema,
  DefinitionNode,
  FragmentDefinitionNode,
  GraphQLSchema,
  Kind,
  ObjectTypeDefinitionNode,
  ObjectTypeExtensionNode,
  OperationDefinitionNode,
  parse,
  print,
  printSchema,
  ScalarTypeDefinitionNode,
  SelectionNode,
  visit,
} from 'graphql';
import {DocumentNode} from 'graphql/language/ast';
import buildPrivateTypeQuery from './utilities/buildPrivateTypeQuery';
import {addMocksToSchema, createMockStore} from '@graphql-tools/mock';
import {faker} from '@faker-js/faker';
import SeedManager from './seed/SeedManager';

const GQMOCK_QUERY_PREFIX = 'gqmock';

type SchemaRegistrationOptions = {
  subgraph: boolean;
  fakerConfig: Record<string, object>;
};

export default class MockServer {
  private mockStore;
  private apolloServerInstance;
  private graphQLSchema: GraphQLSchema | null = null;
  private fakerConfig: Record<string, object> = {};
  seedManager: SeedManager;
  get apolloServer(): ApolloServer | null {
    return this.apolloServerInstance || null;
  }

  get schema(): GraphQLSchema | null {
    return this.graphQLSchema;
  }

  get privateQueryPrefix(): string {
    return GQMOCK_QUERY_PREFIX;
  }

  constructor(schemaSource: string, options: SchemaRegistrationOptions) {
    const schema = parse(schemaSource);

    const scalars: string[] = [];
    visit(schema, {
      ScalarTypeDefinition: (node: ScalarTypeDefinitionNode) =>
        scalars.push(node.name.value),
    });

    const fakerConfig = {};

    scalars.forEach((scalar) => {
      // @ts-expect-error TODO fix types
      fakerConfig[scalar] = {
        method: 'random.word',
        // method: () => 'Hello World',
        args: [],
      };
    });

    this.fakerConfig = fakerConfig;

    if (options.subgraph) {
      this.graphQLSchema = buildSubgraphSchema(schema);
    } else {
      this.graphQLSchema = buildASTSchema(schema);
    }

    // if (options.fakerConfig) {
    //     this.fakerConfig = options.fakerConfig;
    // }

    this.mockStore = createMockStore({
      schema: this.graphQLSchema,
      mocks: this.createCustomMocks(this.fakerConfig),
    });

    this.apolloServerInstance = new ApolloServer({
      introspection: true,
      schema: addMocksToSchema({
        schema: this.graphQLSchema,
        store: this.mockStore,
      }),
    });

    // @ts-expect-error TODO fix types
    this.apolloServerInstance.e;

    this.seedManager = new SeedManager();
  }

  private createCustomMocks(fakerConfig: Record<string, any>) {
    const mocks = {};

    Object.entries(fakerConfig).forEach(([key, value]) => {
      this.createCustomMock({mocks, key, value});
    });

    return mocks;
  }

  private createCustomMock({
    mocks,
    key,
    value,
  }: {
    mocks: Record<string, any>;
    key: string;
    value: Record<string, any>;
  }) {
    if (
      // detect a faker method definition:
      //   if there is a `method` key, AND
      //   if `method` is a string
      value['method'] &&
      typeof value['method'] === 'string'
    ) {
      const fakerKeys = value.method.split('.');
      const fakerMethod = this.getFakerMethod(fakerKeys);

      if (!fakerMethod) {
        return;
      }

      mocks[key] = () => {
        if (Array.isArray(value.args)) {
          return fakerMethod(...value.args);
        } else if (!!value.args) {
          return fakerMethod(value.args);
        } else {
          return fakerMethod();
        }
      };

      return;
    }

    mocks[key] = {};
    Object.entries(value).forEach(([innerKey, innerValue]) => {
      this.createCustomMock({
        mocks: mocks[key],
        key: innerKey,
        value: innerValue,
      });
    });
  }

  private getFakerMethod(
    fakerKeys: string[]
  ): (...args: any[]) => any | null | undefined {
    let fakerMethod = faker;

    while (fakerKeys.length) {
      const fakerKey = fakerKeys.shift();

      if (!fakerKey) {
        continue;
      }
      // @ts-expect-error TODO fix types
      fakerMethod = fakerMethod[fakerKey];

      if (!fakerMethod) {
        break;
      }
    }

    // @ts-expect-error If we got here, it's either a function or undefined
    return fakerMethod;
  }

  getFieldName(__typename: string): string {
    return `${this.privateQueryPrefix}_${__typename}`;
  }

  async getNewMock({
    query,
    variables,
    typeName,
    operationName,
    rollingKey,
  }: {
    query: string;
    variables: Record<string, unknown>;
    typeName: string;
    operationName: string;
    rollingKey: string;
  }): Promise<Record<string, unknown>> {
    const newQuery = buildPrivateTypeQuery({
      query,
      typeName,
      operationName,
      rollingKey,
      apolloServerManager: this,
    });

    const queryResult = await this.executeOperation({
      query: newQuery,
      variables,
      operationName: this.getFieldName('privateQuery'),
    });

    return queryResult?.data
      ? {...queryResult.data[this.getFieldName(typeName)]}
      : {};
  }

  async executeOperation({
    query,
    variables,
    operationName,
  }: {
    query: string;
    variables: Record<string, unknown>;
    operationName: string;
  }): Promise<{data: Record<string, object>}> {
    this.mockStore.reset();
    return this.apolloServer
      ?.executeOperation({
        query,
        variables,
        operationName,
      })
      .then((response) => response.body)
      .then((body) => {
        if (body.kind === 'single') {
          if (!body.singleResult.errors) {
            delete body.singleResult.errors;
          }
          return body.singleResult;
        } else {
          return {
            initialResult: body.initialResult,
            subsequentResults: body.subsequentResults,
          };
        }
      }) as Promise<{
      data: Record<string, object>;
    }>;
  }

  expandFragments(query: string): string {
    const queryAst = parse(query);
    const definitions = queryAst.definitions;
    let newQuery = visit(queryAst, {
      SelectionSet: (node) => {
        node.selections = [
          ...node.selections.reduce(
            (selections: SelectionNode[], selection) => {
              if (selection.kind === Kind.FRAGMENT_SPREAD) {
                const fragmentDefinition = definitions.find(
                  (definition) =>
                    definition.kind === Kind.FRAGMENT_DEFINITION &&
                    definition.name.value === selection.name.value
                ) as FragmentDefinitionNode | undefined;
                if (fragmentDefinition) {
                  selections.push({
                    kind: Kind.INLINE_FRAGMENT,
                    typeCondition: fragmentDefinition.typeCondition,
                    selectionSet: fragmentDefinition.selectionSet,
                  });
                }
              } else {
                selections.push(selection);
              }

              return selections;
            },
            []
          ),
        ];
        return node;
      },
    });

    newQuery = {
      ...newQuery,
      definitions: [
        ...(newQuery.definitions.filter(
          (definition) => definition.kind !== Kind.FRAGMENT_DEFINITION
        ) as DefinitionNode[]),
      ],
    };

    return print(newQuery);
  }

  getInterfaceImplementations(
    schema: GraphQLSchema,
    typeName: string
  ): string[] {
    const schemaAst = parse(printSchema(schema));
    const typeDefinition = schemaAst.definitions.find((definition) => {
      if ('name' in definition) {
        return definition.name?.value === typeName;
      }

      return false;
    });

    if (typeDefinition && 'interfaces' in typeDefinition) {
      return (
        typeDefinition.interfaces?.map(
          (interfaceImplementationDefinition) =>
            interfaceImplementationDefinition.name.value
        ) || []
      );
    }

    return [];
  }

  getUnionImplementations(schema: GraphQLSchema, typeName: string): string[] {
    const schemaAst = parse(printSchema(schema));
    const unionTypeDefinitions = schemaAst.definitions.filter((definition) => {
      return definition.kind === Kind.UNION_TYPE_DEFINITION;
    });

    if (unionTypeDefinitions && unionTypeDefinitions.length > 0) {
      return (
        unionTypeDefinitions
          .filter((unionTypeDefinition) =>
            // @ts-expect-error We know this is a union type definition
            unionTypeDefinition?.types?.find(
              // @ts-expect-error TODO fix types
              (typeDefinition) => typeDefinition.name.value === typeName
            )
          )
          // @ts-expect-error We know this is a union type definition
          .map((unionTypeDefinition) => unionTypeDefinition.name.value) || []
      );
    }

    return [];
  }

  private getCustomScalarsConfig(schema: DocumentNode) {
    const wellKnownScalars: string[] = ['Date', 'DateTime'];
    const scalars: string[] = [];
    visit(schema, {
      ScalarTypeDefinition: (node: ScalarTypeDefinitionNode) =>
        scalars.push(node.name.value),
    });

    const fakerConfig = {};

    scalars.forEach((scalar) => {
      // @ts-expect-error TODO fix types
      fakerConfig[scalar] = {
        method: 'random.word',
        // method: () => 'Hello World',
        args: [],
      };
    });
  }
}

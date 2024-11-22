import {
  ApolloClient,
  ApolloLink,
  createHttpLink,
  DefaultOptions,
  InMemoryCache,
} from '@apollo/client';
import {setContext} from '@apollo/client/link/context';
import {RequestContext} from '@mikro-orm/core';
import {ApolloApiKey} from '../models/apolloApiKey';
import {DI} from '../server';
import {logger} from '../utilities/logger';
import {SchemaLoader} from '../utilities/schemaLoader';
import {
  CreateProposalMutation,
  GetGraphQuery,
  GetGraphsQuery,
  GetGraphWithSubgraphsQuery,
  GetOrganizationIdQuery,
  GetSchemaQuery,
  GetVariantQuery,
  ProposalLaunchesQuery,
  PublishProposalRevisionMutation,
  PublishProposalRevisionMutationVariables,
  UpdateProposalStatusMutation,
} from './apollo/types/graphql';
import {CREATE_PROPOSAL} from './mutations/createProposal';
import {PUBLISH_PROPOSAL_REVISION} from './mutations/publishProposalRevision';
import {UPDATE_PROPOSAL_STATUS} from './mutations/updateProposalStatus';
import {GET_GRAPH} from './queries/getGraph';
import {GET_GRAPHS} from './queries/getGraphs';
import {GET_GRAPH_WITH_SUBGRAPHS} from './queries/getGraphWithSubgraphs';
import {GET_ORGANIZATION_ID} from './queries/getOrganizationId';
import {GET_SCHEMA} from './queries/getSchema';
import {GET_VARIANT} from './queries/getVariant';
import {PROPOSAL_LAUNCHES} from './queries/proposalLaunches';

export default class Client {
  private apolloClient!: ApolloClient<unknown>;
  private organizationId: string | null | undefined;
  private schemaLoader: SchemaLoader;

  constructor() {
    this.schemaLoader = new SchemaLoader();
    this.loadLocalSchemas();
  }

  private async loadLocalSchemas() {
    logger.startup('Loading local schemas');
    const schemas = await this.schemaLoader.loadFromFiles();
    logger.startup('Local schemas loaded', {
      count: schemas.length,
      schemaNames: schemas.map((s) => s.name),
    });
  }

  private async getGraphsFromFiles(): Promise<
    NonNullable<GetGraphsQuery['organization']>['graphs']
  > {
    logger.debug('Attempting to load schemas from files');
    const schemas = await this.schemaLoader.loadFromFiles();
    logger.debug('Loaded schemas:', {
      count: schemas.length,
      schemaNames: schemas.map((s) => s.name),
    });

    return schemas.map(({name}) => ({
      id: `local-${name}`,
      name,
      variants: [
        {
          id: `local-${name}@current`,
          name: 'current',
          latestPublication: {
            publishedAt: new Date().toISOString(),
          },
        },
      ],
      proposals: {
        totalCount: 0,
      },
    }));
  }

  public async initializeClient(): Promise<void> {
    logger.startup('Initializing Apollo client', {
      nodeEnv: process.env.NODE_ENV,
    });

    let uri;
    switch (process.env.NODE_ENV) {
      case 'e2e-test':
        uri = `http://instant-mock-e2e-play:${process.env.PLAY_PORT}/api/local-apollo-platform-api/current/graphql`;
        break;
      default:
        uri = 'https://api.apollographql.com/api/graphql';
        break;
    }

    const link = createHttpLink({
      uri,
    });

    const authLink = setContext(async (_, {headers}) => {
      const em = DI.orm.em.fork();
      return RequestContext.create(em, async () => {
        let _headers = {...headers};

        if (process.env.NODE_ENV === 'e2e-test') {
          _headers['seed-group'] = 'default';
        } else {
          const apiKeyEntity = await em
            .getRepository(ApolloApiKey)
            .findOne({id: 1});
          if (apiKeyEntity) {
            _headers = {
              ..._headers,
              'apollographql-client-name': 'instant-mock',
              'apollographql-client-version': '1.0.0-beta.2',
              'X-API-KEY': apiKeyEntity.getDecryptedKey(),
            };
          }
        }
        return {headers: _headers};
      });
    });

    const defaultOptions: DefaultOptions = {
      watchQuery: {fetchPolicy: 'no-cache'},
      query: {fetchPolicy: 'no-cache'},
    };

    let instantMockLink: ApolloLink | null = null;
    if (process.env.NODE_ENV === 'e2e-record') {
      instantMockLink = new ApolloLink((operation, forward) => {
        return forward(operation).map((response) => {
          logger.debug('Recording with instant mock link', {
            operationName: operation.operationName,
          });
          const graphId = 'local-apollo-platform-api';
          const variantName = 'current';
          const operationName = operation.operationName;
          const operationMatchArguments = operation.variables;
          const seedResponse = response;

          const apiUrl = `http://instant-mock-e2e-play:${process.env.PLAY_PORT}/api/seeds`;

          if (operationName === 'IntrospectionQuery') {
            return response;
          }

          fetch(apiUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              graphId,
              variantName,
              seedResponse: seedResponse,
              seedGroupId: 1,
              operationName: operationName,
              operationMatchArguments: operationMatchArguments,
            }),
          })
            .then((res) => {
              if (!res.ok) {
                logger.api('Error registering seed', {
                  operationName,
                });
                // Throw an error with the HTTP status text if the response is not OK
                throw new Error(
                  `HTTP error! Status: ${res.status} - ${res.statusText}`
                );
              }
              return res.json();
            })
            .then((json) => {
              logger.api('Seed registered via InstantMockLink', {
                operationName,
                seedId: json.id,
              });
            })
            .catch((err) => {
              // This will catch both network errors and HTTP errors
              logger.error('Failed to create seed via InstantMockLink', {
                operationName,
                error: err.message,
              });
            });

          return response;
        });
      });
    }

    const loggingLink = new ApolloLink((operation, forward) => {
      logger.debug('Apollo Client Request', {
        operationName: operation.operationName,
        variables: operation.variables,
        url: uri, // Log the endpoint URL
        // headers: operation.getContext().headers, // Log the headers - CAREFUL can expose keys to logs
      });

      return forward(operation).map((response) => {
        logger.debug('Apollo Client Response', {
          operationName: operation.operationName,
          response,
        });
        return response;
      });
    });

    const linkArray = instantMockLink
      ? [authLink, instantMockLink, link]
      : [authLink, loggingLink, link];

    this.apolloClient = new ApolloClient({
      link: ApolloLink.from(linkArray),
      cache: new InMemoryCache(),
      defaultOptions: defaultOptions,
    });

    logger.startup('Getting Apollo Organization ID');
    this.organizationId = await this.getOrganizationId();
    logger.startup('Apollo client initialization complete', {
      organizationId: this.organizationId,
    });
  }

  public async updateApiKey(newApiKey: string, userId: string): Promise<void> {
    logger.security('Updating Apollo API key');
    const em = DI.orm.em.fork();
    await RequestContext.create(em, async () => {
      let apiKeyEntity = await em.getRepository(ApolloApiKey).findOne({id: 1});
      if (apiKeyEntity) {
        const newEntity = new ApolloApiKey(newApiKey, userId);
        apiKeyEntity.encryptedKey = newEntity.encryptedKey;
        apiKeyEntity.iv = newEntity.iv;
        apiKeyEntity.tag = newEntity.tag;
        logger.security('Existing API key updated');
      } else {
        apiKeyEntity = new ApolloApiKey(newApiKey, userId);
        em.persist(apiKeyEntity);
        logger.security('New API key created');
      }
      await em.flush();
    });
    await this.initializeClient();
  }

  async getGraphs(): Promise<
    NonNullable<GetGraphsQuery['organization']>['graphs']
  > {
    logger.graph('Fetching graphs from local files');
    const localGraphs = await this.getGraphsFromFiles();

    if (!this.organizationId) {
      return localGraphs;
    }

    logger.graph('Fetching graphs from Apollo', {
      organizationId: this.organizationId,
    });

    try {
      const {data} = await this.apolloClient.query<GetGraphsQuery>({
        query: GET_GRAPHS,
        variables: {organizationId: this.organizationId},
      });

      if (data.organization?.__typename === 'Organization') {
        logger.graph('Successfully retrieved graphs', {
          count: data.organization.graphs.length,
        });
        return [...localGraphs, ...data.organization.graphs];
      }
    } catch (e) {
      logger.error('Error fetching Apollo graphs', {error: e});
      return localGraphs;
    }

    logger.error('Failed to retrieve organization graphs', {
      organizationId: this.organizationId,
    });
    throw new Error('Unable to retrieve graphs');
  }

  async getGraph(graphId: string): Promise<GetGraphQuery['graph']> {
    // Always check local schemas first
    const schemas = await this.schemaLoader.loadFromFiles();
    const graphName = graphId.replace('local-', '');
    const localSchema = schemas.find((s) => s.name === graphName);

    if (localSchema) {
      return {
        variants: [
          {
            key: `local-${graphName}@current`,
            displayName: 'current',
            name: 'current',
            latestPublication: {
              publishedAt: new Date().toISOString(),
              schema: {
                document: localSchema.schema,
              },
            },
          },
        ],
        proposals: {
          proposals: [],
        },
      };
    }

    // If not found locally and we have Apollo client initialized, try remote
    if (this.apolloClient) {
      const res = await this.apolloClient.query<GetGraphQuery>({
        query: GET_GRAPH,
        variables: {
          graphId,
          filterBy: {
            status: ['APPROVED', 'DRAFT', 'IMPLEMENTED', 'OPEN'],
          },
        },
      });
      return res.data.graph;
    }

    return null;
  }

  async getVariant(
    graphId: string,
    variantName: string
  ): Promise<NonNullable<GetVariantQuery['graph']>['variant']> {
    const schemas = await this.schemaLoader.loadFromFiles();
    const graphName = graphId.replace('local-', '');
    const localSchema = schemas.find((s) => s.name === graphName);

    if (localSchema) {
      return {
        id: `local-${graphName}@${variantName}`,
        name: variantName,
        url: null,
        isProposal: false,
        proposal: null,
        latestLaunch: null,
        subgraphs: [],
        latestPublication: {
          publishedAt: new Date().toISOString(),
          schema: {
            document: localSchema.schema,
          },
        },
      };
    }

    if (this.apolloClient) {
      const {data} = await this.apolloClient.query<GetVariantQuery>({
        query: GET_VARIANT,
        variables: {graphId, name: variantName},
      });
      return data.graph?.variant;
    }

    return null;
  }

  async getGraphWithSubgraphs(
    graphId: string
  ): Promise<GetGraphWithSubgraphsQuery['graph']> {
    const schemas = await this.schemaLoader.loadFromFiles();
    const graphName = graphId.replace('local-', '');
    const localSchema = schemas.find((s) => s.name === graphName);

    if (localSchema) {
      return {
        variants: [
          {
            key: `local-${graphName}@current`,
            displayName: 'current',
            name: 'current',
            latestPublication: {
              publishedAt: new Date().toISOString(),
              schema: {
                document: localSchema.schema,
              },
            },
          },
        ],
        proposals: {
          proposals: [],
        },
      };
    }

    if (this.apolloClient) {
      const {data} = await this.apolloClient.query<GetGraphWithSubgraphsQuery>({
        query: GET_GRAPH_WITH_SUBGRAPHS,
        variables: {
          graphId,
          filterBy: {
            status: ['APPROVED', 'DRAFT', 'IMPLEMENTED', 'OPEN'],
          },
        },
      });
      return data.graph;
    }

    return null;
  }

  async getSchema(graphId: string, name: string): Promise<string | null> {
    const schemas = await this.schemaLoader.loadFromFiles();
    const localSchema = schemas.find(
      (s) => s.name === graphId.replace('local-', '')
    );

    if (localSchema) {
      logger.debug('Using local schema', {name: localSchema.name});
      return localSchema.schema;
    }

    try {
      const {data} = await this.apolloClient.query<GetSchemaQuery>({
        query: GET_SCHEMA,
        variables: {graphId, name},
      });
      return data.graph?.variant?.latestPublication?.schema.document || null;
    } catch (e) {
      logger.error(
        `getSchema error for graphId: ${graphId}, variant name: ${name}`,
        {
          error: e as unknown,
        }
      );
      return null;
    }
  }

  async proposalLaunches(
    proposalId: string
  ): Promise<ProposalLaunchesQuery['proposal']> {
    const {data} = await this.apolloClient.query<ProposalLaunchesQuery>({
      query: PROPOSAL_LAUNCHES,
      variables: {proposalId},
    });
    return data.proposal;
  }

  async createProposal(
    graphId: string,
    variantName: string,
    displayName: string,
    description?: string
  ): Promise<CreateProposalMutation | null> {
    const {data} = await this.apolloClient.mutate<CreateProposalMutation>({
      mutation: CREATE_PROPOSAL,
      variables: {
        graphId,
        input: {
          sourceVariantName: variantName,
          displayName,
          description,
        },
      },
    });

    if (data) return data;

    logger.error(
      `Failed to create proposal for graphId: ${graphId}, variantName: ${variantName}. No data returned from mutation.`
    );
    return null;
  }

  async updateProposalStatus(
    proposalId: string,
    status: string
  ): Promise<UpdateProposalStatusMutation | null> {
    const {data} = await this.apolloClient.mutate<UpdateProposalStatusMutation>(
      {
        mutation: UPDATE_PROPOSAL_STATUS,
        variables: {
          proposalId,
          status,
        },
      }
    );

    if (data) return data;

    logger.error(
      `Failed to update proposal status for proposalId: ${proposalId}. No data returned from mutation.`
    );
    return null;
  }

  async publishProposalRevision(
    proposalId: string,
    subgraphInputs: PublishProposalRevisionMutationVariables['input']['subgraphInputs'],
    summary: string,
    revision: string,
    previousLaunchId: string
  ): Promise<PublishProposalRevisionMutation | null> {
    const {data} = await this.apolloClient.mutate<
      PublishProposalRevisionMutation,
      PublishProposalRevisionMutationVariables
    >({
      mutation: PUBLISH_PROPOSAL_REVISION,
      variables: {
        proposalId,
        input: {
          subgraphInputs,
          summary,
          revision,
          previousLaunchId,
        },
      },
    });

    if (data) return data;

    logger.error(
      `Failed to publish proposal revision for proposalId: ${proposalId}. No data returned from mutation.`
    );
    return null;
  }

  async getOrganizationId(): Promise<string | null> {
    try {
      const {data} = await this.apolloClient.query<GetOrganizationIdQuery>({
        query: GET_ORGANIZATION_ID,
      });

      if (data?.me?.__typename === 'User' && data.me.memberships?.length > 0) {
        const orgId = data.me.memberships[0].account?.id;
        if (orgId) {
          logger.startup('Successfully retrieved organization ID', {orgId});
          return orgId;
        }
      }
      logger.warn('No organization ID found in response');
      return null;
    } catch (error) {
      logger.warn('Failed to retrieve organization ID', {
        error: error instanceof Error ? error.message : error,
      });
      return null;
    }
  }
}

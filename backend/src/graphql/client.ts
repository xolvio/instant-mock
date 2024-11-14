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
import {logger} from '../utilities/logger';
import {SchemaLoader} from '../utilities/schemaLoader';

export default class Client {
  private apolloClient!: ApolloClient<unknown>;
  private organizationId: string | null | undefined;
  private schemaLoader: SchemaLoader;

  constructor() {
    this.schemaLoader = new SchemaLoader();
  }

  private async getGraphsFromFiles(): Promise<
    NonNullable<GetGraphsQuery['organization']>['graphs']
  > {
    const schemas = await this.schemaLoader.loadFromFiles();

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
        uri = `http://localhost:${process.env.PLAY_PORT}/api/Apollo-Platform-API-lkwnx/current/graphql`;
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
              'apollographql-client-name': 'explorer',
              'apollographql-client-version': '1.0.0',
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
            .then((res) => res.json())
            .then((json) => {
              logger.api('Seed registered via InstantMockLink', {
                operationName,
                seedId: json.id,
              });
            })
            .catch((err) => {
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

  public async updateApiKey(newApiKey: string): Promise<void> {
    logger.security('Updating Apollo API key');
    const em = DI.orm.em.fork();
    await RequestContext.create(em, async () => {
      let apiKeyEntity = await em.getRepository(ApolloApiKey).findOne({id: 1});
      if (apiKeyEntity) {
        const newEntity = new ApolloApiKey(newApiKey);
        apiKeyEntity.encryptedKey = newEntity.encryptedKey;
        apiKeyEntity.iv = newEntity.iv;
        apiKeyEntity.tag = newEntity.tag;
        logger.security('Existing API key updated');
      } else {
        apiKeyEntity = new ApolloApiKey(newApiKey);
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
    if (process.env.USE_LOCAL_SCHEMA === 'true') {
      logger.graph('Fetching graphs from local files');
      return this.getGraphsFromFiles();
    }

    logger.graph('Fetching graphs from Apollo', {
      organizationId: this.organizationId,
    });

    const {data} = await this.apolloClient.query<GetGraphsQuery>({
      query: GET_GRAPHS,
      variables: {organizationId: this.organizationId},
    });

    if (data.organization?.__typename === 'Organization') {
      logger.graph('Successfully retrieved graphs', {
        count: data.organization.graphs.length,
      });
      return data.organization.graphs;
    }

    logger.error('Failed to retrieve organization graphs', {
      organizationId: this.organizationId,
      typename: data.organization?.__typename,
    });
    throw new Error('Unable to retrieve graphs');
  }

  async getGraph(graphId: string): Promise<GetGraphQuery['graph']> {
    if (process.env.USE_LOCAL_SCHEMA === 'true') {
      const schemas = await this.schemaLoader.loadFromFiles();
      const graphName = graphId.replace('local-', '');
      const schema = schemas.find((s) => s.name === graphName);

      if (!schema) return null;

      return {
        variants: [
          {
            key: `local-${graphName}@current`,
            displayName: 'current',
            name: 'current',
            latestPublication: {
              publishedAt: new Date().toISOString(),
              schema: {
                document: schema.schema,
              },
            },
          },
        ],
        proposals: {
          proposals: [],
        },
      };
    }

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

  async getVariant(
    graphId: string,
    variantName: string
  ): Promise<NonNullable<GetVariantQuery['graph']>['variant']> {
    if (process.env.USE_LOCAL_SCHEMA === 'true') {
      const schemas = await this.schemaLoader.loadFromFiles();
      const localId = parseInt(graphId.replace('local-', ''));
      const schema = schemas[localId];

      if (!schema) return null;

      return {
        id: `local-${localId}@${variantName}`,
        name: variantName,
        url: null,
        isProposal: false,
        proposal: null,
        latestLaunch: null,
        subgraphs: [],
        latestPublication: {
          publishedAt: new Date().toISOString(),
          schema: {
            document: schema.schema,
          },
        },
      };
    }

    const {data} = await this.apolloClient.query<GetVariantQuery>({
      query: GET_VARIANT,
      variables: {graphId, name: variantName},
    });
    return data.graph?.variant;
  }

  async getGraphWithSubgraphs(
    graphId: string
  ): Promise<GetGraphWithSubgraphsQuery['graph']> {
    if (process.env.USE_LOCAL_SCHEMA === 'true') {
      const schemas = await this.schemaLoader.loadFromFiles();
      const localId = parseInt(graphId.replace('local-', ''));
      const schema = schemas[localId];

      if (!schema) return null;

      return {
        variants: [
          {
            key: `local-${localId}@current`,
            displayName: 'current',
            name: 'current',
            latestPublication: {
              publishedAt: new Date().toISOString(),
              schema: {
                document: schema.schema,
              },
            },
          },
        ],
        proposals: {
          proposals: [],
        },
      };
    }

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

  async getSchema(graphId: string, name: string): Promise<string | null> {
    if (process.env.USE_LOCAL_SCHEMA === 'true') {
      const schemas = await this.schemaLoader.loadFromFiles();
      const debugSchema = schemas.map((s) => s.name);
      logger.debug('Found schemas:', {debugSchema});
      const schema = schemas.find(
        (s) => s.name === graphId.replace('local-', '')
      );
      logger.debug('found schmea', {schemas, schema});
      return schema ? schema.schema : null;
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

import {
  ApolloClient,
  ApolloLink,
  createHttpLink,
  DefaultOptions,
  InMemoryCache,
} from '@apollo/client';
import {setContext} from '@apollo/client/link/context';
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
import {DI} from '../server';
import {RequestContext} from '@mikro-orm/core';
import {ApolloApiKey} from '../models/apolloApiKey';

export default class Client {
  private apolloClient!: ApolloClient<any>;
  private organizationId: string | undefined;
  private apiKey: string | undefined;

  public async initializeClient() {
    const link = createHttpLink({
      uri: 'https://api.apollographql.com/api/graphql',
    });

    const authLink = setContext(async (_, {headers}) => {
      const em = DI.orm.em.fork();
      return RequestContext.create(em, async () => {
        const apiKeyEntity = await em
          .getRepository(ApolloApiKey)
          .findOne({id: 1});
        this.apiKey = apiKeyEntity ? apiKeyEntity.key : '';
        return {
          headers: {
            ...headers,
            'apollographql-client-name': 'explorer',
            'apollographql-client-version': '1.0.0',
            'X-API-KEY': this.apiKey,
          },
        };
      });
    });

    const defaultOptions: DefaultOptions = {
      watchQuery: {fetchPolicy: 'no-cache'},
      query: {fetchPolicy: 'no-cache'},
    };

    const instantMockLink = new ApolloLink((operation, forward) => {
      return forward(operation).map((response) => {
        const graphId = 'Apollo-Platform-API-lkwnx';
        const variantName = 'current';
        const operationName = operation.operationName;
        const operationMatchArguments = operation.variables;
        const seedResponse = response.data;

        const apiUrl = `http://localhost:3000/api/seeds`;

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
            console.log(
              'Seed registered successfully using InstantMockLink:',
              json
            );
          })
          .catch((err) => {
            console.error('Error creating seed using InstantMockLink:', err);
          });

        return response;
      });
    });

    this.apolloClient = new ApolloClient({
      link: ApolloLink.from([authLink, link]),
      cache: new InMemoryCache(),
      defaultOptions: defaultOptions,
    });

    this.organizationId = await this.getOrganizationId();
    console.log('SET ORG ID TO: ', this.organizationId);
  }

  public async updateApiKey(newApiKey: string) {
    console.log('updateApiKey called');
    const em = DI.orm.em.fork();
    await RequestContext.create(em, async () => {
      let apiKeyEntity = await em.getRepository(ApolloApiKey).findOne({id: 1});
      if (apiKeyEntity) {
        apiKeyEntity.key = newApiKey;
      } else {
        apiKeyEntity = new ApolloApiKey(newApiKey);
        em.persist(apiKeyEntity);
      }
      await em.flush();
    });
    await this.initializeClient();
  }

  async getGraphs(): Promise<
    NonNullable<GetGraphsQuery['organization']>['graphs']
  > {
    console.log('getGraphs called with org id: ', this.organizationId);
    const {data} = await this.apolloClient.query<GetGraphsQuery>({
      query: GET_GRAPHS,
      variables: {organizationId: this.organizationId},
    });

    if (data.organization?.__typename === 'Organization') {
      return data.organization.graphs;
    }

    throw new Error(
      'Unable to retrieve graphs for the specified organization. Please ensure the organization has the required permissions.'
    );
  }

  async getGraph(graphId: string): Promise<GetGraphQuery['graph']> {
    const res = await this.apolloClient.query<GetGraphQuery>({
      query: GET_GRAPH,
      variables: {
        graphId: graphId,
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
    const {data} = await this.apolloClient.query<GetVariantQuery>({
      query: GET_VARIANT,
      variables: {graphId: graphId, name: variantName},
    });
    return data.graph?.variant;
  }

  async getGraphWithSubgraphs(
    graphId: string
  ): Promise<GetGraphWithSubgraphsQuery['graph']> {
    const {data} = await this.apolloClient.query<GetGraphWithSubgraphsQuery>({
      query: GET_GRAPH_WITH_SUBGRAPHS,
      variables: {
        graphId: graphId,
        filterBy: {
          status: ['APPROVED', 'DRAFT', 'IMPLEMENTED', 'OPEN'],
        },
      },
    });
    return data.graph;
  }

  async getSchema(
    graphId: string,
    name: string
  ): Promise<
    | NonNullable<
        NonNullable<
          NonNullable<GetSchemaQuery['graph']>['variant']
        >['latestPublication']
      >['schema']['document']
    | null
  > {
    try {
      const {data} = await this.apolloClient.query<GetSchemaQuery>({
        query: GET_SCHEMA,
        variables: {graphId, name},
      });

      const document = data.graph?.variant?.latestPublication?.schema.document;

      if (!document) {
        console.error(
          `Schema document not found for graphId: ${graphId}, variant name: ${name}. Check if the graph or variant exists and has a publication.`
        );
      }
      return document;
    } catch (e) {
      console.error(
        `getSchema error for graphId: ${graphId}, variant name: ${name}:\n`,
        e
      );
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

    console.error(
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

    console.error(
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

    console.error(
      `Failed to publish proposal revision for proposalId: ${proposalId}. No data returned from mutation.`
    );
    return null;
  }

  async getOrganizationId(): Promise<string> {
    const {data} = await this.apolloClient.query<GetOrganizationIdQuery>({
      query: GET_ORGANIZATION_ID,
    });
    if (data?.me?.__typename === 'User' && data.me.memberships) {
      const memberships = data.me.memberships;
      if (memberships.length > 0 && memberships[0].account?.id) {
        return memberships[0].account.id;
      }
    }
    console.error('Organization ID not found');
    return '';
  }
}

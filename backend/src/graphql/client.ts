import {
  ApolloClient,
  ApolloLink,
  createHttpLink,
  DefaultOptions,
  InMemoryCache,
} from '@apollo/client';
import {setContext} from '@apollo/client/link/context';
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
  private apolloClient: ApolloClient<any>;
  private organizationId: string | undefined;

  constructor() {
    const link = createHttpLink({
      uri: 'https://api.apollographql.com/api/graphql',
    });

    const authLink = setContext((_, {headers}) => {
      return {
        headers: {
          ...headers,
          'apollographql-client-name': 'explorer',
          'apollographql-client-version': '1.0.0',
          'X-API-KEY': process.env.APOLLO_API_KEY,
        },
      };
    });

    const defaultOptions: DefaultOptions = {
      watchQuery: {fetchPolicy: 'no-cache'},
      query: {fetchPolicy: 'no-cache'},
    };

    this.apolloClient = new ApolloClient({
      link: ApolloLink.from([authLink, link]),
      cache: new InMemoryCache(),
      defaultOptions: defaultOptions,
    });

    // set organizationId
    this.getOrganizationId().then((organizationId) => {
      this.organizationId = organizationId;
    });
  }

  async getGraphs() {
    console.log('getGraphs with org id: ', this.organizationId);
    const {data} = await this.apolloClient.query({
      query: GET_GRAPHS,
      variables: {organizationId: this.organizationId},
    });
    return data.organization.graphs;
  }

  async getGraph(graphId: string) {
    const {data} = await this.apolloClient.query({
      query: GET_GRAPH,
      variables: {
        graphId: graphId,
        filterBy: {
          status: ['APPROVED', 'DRAFT', 'IMPLEMENTED', 'OPEN'],
        },
      },
    });

    return data.graph;
  }

  async getVariant(graphId: string, variantName: string) {
    const {data} = await this.apolloClient.query({
      query: GET_VARIANT,
      variables: {graphId: graphId, name: variantName},
    });

    return data.graph.variant;
  }

  async getGraphWithSubgraphs(graphId: string) {
    const {data} = await this.apolloClient.query({
      query: GET_GRAPH_WITH_SUBGRAPHS,
      variables: {
        graphId: graphId, // TODO remove it after summit, consumers should define filters themselvers
        filterBy: {
          status: ['APPROVED', 'DRAFT', 'IMPLEMENTED', 'OPEN'],
        },
      },
    });

    return data.graph;
  }

  async getSchema(graphId: string, name: string) {
    try {
      const {data} = await this.apolloClient.query({
        query: GET_SCHEMA,
        variables: {graphId: graphId, name},
      });

      return data.graph.variant.latestPublication.schema.document;
    } catch (e) {
      console.error('getSchema error:\n', e);
    }
  }

  async proposalLaunches(proposalId: string) {
    const {data} = await this.apolloClient.query({
      query: PROPOSAL_LAUNCHES,
      variables: {proposalId},
    });

    return data.proposal;
  }

  async createProposal(
    graphId: string,
    variantName: string,
    displayName: string,
    description: string | undefined
  ) {
    const {data} = await this.apolloClient.mutate({
      mutation: CREATE_PROPOSAL,
      variables: {
        graphId: graphId,
        input: {
          sourceVariantName: variantName,
          displayName: displayName,
          description: description,
        },
      },
    });
    return data;
  }

  async updateProposalStatus(proposalId: string, status: string) {
    const {data} = await this.apolloClient.mutate({
      mutation: UPDATE_PROPOSAL_STATUS,
      variables: {
        proposalId: proposalId,
        status: status,
      },
    });
  }

  // TODO fix object type
  async publishProposalRevision(
    proposalId: string,
    subgraphInputs: Object[],
    summary: string,
    revision: string,
    previousLaunchId: string
  ) {
    const {data} = await this.apolloClient.mutate({
      mutation: PUBLISH_PROPOSAL_REVISION,
      variables: {
        proposalId: proposalId,
        input: {
          subgraphInputs: subgraphInputs,
          summary: summary,
          revision: revision,
          previousLaunchId: previousLaunchId,
        },
      },
    });

    return data;
  }

  async getOrganizationId() {
    const {data} = await this.apolloClient.query({query: GET_ORGANIZATION_ID});
    const memberships = data?.me?.memberships;

    // TODO consider case when a token has multiple memberships
    if (memberships && memberships.length > 0) {
      return memberships[0].account?.id;
    }

    return null;
  }
}

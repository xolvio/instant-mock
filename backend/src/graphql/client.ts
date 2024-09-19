import {
  ApolloClient,
  ApolloLink,
  createHttpLink,
  InMemoryCache,
} from '@apollo/client';
import {setContext} from '@apollo/client/link/context';
import {CREATE_PROPOSAL} from './queries/createProposal';
import {GET_GRAPH} from './queries/getGraph';
import {GET_GRAPHS} from './queries/getGraphs';
import {GET_GRAPH_WITH_SUBGRAPHS} from './queries/getGraphWithSubgraphs';
import {GET_SCHEMA} from './queries/getSchema';

export default class Client {
  private apolloClient: ApolloClient<any>;
  private readonly organizationId =
    process.env.ORGANIZATION_ID || 'fcamna-orchestration';

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

    this.apolloClient = new ApolloClient({
      link: ApolloLink.from([authLink, link]),
      cache: new InMemoryCache(),
    });
  }

  async getGraphs() {
    const {data} = await this.apolloClient.query({
      query: GET_GRAPHS,
      variables: {organizationId: this.organizationId},
    });
    return data.organization.graphs;
  }

  async getGraph(graphId: string) {
    const {data} = await this.apolloClient.query({
      query: GET_GRAPH,
      variables: {graphId: graphId, filterBy: {}},
    });

    return data.graph;
  }

  async getGraphWithSubgraphs(graphId: string) {
    const {data} = await this.apolloClient.query({
      query: GET_GRAPH_WITH_SUBGRAPHS,
      variables: {graphId: graphId, filterBy: {}},
    });

    return data.graph;
  }

  async getSchema(graphId: string, name: string) {
    const {data} = await this.apolloClient.query({
      query: GET_SCHEMA,
      variables: {graphId: graphId, name},
    });

    return data.graph.variant.latestPublication.schema.document;
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
}

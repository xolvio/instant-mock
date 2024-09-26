import Client from '../graphql/client';

export class GraphService {
  private client: Client;

  constructor() {
    this.client = new Client();
  }

  async getAllGraphs() {
    return this.client.getGraphs();
  }

  async getGraph(graphId: string) {
    return this.client.getGraph(graphId);
  }

  async getGraphWithSubgraphs(graphId: string) {
    return this.client.getGraphWithSubgraphs(graphId);
  }

  async createProposal(
    graphId: string,
    variantName: string,
    displayName: string,
    description: string | undefined
  ) {
    return this.client.createProposal(
      graphId,
      variantName,
      displayName,
      description
    );
  }

  async publishProposalRevision(
    proposalId: string,
    subgraphInputs: Object[],
    summary: string,
    revision: string,
    previousLaunchId: string
  ) {
    return this.client.publishProposalRevision(
      proposalId,
      subgraphInputs,
      summary,
      revision,
      previousLaunchId
    );
  }
}

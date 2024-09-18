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
}

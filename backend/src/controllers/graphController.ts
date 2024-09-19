import {Request, Response} from 'express';
import {GraphService} from '../service/graphService';

export default class GraphController {
  private graphService: GraphService;

  constructor() {
    this.graphService = new GraphService();
    this.getGraph = this.getGraph.bind(this);
    this.getGraphs = this.getGraphs.bind(this);
    this.createProposal = this.createProposal.bind(this);
  }

  async getGraph(req: Request, res: Response) {
    // TODO simplify
    const withSubgraphs: boolean = req.query.withSubgraphs === 'true';
    const graphId = req.params.graphId as string;
    try {
      let graphs;
      if (withSubgraphs) {
        graphs = await this.graphService.getGraphWithSubgraphs(graphId);
      } else {
        graphs = await this.graphService.getGraph(graphId);
      }
      res.json(graphs);
    } catch (error) {
      console.error(error);
      res.status(500).send({error: 'Error querying GraphQL API'});
    }
  }

  async getGraphs(req: Request, res: Response) {
    try {
      const graphs = await this.graphService.getAllGraphs();
      res.json(graphs);
    } catch (error) {
      console.error(error);
      res.status(500).send({error: 'Error querying GraphQL API'});
    }
  }

  async createProposal(req: Request, res: Response) {
    // TODO probably we should use express-validator to make it in a more efficient way
    const {graphId, variantName} = req.params;
    const {displayName, description} = req.body;
    if (!graphId || !variantName || !displayName) {
      return res.status(400).json({
        error:
          'Missing required parameters: graphId, variantName, or displayName',
      });
    }

    try {
      const data = await this.graphService.createProposal(
        graphId,
        variantName,
        displayName,
        description
      );
      if (data.message) {
        return res.status(400).json({error: data.message});
      } else {
        const proposalName = data.graph.createProposal.name;
        return res.json({
          url: `https://studio.apollographql.com/graph/${graphId}/proposal/${proposalName}/home`,
        });
      }
    } catch (error) {
      console.error(error);
      // TODO add error message from apollo
      res.status(500).send({error: 'Error querying GraphQL API'});
    }
  }
}

import {Request, Response} from 'express';
import {GraphService} from '../service/graphService';

export default class GraphController {
  private graphService: GraphService;

  constructor() {
    this.graphService = new GraphService();
    this.getGraph = this.getGraph.bind(this);
    this.getGraphs = this.getGraphs.bind(this);
  }

  async getGraph(req: Request, res: Response) {
    const graphId = req.params.graphId as string;
    try {
      const graphs = await this.graphService.getGraph(graphId);
      res.json(graphs);
    } catch (error) {
      console.error(error);
      res.status(500).send('Error querying GraphQL API');
    }
  }

  async getGraphs(req: Request, res: Response) {
    try {
      const graphs = await this.graphService.getAllGraphs();
      res.json(graphs);
    } catch (error) {
      console.error(error);
      res.status(500).send('Error querying GraphQL API');
    }
  }
}

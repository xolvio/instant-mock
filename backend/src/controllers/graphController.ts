import {Request, Response} from 'express';
import {GraphService} from '../service/graphService';
import {parse, DocumentNode} from 'graphql';
import {findMissingFields} from '../utilities/findMissingFields';
import {MockService} from '../service/mockService';

export default class GraphController {
  private graphService: GraphService;

  constructor() {
    this.graphService = new GraphService();
    this.getGraph = this.getGraph.bind(this);
    this.getGraphs = this.getGraphs.bind(this);
    this.createProposal = this.createProposal.bind(this);
    this.publishProposalRevision = this.publishProposalRevision.bind(this);
    this.createOrUpdateSchemaProposalByOperation =
      this.createOrUpdateSchemaProposalByOperation.bind(this);
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
        return res.json({
          proposalName: data.graph.createProposal.name,
          proposalId: data.graph.createProposal.proposal.id,
          latestLaunchId: data.graph.createProposal.latestLaunch.id,
        });
      }
    } catch (error) {
      console.error(error);
      // TODO add error message from apollo
      res.status(500).send({error: 'Error querying GraphQL API'});
    }
  }

  async publishProposalRevision(req: Request, res: Response) {
    // TODO probably we should use express-validator to make it in a more efficient way
    const {proposalId} = req.params;
    const {subgraphInputs, summary, revision, previousLaunchId} = req.body;
    // TODO parameter validation before sending request to apollo, for now rely on their validation

    try {
      const data = await this.graphService.publishProposalRevision(
        proposalId,
        subgraphInputs,
        summary,
        revision,
        previousLaunchId
      );
      if (data.proposal.message) {
        return res.status(400).json({error: data.proposal.message});
      } else if (data.proposal.publishSubgraphs.message) {
        return res
          .status(400)
          .json({error: data.proposal.publishSubgraphs.message});
      } else {
        return res.json({
          latestLaunchId:
            data.proposal.publishSubgraphs.backingVariant.latestLaunch.id,
        });
      }
    } catch (error) {
      console.error(error);
      res.status(500).send({error: 'Error querying GraphQL API'});
    }
  }

  async createOrUpdateSchemaProposalByOperation(req: Request, res: Response) {
    try {
      const {operation, graphId, variantName} = req.body;
      // First we find any missing fields from the provided schema
      const mockService = MockService.getInstance();

      const variantServerInstance = await mockService.getOrStartNewMockServer(
        graphId,
        variantName
      );
      const variantSupergraphSchema = variantServerInstance.schema;
      const missingFields = findMissingFields(
        operation,
        variantSupergraphSchema
      );

      //
      //
      //
      //
      //
      // // Ensure the provided operation is a valid GraphQL query or mutation
      // let parsedOperation: DocumentNode;
      // try {
      //   parsedOperation = parse(operation);
      // } catch (error) {
      //   return res.status(400).json({error: 'Invalid GraphQL operation'});
      // }
      //
      // // Placeholder logic for generating the response
      // const response = {
      //   graphId,
      //   proposalId: 'generated-proposal-id', // Replace with actual proposal ID logic
      //   schemaDocument: 'generated-schema-document', // Replace with actual schema document logic
      // };
      //
      // res.json(response);
    } catch (error) {
      console.error(error);
      res.status(500).send({error: 'An unexpected error occurred'});
    }
  }
}

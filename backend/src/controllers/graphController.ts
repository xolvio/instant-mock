import {Request, Response} from 'express';
import {buildASTSchema, parse} from 'graphql';
import Client from '../graphql/client';
import {GraphService} from '../service/graphService';
import {createProposedSubgraphsFromOperationsMissingFields} from '../utilities/addMissingFieldsToSchema';

export default class GraphController {
  private graphService: GraphService;
  private client: Client;

  constructor() {
    this.graphService = new GraphService();
    this.client = new Client();
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
      const variant = await this.client.getVariant(graphId, variantName);

      const supergraph = buildASTSchema(
        parse(variant.latestPublication.schema.document)
      );

      const subgraphs = variant.subgraphs.map(
        (subgraph: {name: string; activePartialSchema: {sdl: string}}) => {
          const schemaString = subgraph.activePartialSchema.sdl;

          const schemaStringWithKeyDirective = `
        scalar FieldSet
        scalar link__Import
        enum link__Purpose {
          """
          \`SECURITY\` features provide metadata necessary to securely resolve fields.
          """
          SECURITY

          """
          \`EXECUTION\` features provide metadata necessary for operation execution.
          """
          EXECUTION
        }
        directive @link(url: String!, as: String, for: link__Purpose, import: [link__Import]) repeatable on SCHEMA
        directive @key(fields: FieldSet!, resolvable: Boolean = true) repeatable on OBJECT | INTERFACE
        ${schemaString}
        `;

          console.log(schemaStringWithKeyDirective);

          const schema = buildASTSchema(parse(schemaStringWithKeyDirective));

          return {
            name: subgraph.name,
            schema,
          };
        }
      );

      const subgraphInputs = createProposedSubgraphsFromOperationsMissingFields(
        supergraph,
        subgraphs,
        operation
      );

      const proposalDisplayName = 'Generated at ' + new Date().toLocaleString();

      const data = await this.client.createProposal(
        graphId,
        variantName,
        proposalDisplayName,
        ''
      );

      //TODO: support this being provided in request
      // const proposalName = data.graph.createProposal.name;
      const proposalId = data.graph.createProposal.proposal.id;
      const latestLaunchId = data.graph.createProposal.latestLaunch.id;
      const revision = await this.client.publishProposalRevision(
        proposalId,
        subgraphInputs,
        'test summary',
        'test revision',
        latestLaunchId
      );

      res.json({proposalDisplayName, revision});
    } catch (error) {
      console.error(error);
      res.status(500).send({error: 'An unexpected error occurred'});
    }
  }
}

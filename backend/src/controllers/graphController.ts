import {Request, Response} from 'express';
import {buildASTSchema, parse} from 'graphql';
import Client from '../graphql/client';
import {GraphService} from '../service/graphService';
import {createProposedSubgraphsFromOperationsMissingFields} from '../utilities/addMissingFieldsToSchema';

type Variant = {
  id: string;
  name: string;
  latestPublication: any;
  subgraphs: any;
  key?: string;
};

type Proposal = {
  displayName: string;
  status: string;
  id: string;
  createdAt: string;
  createdBy: {name: string};
  backingVariant: {
    id: string;
    name: string;
    subgraphs: any;
    latestPublication: any;
  };
  key: {id: string};
};

type Graph = {
  id: string;
  name: string;
  variants: Variant[];
  proposals?: {
    totalCount: number;
    proposals: Proposal[];
  };
};

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
    const withSubgraphs: boolean = req.query.withSubgraphs === 'true';
    const graphId = req.params.graphId as string;

    try {
      let graph: Graph;
      if (withSubgraphs) {
        graph = await this.graphService.getGraphWithSubgraphs(graphId);
      } else {
        graph = await this.graphService.getGraph(graphId);
      }

      const updatedProposals = graph.proposals?.proposals?.map((proposal) => ({
        ...proposal,
        key: proposal.key.id,
      }));

      const updatedGraph: Graph = {
        ...graph,
        proposals: updatedProposals,
      };

      res.json(updatedGraph);
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
      const {operation, key} = req.body;
      const graphId = key.split('@')[0];
      const variantName = key.split('@')[1];

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

      let data, revision, proposalDisplayName;

      if (variant.isProposal) {
        revision = await this.client.publishProposalRevision(
          variant.proposal.id,
          subgraphInputs,
          'Auto-updating from Narrative via instant-mock at ' +
            new Date().toLocaleString(),
          'auto-updated',
          variant.latestLaunch.id
        );
        console.log(JSON.stringify(revision, null, 2));
      } else {
        const proposalDisplayName =
          'Auto-generated from Narrative via instant-mock at ' +
          new Date().toLocaleString();
        data = await this.client.createProposal(
          graphId,
          variantName,
          proposalDisplayName,
          ''
        );
        const proposalId = data.graph.createProposal.proposal.id;
        const latestLaunchId = data.graph.createProposal.latestLaunch.id;
        revision = await this.client.publishProposalRevision(
          proposalId,
          subgraphInputs,
          'Auto-generating from Narrative via instant-mock at ' +
            new Date().toLocaleString(),
          'auto-generated',
          latestLaunchId
        );
      }

      res.json({proposalDisplayName, revision});
    } catch (error) {
      console.error(error);
      res.status(500).send({error: 'An unexpected error occurred'});
    }
  }
}

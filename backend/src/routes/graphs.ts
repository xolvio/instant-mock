import express, {Request, Response, Router} from 'express';
import {buildASTSchema, parse} from 'graphql';
import Client from '../graphql/client';
import {createProposedSubgraphsFromOperationsMissingFields} from '../utilities/operationToSchema';

const router: Router = express.Router();
const client = new Client();

const prepareSubgraphSchema = (subgraph: {
  name: string;
  activePartialSchema: {sdl: string};
}) => {
  const schemaStringWithDirectives = `
    scalar FieldSet
    scalar link__Import
    enum link__Purpose {
      SECURITY
      EXECUTION
    }
    directive @link(url: String!, as: String, for: link__Purpose, import: [link__Import]) repeatable on SCHEMA
    directive @key(fields: FieldSet!, resolvable: Boolean = true) repeatable on OBJECT | INTERFACE
    ${subgraph.activePartialSchema.sdl}
  `;

  const schema = buildASTSchema(parse(schemaStringWithDirectives));
  return {name: subgraph.name, schema};
};

router.get('/graphs', async (_: Request, res: Response) => {
  try {
    const graphs = await client.getGraphs();
    res.json(graphs);
  } catch (error) {
    console.error(error);
    res.status(500).send({error: 'Error querying GraphQL API'});
  }
});

router.get('/graphs/:graphId', async (req: Request, res: Response) => {
  const graphId = req.params.graphId;
  const withSubgraphs = req.query.withSubgraphs === 'true';

  try {
    const graph = withSubgraphs
      ? await client.getGraphWithSubgraphs(graphId)
      : await client.getGraph(graphId);

    //@ts-ignore
    const proposals = graph.proposals?.proposals.map((p) => ({
      ...p,
      key: p.key.id,
    }));
    res.json({...graph, proposals});
  } catch (error) {
    console.error(error);
    res.status(500).send({error: 'Error querying GraphQL API'});
  }
});

router.post(
  '/graphs/:graphId/:variantName/proposals',
  async (req: Request, res: Response) => {
    const {graphId, variantName} = req.params;
    const {displayName, description} = req.body;

    if (!graphId || !variantName || !displayName) {
      return res.status(400).json({error: 'Missing required parameters'});
    }

    try {
      const data = await client.createProposal(
        graphId,
        variantName,
        displayName,
        description
      );
      res.json({
        proposalName: data.graph.createProposal.name,
        proposalId: data.graph.createProposal.proposal.id,
        latestLaunchId: data.graph.createProposal.latestLaunch.id,
      });
    } catch (error) {
      console.error(error);
      res.status(500).send({error: 'Error creating proposal'});
    }
  }
);

router.post('/graphs/:graphId/reset', async (req: Request, res: Response) => {
  const graphId = req.params.graphId;

  try {
    const graph = await client.getGraph(graphId);
    const openProposals = graph.proposals.proposals.filter(
      //@ts-ignore
      (p) => p.status !== 'CLOSED'
    );
    await Promise.all(
      //@ts-ignore
      openProposals.map((p) => client.updateProposalStatus(p.id, 'CLOSED'))
    );
    res.json('success');
  } catch (error) {
    console.error(error);
    res.status(500).send({error: 'Error resetting graph'});
  }
});

router.post(
  '/graphs/:graphId/:variantName/operations',
  async (req: Request, res: Response) => {
    const {operation, key} = req.body;
    const [graphId, variantName] = key.split('@');

    try {
      const variant = await client.getVariant(graphId, variantName);
      const supergraph = buildASTSchema(
        parse(variant.latestPublication.schema.document)
      );
      const subgraphs = variant.subgraphs.map(prepareSubgraphSchema);
      const subgraphInputs = createProposedSubgraphsFromOperationsMissingFields(
        supergraph,
        subgraphs,
        operation
      );

      let revision;
      if (variant.isProposal) {
        revision = await client.publishProposalRevision(
          variant.proposal.id,
          subgraphInputs,
          'Auto-updating',
          'auto-updated',
          variant.latestLaunch.id
        );
      } else {
        const data = await client.createProposal(
          graphId,
          variantName,
          'Auto-generated',
          ''
        );
        revision = await client.publishProposalRevision(
          data.graph.createProposal.proposal.id,
          subgraphInputs,
          'Auto-generated',
          'auto-generated',
          data.graph.createProposal.latestLaunch.id
        );
      }

      res.json(revision);
    } catch (error) {
      console.error(error);
      res.status(500).send({error: 'An unexpected error occurred'});
    }
  }
);

export default router;

import express, {Request, Response, Router} from 'express';
import {buildASTSchema, parse} from 'graphql';
import {CreateProposalMutation} from '../graphql/apollo/types/graphql';
import Client from '../graphql/client';

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

// @ts-ignore
const unifyVariantAndProposalDataShapes = (graph) => {
  const {
    proposals: {proposals},
  } = graph;

  const updatedProposals = proposals.map(
    // @ts-ignore
    ({displayName, key, latestPublication}) => ({
      displayName,
      key: key.key,
      latestPublication: latestPublication.latestPublication,
    })
  );

  return {
    ...graph,
    proposals: updatedProposals,
  };
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

    const graphDataWithUnifiedVariantAndProposalShapes =
      unifyVariantAndProposalDataShapes(graph);

    res.json(graphDataWithUnifiedVariantAndProposalShapes);
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

      if (!data?.graph?.createProposal) {
        return res.status(500).json({error: 'Failed to create proposal'});
      }

      const response = extractProposalData(data.graph?.createProposal);

      if ('error' in response) {
        return res.status(400).json(response);
      }

      res.json(response);
    } catch (error) {
      console.error(error);
      res.status(500).send({error: 'Error creating proposal'});
    }
  }
);

function extractProposalData(
  createProposal: NonNullable<CreateProposalMutation['graph']>['createProposal']
) {
  if (!createProposal) {
    return {error: 'No data available'};
  }

  switch (createProposal.__typename) {
    case 'GraphVariant':
      return {
        proposalName: createProposal.name,
        proposalId: createProposal.proposal?.id ?? null,
        food: createProposal.proposal?.id ?? null,
        latestLaunchId: createProposal.latestLaunch?.id ?? null,
      };
    case 'CreateProposalError':
    case 'PermissionError':
    case 'ValidationError':
      return {error: createProposal.message};
    default:
      return {error: 'Unexpected response type'};
  }
}

router.post('/graphs/:graphId/reset', async (req: Request, res: Response) => {
  const graphId = req.params.graphId;

  try {
    const graph = await client.getGraph(graphId);
    const openProposals = graph?.proposals.proposals.filter(
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

export default router;

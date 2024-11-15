import express, { Request, Response, Router } from 'express';
import { buildASTSchema, parse } from 'graphql';
import {
  CreateProposalMutation,
  GetGraphQuery,
} from '../graphql/apollo/types/graphql';
import { DI } from '../server';
import { logger } from '../utilities/logger';

const router: Router = express.Router();

const prepareSubgraphSchema = (subgraph: {
  name: string;
  activePartialSchema: { sdl: string };
}) => {
  logger.debug('Preparing subgraph schema', { subgraphName: subgraph.name });
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
  return { name: subgraph.name, schema };
};

const unifyVariantAndProposalDataShapes = (graph: GetGraphQuery['graph']) => {
  logger.debug('Unifying variant and proposal data shapes');
  if (!graph?.proposals) return { ...graph };
  const {
    proposals: { proposals },
  } = graph;

  const updatedProposals = proposals.map(
    ({ displayName, key, latestPublication }) => ({
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

router.get('/graphs', async (req: Request, res: Response) => {
  logger.info('Graphs endpoint accessed', {
    userId: (req as any).session?.getUserId(),
    method: req.method,
    path: req.path
  });

  try {
    const graphs = await DI.apolloClient.getGraphs();
    logger.debug('Graphs retrieved successfully', { count: graphs.length });
    res.json(graphs);
  } catch (error) {
    logger.error('Failed to retrieve graphs', { error });
    res.status(500).send({ error: 'Error querying GraphQL API' });
  }
});

router.get('/graphs/:graphId', async (req: Request, res: Response) => {
  logger.info('Graphs endpoint hit with req params: ', { params: req.params });
  const graphId = req.params.graphId;
  const withSubgraphs = req.query.withSubgraphs === 'true';

  try {
    const graph = withSubgraphs
      ? await DI.apolloClient.getGraphWithSubgraphs(graphId)
      : await DI.apolloClient.getGraph(graphId);

    const graphDataWithUnifiedVariantAndProposalShapes =
      unifyVariantAndProposalDataShapes(graph);

    res.json(graphDataWithUnifiedVariantAndProposalShapes);
  } catch (error) {
    logger.error('/graphs error', { error });
    res.status(500).send({ error: 'Error querying GraphQL API' });
  }
});

router.post(
  '/graphs/:graphId/:variantName/proposals',
  async (req: Request, res: Response) => {
    const { graphId, variantName } = req.params;
    const { displayName, description } = req.body;

    if (!graphId || !variantName || !displayName) {
      return res.status(400).json({ error: 'Missing required parameters' });
    }

    try {
      const data = await DI.apolloClient.createProposal(
        graphId,
        variantName,
        displayName,
        description
      );

      if (!data?.graph?.createProposal) {
        return res.status(500).json({ error: 'Failed to create proposal' });
      }

      const response = extractProposalData(data.graph?.createProposal);

      if ('error' in response) {
        return res.status(400).json(response);
      }

      res.json(response);
    } catch (error) {
      console.error(error);
      res.status(500).send({ error: 'Error creating proposal' });
    }
  }
);

function extractProposalData(
  createProposal: NonNullable<CreateProposalMutation['graph']>['createProposal']
) {
  if (!createProposal) {
    return { error: 'No data available' };
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
      return { error: createProposal.message };
    default:
      return { error: 'Unexpected response type' };
  }
}

router.post('/graphs/:graphId/reset', async (req: Request, res: Response) => {
  const graphId = req.params.graphId;

  try {
    const graph = await DI.apolloClient.getGraph(graphId);
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
    res.status(500).send({ error: 'Error resetting graph' });
  }
});

export default router;

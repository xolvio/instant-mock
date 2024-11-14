import express, {Request, Response, Router} from 'express';
import {buildASTSchema, GraphQLSchema, parse} from 'graphql';
import {createProposedSubgraphsFromOperationsMissingFields} from '../utilities/operationToSchema';
import {DI} from '../server';
import {logger} from '../utilities/logger';

const router: Router = express.Router();

const APOLLO_STUDIO_BASE_URL = 'https://studio.apollographql.com';

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
  return {
    name: subgraph.name,
    schema: buildASTSchema(parse(schemaStringWithDirectives)),
  };
};

const generateFailureLink = (graphId: string, variantName: string): string => {
  return `${APOLLO_STUDIO_BASE_URL}/graph/${graphId}/proposal/${variantName}/checks/`;
};

const handleLaunchStatus = async (
  proposalId: string,
  latestLaunchId: string,
  graphId: string
): Promise<{status: string; message?: string}> => {
  const sleep = (ms: number) =>
    new Promise((resolve) => setTimeout(resolve, ms));

  while (true) {
    const proposalLaunches = await DI.apolloClient.proposalLaunches(proposalId);
    if (!proposalLaunches)
      return {status: 'FAILED', message: 'no proposal found'};

    const {backingVariant, activities} = proposalLaunches;

    const latestLaunch = activities?.edges?.find((edge) => {
      const target = edge?.node?.target;
      return (
        target?.__typename === 'ProposalRevision' &&
        target.launch?.id === latestLaunchId
      );
    });

    const target = latestLaunch?.node?.target;
    const status =
      target && target.__typename === 'ProposalRevision'
        ? target.launch?.status
        : undefined;

    switch (status) {
      case 'LAUNCH_INITIATED':
        logger.polling(`Launch ${latestLaunchId} initiated. Waiting...`);
        await sleep(1000);
        break;

      case 'LAUNCH_FAILED':
        logger.error(`Launch ${latestLaunchId} failed.`);
        const failureLink = generateFailureLink(graphId, backingVariant.name);
        return {
          status: 'FAILED',
          message: `Launch ${latestLaunchId} failed. Check details here: ${failureLink}`,
        };

      case 'LAUNCH_COMPLETED':
        logger.polling(`Launch ${latestLaunchId} completed.`);
        return {status: 'COMPLETED'};

      default:
        logger.warn(`Unexpected status: ${status}. Exiting polling.`);
        return {
          status: `${status}`,
          message: `Unexpected status encountered: ${status}. Please check the logs.`,
        };
    }
  }
};

const getCurrentTimestamp = (): string => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(
    now.getDate()
  ).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(
    now.getMinutes()
  ).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
};

router.post(
  '/create-or-update-schema-proposal-by-operation',
  async (req: Request, res: Response) => {
    const {operation, key} = req.body;
    const [graphId, variantName] = key.split('@');

    try {
      const variant = await DI.apolloClient.getVariant(graphId, variantName);
      if (!variant) return res.status(400).json({error: 'No variant provided'});

      const supergraph: GraphQLSchema = buildASTSchema(
        parse(variant.latestPublication?.schema.document)
      );
      const subgraphs = variant?.subgraphs?.map(prepareSubgraphSchema);
      if (!subgraphs)
        return res.status(400).json({error: 'No subgraphs found for variant'});

      const subgraphInputs = createProposedSubgraphsFromOperationsMissingFields(
        supergraph,
        subgraphs,
        operation
      );

      let revision;
      const timestamp = getCurrentTimestamp();
      if (variant.isProposal) {
        revision = await DI.apolloClient.publishProposalRevision(
          variant.proposal?.id as string,
          subgraphInputs,
          `Auto-updating at ${timestamp}`,
          `auto-updated at ${timestamp}`,
          variant.latestLaunch?.id as string
        );
      } else {
        const data = await DI.apolloClient.createProposal(
          graphId,
          variantName,
          `Auto-generated at ${timestamp}`,
          ''
        );
        if (!data?.graph?.createProposal) {
          return res.status(500).json({error: 'No graphs found'});
        }

        if (data.graph.createProposal.__typename === 'GraphVariant') {
          revision = await DI.apolloClient.publishProposalRevision(
            data.graph.createProposal.proposal?.id as string,
            subgraphInputs,
            `Auto-generated at ${timestamp}`,
            `auto-generated at ${timestamp}`,
            data.graph.createProposal.latestLaunch?.id as string
          );
        } else {
          return res
            .status(400)
            .json({error: data.graph.createProposal?.__typename});
        }
      }

      if (
        revision?.proposal?.__typename === 'ProposalMutation' &&
        revision?.proposal?.publishSubgraphs?.__typename === 'Proposal' &&
        revision.proposal.publishSubgraphs.backingVariant?.latestLaunch?.id &&
        revision.proposal.publishSubgraphs.backingVariant.id
      ) {
        const latestLaunchId =
          revision.proposal.publishSubgraphs.backingVariant.latestLaunch.id;

        const launchStatus = await handleLaunchStatus(
          revision.proposal.publishSubgraphs.id,
          latestLaunchId,
          graphId
        );

        if (launchStatus.status === 'FAILED') {
          return res.status(400).json({error: launchStatus.message});
        }

        const response = {
          ...revision.proposal,
          key: revision.proposal.publishSubgraphs.backingVariant.id,
        };

        return res.json(response);
      } else {
        return res.status(400).json({error: 'Incomplete proposal data'});
      }
    } catch (error) {
      console.error(error);
      res.status(500).send({
        error: 'An unexpected error occurred while processing your request.',
      });
    }
  }
);

export default router;

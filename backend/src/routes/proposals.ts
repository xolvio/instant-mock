import express, {Request, Response, Router} from 'express';
import {buildASTSchema, GraphQLSchema, parse} from 'graphql';
import Client from '../graphql/client';
import {createProposedSubgraphsFromOperationsMissingFields} from '../utilities/operationToSchema';

const router: Router = express.Router();
const client = new Client();

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
    const {backingVariant, activities} =
      await client.proposalLaunches(proposalId);

    const latestLaunch = activities?.edges?.find(
      //@ts-ignore
      (edge) => edge?.node?.target?.launch?.id === latestLaunchId
    );

    const status = latestLaunch?.node?.target?.launch?.status;

    switch (status) {
      case 'LAUNCH_INITIATED':
        console.log(`[Polling] Launch ${latestLaunchId} initiated. Waiting...`);
        await sleep(1000);
        break;

      case 'LAUNCH_FAILED':
        console.error(`[Polling] Launch ${latestLaunchId} failed.`);
        const failureLink = generateFailureLink(graphId, backingVariant.name);
        return {
          status: 'FAILED',
          message: `Launch ${latestLaunchId} failed. Check details here: ${failureLink}`,
        };

      case 'LAUNCH_COMPLETED':
        console.log(`[Polling] Launch ${latestLaunchId} completed.`);
        return {status: 'COMPLETED'};

      default:
        console.warn(`Unexpected status: ${status}. Exiting polling.`);
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
      const variant = await client.getVariant(graphId, variantName);
      const supergraph: GraphQLSchema = buildASTSchema(
        parse(variant.latestPublication.schema.document)
      );
      const subgraphs = variant.subgraphs.map(prepareSubgraphSchema);
      const subgraphInputs = createProposedSubgraphsFromOperationsMissingFields(
        supergraph,
        subgraphs,
        operation
      );

      let revision;
      const timestamp = getCurrentTimestamp();
      if (variant.isProposal) {
        revision = await client.publishProposalRevision(
          variant.proposal.id,
          subgraphInputs,
          `Auto-updating at ${timestamp}`,
          `auto-updated at ${timestamp}`,
          variant.latestLaunch.id
        );
      } else {
        const data = await client.createProposal(
          graphId,
          variantName,
          `Auto-generated at ${timestamp}`,
          ''
        );
        revision = await client.publishProposalRevision(
          data.graph.createProposal.proposal.id,
          subgraphInputs,
          `Auto-generated at ${timestamp}`,
          `auto-generated at ${timestamp}`,
          data.graph.createProposal.latestLaunch.id
        );
      }

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

      revision.proposal.key =
        revision.proposal.publishSubgraphs.backingVariant.id;
      res.json(revision);
    } catch (error) {
      console.error(error);
      res.status(500).send({
        error: 'An unexpected error occurred while processing your request.',
      });
    }
  }
);

export default router;

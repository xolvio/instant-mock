import express, {Request, Response, Router} from 'express';
import {buildASTSchema, GraphQLSchema, parse} from 'graphql';
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

router.post(
  '/proposals/:proposalId/revisions',
  async (req: Request, res: Response) => {
    const {proposalId} = req.params;
    const {subgraphInputs, summary, revision, previousLaunchId} = req.body;

    try {
      const data = await client.publishProposalRevision(
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
      }

      res.json({
        latestLaunchId:
          data.proposal.publishSubgraphs.backingVariant.latestLaunch.id,
      });
    } catch (error) {
      console.error(error);
      res.status(500).send({error: 'Error querying GraphQL API'});
    }
  }
);

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

      const latestLaunchId =
        revision.proposal.publishSubgraphs.backingVariant.latestLaunch.id;
      let launchCompleted = false;

      while (!launchCompleted) {
        const proposalStatus = await client.proposalLaunches(
          revision.proposal.publishSubgraphs.id
        );
        const latestLaunch = proposalStatus.activities?.edges?.find(
          //@ts-ignore
          (edge) => edge?.node?.target?.launch?.id === latestLaunchId
        );

        if (latestLaunch?.node?.target?.launch?.status === 'LAUNCH_COMPLETED') {
          launchCompleted = true;
          console.log(`[Polling] Launch ${latestLaunchId} is completed.`);
        } else {
          console.log(
            `[Polling] Waiting for launch ${latestLaunchId} to complete...`
          );
          await new Promise((resolve) => setTimeout(resolve, 1000));
        }
      }

      revision.proposal.key =
        revision.proposal.publishSubgraphs.backingVariant.id;
      res.json(revision);
    } catch (error) {
      console.error(error);
      res.status(500).send({error: 'An unexpected error occurred'});
    }
  }
);

export default router;

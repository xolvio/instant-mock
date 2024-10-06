import express, {Router} from 'express';
import GraphController from '../controllers/graphController';

const router: Router = express.Router();
const graphController = new GraphController();

//TODO not really sure if this route supposed to be there, let's leave it there for now
router.post(
  '/proposals/:proposalId/revisions',
  graphController.publishProposalRevision
);

router.post(
  '/create-or-update-schema-proposal-by-operation',
  graphController.createOrUpdateSchemaProposalByOperation
);
export default router;

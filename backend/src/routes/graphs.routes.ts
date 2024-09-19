import express, {Router} from 'express';
import GraphController from '../controllers/graphController';

const router: Router = express.Router();
const graphController = new GraphController();

router.get('/graphs', graphController.getGraphs);
router.get('/graphs/:graphId', graphController.getGraph);
router.post(
  '/graphs/:graphId/:variantName/proposals',
  graphController.createProposal
);

export default router;

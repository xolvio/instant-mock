import express, {Router} from "express";
import ProposalController from "../controllers/proposalController";

const router: Router = express.Router();
const proposalController = new ProposalController();

router.get('/proposals', proposalController.getProposals);

export default router;
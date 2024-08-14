import express, {Router} from "express";
import ProposalController from "../controllers/proposalController";

const router: Router = express.Router();
const proposalController = new ProposalController();

/**
 * @openapi
 * /api/proposals/:
 *   get:
 *     summary: Retrieve all proposals
 *     description: Fetches a list of all proposals from the service.
 *     tags:
 *       - Proposals
 *     responses:
 *       200:
 *         description: A list of proposals.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                     example: "dev"
 *                   title:
 *                     type: string
 *                     example: "dev"
 *                   created:
 *                     type: string
 *                     format: date-time
 *                     example: "2024-08-14T17:51:41.454519000Z"
 *                   author:
 *                     type: string
 *                     example: "user@ford.com"
 *                   status:
 *                     type: string
 *                     example: "CLOSED"
 *                   port:
 *                     type: integer
 *                     example: 8000
 *       500:
 *         description: Server error while querying the GraphQL API.
 */
router.get('/proposals', proposalController.getProposals);

export default router;
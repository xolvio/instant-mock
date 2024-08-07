import {Request, Response} from "express";
import {ProposalService} from "../service/proposalService";

export default class ProposalController {

    private proposalService: ProposalService;

    constructor() {
        this.proposalService = new ProposalService();
        this.getProposals = this.getProposals.bind(this);
    }

    async getProposals(req: Request, res: Response) {

        try {
            const proposals = await this.proposalService.getAllProposals();
            res.json(proposals);
        } catch (error) {
            console.error(error);
            res.status(500).send("Error querying GraphQL API");
        }
    }

}
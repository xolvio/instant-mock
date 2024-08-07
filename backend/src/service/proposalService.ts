import {Proposal} from "../models/proposal";
import proposals from "../proposals";
import Client from "../graphql/client";

export class ProposalService {

    private client: Client;

    constructor() {
        this.client = new Client();
    }

    async getAllProposals(): Promise<Proposal[]> {
        return Object.values(proposals);
    }

    // Fetches proposals from Apollo and updates the in memory proposals list
    async fetchProposalsFromApollo(): Promise<Proposal[]> {
        return this.client.getProposals();
    }

}
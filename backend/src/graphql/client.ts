import {ApolloClient, ApolloLink, HttpLink, InMemoryCache} from "@apollo/client";
import {setContext} from "@apollo/client/link/context";
import {GET_PROPOSALS} from "./queries/getProposals";
import {GET_SCHEMA} from "./queries/getSchema";
import {GRAPH_ID} from "../server";
import {Proposal, ProposalStatus} from "../models/proposal";
import proposals from "../proposals";
import {basePort, getPortPromise} from "portfinder";

export default class Client {
    private apolloClient: ApolloClient<any>;

    constructor() {
        const httpLink = new HttpLink({
            uri: "https://api.apollographql.com/api/graphql",
            fetch,
        });

        const authLink = setContext((_, {headers}) => {
            return {
                headers: {
                    ...headers,
                    "apollographql-client-name": "explorer",
                    "apollographql-client-version": "1.0.0",
                    "X-API-KEY": process.env.APOLLO_API_KEY,
                },
            };
        });

        this.apolloClient = new ApolloClient({
            link: ApolloLink.from([authLink, httpLink]),
            cache: new InMemoryCache(),
        });
    }

    async getProposals(): Promise<Proposal[]> {
        const {data} = await this.apolloClient.query({
            query: GET_PROPOSALS,
            variables: {graphId: GRAPH_ID, filterBy: {}}, // Adjust filterBy as needed
        });

        const port = await getPortPromise();
        proposals['dev'] = {
            id: 'dev',
            title: 'dev',
            port: port
        };

        return Promise.all(
            data.graph.proposals.proposals
                .filter((p: any) => p.backingVariant?.name)
                .map(async (p: any): Promise<Proposal> => {
                    const port = await getPortPromise({
                        port: 8001,    // minimum port
                    });
                    const proposal: Proposal = {
                        id: p.backingVariant.name,
                        title: p.displayName,
                        created: p.createdAt,
                        author: p.createdBy.name,
                        status: p.status as ProposalStatus,
                        port: port
                    };
                    proposals[proposal.id] = proposal;
                    return proposal;
                })
        );
    }

    async getSchema(variantName: string) {
        const {data} = await this.apolloClient.query({
            query: GET_SCHEMA,
            variables: {graphId: GRAPH_ID, variantName},
        });

        // Assuming the document exists and is not null
        return data.graph.variant.latestPublication.schema.document;
    }

}

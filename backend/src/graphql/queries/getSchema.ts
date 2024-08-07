import {gql} from "@apollo/client";

export const GET_SCHEMA = gql`
    query GetSDL($graphId: ID!, $variantName: String!) {
        graph(id: $graphId) {
            variant(name: $variantName) {
                id
                url
                latestPublication {
                    schema {
                        document
                    }
                }
            }
        }
    }
`;
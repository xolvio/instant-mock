import {gql} from "@apollo/client";

export const GET_PROPOSALS = gql`
    query GetGraph($graphId: ID!, $filterBy: ProposalsFilterInput) {
        graph(id: $graphId) {
            id
            title
            myRole
            proposals(filterBy: $filterBy) {
                totalCount
                proposals {
                    displayName
                    status
                    id
                    createdAt
                    createdBy {
                        name
                    }
                    backingVariant {
                        id
                        name
                    }
                }
            }
        }
    }
`;
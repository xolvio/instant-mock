import {gql} from '@apollo/client';

export const GET_GRAPH = gql`
  query GetGraph($graphId: ID!, $filterBy: ProposalsFilterInput) {
    graph(id: $graphId) {
      name
      variants {
        name
        latestPublication {
          publishedAt
        }
      }
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

import {gql} from '@apollo/client';

export const GET_GRAPH = gql`
  query GetGraph($graphId: ID!, $filterBy: ProposalsFilterInput) {
    graph(id: $graphId) {
      name
      variants {
        name
        latestPublication {
          publishedAt
          schema {
            document
          }
        }
      }
      proposals(filterBy: $filterBy) {
        totalCount
        proposals {
          displayName
          key: backingVariant {
            id
          }
          status
          id
          createdAt
          createdBy {
            name
          }
          backingVariant {
            id
            name
            latestPublication {
              schema {
                document
              }
            }
          }
        }
      }
    }
  }
`;

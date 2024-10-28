import {gql} from '@apollo/client';

export const GET_GRAPH = gql`
  query GetGraph($graphId: ID!, $filterBy: ProposalsFilterInput) {
    graph(id: $graphId) {
      variants {
        key: id
        displayName: name
        name
        latestPublication {
          publishedAt
          schema {
            document
          }
        }
      }
      proposals(filterBy: $filterBy) {
        proposals {
          displayName
          key: backingVariant {
            key: id
          }
          latestPublication: backingVariant {
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

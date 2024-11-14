import {gql} from '@apollo/client';

export const GET_GRAPH_WITH_SUBGRAPHS = gql`
  query GetGraphWithSubgraphs($graphId: ID!, $filterBy: ProposalsFilterInput) {
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
        subgraphs {
          name
          activePartialSchema {
            sdl
          }
        }
      }
      proposals(filterBy: $filterBy, limit: 100) {
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

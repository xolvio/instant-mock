import {gql} from '@apollo/client';

export const GET_GRAPH_WITH_SUBGRAPHS = gql`
  query GetGraph($graphId: ID!, $filterBy: ProposalsFilterInput) {
    graph(id: $graphId) {
      name
      variants {
        key: id
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
      proposals(filterBy: $filterBy) {
        proposals {
          displayName
          key: backingVariant {
            key: id
          }
          backingVariant {
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

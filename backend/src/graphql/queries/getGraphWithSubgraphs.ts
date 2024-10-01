import {gql} from '@apollo/client';

export const GET_GRAPH_WITH_SUBGRAPHS = gql`
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
        subgraphs {
          name
          activePartialSchema {
            sdl
          }
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
            subgraphs {
              name
              activePartialSchema {
                sdl
              }
            }
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

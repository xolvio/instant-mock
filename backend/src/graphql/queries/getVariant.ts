import {gql} from '@apollo/client';

export const GET_VARIANT = gql`
  query GetVariant($graphId: ID!, $name: String!) {
    graph(id: $graphId) {
      variant(name: $name) {
        id
        proposal {
          id
        }
        url
        subgraphs {
          name
          activePartialSchema {
            sdl
          }
        }
        latestLaunch {
          id
        }
        isProposal
        latestPublication {
          publishedAt
          schema {
            document
          }
        }
        name
      }
    }
  }
`;

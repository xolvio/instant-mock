import {gql} from '@apollo/client';

export const GET_SCHEMA = gql`
  query GetSDL($graphId: ID!, $name: String!) {
    graph(id: $graphId) {
      variant(name: $name) {
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

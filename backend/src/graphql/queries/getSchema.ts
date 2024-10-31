import {gql} from '@apollo/client';

export const GET_SCHEMA = gql`
  query GetSchema($graphId: ID!, $name: String!) {
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

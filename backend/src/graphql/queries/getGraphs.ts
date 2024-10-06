import {gql} from '@apollo/client';

export const GET_GRAPHS = gql`
  query GetGraphs($organizationId: ID!) {
    organization(id: $organizationId) {
      graphs {
        id
        name
        variants {
          id
          name
          latestPublication {
            publishedAt
          }
        }
        proposals {
          totalCount
        }
      }
    }
  }
`;

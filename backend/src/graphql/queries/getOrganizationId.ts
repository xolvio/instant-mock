import {gql} from '@apollo/client';

export const GET_ORGANIZATION_ID = gql`
  query GetOrganizationId {
    me {
      ... on User {
        memberships {
          account {
            id
          }
        }
      }
    }
  }
`;

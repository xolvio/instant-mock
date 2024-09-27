import {gql} from '@apollo/client';

export const GET_ORGANIZATION_ID = gql`
  query getOrganizationId {
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

import {gql} from '@apollo/client';

export const PROPOSAL_LAUNCHES = gql`
  query ProposalLaunches($proposalId: ID!) {
    proposal(id: $proposalId) {
      backingVariant {
        id
        name
      }
      activities {
        edges {
          node {
            target {
              ... on ProposalRevision {
                launch {
                  status
                  id
                }
              }
            }
          }
        }
      }
    }
  }
`;

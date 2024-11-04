import {gql} from '@apollo/client';

export const PUBLISH_PROPOSAL_REVISION = gql`
  mutation PublishProposalRevision(
    $proposalId: ID!
    $input: PublishProposalSubgraphsInput!
  ) {
    proposal(id: $proposalId) {
      ... on ProposalMutation {
        publishSubgraphs(input: $input) {
          ... on PermissionError {
            message
          }
          ... on ValidationError {
            message
          }
          ... on NotFoundError {
            message
          }
          ... on Error {
            message
          }
          ... on Proposal {
            id
            displayName
            backingVariant {
              id
              name
              subgraphs {
                revision
              }
              proposal {
                id
              }
              latestLaunch {
                id
              }
            }
          }
        }
      }
      ... on ValidationError {
        message
      }
      ... on NotFoundError {
        message
      }
      ... on PermissionError {
        message
      }
    }
  }
`;

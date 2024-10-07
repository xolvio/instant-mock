import {gql} from '@apollo/client';

export const UPDATE_PROPOSAL_STATUS = gql`
  mutation UpdateProposalStatus($proposalId: ID!, $status: ProposalStatus!) {
    proposal(id: $proposalId) {
      ... on ProposalMutation {
        updateStatus(status: $status) {
          ... on Proposal {
            id
            status
          }
          ... on PermissionError {
            message
          }
          ... on ValidationError {
            message
          }
        }
      }
    }
  }
`;

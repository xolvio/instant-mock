import {gql} from '@apollo/client';

export const CREATE_PROPOSAL = gql`
  mutation createProposal($graphId: ID!, $input: CreateProposalInput!) {
    graph(id: $graphId) {
      createProposal(input: $input) {
        ... on GraphVariant {
          name
        }
        ... on CreateProposalError {
          message
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
`;

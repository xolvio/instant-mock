// src/models/Proposal.ts
export interface Proposal {
  id: string;
  title: string;
  author?: string;
  created?: string;
  status?: ProposalStatus;
  port: number;
}

export enum ProposalStatus {
  OPEN = 'OPEN',
  DRAFT = 'DRAFT',
  APPROVED = 'APPROVED',
  CLOSED = 'CLOSED',
  IMPLEMENTED = 'IMPLEMENTED',
}

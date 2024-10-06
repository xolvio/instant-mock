// src/models/Proposal.ts
export type Proposal = {
    id: string;
    title: string;
    author: string;
    created: string;
    status: ProposalStatus;
};

export enum ProposalStatus {
    OPEN = 'OPEN',
    DRAFT = 'DRAFT',
    APPROVED = 'APPROVED',
    CLOSED = 'CLOSED',
    IMPLEMENTED = 'IMPLEMENTED',
}

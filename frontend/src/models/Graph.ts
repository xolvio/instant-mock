export type SchemaPublication = {
  publishedAt: string | null;
};

export type Variant = {
  id: string;
  name: string;
  latestPublication: SchemaPublication | null;
};

export type CreatedBy = {
  name: string;
};

export type Proposal = {
  displayName: string;
  status: string;
  id: string;
  createdAt: string;
  createdBy: CreatedBy;
  backingVariant: Variant;
};

export type ProposalsResult = {
  totalCount: number;
  proposals: Proposal[];
};

export type Graph = {
  id: string;
  name: string;
  variants: Variant[];
  proposals: ProposalsResult;
};

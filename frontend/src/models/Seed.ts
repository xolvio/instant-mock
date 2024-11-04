export type Seed = {
  id: number;
  operationName: string;
  seedResponse: string;
  operationMatchArguments: string;
  seedGroup: SeedGroup;
  variantName: string;
  graphId: string;
};

export type SeedGroup = {
  id: number;
  name: string;
};

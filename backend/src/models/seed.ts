import {Entity, PrimaryKey, Property} from '@mikro-orm/core';

@Entity()
export class Seed {
  @PrimaryKey()
  id!: number;

  @Property()
  graphId!: string;

  @Property()
  variantName!: string;

  @Property()
  operationName!: string;

  @Property({type: 'jsonb'})
  seedResponse!: any;

  @Property({type: 'jsonb'})
  operationMatchArguments!: any;

  @Property()
  seedGroupId!: string;

  constructor(
    graphId: string,
    variantName: string,
    operationName: string,
    seedResponse: any,
    operationMatchArguments: any,
    seedGroupId: string
  ) {
    this.graphId = graphId;
    this.variantName = variantName;
    this.operationName = operationName;
    this.seedResponse = seedResponse;
    this.operationMatchArguments = operationMatchArguments;
    this.seedGroupId = seedGroupId;
  }
}

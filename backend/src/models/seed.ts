import {Entity, PrimaryKey, Property, ManyToOne} from '@mikro-orm/core';
import {SeedGroup} from './seedGroup';

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

  @ManyToOne()
  seedGroup!: SeedGroup;

  constructor(
    graphId: string,
    variantName: string,
    operationName: string,
    seedResponse: any,
    operationMatchArguments: any,
    seedGroup: SeedGroup
  ) {
    this.graphId = graphId;
    this.variantName = variantName;
    this.operationName = operationName;
    this.seedResponse = seedResponse;
    this.operationMatchArguments = operationMatchArguments;
    this.seedGroup = seedGroup;
  }
}

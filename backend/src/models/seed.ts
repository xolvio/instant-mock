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
}

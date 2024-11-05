import {Entity, PrimaryKey, Property} from '@mikro-orm/core';

@Entity()
export class ApolloApiKey {
  @PrimaryKey()
  id!: number;

  @Property()
  key!: string;

  constructor(key: string) {
    this.key = key;
  }
}

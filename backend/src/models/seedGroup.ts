import {
  Entity,
  PrimaryKey,
  Property,
  Unique,
  OneToMany,
  Collection,
} from '@mikro-orm/core';
import {Seed} from './seed';

@Entity()
export class SeedGroup {
  @PrimaryKey()
  id!: number;

  @Property()
  @Unique()
  name!: string;

  @OneToMany(() => Seed, (seed) => seed.seedGroup)
  seeds = new Collection<Seed>(this);
}

import {faker} from '@faker-js/faker';
import {EntityManager} from '@mikro-orm/core';
import {Seeder} from '@mikro-orm/seeder';
import {Seed} from '../models/seed';

export class DatabaseSeeder extends Seeder {
  async run(em: EntityManager): Promise<void> {
    for (let i = 0; i < 10; i++) {
      em.create(Seed, {
        graphId: faker.string.uuid(),
        variantName: faker.word.sample(),
        operationName: faker.word.sample(),
        seedResponse: {data: {exampleField: faker.word.sample()}},
        operationMatchArguments: {arg1: faker.word.sample()},
        // @ts-ignore
        seedGroupId: faker.string.uuid(),
      });
    }
  }
}

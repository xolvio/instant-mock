import {Seeder} from '@mikro-orm/seeder';
import {EntityManager} from '@mikro-orm/core';
import {Seed} from '../models/seed';
import {faker} from '@faker-js/faker';

export class DatabaseSeeder extends Seeder {
  async run(em: EntityManager): Promise<void> {
    for (let i = 0; i < 10; i++) {
      em.create(Seed, {
        graphId: faker.string.uuid(),
        variantName: faker.word.sample(),
        operationName: faker.word.sample(),
        seedResponse: {data: {exampleField: faker.word.sample()}},
        operationMatchArguments: {arg1: faker.word.sample()},
        seedGroupId: faker.string.uuid(),
      });
    }
  }
}

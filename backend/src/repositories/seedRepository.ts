import {EntityManager} from '@mikro-orm/core';
import {Seed} from '../models/seed';

export class SeedRepository {
  constructor(private em: EntityManager) {}

  async findByGraphIdAndVariantName(
    graphId: string,
    variantName: string
  ): Promise<Seed[]> {
    return this.em.find(Seed, {graphId, variantName});
  }

  async findSeedById(id: number): Promise<Seed | null> {
    return this.em.findOne(Seed, {id});
  }

  async createSeed(seed: Seed): Promise<void> {
    await this.em.persistAndFlush(seed);
  }

  async updateSeed(seed: Seed): Promise<void> {
    await this.em.persistAndFlush(seed);
  }

  async deleteSeedById(id: number): Promise<Seed | null> {
    const seed = await this.findSeedById(id);
    if (seed) {
      await this.em.removeAndFlush(seed);
    }
    return seed;
  }

  async deleteSeedsByGraphId(graphId: string): Promise<number> {
    const result = await this.em.nativeDelete(Seed, {graphId});
    return result;
  }
}

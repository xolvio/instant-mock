import {getDatabase} from '../database/database';
import {Seed} from '../models/seed';

export class SeedRepository {
  async findAllByVariantName(variantName: string): Promise<Seed[]> {
    return await getDatabase().all(
      `SELECT id, operationName, seedResponse, operationMatchArguments, sequenceId
             FROM seeds
             WHERE variantName = ?`,
      [variantName]
    );
  }

  async createSeed(seed: Seed) {
    await getDatabase().run(
      `INSERT INTO seeds (variantName, operationName, seedResponse, operationMatchArguments, sequenceId)
             VALUES (?, ?, ?, ?, ?)`,
      [
        seed.variantName,
        seed.operationName,
        JSON.stringify(seed.seedResponse),
        JSON.stringify(seed.operationMatchArguments),
        seed.sequenceId,
      ]
    );
  }
}

import {getDatabase} from '../database/database';
import {Seed} from '../models/seed';

export class SeedRepository {
  async findByGraphIdAndVariantName(
    graphId: string,
    variantName: string
  ): Promise<Seed[]> {
    return await getDatabase().all(
      `SELECT id, graphId, variantName, operationName, seedResponse, operationMatchArguments, sequenceId
         FROM seeds
         WHERE variantName = ?
           AND graphId = ?`,
      [graphId, variantName]
    );
  }

  async findSeedById(id: number): Promise<Seed | null> {
    try {
      const db = getDatabase();
      const seed = await db.get<Seed>('SELECT * FROM seeds WHERE id = ?', id);
      return seed || null;
    } catch (error) {
      console.error('Error finding seed by ID:', error);
      throw new Error('Could not find seed');
    }
  }

  async createSeed(seed: Seed) {
    await getDatabase().run(
      `INSERT INTO seeds (graphId, variantName , operationName, seedResponse, operationMatchArguments, sequenceId)
             VALUES (?, ?, ?, ?, ?, ?)`,
      [
        seed.graphId,
        seed.variantName,
        seed.operationName,
        JSON.stringify(seed.seedResponse),
        JSON.stringify(seed.operationMatchArguments),
        seed.sequenceId,
      ]
    );
  }

  async deleteSeedById(id: number): Promise<Seed | null> {
    try {
      const db = getDatabase();

      // First, fetch the seed to return it after deletion
      const seed = await db.get<Seed>('SELECT * FROM seeds WHERE id = ?', id);

      if (!seed) {
        throw new Error(`Seed with ID ${id} does not exist`);
      }

      const result = await db.run('DELETE FROM seeds WHERE id = ?', id);

      // Check if the seed was deleted
      if ((result.changes as number) > 0) {
        return seed;
      } else {
        return null;
      }
    } catch (error) {
      console.error('Error deleting seed:', error);
      throw new Error('Could not delete seed');
    }
  }
}

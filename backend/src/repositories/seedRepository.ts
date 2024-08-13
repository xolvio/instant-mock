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

  async deleteSeedById(id: number): Promise<Seed | null> {
    try {
      const db = getDatabase();

      // First, fetch the seed to return it after deletion
      const seed = await db.get<Seed>('SELECT * FROM seeds WHERE id = ?', id);

      if (!seed) {
        throw new Error(`Seed with ID ${id} does not exist`);
      }

      // Proceed to delete the seed
      const result = await db.run('DELETE FROM seeds WHERE id = ?', id);

      // Check if the seed was deleted
      if ((result.changes as number) > 0) {
        return seed; // Return the deleted seed
      } else {
        return null; // Return null if no seed was deleted (this case is rare)
      }
    } catch (error) {
      console.error('Error deleting seed:', error);
      throw new Error('Could not delete seed');
    }
  }
}

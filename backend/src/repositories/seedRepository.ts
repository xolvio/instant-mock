import {QueryResult} from 'pg';
import {query} from '../database/database';
import {Seed} from '../models/seed';

export class SeedRepository {
  /**
   * Find seeds by graph_id and variant_name using underscore-style column names
   */
  async findByGraphIdAndVariantName(
    graphId: string,
    variantName: string
  ): Promise<Seed[]> {
    const result: QueryResult<Seed> = await query(
      `SELECT id, graph_id, variant_name, operation_name, seed_response, operation_match_arguments, sequence_id
       FROM seeds
       WHERE graph_id = $1
         AND variant_name = $2`,
      [graphId, variantName]
    );
    return result.rows;
  }

  /**
   * Find a seed by its id using underscore-style column names
   */
  async findSeedById(id: number): Promise<Seed | null> {
    try {
      const result = await query('SELECT * FROM seeds WHERE id = $1', [id]);
      return result.rows[0] || null;
    } catch (error) {
      console.error('Error finding seed by ID:', error);
      throw new Error('Could not find seed');
    }
  }

  /**
   * Create a new seed using underscore-style column names
   */
  async createSeed(seed: Seed): Promise<void> {
    try {
      await query(
        `INSERT INTO seeds (graph_id, variant_name, operation_name, seed_response, operation_match_arguments, sequence_id)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [
          seed.graphId,
          seed.variantName,
          seed.operationName,
          JSON.stringify(seed.seedResponse), // Storing as JSON
          JSON.stringify(seed.operationMatchArguments), // Storing as JSON
          seed.sequenceId,
        ]
      );
    } catch (error) {
      console.error('Error creating seed:', error);
      throw new Error('Could not create seed');
    }
  }

  /**
   * Delete a seed by its id using underscore-style column names
   */
  async deleteSeedById(id: number): Promise<Seed | null> {
    try {
      // First, fetch the seed to return it after deletion
      const result = await query('SELECT * FROM seeds WHERE id = $1', [id]);

      const seed = result.rows[0];
      if (!seed) {
        throw new Error(`Seed with ID ${id} does not exist`);
      }

      // Delete the seed
      const deleteResult = await query('DELETE FROM seeds WHERE id = $1', [id]);

      // Check if any rows were affected (i.e., seed was deleted)
      if (deleteResult?.rowCount && deleteResult.rowCount > 0) {
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

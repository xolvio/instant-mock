import {QueryResult} from 'pg';
import {query} from '../database/database';
import {Seed} from '../models/seed';

// TODO we should consider using ORM since mapping column names to properties is cumbersome
export class SeedRepository {
  async findByGraphIdAndVariantName(
    graphId: string,
    variantName: string
  ): Promise<Seed[]> {
    const result: QueryResult = await query(
      `SELECT id, graph_id, variant_name, operation_name, seed_response, operation_match_arguments, sequence_id
       FROM seeds
       WHERE graph_id = $1
         AND variant_name = $2`,
      [graphId, variantName]
    );

    return result.rows.map((row) => ({
      id: row.id,
      operationName: row.operation_name,
      seedResponse: row.seed_response,
      operationMatchArguments: row.operation_match_arguments,
      sequenceId: row.sequence_id,
      graphId: row.graph_id,
      variantName: row.variant_name,
    }));
  }

  async findSeedById(id: number): Promise<Seed | null> {
    try {
      const result = await query('SELECT * FROM seeds WHERE id = $1', [id]);

      if (result.rows.length === 0) {
        return null;
      }

      const row = result.rows[0];
      // Map the result to match your Seed interface (camelCase)
      return {
        id: row.id,
        operationName: row.operation_name,
        seedResponse: row.seed_response,
        operationMatchArguments: row.operation_match_arguments,
        sequenceId: row.sequence_id,
        graphId: row.graph_id,
        variantName: row.variant_name,
      };
    } catch (error) {
      console.error('Error finding seed by ID:', error);
      throw new Error('Could not find seed');
    }
  }

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

  async updateSeed(seed: Seed): Promise<void> {
    const {
      id,
      operationName,
      seedResponse,
      operationMatchArguments,
      sequenceId,
      graphId,
      variantName,
    } = seed;

    if (!id) {
      throw new Error('Seed ID is required to update the seed.');
    }

    try {
      await query(
        `UPDATE seeds 
       SET operation_name = $1, 
           seed_response = $2, 
           operation_match_arguments = $3, 
           sequence_id = $4, 
           graph_id = $5, 
           variant_name = $6
       WHERE id = $7`,
        [
          operationName,
          JSON.stringify(seedResponse),
          JSON.stringify(operationMatchArguments),
          sequenceId,
          graphId,
          variantName,
          id,
        ]
      );
    } catch (error) {
      console.error('Error updating seed:', error);
      throw new Error('Could not update seed');
    }
  }

  async deleteSeedById(id: number): Promise<Seed | null> {
    try {
      const result = await query('SELECT * FROM seeds WHERE id = $1', [id]);

      if (result.rows.length === 0) {
        return null;
      }

      const seed = result.rows[0];
      const deleteResult = await query('DELETE FROM seeds WHERE id = $1', [id]);

      if (deleteResult?.rowCount && deleteResult.rowCount > 0) {
        return {
          id: seed.id,
          operationName: seed.operation_name,
          seedResponse: seed.seed_response,
          operationMatchArguments: seed.operation_match_arguments,
          sequenceId: seed.sequence_id,
          graphId: seed.graph_id,
          variantName: seed.variant_name,
        };
      } else {
        return null;
      }
    } catch (error) {
      console.error('Error deleting seed:', error);
      throw new Error('Could not delete seed');
    }
  }
}

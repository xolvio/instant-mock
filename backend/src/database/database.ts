import {Pool, QueryResult} from 'pg';

// Database connection configuration
const pool = new Pool({
  user: 'myuser', // PostgreSQL username
  host: 'localhost', // Use 'localhost' if Node.js is running outside Docker, or 'postgres' if inside Docker
  database: 'mydatabase', // Name of the database
  password: 'mypassword', // PostgreSQL password
  port: 5432, // PostgreSQL port
});

let dbInitialized = false;

/**
 * Initializes the PostgreSQL database if it has not been initialized yet
 */
export const initializeDatabase = async (): Promise<void> => {
  if (dbInitialized) {
    return;
  }
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS seeds (
        id SERIAL PRIMARY KEY,
        variant_name TEXT,
        graph_id TEXT,
        operation_name TEXT,
        seed_response JSONB,
        operation_match_arguments JSONB,
        sequence_id TEXT
      )
    `);
    console.log('PostgreSQL Database initialized and ready for use.');
    dbInitialized = true;
  } catch (error) {
    console.error('Failed to initialize the database:', error);
    throw new Error('Failed to initialize the PostgreSQL database');
  }
};

/**
 * Provides access to the PostgreSQL database pool
 */
export const getDatabase = (): Pool => {
  if (!dbInitialized) {
    throw new Error(
      'Database has not been initialized. Please call initializeDatabase first.'
    );
  }
  return pool;
};

/**
 * Function to execute a query
 * @param text SQL query string
 * @param params Query parameters (optional)
 * @returns QueryResult from PostgreSQL
 */
export const query = async (
  text: string,
  params?: any[]
): Promise<QueryResult<any>> => {
  try {
    const res = await pool.query(text, params);
    return res;
  } catch (error) {
    console.error('Query execution failed:', error);
    throw new Error('Failed to execute query');
  }
};

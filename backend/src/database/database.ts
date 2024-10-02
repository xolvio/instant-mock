import {Pool, QueryResult} from 'pg';

// const sslConfig = {
//   rejectUnauthorized: false,
//   key: fs
//     .readFileSync(path.join(__dirname, '../../../certs/client-key.pem'))
//     .toString(),
//   cert: fs
//     .readFileSync(path.join(__dirname, '../../../certs/client-cert.pem'))
//     .toString(),
//   ca: fs
//     .readFileSync(path.join(__dirname, '../../../certs/server-ca.pem'))
//     .toString(),
// };
//
const pool = new Pool({
  user: process.env.POSTGRES_USER,
  host: process.env.POSTGRES_HOST,
  database: process.env.POSTGRES_DB,
  password: String(process.env.POSTGRES_PASSWORD),
  port: Number(process.env.POSTGRES_PORT),
  // ssl: sslConfig,
});

let dbInitialized = false;

// Initialize the database if not done yet
export const initializeDatabase = async (): Promise<void> => {
  if (dbInitialized) return;
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

export const getDatabase = (): Pool => {
  if (!dbInitialized) {
    throw new Error(
      'Database has not been initialized. Please call initializeDatabase first.'
    );
  }
  return pool;
};

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

import {Database, open} from 'sqlite';
import sqlite3 from 'sqlite3';

export type SQLiteDB = Database<sqlite3.Database, sqlite3.Statement>;

let db: SQLiteDB;

/**
 * Initializes the database if it has not been initialized yet
 */
export const initializeDatabase = async (): Promise<SQLiteDB> => {
  if (db) {
    return db;
  }
  try {
    db = await open({
      filename: './seeds.db',
      driver: sqlite3.Database,
    });
    await db.exec(`
            CREATE TABLE IF NOT EXISTS seeds (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                variantName TEXT,
                graphId TEXT,
                operationName TEXT,
                seedResponse TEXT,
                operationMatchArguments TEXT,
                sequenceId TEXT
            )
        `);
    console.log('Database initialized and ready for use.');
    return db;
  } catch (error) {
    console.error('Failed to open or create database:', error);
    throw new Error('Failed to initialize the database');
  }
};

/**
 * Provides access to the database instance, ensuring it is initialized first
 */
export const getDatabase = (): SQLiteDB => {
  if (!db) {
    throw new Error(
      'Database has not been initialized. Please call initializeDatabase first.'
    );
  }
  return db;
};

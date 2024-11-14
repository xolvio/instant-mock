import fs from 'fs';
import path from 'path';
import readline from 'readline';
import {logger} from '../utilities/logger';

const dbPath = path.join(process.cwd(), 'data', 'instant-mock.db');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const resetDatabase = async () => {
  if (fs.existsSync(dbPath)) {
    if (process.env.NODE_ENV === 'test' || process.argv.includes('--force')) {
      fs.unlinkSync(dbPath);
      logger.info('🗑️  Database deleted successfully!');
      process.exit(0);
    }

    rl.question(
      '🚨 Are you sure you want to reset the database? (y/N) ',
      (answer) => {
        if (answer.toLowerCase() === 'y') {
          fs.unlinkSync(dbPath);
          logger.info('🗑️  Database deleted successfully!');
        } else {
          logger.info('❌ Database reset cancelled');
        }
        process.exit(0);
      }
    );
  } else {
    logger.info('💡 No database file found to reset');
    process.exit(0);
  }
};

resetDatabase();

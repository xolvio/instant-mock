import {defineConfig} from '@mikro-orm/sqlite';
import {Seed} from './models/seed';
import {Migrator} from '@mikro-orm/migrations';
import {SeedGroup} from './models/seedGroup';
import {SqliteDriver} from '@mikro-orm/sqlite';
import {ApolloApiKey} from './models/apolloApiKey';
import {logger} from './utilities/logger';

const dbPath = './data/instant-mock.db';

export default defineConfig({
  debug: process.env.MIKRO_ORM_DEBUG === 'true' || false,
  entities: [Seed, SeedGroup, ApolloApiKey],
  dbName: dbPath,
  driver: SqliteDriver,
  logger: (message) => logger.db(message),
  migrations: {
    path: './dist/migrations/sqlite',
    pathTs: './src/migrations/sqlite',
  },
  extensions: [Migrator],
});

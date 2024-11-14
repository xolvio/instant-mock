import {defineConfig} from '@mikro-orm/postgresql';
import {Seed} from './models/seed';
import {Migrator} from '@mikro-orm/migrations';
import {SeedGroup} from './models/seedGroup';
import {ApolloApiKey} from './models/apolloApiKey';
import {logger} from './utilities/logger';

export default defineConfig({
  debug: process.env.MIKRO_ORM_DEBUG === 'true' || false,
  entities: [Seed, SeedGroup, ApolloApiKey],
  dbName: process.env.POSTGRES_DB,
  user: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  host: process.env.POSTGRES_HOST,
  port: Number(process.env.POSTGRES_PORT),
  logger: (message) => logger.db(message),
  migrations: {
    path: './src/migrations/postgres',
  },
  extensions: [Migrator],
});

import {defineConfig} from '@mikro-orm/postgresql';
import {Seed} from './models/seed';
import {Migrator} from '@mikro-orm/migrations';
import {SeedGroup} from './models/seedGroup';
import {ApolloApiKey} from './models/apolloApiKey';

export default defineConfig({
  debug: true,
  entities: [Seed, SeedGroup, ApolloApiKey],
  dbName: process.env.POSTGRES_DB,
  user: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  host: process.env.POSTGRES_HOST,
  port: Number(process.env.POSTGRES_PORT),
  migrations: {
    path: './src/migrations/postgres',
  },
  extensions: [Migrator],
});

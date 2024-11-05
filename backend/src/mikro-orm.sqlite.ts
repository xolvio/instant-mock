import {defineConfig} from '@mikro-orm/sqlite';
import {Seed} from './models/seed';
import {Migrator} from '@mikro-orm/migrations';
import {SeedGroup} from './models/seedGroup';
import {SqliteDriver} from '@mikro-orm/sqlite';
import {ApolloApiKey} from './models/apolloApiKey';

export default defineConfig({
  debug: true,
  entities: [Seed, SeedGroup, ApolloApiKey],
  dbName: './data/instant-mock.db',
  driver: SqliteDriver,
  migrations: {
    path: './dist/migrations/sqlite',
    pathTs: './src/migrations/sqlite',
  },
  extensions: [Migrator],
});

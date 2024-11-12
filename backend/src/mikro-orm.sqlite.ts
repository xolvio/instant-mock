import {defineConfig} from '@mikro-orm/sqlite';
import {Seed} from './models/seed';
import {Migrator} from '@mikro-orm/migrations';
import {SeedGroup} from './models/seedGroup';
import {SqliteDriver} from '@mikro-orm/sqlite';
import {ApolloApiKey} from './models/apolloApiKey';

const dbPath = './data/instant-mock.db';

export default defineConfig({
  //TODO: disable!
  debug: true,
  entities: [Seed, SeedGroup, ApolloApiKey],
  dbName: dbPath,
  driver: SqliteDriver,
  migrations: {
    path: './dist/migrations/sqlite',
    pathTs: './src/migrations/sqlite',
  },
  extensions: [Migrator],
});

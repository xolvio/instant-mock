//Dont move these
import 'reflect-metadata';
import {
  EntityManager,
  EntityRepository,
  MikroORM,
  RequestContext,
} from '@mikro-orm/core';
import cors from 'cors';
import express from 'express';
import path from 'path';
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import * as Undici from 'undici';
import Client from './graphql/client';
import {ApolloApiKey} from './models/apolloApiKey';
import {Seed} from './models/seed';
import {SeedGroup} from './models/seedGroup';
import apolloApiKeysRoutes from './routes/apolloApiKey';
import graphqlRoutes from './routes/graphql';
import graphsRoutes from './routes/graphs';
import proposalsRoutes from './routes/proposals';
import seedGroupsRoutes from './routes/seedGroups';
import seedsRoutes from './routes/seeds';

require('dotenv').config();

const isTypescript = __filename.endsWith('.ts');

// Migrations are specified in the config file and run upon config init
const mikroOrmConfig = {
  ...require(
    `./mikro-orm.${process.env.MIKRO_ORM_DRIVER || 'sqlite'}${isTypescript ? '.ts' : '.js'}`
  ).default,
  debug: process.env.NODE_ENV !== 'production',
};

const ProxyAgent = Undici.ProxyAgent;
const setGlobalDispatcher = Undici.setGlobalDispatcher;
if (process.env.HTTP_PROXY)
  console.log('process.env.HTTP_PROXY: ', process.env.HTTP_PROXY);
console.log(
  'process.env.APOLLO_API_KEY is present: ',
  !!process.env.APOLLO_API_KEY
);

if (process.env.HTTP_PROXY) {
  setGlobalDispatcher(new ProxyAgent(process.env.HTTP_PROXY));
}

export const DI = {} as {
  orm: MikroORM;
  em: EntityManager;
  seeds: EntityRepository<Seed>;
  seedGroups: EntityRepository<SeedGroup>;
  apolloApiKeys: EntityRepository<ApolloApiKey>;
  apolloClient: Client;
};

const app = express();
const port = process.env.PORT || 3033;

(async () => {
  // Migrations run here
  DI.orm = await MikroORM.init(mikroOrmConfig);

  const migrator = DI.orm.getMigrator();
  await migrator.up();

  DI.em = DI.orm.em;
  DI.seeds = DI.orm.em.getRepository(Seed);
  DI.seedGroups = DI.orm.em.getRepository(SeedGroup);
  DI.apolloApiKeys = DI.orm.em.getRepository(ApolloApiKey);

  if (process.env.APOLLO_API_KEY) {
    const em = DI.orm.em.fork();
    try {
      const newApiKey = em.getRepository(ApolloApiKey).create({
        key: process.env.APOLLO_API_KEY,
      });
      await em.persistAndFlush(newApiKey);
      console.log('Apollo API key saved successfully.');
    } catch (error) {
      console.error('Failed to save Apollo API key:', error);
    }
  }

  DI.apolloClient = new Client();
  await DI.apolloClient.initializeClient();
  console.log('after client...');

  const em = DI.orm.em.fork();
  const defaultGroup = await em
    .getRepository(SeedGroup)
    .findOne({name: 'default'});
  if (!defaultGroup) {
    const newGroup = em.getRepository(SeedGroup).create({name: 'default'});
    await em.persistAndFlush(newGroup);
  }

  app.use(express.json({limit: '50mb'}));
  app.use(express.urlencoded({limit: '50mb', extended: true}));
  app.use(cors());
  app.use(express.json());
  app.use((_, __, next) => RequestContext.create(DI.orm.em, next));
  app.use('/api', seedsRoutes);
  app.use('/api', graphsRoutes);
  app.use('/api', proposalsRoutes);
  app.use('/api', graphqlRoutes);
  app.use('/api', seedGroupsRoutes);
  app.use('/api', apolloApiKeysRoutes);

  const isConnected = await DI.orm.isConnected();
  app.get('/health', (_, res) => {
    const healthcheck = {
      status: 'ok',
      timestamp: new Date(),
      uptime: process.uptime(),
      database: isConnected ? 'connected' : 'disconnected',
    };
    res.json(healthcheck);
  });

  const options = {
    definition: {
      openapi: '3.0.0',
      info: {
        title: 'Instant Mock',
        version: '0.1.0-alpha',
        description: 'Mocks, but more instantly...',
      },
    },
    apis: [
      path.join(__dirname, './routes/*.ts'),
      path.join(__dirname, 'server.ts'),
    ],
  };

  const swaggerSpec = swaggerJsdoc(options);
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
  app.get('/api/openapi.json', (_, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerSpec);
  });

  app.use(express.static(path.join(__dirname, '../../frontend/build')));
  app.get('*', (_, res) => {
    res.sendFile(path.join(__dirname, '../../frontend/build', 'index.html'));
  });

  app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
  });
})();

import './loadEnv';
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
import {logger} from './utilities/logger';

const isTypescript = __filename.endsWith('.ts');
const ProxyAgent = Undici.ProxyAgent;
const setGlobalDispatcher = Undici.setGlobalDispatcher;

if (process.env.HTTP_PROXY) {
  logger.startup('HTTP_PROXY configuration detected', {
    proxy: process.env.HTTP_PROXY,
  });
  setGlobalDispatcher(new ProxyAgent(process.env.HTTP_PROXY));
} else {
  logger.startup('No HTTP_PROXY configuration detected');
}

logger.startup('Checking APOLLO_API_KEY presence', {
  present: !!process.env.APOLLO_API_KEY,
});

const port = process.env.PORT || 3033;

export const DI = {} as {
  orm: MikroORM;
  em: EntityManager;
  seeds: EntityRepository<Seed>;
  seedGroups: EntityRepository<SeedGroup>;
  apolloApiKeys: EntityRepository<ApolloApiKey>;
  apolloClient: Client;
};

const initializeApp = async () => {
  const mikroOrmConfig = {
    ...(await import(
      `./mikro-orm.${process.env.MIKRO_ORM_DRIVER || 'sqlite'}${isTypescript ? '.ts' : '.js'}`
    ).then((module) => module.default)),
  };

  DI.orm = await MikroORM.init(mikroOrmConfig);
  await DI.orm.getMigrator().up();
  logger.startup('Database initialized and migrations applied');

  DI.em = DI.orm.em;
  DI.seeds = DI.orm.em.getRepository(Seed);
  DI.seedGroups = DI.orm.em.getRepository(SeedGroup);
  DI.apolloApiKeys = DI.orm.em.getRepository(ApolloApiKey);

  if (process.env.APOLLO_API_KEY) {
    const em = DI.orm.em.fork();
    try {
      const apiKey = process.env.APOLLO_API_KEY;
      const existingKey = await em.findOne(ApolloApiKey, {id: 1});

      if (existingKey) {
        const newApiKey = new ApolloApiKey(apiKey);
        existingKey.encryptedKey = newApiKey.encryptedKey;
        existingKey.iv = newApiKey.iv;
        existingKey.tag = newApiKey.tag;
        await em.flush();
      } else {
        const newApiKey = new ApolloApiKey(apiKey);
        await em.persistAndFlush(newApiKey);
      }
      logger.startup('Apollo API key saved successfully');
    } catch (error) {
      if (error instanceof Error) {
        logger.error('Failed to save Apollo API key', {
          message: error.message,
          stack: error.stack,
        });
      } else {
        logger.error('Failed to save Apollo API key', {error});
      }
    }
  }

  DI.apolloClient = new Client();
  await DI.apolloClient.initializeClient();
  logger.startup('Apollo client initialized');

  const em = DI.orm.em.fork();
  const defaultGroup = await em
    .getRepository(SeedGroup)
    .findOne({name: 'default'});
  if (!defaultGroup) {
    const newGroup = em.getRepository(SeedGroup).create({name: 'default'});
    await em.persistAndFlush(newGroup);
  }

  const app = express();
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
    logger.http('Health check performed', healthcheck);
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
    logger.api('Swagger API documentation served');
  });

  app.use(express.static(path.join(__dirname, '../../frontend/build')));
  app.get('*', (_, res) => {
    res.sendFile(path.join(__dirname, '../../frontend/build', 'index.html'));
  });

  app.listen(port, () => {
    logger.startup('Server running', {port, url: `http://localhost:${port}`});
  });
};

initializeApp().catch((error) => {
  logger.error('Failed to start the application', error);
});

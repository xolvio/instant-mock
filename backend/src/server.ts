import 'reflect-metadata';
require('dotenv').config();

import {
  EntityManager,
  EntityRepository,
  MikroORM,
  RequestContext,
} from '@mikro-orm/core';
import mikroOrmConfig from './mikro-orm.config';
import {Seed} from './models/seed';
import cors from 'cors';
import express from 'express';
import * as Undici from 'undici';
import path from 'path';
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import graphqlRoutes from './routes/graphql';
import graphsRoutes from './routes/graphs';
import proposalsRoutes from './routes/proposals';
import seedsRoutes from './routes/seeds';

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
};

const app = express();
const port = process.env.PORT || 3001;

(async () => {
  DI.orm = await MikroORM.init(mikroOrmConfig);
  DI.em = DI.orm.em;
  DI.seeds = DI.orm.em.getRepository(Seed);

  app.use(cors());
  app.use(express.json());
  app.use((_, __, next) => RequestContext.create(DI.orm.em, next));
  app.use('/api', seedsRoutes);
  app.use('/api', graphsRoutes);
  app.use('/api', proposalsRoutes);
  app.use('/api', graphqlRoutes);

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

  // TODO: enable for sinlge-container deploys (also need sqlite)
  // app.use(express.static(path.join(__dirname, '../../frontend/build')));
  // // Catch-all route for serving the frontend
  // app.get('*', (_, res) => {
  //   res.sendFile(path.join(__dirname, '../../frontend/build', 'index.html'));
  // });

  app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
  });
})();

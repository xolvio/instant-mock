require('dotenv').config();

import {
  EntityManager,
  EntityRepository,
  MikroORM,
  RequestContext,
} from '@mikro-orm/core';
import cors from 'cors';
import express from 'express';
import {parse} from 'graphql';
import path from 'path';
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import * as Undici from 'undici';
import mikroOrmConfig from './mikro-orm.config';
import {Seed} from './models/seed';
import graphsRoutes from './routes/graphs.routes';
import proposalsRoutes from './routes/proposals.routes';
import seedsRoutes from './routes/seeds.routes';
import {MockService} from './service/mockService';

const ProxyAgent = Undici.ProxyAgent;
const setGlobalDispatcher = Undici.setGlobalDispatcher;

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

  const mockService = MockService.getInstance(DI.em);

  app.use(cors());
  app.use(express.json());
  app.use(express.static(path.join(__dirname, '../../frontend/build')));

  // Attach MikroORM's RequestContext middleware
  app.use((_, __, next) => RequestContext.create(DI.orm.em, next));

  app.use('/api', seedsRoutes);
  app.use('/api', graphsRoutes);
  app.use('/api', proposalsRoutes);

  // Swagger setup
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

  // Centralized function for GraphQL requests
  const handleGraphQLRequest = async (
    req: express.Request,
    res: express.Response,
    graphId: string,
    variantName: string
  ) => {
    const {query = '', variables = {}} = req.body;
    const operationName = req.body.operationName;
    const sequenceId = req.headers['mocking-sequence-id'] as string;

    // Log the graphId, variantName, and operationName for debugging
    console.log('Handling GraphQL Request:', {
      graphId,
      variantName,
      operationName,
    });

    if (!operationName) {
      return res
        .status(400)
        .json({message: 'GraphQL operation name is required'});
    }

    try {
      parse(query);
    } catch (error) {
      console.error('Invalid GraphQL Query:', error);
      return res.status(422).json({message: 'Invalid GraphQL Query', error});
    }

    const mockServer = await mockService.getOrStartNewMockServer(
      graphId,
      variantName
    );
    const queryWithoutFragments = mockServer.expandFragments(query);
    const typenamedQuery = mockServer.addTypenameFieldsToQuery(
      queryWithoutFragments
    );

    try {
      const operationResult = await mockServer.executeOperation({
        query: typenamedQuery,
        variables,
        operationName,
      });

      const {operationResponse, statusCode} =
        await mockServer.seedManager.mergeOperationResponse({
          operationName,
          variables,
          operationMock: operationResult,
          sequenceId,
          mockServer,
          query: typenamedQuery,
        });

      console.log('Operation Result:', operationResult);
      res.status(statusCode);
      operationResponse ? res.json(operationResponse) : res.end();
    } catch (error) {
      console.error('GraphQL Execution Error:', error);
      res
        .status(500)
        .json({message: 'GraphQL operation execution error', error});
    }
  };

  // Routes with specific parameters: /:graphId/:variantName/graphql
  app.use('/:graphId/:variantName/graphql', (req, res) =>
    handleGraphQLRequest(
      req,
      res,
      (req.params.graphId as string) || '',
      (req.params.variantName as string) || ''
    )
  );

  // Generic GraphQL route: /graphql
  app.use('/graphql', (req, res) =>
    handleGraphQLRequest(
      req,
      res,
      (req.headers['graph-id'] as string) || '',
      (req.headers['variant-name'] as string) || ''
    )
  );

  // Catch-all route for serving the frontend
  app.get('*', (_, res) => {
    res.sendFile(path.join(__dirname, '../../frontend/build', 'index.html'));
  });

  app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
  });
})();

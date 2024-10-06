require('dotenv').config();

import cors from 'cors';
import express from 'express';
import { parse } from 'graphql';
import path from 'path';
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import * as Undici from 'undici';
import { initializeDatabase } from './database/database';
import graphsRoutes from './routes/graphs.routes';
import proposalsRoutes from './routes/proposals.routes';
import seedsRoutes from './routes/seeds.routes';
import { SeededOperationResponse } from './seed/types';
import { MockService } from './service/mockService';

const proxy = require('express-http-proxy');

const ProxyAgent = Undici.ProxyAgent;
const setGlobalDispatcher = Undici.setGlobalDispatcher;
console.log('process.env.HTTP_PROXY: ', process.env.HTTP_PROXY);
console.log(
  'process.env.APOLLO_API_KEY is present: ',
  !!process.env.APOLLO_API_KEY
);

if (process.env.HTTP_PROXY)
  setGlobalDispatcher(new ProxyAgent(process.env.HTTP_PROXY));

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../../frontend/build')));

app.use('/api', seedsRoutes);
app.use('/api', graphsRoutes);
app.use('/api', proposalsRoutes);
const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Instant Mock',
      version: '0.1.0-alpha',
      description: 'Mocks, but more instantly...'
    },
  },
  apis: [
    path.join(__dirname, './routes/*.ts'),
    path.join(__dirname, 'server.ts'),
  ],
};

const swaggerSpec = swaggerJsdoc(options);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.get('/api/openapi.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
});
app.get('*', (_, res) => {
  res.sendFile(path.join(__dirname, '../../frontend/build', 'index.html'));
});

const mockService = MockService.getInstance();

app.use('/:graphId/:variantName/graphql', async (req, res) => {
  // TODO: handle invalid graphId/variantName
  const { graphId, variantName } = req.params;
  const { query = '', variables = {} } = req.body;
  const operationName = req.body.operationName;
  const sequenceId = req.headers['mocking-sequence-id'] as string;

  if (!operationName) {
    res.status(400);
    res.json({
      message: 'GraphQL operation name is required',
    });
    return;
  }

  const mockServer = await mockService.getOrStartNewMockServer(
    graphId,
    variantName
  );

  try {
    parse(query);
  } catch (error) {
    // GraphqlMockingContextLogger.error(
    //     `Invalid GraphQL Query: ${(error as Error).message}`,
    //     sequenceId
    // );
    res.status(422);
    res.json({
      message: 'Invalid GraphQL Query',
      error,
    });
    return;
  }
  const queryWithoutFragments = mockServer.expandFragments(query);
  const typenamedQuery = mockServer.addTypenameFieldsToQuery(
    queryWithoutFragments
  );

  let operationResult;
  try {
    const apolloServer = mockServer.apolloServer;
    if (apolloServer) {
      operationResult = await mockServer.executeOperation({
        query: typenamedQuery,
        variables,
        operationName,
      });
    }
  } catch (error) {
    res.status(500);
    res.json({
      message: 'GraphQL operation execution error',
      error,
    });
    return;
  }

  const { operationResponse, statusCode } =
    await mockServer.seedManager.mergeOperationResponse({
      operationName,
      variables,
      // @ts-expect-error TODO fix types
      operationMock: operationResult,
      sequenceId,
      mockServer,
      query: typenamedQuery,
    });

  res.status(statusCode);

  if (operationResponse === null) {
    res.end();
  } else if (operationResponse instanceof Object) {
    if ('warnings' in operationResponse) {
      (operationResponse as SeededOperationResponse).warnings?.forEach(
        (warning) => {
          // GraphqlMockingContextLogger.warning(warning, sequenceId);
          console.warn(warning);
        }
      );
    }
    res.json(operationResponse);
  } else {
    res.send(operationResponse);
  }
});

// TODO refactor to avoid code duplication
app.use('/graphql', async (req, res) => {
  // TODO handle invalid
  const { query = '', variables = {} } = req.body;
  const operationName = req.body.operationName;
  const graphId = req.headers['graph-id'] as string;
  const variantName = req.headers['variant-name'] as string;
  const sequenceId = req.headers['mocking-sequence-id'] as string;

  if (!operationName) {
    res.status(400);
    res.json({
      message: 'GraphQL operation name is required',
    });
    return;
  }

  const mockServer = await mockService.getOrStartNewMockServer(
    graphId,
    variantName
  );

  try {
    // verify the query is valid
    parse(query);
  } catch (error) {
    // GraphqlMockingContextLogger.error(
    //     `Invalid GraphQL Query: ${(error as Error).message}`,
    //     sequenceId
    // );
    res.status(422);
    res.json({
      message: 'Invalid GraphQL Query',
      error,
    });
    return;
  }
  const queryWithoutFragments = mockServer.expandFragments(query);
  const typenamedQuery = mockServer.addTypenameFieldsToQuery(
    queryWithoutFragments
  );

  let operationResult;
  try {
    const apolloServer = mockServer.apolloServer;
    if (apolloServer) {
      operationResult = await mockServer.executeOperation({
        query: typenamedQuery,
        variables,
        operationName,
      });
    }
  } catch (error) {
    res.status(500);
    res.json({
      message: 'GraphQL operation execution error',
      error,
    });
    return;
  }

  const { operationResponse, statusCode } =
    await mockServer.seedManager.mergeOperationResponse({
      operationName,
      variables,
      // @ts-expect-error TODO fix types
      operationMock: operationResult,
      sequenceId,
      mockServer,
      query: typenamedQuery,
    });

  res.status(statusCode);

  if (operationResponse === null) {
    res.end();
  } else if (operationResponse instanceof Object) {
    if ('warnings' in operationResponse) {
      (operationResponse as SeededOperationResponse).warnings?.forEach(
        (warning) => {
          // GraphqlMockingContextLogger.warning(warning, sequenceId);
          console.warn(warning);
        }
      );
    }
    res.json(operationResponse);
  } else {
    res.send(operationResponse);
  }
});

initializeDatabase()
  .then(() => {
    app.listen(port, () => {
      console.log(`Server running on port ${port}`);
    });
    return;
  })
  .catch((error) => {
    console.error('Error starting InstantMock:', error);
    process.exit(1);
  });

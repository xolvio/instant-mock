import express from 'express';
import path from 'path';
import cors from 'cors';
import mockInstances from './mockInstances';
import {initializeDatabase} from './database/database';
import seedsRoutes from './routes/seeds.routes';
import proposalsRoutes from './routes/proposals.routes';
import mocksRoutes from './routes/mocks.routes';
import {MockService} from './service/mockService';
import {ProposalService} from './service/proposalService';
import proposals from './proposals';
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import * as Undici from 'undici';
import {parse} from "graphql";
import {SeededOperationResponse} from "./seed/types";

var proxy = require('express-http-proxy');

require('dotenv').config();

const ProxyAgent = Undici.ProxyAgent;
const setGlobalDispatcher = Undici.setGlobalDispatcher;
console.log('process.env.HTTP_PROXY: ', process.env.HTTP_PROXY);
console.log('process.env.APOLLO_API_KEY: ', process.env.APOLLO_API_KEY);
if (process.env.HTTP_PROXY)
  setGlobalDispatcher(new ProxyAgent(process.env.HTTP_PROXY));

const app = express();
const port = process.env.PORT || 3001;
export const GRAPH_ID = process.env.GRAPH_ID || 'dev-federation-x02qb';

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../../frontend/build')));
app.use('/api', seedsRoutes);
app.use('/api', proposalsRoutes);
app.use('/api', mocksRoutes);
const mockService = MockService.getInstance();
const proposalService = new ProposalService();

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Instant Mock',
      version: '1.0.0',
    },
  },
  apis: [
    path.join(__dirname, './routes/*.js'),
    path.join(__dirname, 'server.js'),
  ],
};

const swaggerSpec = swaggerJsdoc(options);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
// Expose the OpenAPI JSON directly
app.get('/api/openapi.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
});

app.use('/:proposalId/graphql', async (req, res) => {
  // TODO handle invalid
  const { proposalId } = req.params;
  const {query = '', variables = {}} = req.body;
  const operationName = req.body.operationName
  const sequenceId = req.headers['mocking-sequence-id'] as string;
  if (!operationName) {
    res.status(400);
    res.json({
      message: 'GraphQL operation name is required',
    });
    return;
  }

  const mockServer = await mockService.startNewMockInstanceIfNeeded(proposalId)
  // const mockServer = mockInstances[proposalId];

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

  const {operationResponse, statusCode} =
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
    return proposalService.fetchProposalsFromApollo();
  })
  .then((proposals) => {
    console.log(`${proposals.length} Proposals fetched`);
  })
  .catch((error) => {
    console.error('Error starting InstantMock:', error);
    process.exit(1);
  });

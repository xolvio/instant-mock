import {Mutex} from 'async-mutex';
import {Request, Response, Router} from 'express';
import {parse} from 'graphql';
import mockInstances from '../mockInstances';
import MockServer from '../MockServer';
import {SeedType} from '../seed/SeedManager';
import {DI} from '../server';
import {logger} from '../utilities/logger';

const router = Router();
const mutex = new Mutex();

export const getOrStartNewMockServer = async (
  graphId: string,
  variantName: string
): Promise<MockServer | undefined> => {
  const release = await mutex.acquire();
  try {
    let mockInstance = mockInstances[graphId]?.[variantName];
    if (!mockInstance) {
      logger.debug('No existing mock instance found, creating new one', {
        graphId,
        variantName,
      });
      mockInstance = await startNewMockServer(graphId, variantName);
    }
    return mockInstance;
  } catch (error) {
    logger.error('Error getting or starting new mock server', {error});
  } finally {
    release();
  }
};

const startNewMockServer = async (
  graphId: string,
  variantName: string
): Promise<MockServer> => {
  logger.debug('Starting new mock server', {graphId, variantName});
  const schema = await DI.apolloClient.getSchema(graphId, variantName);

  if (!schema) throw new Error('Schema not found');
  const mockServer = new MockServer(schema, {
    subgraph: false,
    fakerConfig: {},
  });

  const seeds = await DI.seeds.find({graphId, variantName});
  logger.debug('Loading seeds into mock server', {
    seedCount: seeds.length,
    graphId,
    variantName,
  });

  seeds.forEach((seed) => {
    mockServer.seedManager.registerSeed(seed.seedGroup.id, SeedType.Operation, {
      operationName: seed.operationName,
      seedResponse: seed.seedResponse,
      operationMatchArguments: seed.operationMatchArguments,
    });
  });

  mockInstances[graphId] = mockInstances[graphId] || {};
  mockInstances[graphId][variantName] = mockServer;

  logger.debug('Mock server started successfully', {graphId, variantName});
  return mockServer;
};

const handleGraphQLRequest = async (
  req: Request,
  res: Response,
  graphId: string,
  variantName: string
) => {
  const {query = '', variables = {}} = req.body;
  const operationName = req.body.operationName;
  const seedGroupName = req.headers['seed-group'] as string;

  //could be cached
  const seedGroup = await DI.seedGroups.findOne({name: seedGroupName});

  if (!seedGroup) {
    return res.status(400).json({message: 'Seed group not found'});
  }

  logger.graph('Handling GraphQL Request:', {
    graphId,
    variantName,
    operationName,
    // query,
    // variables,
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

  const mockServer = await getOrStartNewMockServer(graphId, variantName);
  if (!mockServer) {
    console.error('Could not start mock server', {graphId, variantName});
    return res.status(422).json({message: 'Could not start mock server'});
  }

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

    if (operationName === 'IntrospectionQuery') {
      res.status(200);
      return res.json(operationResult);
    }

    const {operationResponse, statusCode} =
      await mockServer.seedManager.mergeOperationResponse({
        operationName,
        variables,
        operationMock: operationResult,
        seedGroupId: seedGroup.id,
        mockServer,
        query: typenamedQuery,
      });

    console.log('Operation Result:', operationResult);
    res.status(statusCode);
    operationResponse ? res.json(operationResponse) : res.end();
  } catch (error) {
    console.error('GraphQL Execution Error:', error);
    res.status(500).json({message: 'GraphQL operation execution error', error});
  }
};

router.post('/:graphId/:variantName/graphql', (req, res) =>
  handleGraphQLRequest(req, res, req.params.graphId, req.params.variantName)
);

router.post('/graphql', (req, res) =>
  handleGraphQLRequest(
    req,
    res,
    (req.headers['graph-id'] as string) || '',
    (req.headers['variant-name'] as string) || ''
  )
);

export default router;

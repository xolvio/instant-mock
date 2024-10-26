import {Mutex} from 'async-mutex';
import {Request, Response, Router} from 'express';
import {parse} from 'graphql';
import Client from '../graphql/client';
import mockInstances from '../mockInstances';
import MockServer from '../MockServer';
import {SeedType} from '../seed/SeedManager';
import {DI} from '../server';

const router = Router();
const client = new Client();
const mutex = new Mutex();

const getOrStartNewMockServer = async (
  graphId: string,
  variantName: string
): Promise<MockServer> => {
  const release = await mutex.acquire();
  try {
    let mockInstance = mockInstances[graphId]?.[variantName];
    if (!mockInstance) {
      mockInstance = await startNewMockServer(graphId, variantName);
    }
    return mockInstance;
  } finally {
    release();
  }
};

const startNewMockServer = async (
  graphId: string,
  variantName: string
): Promise<MockServer> => {
  const schema = await client.getSchema(graphId, variantName);

  const mockServer = new MockServer(schema, {
    subgraph: false,
    fakerConfig: {},
  });

  const seeds = await DI.seeds.find({graphId, variantName});

  seeds.forEach((seed) => {
    mockServer.seedManager.registerSeed(seed.seedGroup.id, SeedType.Operation, {
      operationName: seed.operationName,
      seedResponse: seed.seedResponse,
      operationMatchArguments: seed.operationMatchArguments,
    });
  });

  mockInstances[graphId] = mockInstances[graphId] || {};
  mockInstances[graphId][variantName] = mockServer;

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
  const seedGroupId = req.headers['mocking-sequence-id'] as string;

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

  const mockServer = await getOrStartNewMockServer(graphId, variantName);
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
        seedGroupId,
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

import {Mutex} from 'async-mutex';
import Client from '../graphql/client';
import mockInstances from '../mockInstances';
import MockServer from '../MockServer';
import {Seed} from '../models/seed';
import {SeedRepository} from '../repositories/seedRepository';
import {SeedType} from '../seed/SeedManager';

export class MockService {
  private static instance: MockService;
  private client: Client;
  private seedRepository: SeedRepository;
  private mutex: Mutex;

  constructor() {
    this.client = new Client();
    this.seedRepository = new SeedRepository();
    this.mutex = new Mutex();
  }

  public static getInstance(): MockService {
    if (!MockService.instance) {
      MockService.instance = new MockService();
    }
    return MockService.instance;
  }

  async getOrStartNewMockServer(
    graphId: string,
    variantName: string
  ): Promise<MockServer> {
    const release = await this.mutex.acquire();
    let mockInstance = mockInstances[graphId]?.[variantName];
    if (!mockInstance) {
      mockInstance = await this.startNewMockServer(graphId, variantName);
    }
    release();
    return mockInstance;
  }

  async startNewMockServer(
    graphId: string,
    variantName: string
  ): Promise<MockServer> {
    const schema = await this.client.getSchema(graphId, variantName);

    // TODO remove faker config
    const mockServer = new MockServer(schema, {
      subgraph: false,
      fakerConfig: {},
    });

    const seeds: Seed[] = await this.seedRepository.findByGraphIdAndVariantName(
      graphId,
      variantName
    );

    for (const seed of seeds) {
      mockServer.seedManager.registerSeed(seed.sequenceId, SeedType.Operation, {
        operationName: seed.operationName,
        seedResponse: JSON.parse(seed.seedResponse),
        operationMatchArguments: JSON.parse(seed.operationMatchArguments),
      });
    }
    mockInstances[graphId] = mockInstances[graphId] || {};
    mockInstances[graphId][variantName] = mockServer;
    return mockServer;
  }
}

import {EntityManager} from '@mikro-orm/core';
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

  constructor(private em: EntityManager) {
    this.client = new Client();
    this.seedRepository = new SeedRepository(this.em);
    this.mutex = new Mutex();
  }

  public static getInstance(em: EntityManager): MockService {
    if (!MockService.instance) {
      MockService.instance = new MockService(em);
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
      mockServer.seedManager.registerSeed(
        seed.seedGroupId,
        SeedType.Operation,
        {
          operationName: seed.operationName,
          seedResponse: seed.seedResponse,
          operationMatchArguments: seed.operationMatchArguments,
        }
      );
    }
    mockInstances[graphId] = mockInstances[graphId] || {};
    mockInstances[graphId][variantName] = mockServer;
    return mockServer;
  }
}

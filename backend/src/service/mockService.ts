import Client from '../graphql/client';
import GraphqlMockingService from '@wayfair/gqmock';
import {SeedRepository} from '../repositories/seedRepository';
import mockInstances from '../mockInstances';
import {Seed} from '../models/seed';
import {MockInstance} from '../models/mockInstance';
import {Proposal} from '../models/proposal';
import proposals from '../proposals';
import {Mutex} from 'async-mutex';

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

  async startNewMockInstanceIfNeeded(
    proposalId: string
  ): Promise<MockInstance> {
    const release = await this.mutex.acquire();
    let mockInstance = mockInstances[proposalId];
    if (!mockInstance) {
      mockInstance = await this.startNewMockInstance(proposalId);
    }
    release();
    return mockInstance;
  }

  async startNewMockInstance(proposalId: string): Promise<MockInstance> {
    // Fetch the SDL document for the given variantName
    const schema = await this.client.getSchema(proposalId);

    const fakerConfig = {
      fmcc__account__AccountNumber: {
        method: 'random.numeric',
        args: [],
      },
      Date: {
        method: 'date.recent',
        args: [],
      },
    };

    // Proceed to start the mocking service using the fetched SDL
    const proposal: Proposal = proposals[proposalId];
    const port = proposal.port;
    const mockingService = new GraphqlMockingService({port});
    await mockingService.start();
    await mockingService.registerSchema(schema, {fakerConfig});

    // Load seeds from the database and register them
    const seeds: Seed[] =
      await this.seedRepository.findAllByVariantName(proposalId);

    for (const seed of seeds) {
      const context = mockingService.createContext(seed.sequenceId);
      await context.operation(
        seed.operationName,
        JSON.parse(seed.seedResponse),
        JSON.parse(seed.operationMatchArguments)
      );
    }
    // Store the instance information in the map
    const mockInstance = {port, service: mockingService} as MockInstance;
    mockInstances[proposalId as string] = mockInstance;
    return mockInstance;
  }

  async restartMockInstance(proposalId: string): Promise<void> {
    const mockInstance: MockInstance = mockInstances[proposalId];
    if (mockInstance) {
      const service = mockInstance.service.stop();
      delete mockInstances[proposalId as string];
      await this.startNewMockInstanceIfNeeded(proposalId);
    }
  }
}
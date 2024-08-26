import {Request, Response} from 'express';
import {SeedRepository} from '../repositories/seedRepository';
import {Seed} from '../models/seed';
import {MockService} from '../service/mockService';
import {SeedType} from "../seed/SeedManager";

export default class SeedController {
  private seedRepository: SeedRepository;
  private mockService: MockService;

  constructor() {
    this.seedRepository = new SeedRepository();
    this.mockService = MockService.getInstance();
    this.getSeeds = this.getSeeds.bind(this);
    this.createSeed = this.createSeed.bind(this);
    this.deleteSeed = this.deleteSeed.bind(this);
  }

  async getSeeds(req: Request, res: Response) {
    const variantName = req.query.variantName as string;

    if (!variantName) {
      return res.status(400).send('Variant name is required');
    }

    try {
      const seeds: Seed[] =
        await this.seedRepository.findAllByVariantName(variantName);
      await this.mockService.startNewMockInstanceIfNeeded(variantName);
      res.json(seeds);
    } catch (error) {
      console.error('Error fetching seeds:', error);
      res.status(500).send('Error fetching seeds');
    }
  }

  async createSeed(req: Request, res: Response) {
    const variantName = req.query.variantName as string;
    const {seedResponse, operationName, operationMatchArguments, sequenceId} =
      req.body;
    const seed: Seed = {
      variantName,
      seedResponse,
      operationName,
      operationMatchArguments,
      sequenceId,
    };

    if (!variantName) {
      return res.status(400).send('Proposal ID is required');
    }

    const mockServer =
      await this.mockService.startNewMockInstanceIfNeeded(variantName);

    try {
      // Save seed to SQLite
      await this.seedRepository.createSeed(seed);

      mockServer.seedManager.registerSeed(seed.sequenceId, SeedType.Operation, {
        operationName: seed.operationName,
        seedResponse: seedResponse,
        operationMatchArguments: operationMatchArguments,
      })

      res.send({message: `Seed registered successfully`});
    } catch (error) {
      console.error('Error registering seed:', error);
      res.status(500).send('Error registering seed');
    }
  }


  async deleteSeed(req: Request, res: Response): Promise<void> {
    const {id} = req.params;

    const numericId = Number(id);

    if (isNaN(numericId)) {
      res.status(400).json({message: 'Invalid ID'});
    }

    try {
      const result = await this.seedRepository.deleteSeedById(numericId);
      if (result) {
        // await this.mockService.restartMockInstance(result.variantName);
        res.status(200).json({message: 'Seed deleted successfully'});
      } else {
        res.status(404).json({message: 'Seed not found'});
      }
    } catch (error) {
      res.status(500).json({message: 'Error deleting seed', error: error});
    }
  }
}

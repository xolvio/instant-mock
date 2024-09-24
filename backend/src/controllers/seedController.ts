import {Request, Response} from 'express';
import {Seed} from '../models/seed';
import {SeedRepository} from '../repositories/seedRepository';
import {SeedType} from '../seed/SeedManager';
import {MockService} from '../service/mockService';

export default class SeedController {
  private seedRepository: SeedRepository;
  private mockService: MockService;

  constructor() {
    this.seedRepository = new SeedRepository();
    this.mockService = MockService.getInstance();
    this.getSeeds = this.getSeeds.bind(this);
    this.findSeedById = this.findSeedById.bind(this);
    this.createSeed = this.createSeed.bind(this);
    this.deleteSeed = this.deleteSeed.bind(this);
  }

  async getSeeds(req: Request, res: Response) {
    // TODO is it possible to simplify it?
    const graphId = req.query.graphId as string;
    const variantName = req.query.variantName as string;

    if (!variantName) {
      return res.status(400).send('Variant name is required');
    }

    try {
      // TODO add graphId to the method
      const seeds: Seed[] =
        await this.seedRepository.findByGraphIdAndVariantName(
          graphId,
          variantName
        );
      res.json(seeds);
    } catch (error) {
      console.error('Error fetching seeds:', error);
      res.status(500).send('Error fetching seeds');
    }
  }

  async findSeedById(req: Request, res: Response) {
    const {id} = req.params;

    const numericId = Number(id);

    if (isNaN(numericId)) {
      res.status(400).json({message: 'Invalid ID'});
      return;
    }

    try {
      const seed = await this.seedRepository.findSeedById(numericId);
      if (seed) {
        res.status(200).json(seed);
      } else {
        res.status(404).json({message: 'Seed not found'});
      }
    } catch (error) {
      console.error('Error finding seed:', error);
      res.status(500).json({message: 'Error finding seed', error: error});
    }
  }

  async createSeed(req: Request, res: Response) {
    // TODO is it possible to simplify it?
    const graphId = req.query.graphId as string;
    const variantName = req.query.variantName as string;
    const {seedResponse, operationName, operationMatchArguments, sequenceId} =
      req.body;
    const seed: Seed = {
      variantName,
      seedResponse,
      operationName,
      operationMatchArguments,
      sequenceId,
      graphId,
    };

    if (!variantName) {
      return res.status(400).send('Proposal ID is required');
    }

    const mockServer = await this.mockService.getOrStartNewMockServer(
      graphId,
      variantName
    );

    try {
      mockServer.seedManager.registerSeed(seed.sequenceId, SeedType.Operation, {
        operationName: seed.operationName,
        seedResponse: seedResponse,
        operationMatchArguments: operationMatchArguments,
      });

      await this.seedRepository.createSeed(seed);

      res.send({message: `Seed registered successfully`});
    } catch (error) {
      console.error('Error registering seed:', error);
      res.status(500).send('Error registering seed');
    }
  }

  async deleteSeed(req: Request, res: Response): Promise<void> {
    const {id} = req.params;
    const graphId = req.query.graphId as string;
    const variantName = req.query.variantName as string;
    const sequenceId = req.query.sequenceId as string;

    const numericId = Number(id);

    if (isNaN(numericId)) {
      res.status(400).json({message: 'Invalid ID'});
    }

    if (!graphId || !variantName) {
      res.status(400).json({message: 'graphId and variantName are required'});
    }

    try {
      const mockServer = await this.mockService.getOrStartNewMockServer(
        graphId,
        variantName
      );

      // TODO also remove seed from seedCache!!!
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

import {MikroORM} from '@mikro-orm/core';
import {Request, Response} from 'express';
import {Seed} from '../models/seed';
import {SeedRepository} from '../repositories/seedRepository';
import {SeedType} from '../seed/SeedManager';
import {MockService} from '../service/mockService';

export default class SeedController {
  private seedRepository: SeedRepository;
  private mockService: MockService;

  constructor(orm: MikroORM) {
    this.seedRepository = new SeedRepository(orm.em);
    this.mockService = MockService.getInstance(orm.em);

    // Bind class methods to the instance
    this.getSeeds = this.getSeeds.bind(this);
    this.findSeedById = this.findSeedById.bind(this);
    this.createSeed = this.createSeed.bind(this);
    this.updateSeed = this.updateSeed.bind(this);
    this.deleteSeed = this.deleteSeed.bind(this);
  }

  async getSeeds(req: Request, res: Response) {
    const graphId = req.query.graphId as string;
    const variantName = req.query.variantName as string;

    if (!variantName) {
      return res.status(400).send('Variant name is required');
    }

    try {
      const seeds = await this.seedRepository.find({graphId, variantName});
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
      return res.status(400).json({message: 'Invalid ID'});
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
      res.status(500).json({message: 'Error finding seed', error});
    }
  }

  async createSeed(req: Request, res: Response) {
    const graphId = req.query.graphId as string;
    const variantName = req.query.variantName as string;
    const {seedResponse, operationName, operationMatchArguments, sequenceId} =
      req.body;

    if (!variantName) {
      return res.status(400).send('Variant name is required');
    }

    const seed: Seed = new Seed(
      graphId,
      variantName,
      seedResponse,
      operationName,
      operationMatchArguments,
      sequenceId
    );

    try {
      const mockServer = await this.mockService.getOrStartNewMockServer(
        graphId,
        variantName
      );

      mockServer.seedManager.registerSeed(sequenceId, SeedType.Operation, {
        operationName,
        seedResponse,
        operationMatchArguments,
      });

      await this.seedRepository.createSeed(seed);
      res.status(201).send({message: 'Seed registered successfully'});
    } catch (error) {
      console.error('Error registering seed:', error);
      res.status(500).send('Error registering seed');
    }
  }

  async updateSeed(req: Request, res: Response) {
    const graphId = req.query.graphId as string;
    const variantName = req.query.variantName as string;
    const {
      id,
      seedResponse,
      operationName,
      operationMatchArguments,
      sequenceId,
      oldOperationMatchArguments,
    } = req.body;

    if (!variantName) {
      return res.status(400).send('Variant name is required');
    }

    const seed: Seed = {
      id,
      graphId,
      variantName,
      seedResponse,
      operationName,
      operationMatchArguments,
      seedGroupId: sequenceId,
    };

    try {
      const mockServer = await this.mockService.getOrStartNewMockServer(
        graphId,
        variantName
      );

      mockServer.seedManager.updateSeed(
        sequenceId,
        oldOperationMatchArguments,
        {
          operationName,
          seedResponse,
          operationMatchArguments,
        }
      );

      await this.seedRepository.updateSeed(seed);
      res.send({message: 'Seed updated successfully'});
    } catch (error) {
      console.error('Error updating seed:', error);
      res.status(500).send('Error updating seed');
    }
  }

  async deleteSeed(req: Request, res: Response) {
    const {id} = req.params;
    const graphId = req.query.graphId as string;
    const variantName = req.query.variantName as string;
    const sequenceId = req.query.sequenceId as string;
    const numericId = Number(id);

    if (isNaN(numericId)) {
      return res.status(400).json({message: 'Invalid ID'});
    }

    if (!graphId || !variantName) {
      return res
        .status(400)
        .json({message: 'graphId and variantName are required'});
    }

    try {
      const mockServer = await this.mockService.getOrStartNewMockServer(
        graphId,
        variantName
      );

      const result = await this.seedRepository.deleteSeedById(numericId);

      if (result) {
        mockServer.seedManager.deleteSeed(
          sequenceId,
          result.operationName,
          result.operationMatchArguments
        );
        return res.status(200).json({message: 'Seed deleted successfully'});
      } else {
        return res.status(404).json({message: 'Seed not found'});
      }
    } catch (error) {
      console.error('Error deleting seed:', error);
      return res.status(500).json({message: 'Error deleting seed', error});
    }
  }
}

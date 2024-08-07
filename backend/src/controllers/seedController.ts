import {Request, Response} from "express";
import {SeedRepository} from "../repositories/seedRepository";
import {Seed} from "../models/seed";
import {MockService} from "../service/mockService";

export default class SeedController {

    private seedRepository: SeedRepository;
    private mockService: MockService;

    constructor() {
        this.seedRepository = new SeedRepository();
        this.mockService = new MockService();
        this.getSeeds = this.getSeeds.bind(this);
        this.createSeed = this.createSeed.bind(this);
    }

    async getSeeds(req: Request, res: Response) {
        const variantName = req.query.variantName as string;

        if (!variantName) {
            return res.status(400).send("Variant name is required");
        }

        try {
            const seeds: Seed[] = await this.seedRepository.findAllByVariantName(variantName);
            await this.mockService.startNewMockInstanceIfNeeded(variantName);
            res.json(seeds);
        } catch (error) {
            console.error("Error fetching seeds:", error);
            res.status(500).send("Error fetching seeds");
        }
    }

    async createSeed(req: Request, res: Response) {
        const variantName = req.query.variantName as string;
        const { seedResponse, operationName, operationMatchArguments, sequenceId } = req.body;
        const seed: Seed = {
            variantName,
            seedResponse,
            operationName,
            operationMatchArguments, // ensure the correct field name is used here
            sequenceId,
        };

        if (!variantName) {
            return res.status(400).send("Proposal ID is required");
        }

        const mockInstance = await this.mockService.startNewMockInstanceIfNeeded(variantName);

        try {
            // Save seed to SQLite
            await this.seedRepository.createSeed(seed);

            const context = mockInstance.service.createContext(seed.sequenceId);
            await context.operation(
                operationName,
                seedResponse,
                operationMatchArguments,
            );

            res.send({ message: `Seed registered successfully` });
        } catch (error) {
            console.error("Error registering seed:", error);
            res.status(500).send("Error registering seed");
        }
    }

}
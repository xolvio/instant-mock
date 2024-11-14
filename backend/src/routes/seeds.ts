import express, {Request, Response, Router} from 'express';
import {SeedGroup} from '../models/seedGroup';
import {SeedType} from '../seed/SeedManager';

import {DI} from '../server';
import {logger} from '../utilities/logger';
import {getOrStartNewMockServer} from './graphql';

const router: Router = express.Router();

/**
 * @openapi
 * /api/seeds:
 *   get:
 *     summary: Retrieve all seeds for a given variant
 *     description: Fetches a list of all seeds associated with a specified variant name.
 *     tags:
 *       - Seeds
 *     parameters:
 *       - in: query
 *         name: variantName
 *         required: true
 *         description: The name of the variant for which to fetch seeds.
 *         schema:
 *           type: string
 *           example: "dev"
 *     responses:
 *       200:
 *         description: A list of seeds for the specified variant.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                     example: 1
 *                   variantName:
 *                     type: string
 *                     example: "dev"
 *                   operationName:
 *                     type: string
 *                     example: "operationNameExample"
 *                   seedResponse:
 *                     type: string
 *                     example: "{\"data\": {\"exampleField\": \"exampleValue\"}}"
 *                   operationMatchArguments:
 *                     type: string
 *                     example: "{\"arg1\": \"value1\", \"arg2\": \"value2\"}"
 *                   seedGroupId:
 *                     type: string
 *                     example: "seq-001"
 *       400:
 *         description: Bad request. Variant name is required.
 *       500:
 *         description: Server error while fetching seeds.
 */

router.get('/seeds', async (req: Request, res: Response) => {
  logger.info('Seeds route hit', {params: req.params});
  const {graphId, variantName, seedGroupId} = req.query;

  try {
    const seeds = await DI.seeds.find({
      graphId: graphId as string,
      variantName: variantName as string,
      seedGroup: {id: seedGroupId as unknown as number},
    });
    res.json(seeds);
  } catch (error) {
    console.error('Error fetching seeds:', error);
    res.status(500).json({message: 'An error occurred', error});
  }
});

router.get('/seeds/:id', async (req: Request, res: Response) => {
  const seed = await DI.seeds.findOne({id: parseInt(req.params.id)});
  seed ? res.json(seed) : res.status(404).json({message: 'Seed not found'});
});

/**
 * @openapi
 * /api/seeds:
 *   post:
 *     summary: Create a new seed
 *     description: Registers a new seed for a specific variant, saving it to the database and starting a new mock instance if needed.
 *     tags:
 *       - Seeds
 *     parameters:
 *       - in: query
 *         name: variantName
 *         required: true
 *         description: The name of the variant for which to create the seed.
 *         schema:
 *           type: string
 *           example: "dev"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               seedResponse:
 *                 type: string
 *                 description: The JSON response that the seed should return.
 *                 example: "{\"data\": {\"exampleField\": \"exampleValue\"}}"
 *               operationName:
 *                 type: string
 *                 description: The name of the GraphQL operation to match.
 *                 example: "operationNameExample"
 *               operationMatchArguments:
 *                 type: string
 *                 description: The arguments to match the operation.
 *                 example: "{\"arg1\": \"value1\", \"arg2\": \"value2\"}"
 *               seedGroupId:
 *                 type: string
 *                 description: The sequence ID for matching requests.
 *                 example: "seq-001"
 *     responses:
 *       200:
 *         description: Seed registered successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Seed registered successfully"
 *       400:
 *         description: Bad request. Variant name is required.
 *       500:
 *         description: Server error while registering seed.
 */
router.post('/seeds', async (req: Request, res: Response) => {
  const {
    graphId,
    variantName,
    seedResponse,
    operationName,
    operationMatchArguments,
    seedGroupId,
  } = req.body;
  if (!variantName)
    return res.status(400).json({message: 'Variant name is required'});
  logger.debug('Attempting to add a new seed', {graphId, variantName});

  const mockServer = await getOrStartNewMockServer(graphId, variantName);
  if (!mockServer) {
    console.error('Could not start mock server', {graphId, variantName});
    return res.status(422).json({message: 'Could not start mock server'});
  }
  const seedGroup = DI.em.getReference(SeedGroup, seedGroupId);

  const seed = DI.seeds.create({
    graphId,
    variantName,
    seedResponse,
    operationName,
    operationMatchArguments,
    seedGroup,
  });

  await DI.em.persistAndFlush(seed);
  // TODO we probably need to unify types, currently we have 2 seed types - gqmock type and entity
  mockServer.seedManager.registerSeed(seedGroupId, SeedType.Operation, {
    seedResponse: seedResponse,
    operationMatchArguments: operationMatchArguments,
    operationName: operationName,
  });
  logger.api('Seed added successfully', {graphId, variantName});
  res.status(201).json({message: 'Seed registered successfully'});
});

/**
 * @openapi
 * /api/seeds/{seedId}:
 *   delete:
 *     summary: Delete a seed by ID
 *     description: Deletes a seed based on the provided ID. If the seed is found and deleted, the associated mock instance is restarted.
 *     tags:
 *       - Seeds
 *     parameters:
 *       - in: path
 *         name: seedId
 *         required: true
 *         description: The ID of the seed to delete.
 *         schema:
 *           type: integer
 *           example: 1
 *     responses:
 *       200:
 *         description: Seed deleted successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Seed deleted successfully"
 *       400:
 *         description: Invalid ID provided.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Invalid ID"
 *       404:
 *         description: Seed not found.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Seed not found"
 *       500:
 *         description: Server error while deleting seed.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Error deleting seed"
 *                 error:
 *                   type: string
 *                   example: "Detailed error message"
 */
router.delete('/seeds/:id', async (req: Request, res: Response) => {
  const seed = await DI.seeds.findOne({id: parseInt(req.params.id)});
  if (!seed) return res.status(404).json({message: 'Seed not found'});
  await DI.em.removeAndFlush(seed);
  res.json({message: 'Seed deleted successfully'});
});

router.patch('/seeds', async (req: Request, res: Response) => {
  const {id, ...updateData} = req.body;
  const seed = await DI.seeds.findOne({id});
  if (!seed) return res.status(404).json({message: 'Seed not found'});
  DI.seeds.assign(seed, updateData);
  await DI.em.persistAndFlush(seed);
  res.json({message: 'Seed updated successfully'});
});

export default router;

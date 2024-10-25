import express, {Request, Response, Router} from 'express';

import {DI} from '../server';

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
  const graphId = req.query.graphId as string;
  const variantName = req.query.variantName as string;
  if (!variantName)
    return res.status(400).json({message: 'Variant name is required'});

  const seeds = await DI.seeds.find({graphId, variantName});
  res.json(seeds);
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

  const seed = DI.seeds.create({
    graphId,
    variantName,
    seedResponse,
    operationName,
    operationMatchArguments,
    seedGroupId,
  });

  await DI.seeds.getEntityManager().persistAndFlush(seed);

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
  res.json({message: 'Seed deleted successfully'});
});

router.patch('/seeds', async (req: Request, res: Response) => {
  const {id, ...updateData} = req.body;
  const seed = await DI.seeds.findOne({id});
  if (!seed) return res.status(404).json({message: 'Seed not found'});
  DI.seeds.assign(seed, updateData);
  res.json({message: 'Seed updated successfully'});
});

export default router;

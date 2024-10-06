import express, {Router} from 'express';
import SeedController from '../controllers/seedController';

const router: Router = express.Router();
const seedController = new SeedController(); // Initialize SeedController

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
 *                   sequenceId:
 *                     type: string
 *                     example: "seq-001"
 *       400:
 *         description: Bad request. Variant name is required.
 *       500:
 *         description: Server error while fetching seeds.
 */
router.get('/seeds', seedController.getSeeds);

router.get('/seeds/:id', seedController.findSeedById);

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
 *               sequenceId:
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
router.post('/seeds', seedController.createSeed);

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
router.delete('/seeds/:id', seedController.deleteSeed);
router.patch('/seeds', seedController.updateSeed);

export default router;

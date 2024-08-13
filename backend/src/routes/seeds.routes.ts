import express, {Router} from "express";
import SeedController from "../controllers/seedController";

const router: Router = express.Router();
const seedController = new SeedController(); // Initialize SeedController

router.get('/seeds', seedController.getSeeds);
router.post('/seeds', seedController.createSeed);
router.delete('/seeds/:id', seedController.deleteSeed);

export default router;

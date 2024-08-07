import express, {Router} from "express";
import SeedController from "../controllers/seedController";

const router: Router = express.Router();
const seedController = new SeedController(); // Initialize SeedController

router.get('/seeds', seedController.getSeeds);
router.post('/seeds', seedController.createSeed);

export default router;

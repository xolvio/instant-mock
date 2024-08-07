import express, {Router} from "express";
import MockController from "../controllers/mockController";

const router: Router = express.Router();
const mockController = new MockController();

router.post('/mocks/start', mockController.startNewMockInstance);
router.post('/mocks/stop', );

export default router;


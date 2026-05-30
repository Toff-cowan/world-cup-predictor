import { Router } from "express";
import { authMiddleware } from "../middleware/authMiddleware.js";
import {
  getPredictions,
  getPredictionById,
  getSharedPrediction,
  createPrediction,
  updatePrediction,
  deletePrediction,
  lockPredictionStage,
  unlockPrediction,
} from "../controllers/predictions/predictionHandlers.js";

const router = Router();

router.get("/shared/:token", getSharedPrediction);

router.use(authMiddleware);
router.get("/", getPredictions);
router.get("/:id", getPredictionById);
router.post("/", createPrediction);
router.patch("/:id", updatePrediction);
router.delete("/:id", deletePrediction);
router.post("/:id/lock", lockPredictionStage);
router.post("/:id/unlock", unlockPrediction);

export default router;

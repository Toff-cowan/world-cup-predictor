import { Router } from "express";
import { getAllMatches, getUpcomingMatches } from "../controllers/matches/getAllMatches.js";

const router = Router();

router.get("/", getAllMatches);
router.get("/upcoming", getUpcomingMatches);

export default router;

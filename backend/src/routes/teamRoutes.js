import { Router } from "express";
import { getAllTeams } from "../controllers/teams/getAllTeams.js";

const router = Router();

router.get("/", getAllTeams);

export default router;

import { Router } from "express";
import {
  getGroupStandings,
  getAllGroupStandings,
} from "../controllers/standings/getGroupStandings.js";

const router = Router();

router.get("/", getAllGroupStandings);
router.get("/groups/:group", getGroupStandings);

export default router;

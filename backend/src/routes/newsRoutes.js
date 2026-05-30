import { Router } from "express";
import {
  getFeaturedNews,
  getFootballNews,
  getNewsArticle,
} from "../controllers/news/getFootballNews.js";

const router = Router();

router.get("/", getFootballNews);
router.get("/featured", getFeaturedNews);
router.get("/:slug", getNewsArticle);

export default router;

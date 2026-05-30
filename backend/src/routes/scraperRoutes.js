import { Router } from "express";
import { syncFifaTournament } from "../scraper/simpleFifaScraper.js";
import { syncFifaNews } from "../scraper/syncFifaNews.js";
import { ok, fail } from "../utils/apiResponse.js";

const router = Router();

function adminKey(req, res, next) {
  const key = req.headers["x-admin-key"];
  if (key && key === process.env.ADMIN_SCRAPE_KEY) return next();
  return fail(res, "Forbidden", 403);
}

router.post("/run", adminKey, async (req, res, next) => {
  try {
    const result = await syncFifaTournament();
    const news = await syncFifaNews();
    return ok(res, { ...result, ...news });
  } catch (err) {
    next(err);
  }
});

router.post("/news", adminKey, async (req, res, next) => {
  try {
    const result = await syncFifaNews();
    return ok(res, result);
  } catch (err) {
    next(err);
  }
});

export default router;

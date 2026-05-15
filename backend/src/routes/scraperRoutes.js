import { Router } from "express";
import { syncFifaTournament } from "../scraper/simpleFifaScraper.js";
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
    return ok(res, result);
  } catch (err) {
    next(err);
  }
});

export default router;

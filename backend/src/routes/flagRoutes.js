import { Router } from "express";
import { fetchTeamFlagBuffer } from "../utils/fetchTeamFlag.js";

const router = Router();

router.get("/:code", async (req, res, next) => {
  try {
    const code = req.params.code?.toUpperCase().replace(/[^A-Z]/g, "");
    if (!code) return res.status(400).end();

    const result = await fetchTeamFlagBuffer(code);
    if (result) {
      res.set("Content-Type", result.contentType || "image/png");
      res.set("Cache-Control", "public, max-age=604800");
      return res.send(result.buffer);
    }

    res.status(404).end();
  } catch (err) {
    next(err);
  }
});

export default router;

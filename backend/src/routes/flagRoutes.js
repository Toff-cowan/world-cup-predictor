import { Router } from "express";
import { fifaFlagUrlsToTry } from "../utils/fifaFlagUrl.js";
import { fifaCodeToIso2 } from "../utils/fifaToIso2.js";

const router = Router();

const FIFA_FLAG_HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  Referer: "https://www.fifa.com/",
  Origin: "https://www.fifa.com",
  Accept: "image/*",
};

async function fetchBuffer(url, headers = {}) {
  const res = await fetch(url, { headers });
  if (!res.ok) return null;
  const buffer = Buffer.from(await res.arrayBuffer());
  return buffer.length > 0 ? { buffer, contentType: res.headers.get("content-type") } : null;
}

router.get("/:code", async (req, res, next) => {
  try {
    const code = req.params.code?.toUpperCase().replace(/[^A-Z]/g, "");
    if (!code) return res.status(400).end();

    const iso2 = fifaCodeToIso2(code);
    if (iso2) {
      const cdn = await fetchBuffer(`https://flagcdn.com/w80/${iso2}.png`);
      if (cdn) {
        res.set("Content-Type", "image/png");
        res.set("Cache-Control", "public, max-age=604800");
        return res.send(cdn.buffer);
      }
      const svg = await fetchBuffer(
        `https://hatscripts.github.io/circle-flags/flags/${iso2}.svg`
      );
      if (svg) {
        res.set("Content-Type", "image/svg+xml");
        res.set("Cache-Control", "public, max-age=604800");
        return res.send(svg.buffer);
      }
    }

    for (const url of fifaFlagUrlsToTry(code)) {
      const result = await fetchBuffer(url, FIFA_FLAG_HEADERS);
      if (result) {
        res.set("Content-Type", result.contentType || "image/png");
        res.set("Cache-Control", "public, max-age=604800");
        return res.send(result.buffer);
      }
    }

    res.status(404).end();
  } catch (err) {
    next(err);
  }
});

export default router;

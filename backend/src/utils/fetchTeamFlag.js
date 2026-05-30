import { fifaFlagUrlsToTry } from "./fifaFlagUrl.js";
import { fifaCodeToIso2 } from "./fifaToIso2.js";

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

/** Fetch flag image bytes for a FIFA country code (e.g. MEX). */
export async function fetchTeamFlagBuffer(code) {
  const normalized = `${code || ""}`.toUpperCase().replace(/[^A-Z]/g, "");
  if (!normalized) return null;

  const iso2 = fifaCodeToIso2(normalized);
  if (iso2) {
    const cdn = await fetchBuffer(`https://flagcdn.com/w80/${iso2}.png`);
    if (cdn) return { ...cdn, source: "flagcdn" };

    const svg = await fetchBuffer(
      `https://hatscripts.github.io/circle-flags/flags/${iso2}.svg`
    );
    if (svg) return { ...svg, source: "circle-flags" };
  }

  for (const url of fifaFlagUrlsToTry(normalized)) {
    const result = await fetchBuffer(url, FIFA_FLAG_HEADERS);
    if (result) return { ...result, source: "fifa" };
  }

  return null;
}

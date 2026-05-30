import { API_BASE } from "../constants/apiBase.js";
import { fifaCodeToIso2 } from "./fifaToIso2.js";

function normalizeCode(countryCode, teamCode) {
  return (countryCode || teamCode || "").toUpperCase().replace(/[^A-Z]/g, "");
}

/** Direct CDN — works on Vercel without hitting your API */
export function getFlagCdnUrl(countryCode, teamCode) {
  const code = normalizeCode(countryCode, teamCode);
  const iso2 = fifaCodeToIso2(code);
  if (!iso2) return null;
  return `https://flagcdn.com/w80/${iso2}.png`;
}

export function getFlagApiUrl(countryCode, teamCode) {
  const code = normalizeCode(countryCode, teamCode);
  if (!code) return null;
  return `${API_BASE}/flags/${code}`;
}

/**
 * Prefer flagcdn (no Vercel/Render proxy issues); API route as backup.
 */
export function getFlagUrl(_flagUrl, countryCode, teamCode) {
  return getFlagCdnUrl(countryCode, teamCode) || getFlagApiUrl(countryCode, teamCode);
}

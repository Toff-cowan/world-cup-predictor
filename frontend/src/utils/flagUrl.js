import { API_BASE } from "../constants/apiBase.js";
import { resolveFlagIso2 } from "./fifaToIso2.js";

/** Turn stored teams.flag_url (/api/flags/MEX) into a browser-loadable URL. */
export function resolveStoredFlagUrl(stored, countryCode, teamCode) {
  if (stored?.startsWith("http")) return stored;

  if (stored?.startsWith("/api/flags/")) {
    if (API_BASE.startsWith("http")) {
      const suffix = stored.replace(/^\/api/, "");
      return `${API_BASE}${suffix}`;
    }
    return stored;
  }

  const code = (countryCode || teamCode || "").toUpperCase().replace(/[^A-Z]/g, "");
  if (!code) return null;

  if (API_BASE.startsWith("http")) {
    return `${API_BASE}/flags/${code}`;
  }
  return `/api/flags/${code}`;
}

/** CDN fallbacks when DB URL is missing or fails. */
export function getCdnFlagUrls(countryCode, teamCode) {
  const iso2 = resolveFlagIso2(countryCode, teamCode);
  if (!iso2) return [];
  return [
    `https://flagcdn.com/w80/${iso2}.png`,
    `https://hatscripts.github.io/circle-flags/flags/${iso2}.svg`,
  ];
}

/** Prefer flag_url from DB (backend /api/flags), then CDN. */
export function resolveFlagUrls(flagUrl, countryCode, teamCode) {
  const fromDb = resolveStoredFlagUrl(flagUrl, countryCode, teamCode);
  const urls = [];
  if (fromDb) urls.push(fromDb);
  for (const cdn of getCdnFlagUrls(countryCode, teamCode)) {
    if (!urls.includes(cdn)) urls.push(cdn);
  }
  return urls;
}

export function getFlagUrl(flagUrl, countryCode, teamCode) {
  return resolveFlagUrls(flagUrl, countryCode, teamCode)[0] ?? null;
}

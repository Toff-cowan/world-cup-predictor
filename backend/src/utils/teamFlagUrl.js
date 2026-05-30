import { fetchTeamFlagBuffer } from "./fetchTeamFlag.js";

/** Stored in teams.flag_url — served by GET /api/flags/:code */
export function buildStoredFlagUrl(countryCode) {
  const code = `${countryCode || ""}`.toUpperCase().replace(/[^A-Z]/g, "");
  if (!code) return null;
  return `/api/flags/${code}`;
}

/** Warm CDN/FIFA sources during scrape so the API route is ready. */
export async function warmTeamFlag(countryCode) {
  const code = `${countryCode || ""}`.toUpperCase().replace(/[^A-Z]/g, "");
  if (!code) return false;
  const result = await fetchTeamFlagBuffer(code);
  return Boolean(result);
}

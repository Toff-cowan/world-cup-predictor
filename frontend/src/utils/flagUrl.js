import { resolveFlagIso2 } from "./fifaToIso2.js";

/** Public CDNs only — never hit /api/flags (avoids Vercel proxy + Render FIFA 404 noise). */
export function getFlagUrls(countryCode, teamCode) {
  const iso2 = resolveFlagIso2(countryCode, teamCode);
  if (!iso2) return [];
  return [
    `https://flagcdn.com/w80/${iso2}.png`,
    `https://hatscripts.github.io/circle-flags/flags/${iso2}.svg`,
  ];
}

/** @deprecated Use getFlagUrls — kept for any legacy imports */
export function getFlagCdnUrl(countryCode, teamCode) {
  return getFlagUrls(countryCode, teamCode)[0] ?? null;
}

export function getFlagUrl(_flagUrl, countryCode, teamCode) {
  return getFlagCdnUrl(countryCode, teamCode);
}

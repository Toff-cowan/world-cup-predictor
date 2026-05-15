/**
 * Always use same-origin /api path (Vite proxies to backend in dev).
 * Avoids broken flags when VITE_API_URL points at the wrong host.
 */
export function getFlagUrl(_flagUrl, countryCode, teamCode) {
  const code = (countryCode || teamCode || "").toUpperCase().replace(/[^A-Z]/g, "");
  if (!code) return null;
  return `/api/flags/${code}`;
}

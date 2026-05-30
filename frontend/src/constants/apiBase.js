/**
 * API root including /api.
 * - Dev: Vite proxies /api → localhost:5000 (override with VITE_API_URL).
 * - Production on Vercel: always same-origin /api (vercel.json rewrite → Render).
 * - Other production hosts: set VITE_API_URL + VITE_FORCE_DIRECT_API=true if needed.
 */
export function getApiBase() {
  const configured = import.meta.env.VITE_API_URL?.trim().replace(/\/$/, "");

  if (import.meta.env.DEV) {
    return configured || "/api";
  }

  if (import.meta.env.VITE_FORCE_DIRECT_API === "true" && configured) {
    return configured;
  }

  return "/api";
}

export const API_BASE = getApiBase();

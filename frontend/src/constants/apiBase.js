/**
 * API root including /api.
 * - Dev: Vite proxies /api → localhost:5000 (override with VITE_API_URL).
 * - Vercel (production + preview): same-origin /api via vercel.json rewrite (no CORS).
 * - Other hosts: set VITE_API_URL + VITE_FORCE_DIRECT_API=true if needed.
 */
export function getApiBase() {
  const configured = import.meta.env.VITE_API_URL?.trim().replace(/\/$/, "");

  if (import.meta.env.DEV) {
    return configured || "/api";
  }

  if (typeof window !== "undefined") {
    const host = window.location.hostname;
    if (host.endsWith(".vercel.app") || host === "vercel.app") {
      return "/api";
    }
  }

  if (import.meta.env.VITE_FORCE_DIRECT_API === "true" && configured) {
    return configured;
  }

  return configured || "/api";
}

/** @deprecated use getApiBase() — resolved at call time so Vercel host detection works */
export const API_BASE = "/api";

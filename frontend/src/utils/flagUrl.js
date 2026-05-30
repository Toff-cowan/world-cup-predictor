import { API_BASE } from "../constants/apiBase.js";

/**
 * Flag images are proxied by the API (FIFA CDN + flagcdn fallback).
 * Must use API_BASE so production hits Render, not Vercel (/api only works with Vite dev proxy).
 */
export function getFlagUrl(_flagUrl, countryCode, teamCode) {
  const code = (countryCode || teamCode || "").toUpperCase().replace(/[^A-Z]/g, "");
  if (!code) return null;
  return `${API_BASE}/flags/${code}`;
}

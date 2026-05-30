import { apiFetch } from "./fetchClient.js";

export const newsApi = {
  list: (limit = 12) => apiFetch(`/news?limit=${limit}`),
  featured: () => apiFetch("/news/featured"),
  get: (slug) => apiFetch(`/news/${encodeURIComponent(slug)}`),
};

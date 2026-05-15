import { apiFetch } from "./fetchClient.js";

export const matchesApi = {
  all: () => apiFetch("/matches"),
  upcoming: () => apiFetch("/matches/upcoming"),
};

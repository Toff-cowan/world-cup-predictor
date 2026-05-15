import { apiFetch } from "./fetchClient.js";

export const standingsApi = {
  all: () => apiFetch("/standings"),
  group: (letter) => apiFetch(`/standings/groups/${letter}`),
};

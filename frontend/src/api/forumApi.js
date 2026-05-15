import { apiFetch } from "./fetchClient.js";

export const forumApi = {
  list: () => apiFetch("/forum"),
  get: (id) => apiFetch(`/forum/${id}`),
  create: (body) =>
    apiFetch("/forum", { method: "POST", body: JSON.stringify(body) }),
};

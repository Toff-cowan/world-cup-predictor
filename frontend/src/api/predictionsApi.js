import { apiFetch } from "./fetchClient.js";

export const predictionsApi = {
  list: () => apiFetch("/predictions"),
  get: (id) => apiFetch(`/predictions/${id}`),
  create: (body) =>
    apiFetch("/predictions", { method: "POST", body: JSON.stringify(body) }),
  update: (id, body) =>
    apiFetch(`/predictions/${id}`, { method: "PATCH", body: JSON.stringify(body) }),
  remove: (id) => apiFetch(`/predictions/${id}`, { method: "DELETE" }),
  lockStage: (id, stage) =>
    apiFetch(`/predictions/${id}/lock`, {
      method: "POST",
      body: JSON.stringify({ stage }),
    }),
  shared: (token) => apiFetch(`/predictions/shared/${token}`),
};

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
  unlock: (id, body) =>
    apiFetch(`/predictions/${id}/unlock`, {
      method: "POST",
      body: JSON.stringify(body),
    }),
  shared: (token) => apiFetch(`/predictions/shared/${token}`),
  copyFromShare: (shareToken, name) =>
    apiFetch("/predictions/copy-from-share", {
      method: "POST",
      body: JSON.stringify({ share_token: shareToken, name }),
    }),
};

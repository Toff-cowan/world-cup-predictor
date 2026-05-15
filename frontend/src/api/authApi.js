import { apiFetch } from "./fetchClient.js";

export const authApi = {
  register: (body) =>
    apiFetch("/auth/register", { method: "POST", body: JSON.stringify(body) }),
  login: (body) =>
    apiFetch("/auth/login", { method: "POST", body: JSON.stringify(body) }),
  me: () => apiFetch("/auth/me"),
};

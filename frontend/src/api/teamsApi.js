import { apiFetch } from "./fetchClient.js";

export const teamsApi = {
  all: (group) =>
    apiFetch(group ? `/teams?group=${group}` : "/teams"),
};

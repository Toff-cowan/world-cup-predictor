import { getApiBase } from "../constants/apiBase.js";
import { formatApiError } from "../utils/apiError.js";

function getToken() {
  return localStorage.getItem("token");
}

export async function apiFetch(path, options = {}) {
  const headers = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  let res;
  try {
    res = await fetch(`${getApiBase()}${path}`, {
      ...options,
      headers,
    });
  } catch (err) {
    throw new Error(formatApiError(err));
  }

  const json = await res.json().catch(() => ({}));

  if (!res.ok) {
    const err = new Error(json.message || `Request failed (${res.status})`);
    throw new Error(formatApiError(err));
  }

  return json.data ?? json;
}

/** User-facing message for failed API calls (network vs HTTP vs empty DB). */
export function formatApiError(err, { context = "data" } = {}) {
  const msg = err?.message || "Request failed";

  if (msg === "Failed to fetch" || /networkerror|load failed/i.test(msg)) {
    if (import.meta.env.DEV) {
      return "Cannot reach the API. Start the backend: cd backend && npm run dev";
    }
    return "Cannot reach the API. Check that Render is awake and vercel.json proxies /api to your API.";
  }

  if (/^Request failed \(5\d\d\)/.test(msg)) {
    return `Server error while loading ${context}. Try again in a moment.`;
  }

  return msg;
}

export function isLikelyEmptyDatabase(err) {
  const msg = err?.message || "";
  return !/failed to fetch|networkerror|cannot reach/i.test(msg);
}

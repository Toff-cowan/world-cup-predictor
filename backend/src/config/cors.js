/** Strip trailing slash so https://app.vercel.app/ matches browser origin without slash */
function normalizeOrigin(url) {
  if (!url) return url;
  return url.replace(/\/+$/, "");
}

function parseOrigins() {
  const raw = process.env.CLIENT_URL || "http://localhost:5173";
  return raw
    .split(",")
    .map((s) => normalizeOrigin(s.trim()))
    .filter(Boolean);
}

function isAllowedOrigin(origin, allowed) {
  if (!origin) return true;
  const normalized = normalizeOrigin(origin);
  if (allowed.includes(normalized)) return true;
  if (process.env.ALLOW_VERCEL_PREVIEWS === "true" && /\.vercel\.app$/i.test(normalized)) {
    return true;
  }
  return false;
}

const allowedOrigins = parseOrigins();

export const corsOptions = {
  origin(origin, callback) {
    if (isAllowedOrigin(origin, allowedOrigins)) {
      // Echo the request origin exactly (no trailing slash) — required for credentialed requests
      callback(null, normalizeOrigin(origin) || true);
    } else {
      callback(new Error(`CORS blocked origin: ${origin}`));
    }
  },
  credentials: true,
};

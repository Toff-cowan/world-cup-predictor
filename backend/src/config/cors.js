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

function isVercelHost(origin) {
  try {
    const host = new URL(origin).hostname.toLowerCase();
    return host === "vercel.app" || host.endsWith(".vercel.app");
  } catch {
    return false;
  }
}

function isAllowedOrigin(origin, allowed) {
  if (!origin) return true;
  const normalized = normalizeOrigin(origin);
  if (allowed.includes(normalized)) return true;
  // All Vercel production + preview deployments (*.vercel.app)
  if (isVercelHost(normalized)) return true;
  return false;
}

export const allowedOrigins = parseOrigins();

export const corsOptions = {
  origin(origin, callback) {
    if (isAllowedOrigin(origin, allowedOrigins)) {
      callback(null, normalizeOrigin(origin) || true);
    } else {
      callback(new Error(`CORS blocked origin: ${origin}`));
    }
  },
  credentials: true,
};

/** API root including /api — same as fetchClient (Vite proxy locally, Render in production) */
export const API_BASE = (import.meta.env.VITE_API_URL || "/api").replace(/\/$/, "");

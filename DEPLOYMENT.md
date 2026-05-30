# Deploy: Supabase + Render + Vercel

| Service | Role |
|---------|------|
| **Supabase** | PostgreSQL database |
| **Render** | Node.js API (`backend/`) |
| **Vercel** | React frontend (`frontend/`) |

```
Browser → Vercel (static site)
              ↓ VITE_API_URL
         Render (Express API)
              ↓ DATABASE_URL
         Supabase (Postgres)
```

---

## 1. Supabase (database)

1. Create a project at [supabase.com](https://supabase.com).
2. **Project Settings → Database → Connection string → URI**
   - Choose **Session mode** (port **5432**) for Render (long-running server).
   - Do **not** use Transaction pooler (6543) unless you switch to serverless DB clients.
3. Copy the URI and replace `[YOUR-PASSWORD]` with your database password.

   **Windows users:** Prefer **Connect → Session pooler** (host `aws-0-….pooler.supabase.com`).  
   The direct host `db.….supabase.co` can fail with `ENOTFOUND` when Node resolves IPv6 incorrectly.

   In `backend/.env` set `DATABASE_SSL=true` for Supabase.
4. Run migrations **once** (pick one method):

   **Option A — from your machine** (easiest):

   ```bash
   cd backend
   cp .env.example .env
   # Edit .env: DATABASE_URL=<supabase-uri>, DATABASE_SSL=true
   npm install
   npm run db:migrate
   npm run scrape
   ```

   **Option B — Supabase SQL Editor**  
   Run each file in order under `backend/src/database/migrations/`:
   `001_initial.sql` → `002_fifa_columns.sql` → `003_teams_country_code_unique.sql` → `004_news_articles.sql`

5. Keep the connection string for Render (`DATABASE_URL`).

---

## 2. Render (API)

1. Push the repo to GitHub/GitLab.
2. [Render Dashboard](https://dashboard.render.com) → **New → Web Service** → connect the repo.
3. Settings:

   | Field | Value |
   |-------|--------|
   | **Root Directory** | `backend` |
   | **Runtime** | Node |
   | **Build Command** | `npm install` |
   | **Start Command** | `npm start` |
   | **Health Check Path** | `/api/health` |

   Or use the included **`render.yaml`** blueprint at repo root.

4. **Environment variables** (Render → Environment):

   | Variable | Value |
   |----------|--------|
   | `NODE_ENV` | `production` |
   | `DATABASE_URL` | Supabase URI (Session, port 5432) |
   | `DATABASE_SSL` | `true` |
   | `JWT_SECRET` | Long random string (`openssl rand -base64 48`) |
   | `JWT_EXPIRES_IN` | `7d` |
   | `CLIENT_URL` | `https://YOUR-APP.vercel.app` (**no trailing slash**) |
   | `ALLOW_VERCEL_PREVIEWS` | `true` (optional, for Vercel preview URLs) |
   | `ADMIN_SCRAPE_KEY` | Random string (for scraper endpoint) |
   | `TOURNAMENT_START` | `2026-06-11` |
   | `TOURNAMENT_END` | `2026-07-19` |

   `PORT` is set automatically by Render.

5. Deploy. Note your API URL, e.g. `https://world-cup-predictor-api.onrender.com`.

6. **Verify:** open `https://YOUR-API.onrender.com/api/health` → `{"ok":true,...}`.

7. **Seed data** (first deploy only) — run locally against Supabase:

   ```bash
   cd backend
   # .env with DATABASE_URL + DATABASE_SSL=true
   npm run scrape
   ```

   Or call from a machine with env set:

   ```bash
   curl -X POST https://YOUR-API.onrender.com/api/scraper/run \
     -H "x-admin-key: YOUR_ADMIN_SCRAPE_KEY"
   ```

   Free Render instances **sleep** after inactivity; the first request may take ~30s.

---

## 3. Vercel (frontend)

1. [vercel.com](https://vercel.com) → **Add New Project** → import the same repo.
2. Settings:

   | Field | Value |
   |-------|--------|
   | **Root Directory** | `frontend` |
   | **Framework Preset** | Vite |
   | **Build Command** | `npm run build` |
   | **Output Directory** | `dist` |

3. **Environment variables** (required for production):

   | Variable | Value |
   |----------|--------|
   | `VITE_API_URL` | `https://YOUR-API.onrender.com/api` |

   Must end with `/api`. Set for **Production** (and Preview if you use previews).

4. Deploy. Your site will be `https://something.vercel.app`.

   Flags and JSON both use `VITE_API_URL` (team flags call `https://YOUR-API.onrender.com/api/flags/USA`, not Vercel).

5. **Update Render CORS:** set `CLIENT_URL` on Render to your final Vercel URL (comma-separated if you have a custom domain too):

   ```
   https://your-app.vercel.app,https://www.yourdomain.com
   ```

6. Redeploy Render after changing `CLIENT_URL`.

`frontend/vercel.json` rewrites `/api/*` to your Render service (so relative `/api` works) and other routes to `index.html`. **Update the Render URL in `vercel.json` if your service name changes.**

Team flags load from **flagcdn.com** in the browser (no API required). If you change Render hostnames, update both `VITE_API_URL` and the `/api` rewrite in `vercel.json`.

---

## 4. Checklist

- [ ] Supabase project created; migrations applied
- [ ] `npm run scrape` run at least once (teams, matches, standings, news)
- [ ] Render service live; `/api/health` OK
- [ ] `JWT_SECRET` set (not default)
- [ ] `CLIENT_URL` on Render matches Vercel URL
- [ ] `VITE_API_URL` on Vercel points to Render `/api`
- [ ] Register/login works on production site
- [ ] Optional: custom domain on Vercel + add domain to `CLIENT_URL`

---

## 5. What you change locally vs in dashboards

| What | Where |
|------|--------|
| Database password / URL | Supabase + Render `DATABASE_URL` |
| API public URL | Render (auto) → copy into Vercel `VITE_API_URL` |
| Who can call the API | Render `CLIENT_URL` (+ `ALLOW_VERCEL_PREVIEWS`) |
| Auth signing key | Render `JWT_SECRET` |
| Scraper protection | Render `ADMIN_SCRAPE_KEY` |
| Frontend API target | Vercel `VITE_API_URL` only (baked in at build time) |

**Do not commit** `.env` files. Never put secrets in `VITE_*` vars except the public API URL.

---

## 6. Custom domain (optional)

1. Add domain in Vercel → copy production URL.
2. Append domain to Render `CLIENT_URL`:
   ```
   https://your-app.vercel.app,https://cup.yourdomain.com
   ```
3. Redeploy Render.

---

## 7. Troubleshooting

| Problem | Fix |
|---------|-----|
| CORS error in browser | `CLIENT_URL` must exactly match Vercel origin (https, no trailing slash) |
| API 404 on Vercel | `VITE_API_URL` must be Render URL + `/api`; rebuild Vercel after changing |
| DB connection failed | `DATABASE_SSL=true`; use Session pooler URI (5432) |
| Empty standings/news | Run `npm run scrape` or `POST /api/scraper/run` with `x-admin-key` |
| Slow first API request | Render free tier cold start — normal |
| Migrations fail mid-way | Check `schema_migrations` table in Supabase; fix SQL and re-run |

---

## 8. Ongoing updates

- **Frontend:** push to main → Vercel auto-deploys.
- **API:** push to main → Render auto-deploys.
- **Schema changes:** add `005_*.sql` in `backend/src/database/migrations/`, run `npm run db:migrate` locally against Supabase or add a one-off Render job.
- **Refresh FIFA data:** cron or manual `POST /api/scraper/run` with admin key.

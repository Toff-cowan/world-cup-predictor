# World Cup Predictor — what each file does

Focused MVP for your 14-day build: **auth, predictions (save/lock/share), standings, simple FIFA scraper**, React pages with **Fetch API**.

---

## Quick start

```bash
# 1. PostgreSQL
createdb world_cup_predictor

# 2. Backend
cd backend
cp .env.example .env   # edit DATABASE_URL, JWT_SECRET
npm install
npm run db:migrate
npm run scrape
npm run dev

# 3. Frontend (new terminal)
cd frontend
cp .env.example .env
npm install
npm run dev
```

Scrape (optional): `cd backend && npm run scrape`  
Or HTTP: `POST /api/scraper/run` with header `x-admin-key: <ADMIN_SCRAPE_KEY>`

---

## Backend (`backend/`)

### Root

| File | Purpose |
|------|---------|
| `package.json` | Dependencies & scripts (`dev`, `db:migrate`, `db:seed`, `scrape`) |
| `.env.example` | **Copy to `.env`** — DB URL, JWT, CORS, scrape key, tournament dates |
| `.gitignore` | Ignores `node_modules`, `.env`, uploads |
| `README.md` | Backend-only notes |

### `src/server.js` + `src/app.js`

| File | Purpose |
|------|---------|
| `server.js` | Starts Express on `PORT` |
| `app.js` | Middleware + mounts all `/api/*` routes |

### `src/config/`

| File | Purpose |
|------|---------|
| `db.js` | PostgreSQL connection pool (`pg`) |
| `jwt.js` | JWT secret & expiry |
| `cors.js` | Allows frontend origin (`CLIENT_URL`) |

### `src/database/`

| File | Purpose |
|------|---------|
| `migrations/001_initial.sql` | Tables: **users, teams, matches, standings, predictions, forum_posts**, scrape_cache |
| `migrate.js` | Runs SQL migration |
| `seed.js` | Runs FIFA API sync (same as `npm run scrape`) — **no mock data** |

### `src/routes/` (only what you need now)

| File | Endpoints |
|------|-----------|
| `authRoutes.js` | `POST /register`, `/login`, `/logout`, `GET /me` |
| `teamRoutes.js` | `GET /teams` |
| `matchRoutes.js` | `GET /matches`, `/matches/upcoming` |
| `standingsRoutes.js` | `GET /standings`, `/standings/groups/:group` |
| `predictionRoutes.js` | CRUD predictions + `POST /:id/lock` + shared by token |
| `forumRoutes.js` | List/get posts, create post (auth) |
| `scraperRoutes.js` | `POST /scraper/run` (admin key) |

### `src/controllers/` (implemented)

| File | Purpose |
|------|---------|
| `auth/authHandlers.js` | Register, login, me, logout |
| `teams/getAllTeams.js` | List teams (optional `?group=A`) |
| `matches/getAllMatches.js` | All + upcoming matches |
| `standings/getGroupStandings.js` | Standings by group or all groups |
| `predictions/predictionHandlers.js` | Create/update/delete predictions, lock stage, share link |
| `forums/createForumPost.js` | Forum list + create |

### `src/controllers/` (empty — fill later)

All other files under `controllers/`, `services/`, `jobs/`, `validators/`, `sockets/`, `utils/` (except `apiResponse.js`, `constants.js`) are **empty placeholders** for odds, analytics, admin, players, etc.

### `src/middleware/`

| File | Purpose |
|------|---------|
| `authMiddleware.js` | Reads `Authorization: Bearer <token>` |
| `errorMiddleware.js` | JSON error responses |

### `src/scraper/`

| File | Purpose |
|------|---------|
| `fifaApiClient.js` | Fetches `api.fifa.com` (competition 17, season 285023 = WC 2026) |
| `simpleFifaScraper.js` | Syncs teams, matches, standings into PostgreSQL from FIFA API |
| `runScraper.js` | CLI: `npm run scrape` |

### `src/utils/`

| File | Purpose |
|------|---------|
| `apiResponse.js` | `ok()` / `fail()` JSON helpers |
| `constants.js` | Groups A–L, stage names, tournament dates |

---

## Frontend (`frontend/`)

### Root

| File | Purpose |
|------|---------|
| `package.json` | React + Vite + Tailwind |
| `.env.example` | `VITE_API_URL=http://localhost:5000/api` |
| `vite.config.js` | Dev server + proxy `/api` → backend |

### `src/api/` (Fetch API — no axios)

| File | Purpose |
|------|---------|
| `fetchClient.js` | Base `fetch` wrapper, attaches JWT from `localStorage` |
| `authApi.js` | Login, register, me |
| `predictionsApi.js` | Prediction CRUD + lock stage |
| `standingsApi.js` | Standings |
| `teamsApi.js` | Teams |
| `matchesApi.js` | Matches |
| `forumApi.js` | Forum |

### Pages (your 4 main pages + auth)

| File | Purpose |
|------|---------|
| `pages/Landing/LandingPage.jsx` | Landing shell + links (build hero/sections next) |
| `pages/Predictions/PredictionsPage.jsx` | List/create predictions |
| `pages/Standings/StandingsPage.jsx` | Group tables from API |
| `pages/Profile/ProfilePage.jsx` | User hub: predictions + forum preview |
| `pages/Auth/Login.jsx` | Login form |
| `pages/Auth/Register.jsx` | Register form |
| `pages/Errors/NotFound.jsx` | 404 |

### `src/pages/Landing/sections/` (empty — you build UI)

| File | Purpose |
|------|---------|
| `HeroSection.jsx` | Globe + trophy hero layer |
| `NewsSection.jsx` | News cards overlay |
| `StandingsPreview.jsx` | Standings snippet on landing |
| `UpcomingMatches.jsx` | Next fixtures |
| `FeaturedPredictions.jsx` | Highlight user/community picks |
| `ForumPreview.jsx` | Latest forum posts |
| `VideosSection.jsx` | Video embeds |
| `FAQSection.jsx` | FAQ accordion |
| `CountdownSection.jsx` | Countdown to 11 Jun 2026 |

### Other frontend files (empty stubs)

`components/`, `hooks/`, `services/`, `store/`, extra pages (Teams, Matches, Admin, etc.) — **empty** for later weeks.

### Routing

| File | Purpose |
|------|---------|
| `App.jsx` | Routes: `/`, `/login`, `/register`, `/standings`, `/predictions`, `/profile` |
| `routes/PrivateRoute.jsx` | Redirects to login if no token |
| `layouts/MainLayout.jsx` | Nav + outlet |

---

## Database tables (PostgreSQL)

| Table | Stores |
|-------|--------|
| `users` | Accounts (email, username, password hash) |
| `teams` | 48 teams, group letter A–L |
| `matches` | Fixtures + scores + stage |
| `standings` | Scraped/calculated group table rows |
| `predictions` | User brackets as `JSONB`, `locked_stages[]`, `share_token` |
| `forum_posts` | Discussion posts |
| `forum_comments` | Comments (schema ready, API stub empty) |
| `scrape_cache` | Last scrape metadata |

### Prediction `bracket` JSON (suggested shape)

```json
{
  "groups": { "A": { "winner": 1, "runnerUp": 2 } },
  "knockout": { "round_of_32": {}, "final": {} },
  "metadata": { "usedOdds": true, "usedHistory": true }
}
```

Lock stages via `POST /api/predictions/:id/lock` body `{ "stage": "group" }`.  
Stages: `group`, `round_of_32`, `round_of_16`, `quarter_final`, `semi_final`, `final`.

---

## 14-day suggested order

1. **Days 1–2**: DB + auth + empty pages wired (done in scaffold)
2. **Days 3–5**: Bracket editor UI + save/load `bracket` JSON
3. **Days 6–7**: Standings from matches; scraper refine for real FIFA data
4. **Days 8–9**: Stage locking + compare prediction vs actual
5. **Days 10–11**: Landing sections + profile share links
6. **Days 12–14**: Odds/history blend, accuracy (Brier), polish

---

## Environment variables

See `backend/.env.example` and `frontend/.env.example`.

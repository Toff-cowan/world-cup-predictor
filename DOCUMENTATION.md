# World Cup Predictor — Technical Documentation

Complete reference for architecture, files, functions, state, and implementation patterns.

**Related docs:** [FILES.md](./FILES.md) (file index) · [DEPLOYMENT.md](./DEPLOYMENT.md) (production setup) · [README.md](./README.md) (quick start)

---

## 1. System overview

```
Browser (React SPA on Vercel)
    │  fetch /api/*  (same-origin rewrite → Render)
    ▼
Express API (Render)
    │  pg pool
    ▼
PostgreSQL (Supabase)
    ▲
    │  npm run scrape / POST /api/scraper/run
FIFA api.fifa.com + FIFA news
```

| Layer | Technology | Role |
|-------|------------|------|
| Frontend | React 19, Vite 6, Tailwind CSS 4, React Router 7 | UI, routing, client state |
| Backend | Node.js, Express 4, `pg` | REST API, auth, scraper |
| Database | PostgreSQL 15+ | Users, teams, matches, standings, predictions, news |
| Deploy | Vercel + Render + Supabase | Static site, API, DB |

---

## 2. Coding paradigms

### 2.1 Frontend

| Paradigm | Where used |
|----------|------------|
| **Component composition** | Pages compose section components; shared UI in `components/common/` |
| **Unidirectional data flow** | Props down, callbacks up; API data fetched in `useEffect` |
| **Colocated state** | Page-level `useState` for forms and lists (no global Redux) |
| **Context for cross-cutting UI** | `ThemeContext`, `CountdownVisibilityContext` |
| **Thin API layer** | `src/api/*Api.js` wraps `fetchClient.js` |
| **Utility modules** | Pure functions in `src/utils/` (bracket math, flags, match rounds) |
| **Declarative routing** | `App.jsx` nested routes with layout shells |
| **Tailwind utility-first CSS** | `dark:` variant via `html.dark` class (see `ThemeContext`) |
| **Controlled components** | Forms, bracket editors, FAQ accordion |

### 2.2 Backend

| Paradigm | Where used |
|----------|------------|
| **Layered architecture** | Routes → Controllers → Services (where needed) → `pool.query` |
| **Middleware pipeline** | CORS, JSON body, cookies, JWT auth, error handler |
| **REST JSON API** | `{ success, data }` / `{ success, message }` via `apiResponse.js` |
| **Migration-based schema** | Numbered SQL files + `schema_migrations` tracking |
| **ETL scraper** | FIFA API → normalize → upsert Postgres |
| **Environment config** | `dotenv` — no secrets in code |

---

## 3. Frontend architecture

### 3.1 Entry and providers

**`main.jsx`**

| Function / export | Purpose |
|-------------------|---------|
| `createRoot(...).render()` | Mounts React app |
| `BrowserRouter` | Client-side routing |
| `ThemeProvider` | Light/dark mode on `<html class="dark">` |
| `CountdownVisibilityProvider` | Kickoff ribbon open/closed state |

**`App.jsx`**

| Route | Layout | Page |
|-------|--------|------|
| `/` | `AppLayout` | `LandingPage` |
| `/standings` | `AppLayout` | `StandingsPage` |
| `/predictions` | `AppLayout` + `PrivateRoute` | `PredictionsPage` |
| `/profile` | `AppLayout` + `PrivateRoute` | `ProfilePage` |
| `/login`, `/register` | `MainLayout` | Auth pages |

**`AppLayout`** — sticky header, countdown bar, footer, floating news, FIFA disclaimer modal.

---

### 3.2 Context and global UI state

#### `ThemeContext.jsx`

| Export | Type | Description |
|--------|------|-------------|
| `ThemeProvider` | Component | Wraps app; syncs theme to DOM + `localStorage` |
| `useTheme()` | Hook | Returns `{ theme, setTheme, toggleTheme, isDark }` |
| `getInitialTheme()` | Function | Reads `wc-theme` from storage or `prefers-color-scheme` |

**State:** `theme` ∈ `{ "light", "dark" }`  
**Side effect:** `document.documentElement.classList.toggle("dark", …)`

#### `CountdownVisibilityContext.jsx`

| Export | Description |
|--------|-------------|
| `CountdownVisibilityProvider` | Holds ribbon visibility |
| `useCountdownVisibility()` | `{ visible, show, hide }` |

---

### 3.3 API client layer

#### `constants/apiBase.js`

| Function | Logic |
|----------|-------|
| `getApiBase()` | Dev → `/api` or `VITE_API_URL`; Vercel host → `/api`; else env |
| `API_BASE` | Legacy constant `"/api"` — prefer `getApiBase()` at runtime |

#### `api/fetchClient.js`

| Function | Logic |
|----------|-------|
| `getToken()` | Reads JWT from `localStorage` |
| `apiFetch(path, options)` | Adds `Authorization`, JSON body; throws formatted errors |

#### Domain APIs (`*Api.js`)

Each exports an object of thin wrappers, e.g.:

- `matchesApi.all()` → `GET /matches`
- `standingsApi.all()` → `GET /standings`
- `predictionsApi.update(id, body)` → `PATCH /predictions/:id`
- `newsApi.list(limit)` → `GET /news?limit=`

#### `utils/apiError.js`

| Function | Purpose |
|----------|---------|
| `formatApiError(err, { context })` | Maps "Failed to fetch" to user-friendly text |
| `isLikelyEmptyDatabase(err)` | Distinguishes network vs empty DB errors |

---

### 3.4 Homepage (`pages/Landing/`)

**`LandingPage.jsx`** — vertical stack of sections on `bg-white dark:bg-[#0a0a0a]`.

| Section | File | Local state | Data source |
|---------|------|-------------|-------------|
| Hero | `HeroSection.jsx` | `highlights[]` | `newsApi.list(3)` |
| Banner | `HospitalityBanner.jsx` | — | — |
| News | `NewsSection.jsx` | `featured`, `articles`, `loading`, `error` | `newsApi.featured()`, `newsApi.list(9)` |
| Standings preview | `StandingsPreview.jsx` | `standings{}`, `loading` | `standingsApi.all()` |
| Fixtures | `MatchFixturesSection.jsx` | `matches[]`, `loading`, `error`, `activeRound` | `matchesApi.all()` + poll 45s |
| FAQ | `FAQSection.jsx` | `activeIndex` (hover/focus accordion) | Static `FAQ_ITEMS` |

#### `HomeButton.jsx` (shared homepage buttons)

| Variant | Light mode | Dark mode |
|---------|------------|-----------|
| `primary` | White bg, black text | FIFA blue `#0047FF`, white text |
| `outline` | White border on black banner | Brighter border + hover fill |
| `tab` | Active: zinc-900 / white text | Active: white / zinc-900 text |
| `link` | Underlined zinc-900 | Underlined zinc-100 |
| `ghost` | Muted text hover | Light text hover |

Props: `variant`, `active` (tabs), `as` (`button` | `link` | `a`), `to`, `href`.

#### `MatchFixturesSection.jsx` — key logic

| Function | Purpose |
|----------|---------|
| `formatKickoff(iso)` | Locale time string |
| `StatusBadge({ status })` | Live / Full time / Upcoming pill |
| `MatchCard({ match })` | Single fixture card with flags |
| `QualifierChip({ team, rank })` | Top-2 qualifier row |
| `RoundQualifiers` | Grid of provisional qualifiers per group |
| `groupStageFixturesByRound()` | Utility — buckets matches into rounds 1–3 |
| `topTwoByGroupThroughRound()` | Utility — computes top 2 after N rounds |

**States:** `loading` → fetch; `error` → network/API failure; empty `matches` → scrape hint; `activeRound` ∈ `{1,2,3}`.

#### `FAQSection.jsx`

**State:** `activeIndex` — `null` or index into `FAQ_ITEMS`.  
**Interaction:** `onMouseEnter` / `onClick` / `onFocus` expand; `onMouseLeave` collapses.  
**Animation:** Inline styles + CSS transitions (`FAQ_DURATION`, `FAQ_EASE`).  
**Dark mode:** `useTheme()` → `faqColors(isDark)` for active/muted colors.

---

### 3.5 Standings

#### `GroupStandingsTable.jsx`

| Feature | Implementation |
|---------|----------------|
| Desktop table / mobile cards | Responsive breakpoints |
| Top-2 highlight | `highlightQualifiers` prop — green row bg |
| Form arrows | `FormIndicators.jsx` — W/L/D from API `form[]` |
| Team click | Optional Google search via `teamSearchUrl.js` |
| Flags | `TeamFlag` with `flag_url` from DB |

#### `TeamFlag.jsx`

| State | Description |
|-------|-------------|
| `urlIndex` | Current URL in fallback chain |
| `urls` (memo) | From `resolveFlagUrls(flagUrl, countryCode, teamCode)` |

**Fallback order:** DB `/api/flags/CODE` → flagcdn.com → circle-flags SVG → gray placeholder.

#### `flagUrl.js`

| Function | Purpose |
|----------|---------|
| `resolveStoredFlagUrl(stored, …)` | Turns `/api/flags/MEX` into browser URL |
| `getCdnFlagUrls(…)` | CDN-only fallbacks |
| `resolveFlagUrls(…)` | DB first, then CDN |

#### `fifaToIso2.js`

| Export | Purpose |
|--------|---------|
| `FIFA_TO_ISO2` | Map MEX → mx, ENG → gb-eng, etc. |
| `fifaCodeToIso2(code)` | Lookup FIFA 3-letter code |
| `resolveFlagIso2(countryCode, teamCode)` | FIFA or ISO-2 input → flag slug |

---

### 3.6 Predictions

#### `PredictionsPage.jsx` — state machine (simplified)

```
loading ──► loaded (teams, matches, brackets)
                │
                ├── tab: "group" | "knockout"
                ├── prediction: selected bracket metadata
                ├── bracket: JSON structure (groups + knockout)
                ├── saving / switching flags
                └── helpOpen + helpStep (onboarding tour)
```

| State variable | Type | Purpose |
|----------------|------|---------|
| `teams`, `matches` | arrays | Reference data for editors |
| `brackets` | array | User's saved prediction list |
| `prediction` | object \| null | Active prediction row from DB |
| `bracket` | object | In-memory bracket JSON |
| `tab` | string | `"group"` or `"knockout"` |
| `lockedStages`, `lockedGroups` | from `prediction` | UI disable rules |
| `saving`, `switching` | boolean | Loading indicators |
| `saveTimer` | ref | Debounced autosave (600ms) |

| Function | Purpose |
|----------|---------|
| `persist(predId, nextBracket)` | PATCH prediction to API |
| `queueSave(nextBracket)` | Debounced persist |
| `flushSave()` | Immediate persist (before lock/navigation) |
| `loadPrediction(id, …)` | Fetch one bracket + normalize |
| `isStageLocked(stage)` | Lock guard for UI |

#### `utils/bracketHelpers.js` (core bracket logic)

| Function | Purpose |
|----------|---------|
| `createEmptyBracket()` | Initial JSON shape for 48-team WC |
| `normalizeBracket(raw, { teams, matches })` | Validate/fill from API data |
| `setGroupMatchScore(…)` | Immutable group score update |
| `setKnockoutSide / setKnockoutWinner / setKnockoutMatchScore` | Knockout edits |
| `lockGroupInBracket(…)` | Mark group as locked in JSON |

#### `KnockoutBracketView.jsx` / `KnockoutBracketEditor.jsx`

Visual bracket using `knockoutBracketLayout.js` seed labels and `TeamFlag`.

#### `GroupStageEditor.jsx`

Group-by-group score entry; uses `MatchPredictionTable`, `TeamPicker`.

---

### 3.7 Auth

| File | Role |
|------|------|
| `pages/Auth/Login.jsx` | Email/password → `authApi.login` → store token |
| `pages/Auth/Register.jsx` | Sign up flow |
| `routes/PrivateRoute.jsx` | Redirect to `/login` if no token |
| `services/authService.js` | Token storage helpers |
| `hooks/useAuth.js` | Auth state hook (if used) |

**Client auth state:** JWT in `localStorage` key `"token"`.

---

### 3.8 Hooks

| Hook | File | Returns |
|------|------|---------|
| `useTheme()` | `ThemeContext` | Theme controls |
| `useCountdownVisibility()` | `CountdownVisibilityContext` | Ribbon visibility |
| `useCountdown()` | `hooks/useCountdown.js` | Time until tournament start |
| `usePredictions()` | `hooks/usePredictions.js` | Predictions list helper |

---

### 3.9 Styling and dark mode

**Mechanism:** `ThemeProvider` toggles `class="dark"` on `<html>`. Tailwind v4 custom variant:

```css
@custom-variant dark (&:where(.dark, .dark *));
```

**Global overrides:** `index.css` adjusts body bg, text zinc utilities, safe areas, animations (`hero-trophy-float`, `faq-answer-enter`, countdown ribbon).

**Theme tokens:** `constants/wcTheme.js` — `WC_BLUE`, `WC_BLACK`, etc.

---

## 4. Backend architecture

### 4.1 Server bootstrap

**`server.js`**

1. `dotenv.config()`
2. `app.listen(PORT)`
3. Log CORS origins
4. `ensureTournamentData()` — if `SCRAPE_IF_EMPTY=true` and no teams, run scrape

**`app.js`**

- Middleware: `cors`, `express.json`, `cookieParser`
- Routes under `/api/*`
- `errorMiddleware` last

---

### 4.2 Configuration

| File | Exports | Env vars |
|------|---------|----------|
| `config/db.js` | default `pool` | `DATABASE_URL`, `DATABASE_SSL` |
| `config/cors.js` | `corsOptions`, `allowedOrigins` | `CLIENT_URL`, allows `*.vercel.app` |
| `config/jwt.js` | JWT settings | `JWT_SECRET`, `JWT_EXPIRES_IN` |

**`db.js` notes:** `dns.setDefaultResultOrder('ipv4first')` for Supabase on Windows.

---

### 4.3 API response helpers

**`utils/apiResponse.js`**

| Function | Response |
|----------|----------|
| `ok(res, data, status=200)` | `{ success: true, data }` |
| `fail(res, message, status=400)` | `{ success: false, message }` |

---

### 4.4 Routes and controllers

| Route prefix | Controller(s) | Main endpoints |
|--------------|---------------|----------------|
| `/api/auth` | `auth/*Controller` | register, login, logout, me |
| `/api/teams` | `getAllTeams` | GET `/` |
| `/api/matches` | `getAllMatches`, `getUpcomingMatches` | GET `/`, `/upcoming` |
| `/api/standings` | `getGroupStandings` | GET `/`, `/groups/:group` |
| `/api/predictions` | `predictionHandlers` | CRUD, lock, unlock, shared |
| `/api/forum` | forum controllers | posts, comments |
| `/api/news` | `getFootballNews`, `getFeaturedNews` | list, featured, by slug |
| `/api/flags` | `flagRoutes` | GET `/:code` — image bytes |
| `/api/scraper` | inline | POST `/run`, `/news` (admin key) |

#### `getAllMatches.js`

Joins `teams` for home/away names, codes, `country_code`, `flag_url`.  
Maps snake_case DB rows → camelCase JSON (`homeTeamName`, `homeFlagUrl`, …).

#### `getGroupStandings.js`

| Function | Purpose |
|----------|---------|
| `fetchFormByTeamId()` | Last 5 W/L/D from completed group matches |
| `attachForm(rows, formMap)` | Adds `form: ["W","D",…]` to each row |
| `getGroupStandings` | Single group |
| `getAllGroupStandings` | All groups → `{ standings: { A: [...], B: [...] } }` |

#### `predictionHandlers.js`

| Handler | Purpose |
|---------|---------|
| `createPrediction` | New bracket for user |
| `updatePrediction` | Save `bracket` JSON |
| `lockPrediction` | Lock stage/group |
| `unlockPrediction` | Admin/user unlock |
| `getSharedPrediction` | Public view by share token |

---

### 4.5 Scraper pipeline

**Entry:** `npm run scrape` → `scraper/runScraper.js`

```
runScraper.js
    ├── syncFifaTournament()  ← simpleFifaScraper.js
    └── syncFifaNews()        ← syncFifaNews.js
```

#### `fifaApiClient.js`

| Function | Purpose |
|----------|---------|
| `fifaGet(path)` | Authenticated fetch to api.fifa.com |
| `fetchSeason()` | Tournament metadata |
| `fetchAllMatches()` | Paginated calendar API |
| `parseTeamFromMatchSide(side)` | Team name, code, flag FIFA URL |
| `parseMatch(m)` | Normalized match object |
| `extractTeamsFromMatches(matches)` | Deduped team map |
| `buildStandingsFromMatches(…)` | Points table from completed matches |

#### `simpleFifaScraper.js` — `syncFifaTournament()`

1. Fetch season + all matches from FIFA
2. For each team: `buildStoredFlagUrl()` → `/api/flags/CODE`; `warmTeamFlag()` prefetches image
3. Upsert `teams`, `matches`
4. Rebuild `standings` (delete + insert)
5. Log to `scrape_cache`

**Returns:** `{ season, teams, flagsWarmed, matches, standings }`

#### Flag utilities

| File | Function | Purpose |
|------|----------|---------|
| `utils/fetchTeamFlag.js` | `fetchTeamFlagBuffer(code)` | flagcdn → circle-flags → FIFA |
| `utils/teamFlagUrl.js` | `buildStoredFlagUrl(code)` | `/api/flags/CODE` |
| `utils/teamFlagUrl.js` | `warmTeamFlag(code)` | Prefetch during scrape |
| `routes/flagRoutes.js` | GET `/:code` | Serves image with cache headers |

#### `syncFifaNews.js`

Fetches FIFA Plus news → upserts `news_articles` table.

#### `startup/ensureTournamentData.js`

If `SCRAPE_IF_EMPTY=true` and `teams` count is 0, runs full scrape on server start.

---

### 4.6 Database

**Migrations** (run in order via `migrate.js`):

| File | Adds |
|------|------|
| `001_initial.sql` | Core tables |
| `002_fifa_columns.sql` | FIFA IDs on teams/matches |
| `003_teams_country_code_unique.sql` | Unique `country_code` |
| `004_news_articles.sql` | News table |
| `005_team_flag_api_urls.sql` | Backfill `flag_url` → `/api/flags/*` |

**`migrate.js`:** Tracks applied files in `schema_migrations`.

**Key tables:**

| Table | Purpose |
|-------|---------|
| `users` | Auth |
| `teams` | 48 nations, `flag_url`, `country_code` |
| `matches` | Fixtures + scores |
| `standings` | Group tables |
| `predictions` | User bracket JSON + lock flags |
| `news_articles` | Scraped FIFA news |
| `scrape_cache` | Last scrape metadata |

---

### 4.7 Middleware

| File | Role |
|------|------|
| `authMiddleware.js` | Verifies JWT on protected routes |
| `errorMiddleware.js` | Catches errors; JSON 500 response |

---

## 5. Key user flows

### 5.1 View homepage standings

```
LandingPage → StandingsPreview
  useEffect → standingsApi.all()
  → GET /api/standings
  → render GroupStandingsTable × 12 groups
  → TeamFlag loads flag_url /api/flags/MEX
  → Vercel rewrite → Render flag route → image
```

### 5.2 Create prediction

```
Login → JWT stored
PredictionsPage load → teamsApi, matchesApi, predictionsApi.list()
User edits group scores → queueSave (debounced PATCH)
User locks group → predictionsApi.lock → locked_groups in DB
Knockout tab → KnockoutBracketEditor → setKnockoutWinner helpers
```

### 5.3 Sync tournament data

```
Local:  cd backend && npm run scrape
Remote: POST /api/scraper/run  (x-admin-key)
Auto:   SCRAPE_IF_EMPTY=true on Render first boot
```

---

## 6. State summary (frontend)

| Location | State | Persistence |
|----------|-------|-------------|
| `ThemeContext` | light/dark | `localStorage` `wc-theme` |
| `CountdownVisibilityContext` | ribbon open | Memory only |
| Auth token | string | `localStorage` `token` |
| `PredictionsPage` | bracket JSON | Postgres via API |
| Landing sections | fetch results | Memory (refetch on mount) |
| `FifaDisclaimerModal` | dismissed | `localStorage` |
| FAQ accordion | `activeIndex` | Memory |

---

## 7. Environment variables

See [DEPLOYMENT.md](./DEPLOYMENT.md) for full list.

| Variable | Where | Purpose |
|----------|-------|---------|
| `DATABASE_URL` | Backend | Postgres connection |
| `JWT_SECRET` | Backend | Sign tokens |
| `CLIENT_URL` | Backend | CORS allowlist |
| `ADMIN_SCRAPE_KEY` | Backend | Protect scraper endpoint |
| `SCRAPE_IF_EMPTY` | Backend | Auto-scrape on empty DB |
| `VITE_API_URL` | Frontend (optional) | Override API base in dev |

On Vercel, prefer **no** `VITE_API_URL` — use `/api` rewrite.

---

## 8. Deployment topology

| Service | Hosts | Notes |
|---------|-------|-------|
| Vercel | Static `frontend/dist` | `vercel.json` rewrites `/api/*` → Render |
| Render | Express `backend/` | Cold start ~30s on free tier |
| Supabase | Postgres | Session pooler URI recommended |

---

## 9. Conventions for contributors

1. **New API endpoint:** route → controller → `ok()` response → frontend `*Api.js` wrapper.
2. **New team data field:** migration → scraper upsert → controller SELECT → frontend prop.
3. **Dark mode:** always add `dark:` pairs or use `useTheme()` for inline animated UI.
4. **Homepage buttons:** use `HomeButton` variants for consistent light/dark behavior.
5. **Flags:** store `/api/flags/CODE` in DB; never hotlink FIFA URLs in frontend.
6. **Errors:** use `formatApiError()` in fetch client; distinguish network vs empty DB in UI.

---

## 10. File index (quick reference)

For a one-line description of every file, see **[FILES.md](./FILES.md)**.

**Most touched frontend paths:**

```
src/main.jsx
src/App.jsx
src/context/ThemeContext.jsx
src/constants/apiBase.js
src/api/fetchClient.js
src/components/common/HomeButton.jsx
src/components/standings/TeamFlag.jsx
src/pages/Landing/
src/pages/Predictions/PredictionsPage.jsx
src/utils/bracketHelpers.js
src/utils/flagUrl.js
```

**Most touched backend paths:**

```
src/server.js
src/app.js
src/config/cors.js
src/config/db.js
src/scraper/simpleFifaScraper.js
src/scraper/fifaApiClient.js
src/routes/flagRoutes.js
src/controllers/matches/getAllMatches.js
src/controllers/standings/getGroupStandings.js
src/controllers/predictions/predictionHandlers.js
```

---

*Last updated: reflects WC 2026 48-team format, Supabase + Render + Vercel deployment, and backend-stored flag URLs.*

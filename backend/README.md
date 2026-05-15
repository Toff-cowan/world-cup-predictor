# API

## Scripts

- `npm run dev` — start server with watch
- `npm run db:migrate` — create tables
- `npm run scrape` — sync teams, matches, standings from FIFA API
- `npm run db:seed` — alias for scrape (no mock data)

## API routes

| Method | Path | Auth |
|--------|------|------|
| GET | `/api/health` | No |
| POST | `/api/auth/register` | No |
| POST | `/api/auth/login` | No |
| GET | `/api/auth/me` | Yes |
| GET | `/api/teams` | No |
| GET | `/api/matches` | No |
| GET | `/api/matches/upcoming` | No |
| GET | `/api/standings` | No |
| GET | `/api/predictions` | Yes |
| POST | `/api/predictions` | Yes |
| POST | `/api/predictions/:id/lock` | Yes |
| GET | `/api/predictions/shared/:token` | No |
| GET/POST | `/api/forum` | POST = Yes |
| POST | `/api/scraper/run` | `x-admin-key` header |

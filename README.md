# World Cup Bracket Predictor

Simulate and save World Cup 2026 brackets (48 teams, 12 groups A–L, knockout rounds). Users can create multiple predictions, lock finished stages, and compare picks to real standings.

**Stack:** React + Tailwind + Vite · Node + Express · PostgreSQL · Fetch API · simple FIFA scraper

See **[FILES.md](./FILES.md)** for what every file does.

## Setup

1. Create database: `createdb world_cup_predictor`
2. Backend: `cd backend && cp .env.example .env` → edit `DATABASE_URL`, `npm install && npm run db:migrate && npm run scrape && npm run dev`
3. Frontend: `cd frontend && cp .env.example .env && npm install && npm run dev`

Open http://localhost:5173

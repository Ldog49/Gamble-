# PL Bet Tracker

Weekly £5 Premier League bets, tracked and graded. Upload a photo of a bet365
slip, it gets auto-read and matched to a fixture, and once results are in the
app grades it and rolls everything up into weekly and season tables + graphs.

## Stack

Next.js (App Router, TypeScript) + Tailwind + Prisma/PostgreSQL + Recharts.
Claude vision (Anthropic API) reads bet slip photos. football-data.org
supplies Premier League fixtures/results. No passwords — pick your name,
session kept in a signed cookie.

## Local development

1. Get a Postgres database (see `.env.example` for the shape of `DATABASE_URL`).
2. `cp .env.example .env` and fill in:
   - `DATABASE_URL` — your Postgres connection string
   - `ANTHROPIC_API_KEY` — from console.anthropic.com (used to read slip photos)
   - `FOOTBALL_DATA_API_KEY` — free key from football-data.org (used for fixtures/results)
   - `SESSION_SECRET` — random string, e.g. `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`
3. `npm install`
4. `npm run db:migrate` — applies the schema
5. `npm run db:seed` — creates a couple of test users (edit `prisma/seed.ts` to change them)
6. `npm run dev` → http://localhost:3000

## How it works

- **Upload a bet** (`/bets/upload`): take/choose a photo of a bet365 slip →
  Claude vision reads it → you confirm/edit the extracted fields → it's saved
  and matched to a Premier League fixture (and therefore a gameweek).
- **This Week** (`/bets/week`): everyone's bet for a gameweek, with a "Sync
  results" button that pulls the latest Premier League results and
  auto-grades match result / over-under / BTTS / double-chance bets. Anything
  else (or anything ambiguous) is left "Needs Review" for manual grading —
  every bet's result can be manually set/overridden at any time via its
  status badge.
- **Summary** (`/summary`): a per-user/per-gameweek profit table plus a
  profit-per-gameweek bar chart and a cumulative season-profit line chart.

## Deploying to Railway

1. Push this repo to GitHub.
2. In Railway: New Project → Deploy from GitHub repo → select this repo.
3. Add a Postgres plugin to the project (New → Database → PostgreSQL).
4. On the web service, set env vars: `DATABASE_URL` (reference the Postgres
   plugin's `DATABASE_URL`), `ANTHROPIC_API_KEY`, `FOOTBALL_DATA_API_KEY`,
   `SESSION_SECRET`, `FOOTBALL_DATA_SEASON`, and `SLIP_STORAGE_PATH=/data/slips`.
5. Add a Volume to the web service mounted at `/data` (Settings → Volumes) —
   this is where uploaded slip photos persist across deploys.
6. Push to `main` to trigger the first deploy. The start command
   (`prisma migrate deploy && next start`) applies migrations automatically
   on every deploy.

To keep results fresh automatically, add a Railway Cron Schedule that calls
`POST /api/fixtures/sync` on a schedule (not set up by default — the "Sync
results" button on the This Week page covers this manually for now).

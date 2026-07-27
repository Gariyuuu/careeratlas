# CareerAtlas

An interactive global job salary, career-transition, education-impact, and industry-trend tracker. Built with Next.js (App Router), TypeScript, Tailwind CSS, shadcn/ui, Prisma, and Recharts.

CareerAtlas ships with a full, deterministic **simulated demo dataset** (50 industries, 1,000+ standardized roles, salary distributions, career transitions, education outcomes, and industry trend data) so the entire product is explorable immediately — alongside at least one **live official data connector** (U.S. Bureau of Labor Statistics). Every number in the app is labeled `reported`, `estimated`, `forecast`, or `simulated` — see [Reported vs. estimated vs. simulated](#reported-vs-estimated-vs-forecast-vs-simulated) below.

## Quick start (Supabase / any Postgres)

1. Create a database — the fastest path is a free [Supabase](https://supabase.com) project. Go to **Project Settings → Database → Connection string → URI** and copy it.
2. Copy `.env.example` to `.env` and set `DATABASE_URL` to that connection string.
3. Install, migrate, and seed:

```bash
npm install
npm run db:migrate   # creates the schema in your Postgres database
npm run db:seed       # populates the deterministic demo dataset (~2-3 min)
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

To reset the database and reseed from scratch at any point:

```bash
npm run db:reset
```

Prefer not to stand up a database for local exploration? The schema avoids Postgres-only features on purpose, so you can flip `datasource.provider` in `prisma/schema.prisma` to `"sqlite"` and point `DATABASE_URL` at `file:./dev.db` instead — no other code changes needed.

### Environment variables

Copy `.env.example` to `.env`. Only `DATABASE_URL` is required to run the app; everything else is optional:

| Variable | Required? | Purpose |
|---|---|---|
| `DATABASE_URL` | Yes | PostgreSQL connection string (Supabase, Neon, Vercel Postgres, or local SQLite) |
| `AUTH_SECRET` | Production only | NextAuth session signing secret — `openssl rand -base64 32` |
| `CRON_SECRET` | No | If set, protects `/api/cron/update-trends` with a bearer token |
| `BLS_API_KEY` | No | Raises the BLS public API's daily rate limit; the connector works without it |
| `CENSUS_API_KEY`, `COLLEGE_SCORECARD_API_KEY` | No | Reserved for future connectors (see [Adding a new data provider](#adding-a-new-data-provider)) — the app runs fine without them, and unconfigured sources show clearly as "not configured" on the [Data Sources](#) and [Admin Data Status](#) pages |

## Local development

```bash
npm run dev          # start the dev server (Turbopack)
npm run lint          # ESLint (includes React Compiler rules)
npm run test           # Vitest unit tests (scoring/methodology library)
npm run test:e2e        # Playwright end-to-end tests (requires a build; see below)
npx tsc --noEmit          # TypeScript check
npm run build              # production build
npm run db:studio           # Prisma Studio (browse the database)
```

Playwright's config builds and boots the app itself (`npm run start`) unless a server is already running on port 3000, in which case it reuses it.

## Database setup

The Prisma schema (`prisma/schema.prisma`) targets PostgreSQL by default (Supabase or any Postgres host) and is written to be **portable**: it avoids Postgres-only features (native scalar-list columns, native enums) so the exact same schema also runs unchanged on SQLite if you'd rather not stand up a database for quick local exploration. Enum-like fields are plain `String` columns validated by convention (e.g. `dataStatus: "reported" | "estimated" | "forecast" | "simulated"`).

### Supabase setup

1. Create a project at [supabase.com](https://supabase.com) (free tier is enough for the demo dataset).
2. **Project Settings → Database → Connection string → URI** — copy it. For serverless hosts like Vercel, use the **Transaction pooler** connection string (port 6543, `?pgbouncer=true`) rather than the direct connection, since serverless functions open/close connections frequently.
3. Set `DATABASE_URL` in `.env` (local) or your host's environment variables (production) to that string.
4. Run `npm run db:migrate` to create the schema, then `npm run db:seed`.
5. NextAuth's session/account tables need no further setup — the schema already includes `Account`/`Session` models compatible with `@auth/prisma-adapter`.

Supabase Auth is not wired in by default (the app uses NextAuth v5 with a Credentials provider against the `User` table); swapping to Supabase Auth would mean replacing `src/lib/auth.ts` with a Supabase client and adjusting the `session`/`profile` reads in `src/lib/data/*`.

### Falling back to SQLite

Flip `datasource.provider` in `prisma/schema.prisma` to `"sqlite"`, set `DATABASE_URL="file:./dev.db"`, delete `prisma/migrations/` (Postgres and SQLite migration SQL aren't compatible with each other), then run `npm run db:migrate` to generate a fresh SQLite migration.

## Deployment (Vercel)

1. Push this repo to GitHub and import it into Vercel.
2. Set `DATABASE_URL` (pointing at your production Postgres/Supabase instance) and `AUTH_SECRET` in Vercel's environment variables.
3. Vercel Cron is already configured in `vercel.json` to hit `/api/cron/update-trends` daily at 06:00 UTC. Set `CRON_SECRET` in production and Vercel will send it automatically as the cron's bearer token (configure it under the Vercel Cron UI, or leave `CRON_SECRET` unset to allow unauthenticated calls — not recommended in production).
4. Run `npm run db:migrate` (or `prisma migrate deploy`) against the production database as part of your deploy step, then `npm run db:seed` once to populate the demo dataset (safe to skip in a "real data only" deployment once official connectors are fully populated).

## Daily data updates

`src/lib/providers/` implements a small provider architecture so new official/licensed data sources can be added without touching the rest of the app:

```ts
interface DataProvider<TRaw, TNormalized> {
  slug: string;
  isConfigured(): boolean;
  fetchData(): Promise<TRaw>;
  normalizeData(raw: TRaw): TNormalized[];
  validateData(rows: TNormalized[]): { valid: TNormalized[]; rejected: number; warnings: string[] };
  upsertData(rows: TNormalized[]): Promise<number>;
}
```

`runDataImport(slug)` (`src/lib/providers/run-import.ts`) runs a connector end-to-end and logs the result to `DataImportRun`/`DataQualityCheck` — fetch → normalize → validate → upsert → log, and it **never deletes previously valid data on failure**. `/api/cron/update-trends` runs every configured connector; `vercel.json` schedules it daily. The **Admin → Data Status** page (`/admin/data-status`) shows last successful/attempted update, rows imported/rejected, quality warnings, and connector status per source, and lets you trigger a run manually.

### The working connector

`src/lib/providers/bls-provider.ts` fetches the U.S. Bureau of Labor Statistics' public Average Hourly Earnings series (`CES0500000003`, no API key required) and computes a live year-over-year wage-growth figure, stored in the `EconomicIndicator` table with `dataStatus: "reported"`. This figure is used as the live default "annual raise" assumption in the [Salary Projection Calculator](#) — everywhere else in the app remains simulated demo data. Trigger it locally with:

```bash
curl http://localhost:3000/api/cron/update-trends
```

## Reported vs. estimated vs. forecast vs. simulated

Every data-bearing row in the schema carries a `dataStatus` field, always one of:

- **`reported`** — directly observed from an official or licensed source (e.g. the live BLS series above).
- **`estimated`** — derived from official data with some interpolation or modeling (e.g. cost-of-living indices).
- **`forecast`** — a forward-looking projection computed from a documented formula (e.g. salary forecasts).
- **`simulated`** — deterministically generated placeholder data used to make the product usable before every connector is fully populated. **Never presented as verified real-world data** — every simulated figure carries a visible amber "Simulated" badge, and `computeConfidence()` (`src/lib/scoring/confidence.ts`) caps simulated data at a low confidence ceiling regardless of sample size.

The `/methodology` and `/data-sources` pages explain this to end users; the "demo dataset" banner in the app shell reiterates it on every page.

## Methodology

Every score and projection is implemented as a small, pure, independently unit-tested function in `src/lib/scoring/`:

| File | Score |
|---|---|
| `projection.ts` | Salary Projection (conservative/expected/aggressive, 1/3/5/10-year) |
| `cost-of-living.ts` | Cost-of-living adjustment |
| `transition-score.ts` | Transition compatibility, difficulty, and category classification |
| `momentum-score.ts` | Job Market Momentum Score (9 weighted, user-adjustable factors) |
| `education-roi.ts` | Education ROI (net cost, break-even year, N-year return) |
| `accessibility-score.ts` | Accessibility Score |
| `salary-opportunity-score.ts` | Salary Opportunity Score |
| `career-value-score.ts` | combined Career Value Score |
| `confidence.ts` | Confidence scoring, gated by `dataStatus` |
| `percentile-rank.ts` | Where a salary falls within a role's distribution |

Human-readable descriptions and formulas for each are also seeded into the `MethodologyVersion` table and rendered on `/methodology`. Every formula is transparent by design — projections return their full factor breakdown, and momentum/career-value scores return their component sub-scores and weights alongside the final number, rather than hiding the math.

## Adding a new country

1. Add an entry to `COUNTRIES` in `src/lib/seed-data/geography.ts` (code, name, currency, `supportLevel`).
2. Optionally add `REGIONS` and `METRO_AREAS` entries for that country (used for cost-of-living adjustment and geographic filtering).
3. Re-run `npm run db:seed` (or `db:reset` for a clean reseed).
4. Country-scoped queries (`src/lib/data/salary.ts`, `src/lib/data/geography.ts`) already parameterize by country — no further code changes are required for the new country to appear in the Salary Explorer's country selector. Populate real salary/education data for it via a new or extended data provider (see below) as it becomes available.

## Adding a new data provider

1. Add a row to `DATA_SOURCES` in `src/lib/seed-data/data-sources.ts` describing the source.
2. Implement `DataProvider` in a new file under `src/lib/providers/` (see `bls-provider.ts` for a complete example: fetch → normalize → validate → upsert).
3. Register it in `PROVIDER_REGISTRY` (`src/lib/providers/registry.ts`).
4. If it needs an API key, add the env var to `.env.example` and reference it via `apiKeyEnvVar` on the `DATA_SOURCES` entry — the Data Sources and Admin pages will automatically show "not configured" until it's set, and the app keeps working without it.

## Adding an industry or occupation

The taxonomy is generated programmatically, not hand-typed, so it can scale without a rewrite:

- **Flagship industries** (Technology, AI/ML, Data & Analytics, Financial Services, Quant Finance, Consulting, Healthcare, Cybersecurity) have hand-curated depth in `src/lib/seed-data/featured-taxonomy.ts` — add new subindustries/job families/occupations there following the existing `occ()`/`sub()` helper patterns.
- **All other industries** use category-based archetype templates in `src/lib/seed-data/generic-taxonomy.ts`, which interpolate the industry name into role-ladder templates (analyst → specialist → manager) per `IndustryCategory`. Add a new industry to `INDUSTRIES` in `src/lib/seed-data/industries.ts` with a `category`, and it automatically receives a full generated taxonomy on the next seed run — no manual role authoring needed.
- To add a fully custom deep taxonomy for a new industry instead of the generic templates, add it to `FEATURED_TAXONOMY` in `featured-taxonomy.ts` and mark the industry `featured: true` in `industries.ts`.
- Re-run `npm run db:seed` (or `db:reset`) after any taxonomy change.

## What's simulated, what's real, and what's not implemented

- **Simulated**: all salary observations/percentiles/history/forecasts, employment and job-posting statistics, industry momentum scores and their sub-factors, layoff and remote-work statistics, skill-demand statistics, education outcomes and college costs, and career-transition scores. All deterministically generated (same seed → same data every run) and clearly labeled in the UI.
- **Reported (live)**: U.S. average hourly earnings and its year-over-year growth rate, fetched from the BLS public API and shown on `/admin/data-status` and used as a live default in the Salary Projection Calculator.
- **Not implemented** (documented gaps, not silently missing): PDF report export (CSV export of saved careers is implemented instead); Census ACS and College Scorecard connectors (env vars and `DataSource` rows are scaffolded, but no connector code — see [Adding a new data provider](#adding-a-new-data-provider)); Supabase Auth (NextAuth Credentials is used instead, see [Database setup](#switching-to-postgresql--supabase)); full drag-and-drop weight editing is implemented for the Momentum Score but not yet for the Career Value Score.

## Testing

- **Unit tests** (`npm run test`): every scoring/methodology function in `src/lib/scoring/` (projection, cost-of-living, transition scoring, momentum scoring, education ROI, confidence, percentile rank).
- **End-to-end tests** (`npm run test:e2e`, Playwright): searching for a role, opening a role detail page, creating and adjusting a salary projection, viewing career transitions, comparing careers, changing education ROI assumptions, and signing up + saving a career.

## Tech stack

Next.js (App Router) · TypeScript · React 19 · Tailwind CSS v4 · shadcn/ui · Prisma · SQLite (dev) / PostgreSQL (prod) · NextAuth v5 · Recharts · TanStack Table · Zod · Vitest · Playwright.

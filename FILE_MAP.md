# FILE_MAP.md — Practical Repository Map

All paths are relative to `/Users/gariyuu/Projects/careeratlas`.

## Database layer

### `prisma/schema.prisma`
**Purpose**: the entire data model (51 models, re-counted 2026-08-07 — see
`DATABASE.md`). **Calls**: nothing (it's
config). **Called by**: `prisma generate` (produces `@prisma/client`),
`prisma migrate *`, every file that imports `@prisma/client`. **When to
edit**: adding/changing a table, field, relation, or index. **Edit risk**:
Very high — touches every `src/lib/data/*`, every provider's `upsertData`,
and `prisma/seed.ts`. Always run `npm run db:generate` after editing, and
`npm run db:migrate` against a disposable database.

### `prisma/seed.ts` (956 lines)
**Purpose**: deterministically generates the entire simulated demo dataset.
**Calls**: `src/lib/scoring/*` (projection, transition-score,
momentum-score, confidence), `src/lib/seed-data/*` (all static reference
data), `src/lib/seed-data/rng.ts` for seeded randomness. **Called by**:
`npm run db:seed` / `npm run db:reset`. **When to edit**: adding a new
industry/country/major that needs simulated data generated for it, or
changing how simulated figures are derived. **Edit risk**: High — order and
RNG-seed strings matter for determinism; a careless change silently changes
every generated number.

### `prisma/migrations/20260727202821_init/migration.sql`
**Purpose**: the one and only migration, full initial schema. **When to
edit**: never by hand — regenerate via `prisma migrate dev` after a schema
change. **Edit risk**: Very high if hand-edited (drifts from
`schema.prisma`).

## Server-side read layer (`src/lib/data/`)

Each file is a thin, feature-scoped set of Prisma-query functions called
from Server Component `page.tsx` files. None of them mutate data.

| File | Purpose | Edit risk |
|---|---|---|
| `salary.ts` | Salary Explorer queries (filters by industry/seniority/country/metro) | Medium |
| `occupations.ts` | Occupation/role detail + search-adjacent lookups | Medium |
| `industries.ts` | Industry/subindustry listing | Low |
| `geography.ts` | Country/region/metro + cost-of-living lookups | Low |
| `transitions.ts` | Career transition graph/table queries | Medium |
| `education.ts` | Education ROI / institution / major queries | Medium |
| `trends.ts` | Industry momentum leaderboard queries | Medium |
| `dashboard.ts` | Personalized + global dashboard snapshot aggregation | High (touches many models at once) |
| `compare.ts` | Multi-occupation comparison queries (up to 5) | Medium |
| `saved.ts` | Saved occupations/comparisons listing for `/saved` | Low |
| `projection.ts` | Salary projection calculator's data-fetch side | Medium |
| `admin.ts` | `listDataSourceStatus`, `listEconomicIndicators` for `/admin/data-status` | Low |

**When to edit**: adding a new filter/column to an existing feature, or a
new read query. **General pattern**: import `prisma` from `@/lib/prisma`,
export an `async function` per query, called directly (awaited) from a
Server Component.

## Server-side write layer (`src/lib/actions/`)

All files start with `"use server"`. Pattern: `auth()` check (where
applicable) → validate input → Prisma write → `revalidatePath(...)`.

| File | Purpose | Auth required | Edit risk |
|---|---|---|---|
| `auth.ts` | `signInAction`, `signUpAction` | No (this IS the auth entry point) | High — touches password hashing and session creation |
| `account.ts` | `deleteAccountAction` | Yes | High — irreversible delete, cascades via schema `onDelete: Cascade` |
| `profile.ts` | `upsertProfile` | Yes | Low |
| `saved-occupations.ts` | `toggleSavedOccupation`, `isOccupationSaved` | Yes (toggle); read-only helper degrades gracefully | Low |
| `comparisons.ts` | `saveComparison`, `deleteSavedComparison` | Yes | Low |
| `admin.ts` | `triggerDataImport` | **No — this is the security gap, see SECURITY.md** | High |

## Data connectors (`src/lib/providers/`)

| File | Purpose | Keyless? | Edit risk |
|---|---|---|---|
| `types.ts` | `DataProvider` interface + `runProvider()` orchestration wrapper | — | High — every connector depends on this contract |
| `registry.ts` | `PROVIDER_REGISTRY` — the list of active connectors | — | Medium — add new connectors here |
| `run-import.ts` | `runDataImport(slug)`, `runAllConfiguredImports()` — logs to `DataImportRun`/`DataQualityCheck`, updates `DataSource.status` | — | Medium |
| `bls-provider.ts` | BLS CES avg. hourly earnings (`bls-ces`) | Yes | Low |
| `bls-oews-provider.ts` | BLS OEWS per-occupation wages (`bls-oews`), 27 occupations mapped | Yes | Medium |
| `onet-provider.ts` | O*NET education requirements + alternate titles (`onet`) | Yes | Medium |
| `revelio-rpls-provider.ts` | Revelio public posting-growth trend (`revelio-rpls`) | Yes | Medium |
| `census-acs-provider.ts` | Census ACS median earnings by education level (`census-acs`) | No — needs `CENSUS_API_KEY` | Medium |
| `college-scorecard-provider.ts` | College Scorecard per-institution tuition (`college-scorecard`) | No — needs `COLLEGE_SCORECARD_API_KEY` | Medium |

**When to edit**: adding a new external data source. Follow the existing
pattern exactly; register in `registry.ts`; add a `DataSource` row in
`src/lib/seed-data/data-sources.ts`; add the env var to `.env.example` if
needed.

## Scoring / methodology (`src/lib/scoring/`)

Pure functions, no I/O, imported by both `prisma/seed.ts` and live page
code. `*.test.ts` files are co-located.

| File | Score | Has test? |
|---|---|---|
| `projection.ts` | Salary Projection (conservative/expected/aggressive × 1/3/5/10yr) | Yes |
| `cost-of-living.ts` | Cost-of-living adjustment | Yes |
| `transition-score.ts` | Transition compatibility/difficulty/category | Yes |
| `momentum-score.ts` | Job Market Momentum Score (9 weighted factors) | Yes |
| `education-roi.ts` | Education ROI (net cost, break-even, N-yr return) | Yes |
| `accessibility-score.ts` | Accessibility Score | **No** |
| `salary-opportunity-score.ts` | Salary Opportunity Score | **No** |
| `career-value-score.ts` | Combined Career Value Score | **No** |
| `confidence.ts` | Confidence scoring, gated by `dataStatus` | Yes |
| `percentile-rank.ts` | Where a salary falls within a role's distribution | Yes |

**When to edit**: changing a formula. **Edit risk**: High — these are
user-facing "transparent methodology" numbers described on `/methodology`
and consumed by `prisma/seed.ts`; a change here changes real displayed
numbers app-wide. Always run `npm run test` before and after.

## Static reference / taxonomy data (`src/lib/seed-data/`)

| File | Purpose |
|---|---|
| `industries.ts` | `INDUSTRIES` — the 50-industry list with `category` |
| `featured-taxonomy.ts` | Hand-curated deep taxonomy for 8 flagship industries |
| `generic-taxonomy.ts` | Programmatic archetype-template taxonomy for all other industries |
| `taxonomy-types.ts` | Shared taxonomy TypeScript types + `SENIORITY_TRACK_LEVELS` |
| `seniority-levels.ts` | `SENIORITY_LEVELS`, rank 0 (Intern) – 13 (C-Suite/Partner) |
| `skills.ts` | `UNIQUE_SKILLS` catalog |
| `geography.ts` | `COUNTRIES`, `REGIONS`, `METRO_AREAS` |
| `education.ts` | `MAJORS`, `INSTITUTIONS` |
| `data-sources.ts` | `DATA_SOURCES` — every `DataSource` row, real + planned |
| `methodology.ts` | `METHODOLOGY_VERSIONS` — human-readable formula descriptions for `/methodology` |
| `salary-model.ts` | Base salary curves, tier/company-size/work-arrangement multipliers |
| `bls-occupation-mapping.ts` | Maps CareerAtlas occupation slugs → BLS SOC codes |
| `rng.ts` | `createRng`, `rngSeeded`, `rngInt`, `rngRange`, `rngPick` — deterministic PRNG helpers |

**When to edit**: adding a country/industry/major/skill/institution, per the
`README.md` "Adding a new country" / "Adding an industry or occupation"
sections. **Edit risk**: Medium — always re-run `npm run db:seed` (or
`db:reset`) after, against a disposable database.

## Next.js pages (`src/app/`)

### `src/app/layout.tsx`
Root layout: fonts, `ThemeProvider`, `SessionProvider` (seeded from
server-side `auth()`), `TooltipProvider`, `Toaster`. **Edit risk**: High —
global, affects every page.

### `src/app/page.tsx`
Public landing page. Queries `prisma` directly for headline stats (the one
inline-Prisma exception to the `src/lib/data/` pattern). **Edit risk**: Low
(presentation only).

### `src/app/(app)/layout.tsx`
Wraps every page under the `(app)` group with `Sidebar` + `Topbar` +
`DemoDataBanner` + `MobileNav`. **Does not** perform any auth check — see
`SECURITY.md`. **Edit risk**: Medium — global to the whole app shell.

### `src/app/(app)/*/page.tsx` (dashboard, careers, salary, transitions,
education, trends, compare, roles, saved, profile, settings, methodology,
data-sources, admin/data-status, projection)
Each is a Server Component composing one or more `src/lib/data/*` reads with
a colocated client component for interactive filters/forms (e.g.
`salary-filters.tsx`, `compare-selector.tsx`, `education-compare-tool.tsx`,
`projection-calculator.tsx`, `role-filters.tsx`, `profile-form.tsx`,
`transition-table.tsx`, `momentum-leaderboard.tsx`,
`role-salary-section.tsx`). **Edit risk**: Low–Medium, scoped to that
feature.

### `src/app/(auth)/sign-in/page.tsx`, `sign-up/page.tsx`, `(auth)/layout.tsx`
Minimal-layout auth pages, forms bound to `signInAction`/`signUpAction` via
`useActionState` (implied by the `_prevState`/`FormData` signature in
`src/lib/actions/auth.ts`). **Edit risk**: High (auth-adjacent).

### `src/app/api/auth/[...nextauth]/route.ts`
Re-exports NextAuth's `handlers` from `src/lib/auth.ts`. **Edit risk**: Very
high.

### `src/app/api/cron/update-trends/route.ts`
`GET` handler: optionally checks `CRON_SECRET` bearer token, then calls
`runAllConfiguredImports()`. **Edit risk**: High — see `SECURITY.md`'s note
on unauthenticated access when `CRON_SECRET` is unset.

### `src/app/api/export/saved/route.ts`
`GET`, auth-gated, streams a CSV of the signed-in user's saved occupations.
**Edit risk**: Low.

### `src/app/api/search/route.ts`
`GET`, public, in-memory case-insensitive title/alias search over all
occupations (comment in the file notes this is intentional since the
catalog is only ~1-2k rows). **Edit risk**: Low, but note the "no index,
in-memory scan" approach if the occupation catalog grows substantially.

## UI components

### `src/components/ui/*` (shadcn/ui primitives)
Generated/customized via `shadcn` CLI per `components.json`. **Edit risk**:
Low individually, but changes ripple visually across the whole app — check
multiple pages after editing a shared primitive like `button.tsx` or
`card.tsx`.

### `src/components/layout/*`
`sidebar.tsx`, `topbar.tsx`, `mobile-nav.tsx`, `nav-items.ts` (the single
source of truth for the nav menu — edit here to add/remove/reorder a nav
item), `global-search.tsx` (client component hitting `/api/search`),
`demo-data-banner.tsx`. **Edit risk**: Medium — global chrome.

### `src/components/charts/*`
`comparison-bar-chart.tsx`, `comparison-radar-chart.tsx`,
`salary-distribution-chart.tsx`, `salary-trend-chart.tsx` — Recharts
wrappers. **Edit risk**: Low, presentation only.

### Other top-level components
`data-status-badge.tsx` (renders the reported/estimated/forecast/simulated
badge — central to the app's core "never overstate confidence" principle,
treat as **high** edit risk despite its small size), `data-table.tsx`
(TanStack Table wrapper), `role-picker.tsx`, `run-import-button.tsx`,
`save-career-button.tsx`, `save-comparison-button.tsx`,
`delete-account-button.tsx`, `page-header.tsx`, `session-provider.tsx`,
`theme-provider.tsx`, `theme-settings.tsx`, `theme-toggle.tsx`,
`transition-graph.tsx`.

## Configuration files

| File | Purpose | Edit risk |
|---|---|---|
| `next.config.ts` | Currently empty `NextConfig` object — no custom config | Low |
| `tsconfig.json` | `strict: true`, `@/*` → `./src/*` path alias, Next.js plugin | Medium |
| `eslint.config.mjs` | `eslint-config-next` core-web-vitals + typescript, flat config | Low |
| `vitest.config.ts` | Node environment, `src/**/*.test.ts` include pattern, `vite-tsconfig-paths` plugin | Low |
| `playwright.config.ts` | `e2e/` testDir, `webServer` runs `npm run start` on port 3000 | Medium — touches whatever DB is configured, see `TESTING.md` |
| `components.json` | shadcn/ui config (style, aliases, icon library) | Low |
| `vercel.json` | Vercel Cron schedule for `/api/cron/update-trends` | Medium |
| `.env.example` | Documents every env var — keep in sync with actual usage | Medium |
| `package.json` | Scripts + dependencies | High if touching `scripts` or core deps (Next/Prisma/React versions) |

## Where to make common changes

- **Add a new page/feature under the main app shell**: create
  `src/app/(app)/<name>/page.tsx`, add a read function to
  `src/lib/data/<name>.ts` if it needs new queries, add a nav entry to
  `src/components/layout/nav-items.ts`. Decide explicitly whether it needs
  an `auth()` gate.
- **Add a new form/mutation**: add a function to the relevant
  `src/lib/actions/*.ts` (or a new file, following the existing
  `"use server"` + `auth()` + validate + `revalidatePath` pattern).
- **Add a new external data source**: `src/lib/providers/<slug>-provider.ts`
  implementing `DataProvider`, register in `registry.ts`, add a row to
  `src/lib/seed-data/data-sources.ts`, document any new env var in
  `.env.example`.
- **Add/change a scoring formula**: edit `src/lib/scoring/<name>.ts`,
  update/add its `*.test.ts`, and check whether `prisma/seed.ts` and the
  `/methodology` page's `METHODOLOGY_VERSIONS` description need updating too.
- **Add a new industry/country/major/skill**: extend the relevant file in
  `src/lib/seed-data/`, then `npm run db:seed` (or `db:reset`) against a
  disposable database.
- **Change the schema**: edit `prisma/schema.prisma`, `npm run db:generate`,
  `npm run db:migrate` (disposable DB only), update any `src/lib/data/*` or
  provider `upsertData` that touches the changed model.
- **Change global styling/theme**: `src/app/globals.css` (Tailwind v4
  `@theme` tokens), see `UI_SYSTEM.md`.
- **Add/adjust a shadcn/ui primitive**: `src/components/ui/`, `components.json`.

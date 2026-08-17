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
`prisma/schema.prisma`).

## Server-side read layer (`src/lib/data/`)

Each file is a thin, feature-scoped set of Prisma-query functions called
from Server Component route `**/page.tsx` files. None of them mutate data.

| File | Purpose | Edit risk |
|---|---|---|
| `src/lib/data/salary.ts` | Salary Explorer queries (filters by industry/seniority/country/metro) | Medium |
| `src/lib/data/occupations.ts` | Occupation/role detail + search-adjacent lookups | Medium |
| `src/lib/data/industries.ts` | Industry/subindustry listing | Low |
| `src/lib/data/geography.ts` | Country/region/metro + cost-of-living lookups | Low |
| `src/lib/data/transitions.ts` | Career transition graph/table queries | Medium |
| `src/lib/data/education.ts` | Education ROI / institution / major queries | Medium |
| `src/lib/data/trends.ts` | Industry momentum leaderboard queries | Medium |
| `src/lib/data/dashboard.ts` | Personalized + global dashboard snapshot aggregation | High (touches many models at once) |
| `src/lib/data/compare.ts` | Multi-occupation comparison queries (up to 5) | Medium |
| `src/lib/data/saved.ts` | Saved occupations/comparisons listing for `/saved` | Low |
| `src/lib/data/projection.ts` | Salary projection calculator's data-fetch side | Medium |
| `src/lib/data/admin.ts` | `listDataSourceStatus`, `listEconomicIndicators` for `/admin/data-status` | Low |

**When to edit**: adding a new filter/column to an existing feature, or a
new read query. **General pattern**: import `prisma` from `@/lib/prisma`,
export an `async function` per query, called directly (awaited) from a
Server Component.

## Server-side write layer (`src/lib/actions/`)

All files start with `"use server"`. Pattern: `auth()` check (where
applicable) → validate input → Prisma write → `revalidatePath(...)`.

| File | Purpose | Auth required | Edit risk |
|---|---|---|---|
| `src/lib/actions/auth.ts` | `signInAction`, `signUpAction` | No (this IS the auth entry point) | High — touches password hashing and session creation |
| `src/lib/actions/account.ts` | `deleteAccountAction` | Yes | High — irreversible delete, cascades via schema `onDelete: Cascade` |
| `src/lib/actions/profile.ts` | `upsertProfile` | Yes | Low |
| `src/lib/actions/saved-occupations.ts` | `toggleSavedOccupation`, `isOccupationSaved` | Yes (toggle); read-only helper degrades gracefully | Low |
| `src/lib/actions/comparisons.ts` | `saveComparison`, `deleteSavedComparison` | Yes | Low |
| `src/lib/actions/admin.ts` | `triggerDataImport` | **Yes, as of `80a7961` (2026-08-13)** — gated via `isAdminSession()` (`src/lib/admin-auth.ts`), fails closed if `ADMIN_EMAILS` is unset; see `SECURITY.md`/`TASKS.md` TASK-001 | High |

## Cross-cutting utilities (`src/lib/`, top level)

Added 2026-08-13 alongside the TASK-001 fix; not previously present when
this file was first written.

| File | Purpose | Edit risk |
|---|---|---|
| `src/lib/admin-auth.ts` | `isAdminSession()` — reads `ADMIN_EMAILS` (comma-separated, case-insensitive), fails closed (empty/unset allowlist = deny all), then checks the current session's email against it | Medium — the entire admin gate lives here |
| `src/lib/sanitize.ts` | `sanitizeErrorText()` — truncates and redacts `key`/`token`/`secret`/`password=<value>`-shaped substrings before an error/warning string from a data-connector run is rendered on `/admin/data-status` | Low |

## Data connectors (`src/lib/providers/`)

| File | Purpose | Keyless? | Edit risk |
|---|---|---|---|
| `src/lib/providers/types.ts` | `DataProvider` interface + `runProvider()` orchestration wrapper | — | High — every connector depends on this contract |
| `src/lib/providers/registry.ts` | `PROVIDER_REGISTRY` — the list of active connectors | — | Medium — add new connectors here |
| `src/lib/providers/run-import.ts` | `runDataImport(slug)`, `runAllConfiguredImports()` — logs to `DataImportRun`/`DataQualityCheck`, updates `DataSource.status` | — | Medium |
| `src/lib/providers/bls-provider.ts` | BLS CES avg. hourly earnings (`bls-ces`) | Yes | Low |
| `src/lib/providers/bls-oews-provider.ts` | BLS OEWS per-occupation wages (`bls-oews`), 27 occupations mapped | Yes | Medium |
| `src/lib/providers/onet-provider.ts` | O*NET education requirements + alternate titles (`onet`) | Yes | Medium |
| `src/lib/providers/revelio-rpls-provider.ts` | Revelio public posting-growth trend (`revelio-rpls`) | Yes | Medium |
| `src/lib/providers/census-acs-provider.ts` | Census ACS median earnings by education level (`census-acs`) | No — needs `CENSUS_API_KEY` | Medium |
| `src/lib/providers/college-scorecard-provider.ts` | College Scorecard per-institution tuition (`college-scorecard`) | No — needs `COLLEGE_SCORECARD_API_KEY` | Medium |

**When to edit**: adding a new external data source. Follow the existing
pattern exactly; register in `src/lib/providers/registry.ts`; add a `DataSource` row in
`src/lib/seed-data/data-sources.ts`; add the env var to `.env.example` if
needed.

## Scoring / methodology (`src/lib/scoring/`)

Pure functions, no I/O, imported by both `prisma/seed.ts` and live page
code. `*.test.ts` files are co-located.

| File | Score | Has test? |
|---|---|---|
| `src/lib/scoring/projection.ts` | Salary Projection (conservative/expected/aggressive × 1/3/5/10yr) | Yes |
| `src/lib/scoring/cost-of-living.ts` | Cost-of-living adjustment | Yes |
| `src/lib/scoring/transition-score.ts` | Transition compatibility/difficulty/category | Yes |
| `src/lib/scoring/momentum-score.ts` | Job Market Momentum Score (9 weighted factors) | Yes |
| `src/lib/scoring/education-roi.ts` | Education ROI (net cost, break-even, N-yr return) | Yes |
| `src/lib/scoring/accessibility-score.ts` | Accessibility Score | **No** |
| `src/lib/scoring/salary-opportunity-score.ts` | Salary Opportunity Score | **No** |
| `src/lib/scoring/career-value-score.ts` | Combined Career Value Score | **No** |
| `src/lib/scoring/confidence.ts` | Confidence scoring, gated by `dataStatus` | Yes |
| `src/lib/scoring/percentile-rank.ts` | Where a salary falls within a role's distribution | Yes |

**When to edit**: changing a formula. **Edit risk**: High — these are
user-facing "transparent methodology" numbers described on `/methodology`
and consumed by `prisma/seed.ts`; a change here changes real displayed
numbers app-wide. Always run `npm run test` before and after.

## Static reference / taxonomy data (`src/lib/seed-data/`)

| File | Purpose |
|---|---|
| `src/lib/seed-data/industries.ts` | `INDUSTRIES` — the 50-industry list with `category` |
| `src/lib/seed-data/featured-taxonomy.ts` | Hand-curated deep taxonomy for 8 flagship industries |
| `src/lib/seed-data/generic-taxonomy.ts` | Programmatic archetype-template taxonomy for all other industries |
| `src/lib/seed-data/taxonomy-types.ts` | Shared taxonomy TypeScript types + `SENIORITY_TRACK_LEVELS` |
| `src/lib/seed-data/seniority-levels.ts` | `SENIORITY_LEVELS`, rank 0 (Intern) – 13 (C-Suite/Partner) |
| `src/lib/seed-data/skills.ts` | `UNIQUE_SKILLS` catalog |
| `src/lib/seed-data/geography.ts` | `COUNTRIES`, `REGIONS`, `METRO_AREAS` |
| `education.ts` | `MAJORS`, `INSTITUTIONS` |
| `src/lib/seed-data/data-sources.ts` | `DATA_SOURCES` — every `DataSource` row, real + planned |
| `methodology.ts` | `METHODOLOGY_VERSIONS` — human-readable formula descriptions for `/methodology` |
| `src/lib/seed-data/salary-model.ts` | Base salary curves, tier/company-size/work-arrangement multipliers |
| `src/lib/seed-data/bls-occupation-mapping.ts` | Maps CareerAtlas occupation slugs → BLS SOC codes |
| `src/lib/seed-data/rng.ts` | `createRng`, `rngSeeded`, `rngInt`, `rngRange`, `rngPick` — deterministic PRNG helpers |

**When to edit**: adding a country/industry/major/skill/institution, per the
`README.md` "Adding a new country" / "Adding an industry or occupation"
sections. **Edit risk**: Medium — always re-run `npm run db:seed` (or
`db:reset`) after, against a disposable database.

## Next.js pages (`src/app/`)

### `src/app/layout.tsx`
Root layout: fonts, `ThemeProvider`, `SessionProvider` (seeded from
server-side `auth()`), `TooltipProvider`, `Toaster`. As of `fb63183`
(2026-08-13) also exports the site's `Metadata` (OpenGraph/Twitter card
fields). **Edit risk**: High — global, affects every page.

### `src/app/opengraph-image.tsx`, `src/app/robots.ts`, `src/app/sitemap.ts`
Added `fb63183` (2026-08-13), not present when this file was first written.
Next.js special-file conventions: `src/app/opengraph-image.tsx` generates the
`/opengraph-image` social-preview image at request time; `src/app/robots.ts` and
`src/app/sitemap.ts` generate `/robots.txt` and `/sitemap.xml`. All three are static
content, no auth, no DB reads. **Edit risk**: Low.

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
`src/app/(app)/salary/salary-filters.tsx`, `src/app/(app)/compare/compare-selector.tsx`, `src/app/(app)/education/compare/education-compare-tool.tsx`,
`src/app/(app)/projection/projection-calculator.tsx`, `src/app/(app)/roles/role-filters.tsx`, `src/app/(app)/profile/profile-form.tsx`,
`src/app/(app)/transitions/transition-table.tsx`, `src/app/(app)/trends/momentum-leaderboard.tsx`,
`src/app/(app)/roles/[role]/role-salary-section.tsx`). **Edit risk**: Low–Medium, scoped to that
feature.

### `src/app/(auth)/sign-in/page.tsx`, `src/app/(auth)/sign-up/page.tsx`, `(auth)/layout.tsx`
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
multiple pages after editing a shared primitive like `src/components/ui/button.tsx` or
`src/components/ui/card.tsx`.

### `src/components/layout/*`
`src/components/layout/sidebar.tsx`, `src/components/layout/topbar.tsx`, `src/components/layout/mobile-nav.tsx`, `src/components/layout/nav-items.ts` (the single
source of truth for the nav menu — edit here to add/remove/reorder a nav
item), `src/components/layout/global-search.tsx` (client component hitting `/api/search`),
`src/components/layout/demo-data-banner.tsx`. **Edit risk**: Medium — global chrome.

### `src/components/charts/*`
`src/components/charts/comparison-bar-chart.tsx`, `src/components/charts/comparison-radar-chart.tsx`,
`src/components/charts/salary-distribution-chart.tsx`, `src/components/charts/salary-trend-chart.tsx` — Recharts
wrappers. **Edit risk**: Low, presentation only.

### Other top-level components
`src/components/data-status-badge.tsx` (renders the reported/estimated/forecast/simulated
badge — central to the app's core "never overstate confidence" principle,
treat as **high** edit risk despite its small size), `src/components/data-table.tsx`
(TanStack Table wrapper), `src/components/role-picker.tsx`, `src/components/run-import-button.tsx`,
`src/components/save-career-button.tsx` (as of `fb450a0`, 2026-08-15,
triggers a CSS "pop" animation defined in `src/app/globals.css` on save — cosmetic
only), `src/components/save-comparison-button.tsx`,
`src/components/delete-account-button.tsx` (wraps the delete action in an
`AlertDialog` confirmation — see `TASKS.md` TASK-006, confirmed present,
not a gap), `src/components/page-header.tsx`, `src/components/session-provider.tsx`,
`src/components/theme-provider.tsx`, `src/components/theme-settings.tsx`, `src/components/theme-toggle.tsx`,
`src/components/transition-graph.tsx`.

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
  `src/app/(app)/<route-name>/page.tsx`, add a read function to
  `src/lib/data/<route-name>.ts` if it needs new queries, add a nav entry to
  `src/components/layout/nav-items.ts`. Decide explicitly whether it needs
  an `auth()` gate.
- **Add a new form/mutation**: add a function to the relevant
  `src/lib/actions/*.ts` (or a new file, following the existing
  `"use server"` + `auth()` + validate + `revalidatePath` pattern).
- **Add a new external data source**: `src/lib/providers/<slug>-provider.ts`
  implementing `DataProvider`, register in `src/lib/providers/registry.ts`, add a row to
  `src/lib/seed-data/data-sources.ts`, document any new env var in
  `.env.example`.
- **Add/change a scoring formula**: edit `src/lib/scoring/<score-name>.ts`,
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

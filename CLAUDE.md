# CLAUDE.md — Operating Manual for CareerAtlas

This file is the entry point for any AI agent (or human) picking up this
repository. It is deliberately detailed. Read it fully before making changes,
then read `PROJECT_STATE.md` and `TASKS.md` for the current state of work.

`CLAUDE.md` previously contained only `@AGENTS.md` (a Next.js-16-specific
reminder to check `node_modules/next/dist/docs/` before writing code — that
reminder is preserved below and still applies). This version replaces that
one-liner with the full operating manual, built from a repository audit
performed 2026-08-06.

## Project identity

**CareerAtlas** is a full-stack, interactive career-analytics web app: global
job salary explorer, career-transition mapper, education ROI calculator, and
industry-trend/momentum tracker. It ships with a large **deterministic
simulated demo dataset** (50 industries, 1,000+ standardized occupations,
salary distributions/history/forecasts, career transitions, education
outcomes) so the product is fully explorable with zero external
configuration, plus **six working live data connectors** against real public
data sources (see "API and integrations" below). Every data-bearing database
row carries a `dataStatus` field (`reported` | `estimated` | `forecast` |
`simulated`) and the UI visibly labels which is which — this reported vs.
simulated distinction is the app's core design principle, enforced in the
schema, the seed script, and `computeConfidence()`.

- Repo: `/Users/gariyuu/Projects/careeratlas`
- GitHub: `https://github.com/Gariyuuu/careeratlas` (public, per user's global
  convention of `~/Projects` subfolders → separate public repos)
- Single Next.js application — no monorepo, no separate backend service.

## Current status

- **Branch**: `main`, up to date with `origin/main`.
- **Working tree**: clean, re-verified 2026-08-07 (no uncommitted or
  untracked tracked-relevant changes; see `PROJECT_STATE.md` for the exact
  snapshot).
- **Latest commit**: `d4c16f7` — "docs: add full handoff documentation
  system" (2026-08-06). This is the commit that added this documentation
  set itself (`0b10636`, the favicon commit, is the second-latest).
- 9 commits total, all on `main`, all authored by Gary Wang
  (`garywangsmes@gmail.com`), several co-authored by a prior Claude session.
  History shows one large initial build commit followed by five commits each
  adding one real data connector (BLS OEWS, O*NET, Revelio RPLS, College
  Scorecard, Census ACS), a favicon commit, then this documentation-audit
  commit.
- `npm run lint`, `npx tsc --noEmit`, and `npm run test` (Vitest) all pass
  cleanly, re-verified 2026-08-07 (see "Testing and verification" below).
- No application behavior has been changed by any documentation audit so
  far — only documentation files have been created/updated/committed.

## Technology stack

Versions below are read directly from `package.json` / `node_modules` at
audit time — do not assume newer/older versions without re-checking.

| Layer | Technology | Version (verified) |
|---|---|---|
| Framework | Next.js (App Router) | `16.2.11` |
| Language | TypeScript | `5.9.3` (package.json pins `^5`) |
| UI library | React / React DOM | `19.2.4` |
| Styling | Tailwind CSS | `^4` (v4, CSS-first config via `@theme` in `globals.css`) |
| Component system | shadcn/ui | style `radix-nova`, generator `shadcn@4.14.1`, primitives via `radix-ui@1.6.7` + individual `@radix-ui/react-*` packages |
| ORM / DB | Prisma / `@prisma/client` | `6.19.3` |
| Database | PostgreSQL (Neon-hosted in this environment's `.env`) | schema also SQLite-portable, see `DATABASE.md` |
| Auth | NextAuth (Auth.js) | `5.0.0-beta.32`, `@auth/prisma-adapter@2.11.3` |
| Charts | Recharts | `^3.10.0` |
| Tables | TanStack Table (`@tanstack/react-table`) | `^8.21.3` |
| Validation | Zod | `^4.4.3` |
| Icons | lucide-react | `^1.26.0` |
| Toasts | sonner | `^2.0.7` |
| Unit tests | Vitest / `@vitest/coverage-v8` | `^4.1.10` |
| E2E tests | Playwright (`@playwright/test`) | `^1.62.0` |
| Password hashing | bcryptjs | `^3.0.3` |
| Node.js (observed locally) | — | `v26.3.0` (no `.nvmrc`/`.node-version`/`engines` field pins a version — this is just what was installed on the auditing machine, not a repo requirement) |

No monorepo tooling (no Turborepo/Nx/pnpm workspaces) — this is a single
`npm`-managed package (`package-lock.json` present, no `pnpm-lock.yaml` or
`yarn.lock`).

## Essential commands

**Working directory for all commands below: repo root
(`/Users/gariyuu/Projects/careeratlas`).** Verified against `package.json`
`scripts` and re-run during this audit where marked ✅.

```bash
npm install                 # install dependencies
npm run dev                  # start dev server (Next.js, Turbopack) on :3000
npm run build                 # production build — CAUTION: see note below
npm run start                  # run the production build
npm run lint                    # ✅ ESLint (eslint-config-next + React Compiler rules) — passes, 1 harmless warning
npx tsc --noEmit                # ✅ TypeScript check — passes, zero errors
npm run test                     # ✅ Vitest unit tests (scoring/methodology) — 34/34 pass, 7 files
npm run test:watch                # Vitest watch mode
npm run test:e2e                   # Playwright E2E — NOT run this audit (see TESTING.md, would build+boot the app and write to whatever DATABASE_URL is set)
npm run db:migrate                  # prisma migrate dev — applies/creates migrations (writes to DATABASE_URL)
npm run db:generate                  # prisma generate — regenerate the Prisma client
npm run db:seed                       # tsx prisma/seed.ts — populates the deterministic demo dataset (~2-3 min, writes to DATABASE_URL)
npm run db:reset                       # prisma migrate reset --force — DESTRUCTIVE, wipes DATABASE_URL then reseeds
npm run db:studio                       # Prisma Studio — browse DATABASE_URL's data
```

**`npm run build` was intentionally NOT run during this audit.** The
`.env`/`.env.local` files in this working copy point `DATABASE_URL` at a live
Neon Postgres database. Several pages (landing page, dashboard, salary/role
pages, etc.) are Server Components that query the database directly with no
`export const dynamic = "force-dynamic"` override visible in the files read
during this audit; a production build may attempt to statically prerender
some of them, which would mean `next build` connects to that **real,
non-local database**. Per this task's explicit instruction not to touch a
real database, `build` was skipped. If you need to verify the build, either
point `DATABASE_URL` at a disposable database first, or confirm which routes
are actually static vs. dynamic before running it.

## Repository structure

```
careeratlas/
├── prisma/
│   ├── schema.prisma          # full data model (51 models) — see DATABASE.md
│   ├── seed.ts                 # deterministic demo-data generator (956 lines)
│   └── migrations/
│       ├── migration_lock.toml
│       └── 20260727202821_init/migration.sql   # the only migration — full initial schema
├── src/
│   ├── app/
│   │   ├── (app)/               # authenticated-optional main app shell (sidebar+topbar layout)
│   │   │   ├── dashboard/ careers/ salary/ transitions/ education/ trends/
│   │   │   ├── compare/ roles/ saved/ profile/ settings/ methodology/
│   │   │   ├── data-sources/ admin/data-status/ projection/
│   │   │   └── layout.tsx        # Sidebar + Topbar + MobileNav + DemoDataBanner wrapper
│   │   ├── (auth)/                # sign-in / sign-up, minimal layout
│   │   ├── api/
│   │   │   ├── auth/[...nextauth]/route.ts   # NextAuth handler
│   │   │   ├── cron/update-trends/route.ts    # runs all configured data connectors
│   │   │   ├── export/saved/route.ts           # CSV export of saved careers
│   │   │   └── search/route.ts                  # role/title/alias search
│   │   ├── layout.tsx              # root layout: fonts, ThemeProvider, SessionProvider, Toaster
│   │   ├── page.tsx                 # public landing page
│   │   └── globals.css               # Tailwind v4 theme tokens (see UI_SYSTEM.md)
│   ├── components/
│   │   ├── charts/                   # Recharts wrappers (bar/radar/distribution/trend)
│   │   ├── layout/                    # Sidebar, Topbar, MobileNav, global search, demo-data banner
│   │   └── ui/                         # shadcn/ui primitives (button, card, dialog, table, ...)
│   └── lib/
│       ├── actions/                     # Next.js Server Actions ("use server")
│       ├── data/                         # read-side query functions (Prisma reads per feature area)
│       ├── providers/                     # DataProvider connector implementations + registry
│       ├── scoring/                        # pure, unit-tested scoring/methodology functions
│       ├── seed-data/                       # static taxonomy/geography/skills/etc. source data for the seed script
│       ├── auth.ts                           # NextAuth config (Credentials provider)
│       └── prisma.ts                          # Prisma client singleton
├── e2e/                                        # Playwright specs (5 files)
├── public/                                      # only the default Next.js placeholder SVGs — no product assets
├── .agents/ .claude/ .windsurf/                  # auto-installed Prisma CLI skill docs — gitignored, not part of the app
├── components.json                                # shadcn/ui config
├── vercel.json                                     # Vercel Cron config (daily data-connector run)
├── vitest.config.ts / playwright.config.ts
└── .env / .env.local / .env.example                # see "Environment setup"
```

See `FILE_MAP.md` for a file-by-file breakdown with call graphs and edit-risk
ratings.

## Architecture summary

Standard Next.js App Router monolith: Server Components read the database
directly via Prisma (`src/lib/data/*.ts`); mutations go through Server
Actions (`src/lib/actions/*.ts`, all `"use server"`); a handful of thin route
handlers exist for things that aren't page renders (auth callback, CSV
export, search-as-you-type, the cron endpoint). There is no separate API
layer, no GraphQL, no external backend service, and no `middleware.ts` file
(auth gating is done per-page by calling `auth()` and branching, not by
route-level middleware). Full detail with a diagram is in `ARCHITECTURE.md`.

## Coding conventions

**Verified (directly observed as consistent across the codebase):**
- Server Components read data via functions in `src/lib/data/*`; they do not
  call `prisma` directly inline in page files (occasional exceptions: root
  `layout.tsx`'s session read via `auth()`, and `page.tsx`'s inline
  `prisma.industry.count()` etc. for landing-page stats).
- Mutations are Server Actions in `src/lib/actions/*.ts`, each file starting
  with `"use server"`, each function calling `auth()` first if it requires a
  signed-in user, then validating input, then calling `revalidatePath(...)`
  after a successful mutation.
- All scoring/methodology logic lives in small, pure, synchronous functions
  in `src/lib/scoring/*.ts`, each independently unit-tested in a co-located
  `*.test.ts` file (7 of 10 scoring files currently have a test file — see
  `TESTING.md` for the 3 gaps).
- Every data-bearing Prisma model that stores a number carries a `dataStatus`
  string field; enum-like fields are plain `String` (not Prisma native enums)
  by deliberate design (see `DECISIONS.md`) for SQLite portability.
- IDs are `cuid()`; no auto-increment integer IDs anywhere in the schema.
- No `console.log`/`console.error`/`console.warn` found in `src/` (repo-wide
  grep during this audit returned zero matches in application code).
- No `as any`, `@ts-ignore`, or `@ts-expect-error` found anywhere in `src/`.
- No skipped/`.only` tests found in `src/` or `e2e/`.
- Only two `eslint-disable` comments exist in the whole codebase, both
  `react-hooks/exhaustive-deps` on debounced search-filter effects
  (`src/app/(app)/salary/salary-filters.tsx`,
  `src/app/(app)/roles/role-filters.tsx`) — both look like considered,
  narrow suppressions rather than shortcuts.
- Component aliasing follows `components.json`: `@/components`, `@/lib`,
  `@/components/ui`, `@/hooks` (the `hooks` alias exists in config but no
  `src/hooks/` directory currently exists).

**Recommended (not currently enforced by tooling, inferred as sensible
continuations of the existing style — follow these but don't assume they're
written down elsewhere):**
- Keep new scoring functions pure and add a matching `*.test.ts` immediately
  (don't repeat the 3-file test gap noted in `TESTING.md`).
- Keep new Server Actions consistent with the existing pattern: `auth()`
  check → Zod-or-manual validation → Prisma call → `revalidatePath`.
- Any new external data connector should follow `src/lib/providers/types.ts`'s
  `DataProvider` interface exactly, as `bls-provider.ts`/`census-acs-provider.ts`/etc.
  already do, and must be registered in `src/lib/providers/registry.ts` and
  given a row in `src/lib/seed-data/data-sources.ts`.

## UI and design system

- Tailwind CSS v4, configured CSS-first in `src/app/globals.css` (no
  `tailwind.config.ts` — v4 doesn't require one; `components.json` points
  `tailwind.config` at an empty string).
- shadcn/ui, style `radix-nova`, base color `neutral`, CSS variables enabled,
  icon library `lucide-react`. Config: `/Users/gariyuu/Projects/careeratlas/components.json`.
- Primitives live in `src/components/ui/` (accordion, alert(-dialog),
  avatar, badge, breadcrumb, button, card, checkbox, command, dialog,
  dropdown-menu, input(-group), label, popover, progress, radio-group,
  select, separator, sheet, skeleton, slider, sonner, switch, table, tabs,
  textarea, tooltip).
- Theming: `next-themes` via `src/components/theme-provider.tsx`
  (`attribute="class"`, `defaultTheme="system"`, `enableSystem`); toggle at
  `src/components/theme-toggle.tsx`; full settings UI at
  `src/components/theme-settings.tsx`.
- Fonts: `Geist` / `Geist Mono` via `next/font/google`, wired in
  `src/app/layout.tsx`.
- Design tokens (OKLCH color scale, radii, chart colors 1–8, status colors
  good/warning/serious/critical, sidebar-specific tokens) are defined as CSS
  custom properties in `src/app/globals.css` under `:root` / `.dark` and
  surfaced to Tailwind via the `@theme inline { ... }` block at the top of
  that file.
- Full inventory with exact file paths: `UI_SYSTEM.md`.

## Environment setup

Copy `.env.example` to `.env`. Only `DATABASE_URL` is required to run the app
at all; everything else is optional and the app degrades gracefully without
it (unconfigured connectors show "not configured" in the UI rather than
failing).

| Variable | Required? | Client/Server | Purpose | Format / safe placeholder |
|---|---|---|---|---|
| `DATABASE_URL` | **Yes** | Server only | PostgreSQL connection string (Prisma `datasource.url`) | `postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres` |
| `AUTH_SECRET` | Production only (NextAuth warns/fails without it in prod) | Server only | NextAuth JWT/session signing secret | `openssl rand -base64 32` output, e.g. a random 44-char base64 string — never reuse the repo's dev placeholder in production |
| `CRON_SECRET` | No | Server only | If set, `/api/cron/update-trends` requires `Authorization: Bearer <value>`; if unset, the endpoint is **unauthenticated** | any random string |
| `BLS_API_KEY` | No | Server only | Raises the BLS public API's daily rate limit for `bls-ces` and `bls-oews` connectors; both connectors work without it (`isConfigured()` always returns `true`) | free key from bls.gov/developers |
| `CENSUS_API_KEY` | No | Server only | Required for the `census-acs` connector to run (`isConfigured()` returns `!!process.env.CENSUS_API_KEY`) | free key from census.gov/developers |
| `COLLEGE_SCORECARD_API_KEY` | No | Server only | Required for the `college-scorecard` connector to run | free key from api.data.gov |

**Important correction to the in-repo `README.md`:** the README's "What's
simulated, what's real, and what's not implemented" section (as of the
commit this audit found) still lists Census ACS and College Scorecard as
"env vars and `DataSource` rows are scaffolded, but no connector code" — this
is now **stale**. Both connectors were implemented in commits `fd94d85` and
`90ef269` (2026-07-31 and 2026-08-01) and are registered in
`src/lib/providers/registry.ts`. This audit did not edit `README.md` (out of
scope per the task instructions — only the 17 documentation files listed were
created/updated), but any future session should fix this discrepancy in
`README.md` too.

**Leftover/unused env vars found in `.env.local`** (not in `.env.example`,
not referenced anywhere in `src/`): `DATABASE_URL_UNPOOLED`,
`NEON_AUTH_BASE_URL`, `NEON_PROJECT_ID`, `PGDATABASE`, `PGHOST`,
`PGHOST_UNPOOLED`, `PGPASSWORD`, `PGUSER`, `POSTGRES_DATABASE`,
`POSTGRES_HOST`, `POSTGRES_PASSWORD`, `POSTGRES_PRISMA_URL`, `POSTGRES_URL`,
`POSTGRES_URL_NON_POOLING`, `POSTGRES_URL_NO_SSL`, `POSTGRES_USER`,
`VERCEL_OIDC_TOKEN`, `VITE_NEON_AUTH_URL`. These appear to be auto-injected
by a Vercel↔Neon integration and are dead weight for this app — Prisma only
reads `DATABASE_URL`. Harmless but worth pruning from `.env.local` in a
future cleanup pass (not done here — out of scope, and `.env.local` is
gitignored so it never reaches the repo).

`.env`, `.env.local`, and `.env.example` are **not committed** —
`.gitignore` excludes `.env*` except `.env.example` (confirmed via `git ls-files`).

## Database summary

PostgreSQL via Prisma (Neon-hosted in this working copy), 51 models covering
taxonomy (Industry → Subindustry → JobFamily → Occupation → Seniority),
geography, compensation, labor-market stats, education, career transitions,
data governance (DataSource/DataImportRun/DataQualityCheck/MethodologyVersion),
and users (NextAuth-compatible User/Account/Session plus app-specific
UserProfile/SavedOccupation/SavedComparison/SalaryScenario/CareerGoal/
UserSkill/LearningPlan(Item)/EducationRoiScenario). One migration exists
(`20260727202821_init`). Full detail, ER diagram, and migration risk notes:
`DATABASE.md`.

## Authentication and authorization

NextAuth v5 (beta), JWT session strategy, single Credentials provider
(email + bcrypt-hashed password against the `User` table), `PrismaAdapter`
wired for `Account`/`Session` tables even though the Credentials provider
doesn't use OAuth account linking. **There is no `middleware.ts` and no
route-level auth gate** — every page that needs a signed-in user calls
`auth()` itself and either renders a "sign in" prompt (`/saved`) or reads
`session?.user?.id` and personalizes conditionally (`/dashboard`). **The
`/admin/data-status` page and its `triggerDataImport` Server Action have
NO auth or role check at all** — this is a real gap, flagged in detail in
`SECURITY.md` and `TASKS.md`. Full flow: `ARCHITECTURE.md` and `SECURITY.md`.

## API and integrations

- Internal HTTP endpoints: `GET /api/search`, `GET /api/export/saved`
  (auth-gated), `GET /api/cron/update-trends` (optionally bearer-protected
  via `CRON_SECRET`), NextAuth's `/api/auth/[...nextauth]` catch-all.
- External data connectors (`src/lib/providers/`, registered in
  `registry.ts`): `bls-provider.ts` (BLS CES avg. hourly earnings, keyless),
  `bls-oews-provider.ts` (BLS OEWS occupational wages, keyless),
  `onet-provider.ts` (O*NET education/alias data, keyless),
  `revelio-rpls-provider.ts` (Revelio public labor stats, keyless),
  `college-scorecard-provider.ts` (requires `COLLEGE_SCORECARD_API_KEY`),
  `census-acs-provider.ts` (requires `CENSUS_API_KEY`). Four of six run with
  **zero configuration** — meaning the daily Vercel Cron job and the
  unauthenticated admin "Run now" button both actively call external BLS,
  O*NET, and Revelio APIs by default.
- Seeded-but-not-implemented `DataSource` rows (in `data-sources.ts`, no
  matching file in `providers/`): World Bank, OECD, ILOSTAT, Eurostat —
  planned only, not connectors.
- No payment/storage integrations exist in this repo.
- Full endpoint-by-endpoint reference: `API_REFERENCE.md`.

## Testing and verification

- Unit tests: Vitest, `src/**/*.test.ts`, 7 files / 34 tests, **all passing**
  (`npm run test`, verified this audit). Covers `confidence`,
  `cost-of-living`, `education-roi`, `momentum-score`, `percentile-rank`,
  `projection`, `transition-score`. **No tests exist** for
  `accessibility-score.ts`, `career-value-score.ts`, or
  `salary-opportunity-score.ts`.
- E2E: Playwright, `e2e/*.spec.ts`, 5 files (search-and-role, save-career,
  education, projection, transitions-and-compare). **Not run this audit** —
  `playwright.config.ts`'s `webServer` runs `npm run start` against whatever
  `DATABASE_URL` is configured, and `save-career.spec.ts` signs up a new
  real user via the signup flow, which would write to the live Neon database
  in this working copy. Do not run `test:e2e` against a real/shared database.
- Lint: ESLint via `eslint.config.mjs` (`eslint-config-next` core-web-vitals
  + typescript + React Compiler rule), **passing** (1 non-blocking warning
  about TanStack Table's `useReactTable()` being unmemoizable — expected/known
  limitation of that library, not a bug).
- Types: `npx tsc --noEmit`, **zero errors**.
- Full detail, smoke-test checklist, coverage gaps: `TESTING.md`.

## Deployment

Vercel (inferred from `.vercel/` directory, `vercel.json`, and
`README.md`'s deployment section — no other hosting config found).
`vercel.json` schedules `GET /api/cron/update-trends` daily at 06:00 UTC.
Production needs `DATABASE_URL` and `AUTH_SECRET` set in Vercel's env vars;
`prisma migrate deploy` + `db:seed` need to run against production as part of
deploy. Full detail: `DEPLOYMENT.md`.

## DO NOT CHANGE WITHOUT REVIEW

- **`prisma/schema.prisma` and `prisma/migrations/`** — 51 interrelated
  models; a careless schema edit can silently break seed data generation,
  every `src/lib/data/*` query, and every scoring function's expected input
  shape. If you must change it, run `npm run db:migrate` against a
  disposable database first, never the shared one in `.env`/`.env.local`.
- **`src/lib/auth.ts`, `src/app/api/auth/[...nextauth]/route.ts`** — the
  entire session/credentials flow. A mistake here can lock out real users or
  silently disable auth checks app-wide.
- **`prisma/seed.ts` and everything under `src/lib/seed-data/`** — the
  deterministic seed depends on stable RNG seeding (`src/lib/seed-data/rng.ts`)
  and stable ordering; changing iteration order or the RNG seed inputs
  changes every generated number, which would be indistinguishable from a
  real regression without careful diffing.
- **`src/lib/scoring/*.ts`** — every formula here is documented as
  "transparent by design" and surfaced to end users on `/methodology`.
  Changing a formula changes real user-facing numbers and the seeded
  `MethodologyVersion` descriptions would then be inaccurate.
- **`.env`, `.env.local`** — contain live Neon Postgres credentials for this
  working copy. Never print full values, never commit them (already
  gitignored — verify that stays true), never paste them into any
  documentation file.
- **`vercel.json` cron schedule and `CRON_SECRET` handling** — changing this
  affects production data-refresh cadence and the admin endpoint's exposure.
- **`src/app/api/cron/update-trends/route.ts` and `/admin/data-status`
  auth posture** — see the unresolved security gap noted above; don't
  "quietly" add auth here without documenting it as an intentional fix (see
  `TASKS.md` for the tracked item).

## Known issues

1. **`/admin/data-status` has no authentication or authorization check** —
   anyone with the URL can view connector internals and trigger
   `triggerDataImport` (a Server Action with zero `auth()` call), which
   makes real outbound calls to BLS/O*NET/Revelio (and Census/College
   Scorecard if those keys are set). See `SECURITY.md` and `TASKS.md` TASK-001.
2. **`README.md`'s "not implemented" list is stale** — it still describes
   Census ACS and College Scorecard as unimplemented; both were completed in
   later commits. Not fixed by this audit (out of the listed doc files) — see
   `TASKS.md`.
3. **3 of 10 scoring functions have no unit tests**
   (`accessibility-score.ts`, `career-value-score.ts`,
   `salary-opportunity-score.ts`) — see `TESTING.md`.
4. **E2E suite is unverified in this environment** — never run against the
   live `DATABASE_URL` in `.env`/`.env.local`; needs a disposable database.
5. **No `middleware.ts` / centralized route protection** — every
   auth-dependent page re-implements its own `auth()` check inline. Works
   correctly everywhere it was checked in this audit, but there's no single
   place to audit for "is this route protected" — a new page could easily
   forget the check (as `/admin/data-status` did).
6. **`.env.local` carries ~17 unused Vercel/Neon-integration env vars** not
   referenced anywhere in `src/` — harmless, but dead weight (see
   "Environment setup").
7. **No `engines` field, `.nvmrc`, or `.node-version`** pins a Node.js
   version for this project — Vercel will use its own default/inferred
   runtime, which may not match the `v26.3.0` observed locally.

## AI working instructions

1. Read `CLAUDE.md` (this file), `PROJECT_STATE.md`, and `TASKS.md` in that
   order before touching any code.
2. Skim `HANDOFF.md` for the fastest "what do I do right now" answer if
   you're picking this project up cold.
3. Check `git status` and `git log -5` yourself before trusting any doc's
   claim about the current branch/commit/dirty state — docs can go stale
   between sessions.
4. Never run `npm run db:reset`, `prisma migrate reset`, or any command that
   writes to `DATABASE_URL` against the credentials currently in
   `.env`/`.env.local` unless the user explicitly confirms that database is
   disposable. Prefer a local SQLite flip (see `README.md`'s "Falling back to
   SQLite") for any DB experiment you're not 100% sure is safe.
5. Never run `npm run build` or `npm run test:e2e` without first confirming
   `DATABASE_URL` points somewhere disposable — both can write to or heavily
   query the configured database (see "Testing and verification" above).
6. Before editing `src/lib/scoring/*.ts`, check whether a `*.test.ts` exists
   for it and run `npm run test` before and after your change.
7. Before editing `prisma/schema.prisma`, read `DATABASE.md` fully — several
   fields are deliberately plain `String` instead of native Postgres
   enums/arrays for SQLite portability; don't "fix" that without checking
   `DECISIONS.md` for why.
8. Keep the `dataStatus` labeling discipline intact — never let a new
   simulated/estimated value render without a status badge
   (`src/components/data-status-badge.tsx`) or without going through
   `computeConfidence()`.
9. When adding a new external data connector, follow the existing
   `DataProvider` pattern exactly (`src/lib/providers/types.ts`) and update
   `registry.ts` + `data-sources.ts` + `.env.example` together.
10. When adding a new page under `src/app/(app)/`, decide explicitly whether
    it needs an `auth()` gate — don't assume the layout protects it (it
    doesn't).
11. Run `npm run lint` and `npx tsc --noEmit` after any source change; both
    were clean at the start of this audit, so any new warning/error is yours
    to explain or fix.
12. Run `npm run test` after any change touching `src/lib/scoring/` or
    `src/lib/data/`.
13. Do not commit, push, deploy, or run destructive git operations unless the
    user explicitly asks — this repo's standing instructions (see the user's
    global memory / this session's task) are audit-and-document-only unless
    told otherwise.
14. Never write real secret values (from `.env`/`.env.local`) into any
    Markdown file, chat message, or log. Use placeholders only, as done
    throughout this documentation set.
15. Treat `README.md` as user-facing product documentation, separate from
    the AI-facing memory files (`PROJECT_STATE.md`, `TASKS.md`,
    `SESSION_LOG.md`, `DECISIONS.md`, this file) — the two can and did drift
    out of sync (see "Known issues" #2); don't assume editing one updates
    the other.
16. This is a **Next.js 16** project with breaking changes vs. older
    training data per `AGENTS.md`/`node_modules/next/dist/docs/` — check
    those docs before writing App Router code that assumes an older Next.js
    API surface.
17. If you discover a new stale/incorrect claim in any of the 17
    documentation files, fix it in the same session rather than leaving it —
    these files are only useful if they stay accurate.
18. After any meaningful task, update `PROJECT_STATE.md`, `TASKS.md`,
    `SESSION_LOG.md`, and (if an architectural decision was made)
    `DECISIONS.md` before ending the session — see "Permanent rules" below.

## Permanent rules for future development

**Before starting any task:**
- Read `CLAUDE.md`, `PROJECT_STATE.md`, and `TASKS.md` first.
- Verify the current git branch/commit/dirty-state yourself; don't trust a
  stale doc.

**After finishing any meaningful task:**
- Update `PROJECT_STATE.md` (current state), `TASKS.md` (task status), and
  `SESSION_LOG.md` (append a dated entry) before ending the session.
- If you made or discovered an architectural decision, record it in
  `DECISIONS.md` labeled Verified or Inferred as appropriate.
- Re-run `npm run lint`, `npx tsc --noEmit`, and `npm run test` and note the
  results in `SESSION_LOG.md`.

**Never, without explicit user approval in that session:**
- Expose secrets (env values, connection strings, API keys) in code,
  commits, logs, or documentation.
- Casually touch authentication (`src/lib/auth.ts`, NextAuth route), the
  database schema (`prisma/schema.prisma`), deployment config
  (`vercel.json`, `.vercel/`), or anything payments-related (N/A today, but
  the rule stands if that ever changes) without a deliberate, reviewed
  change.
- Run destructive database or git operations against non-disposable targets.

---

<!-- BEGIN:nextjs-agent-rules (preserved from the original AGENTS.md/CLAUDE.md) -->
## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure
may all differ from your training data. Read the relevant guide in
`node_modules/next/dist/docs/` before writing any code. Heed deprecation
notices.
<!-- END:nextjs-agent-rules -->

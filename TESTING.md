# TESTING.md

## Current test strategy

Two layers, per `README.md` and confirmed by reading the actual test files:
1. **Unit tests** (Vitest) for the pure scoring/methodology functions in
   `src/lib/scoring/`.
2. **End-to-end tests** (Playwright) for full user journeys through the
   real app + database.

No component-level testing (no React Testing Library test files were
found, despite `@testing-library/react` being a devDependency — it's
installed but this audit found no `*.test.tsx` files using it; it may be
scaffolding left over from `create-next-app` / Vitest setup, not actively
used). No visual regression testing, no accessibility testing tooling.

## Test frameworks

- **Vitest** `^4.1.10` + `@vitest/coverage-v8` `^4.1.10` — config:
  `vitest.config.ts` (Node environment, `include: ["src/**/*.test.ts"]`,
  `vite-tsconfig-paths` plugin for the `@/*` alias).
- **Playwright** `@playwright/test` `^1.62.0` — config: `playwright.config.ts`
  (`testDir: "./e2e"`, `fullyParallel: true`, HTML reporter, single
  `chromium` project, `webServer` runs `npm run start` on port 3000 unless
  already running).
- **jsdom** `^29.1.1` present as a devDependency but `vitest.config.ts`
  specifies `environment: "node"`, not `jsdom` — meaning jsdom is installed
  but not the active test environment for the current suite. Likely there
  in case a future component test needs it.

## Test directory structure

- `src/lib/scoring/*.test.ts` — co-located unit tests, one per scoring file
  (where they exist).
- `e2e/*.spec.ts` — Playwright specs, flat directory, 5 files.

## Existing tests (verified this audit — ran `npm run test`)

**7 files, 34 tests, all passing:**
- `confidence.test.ts`
- `cost-of-living.test.ts`
- `education-roi.test.ts`
- `momentum-score.test.ts`
- `percentile-rank.test.ts`
- `projection.test.ts`
- `transition-score.test.ts`

**5 Playwright specs (not run this audit — see "Known flaky/unverified"
below):**
- `e2e/search-and-role.spec.ts` — search for a role, open its detail page.
- `e2e/save-career.spec.ts` — sign up a new user, save a career, verify it
  appears on `/saved`.
- `e2e/education.spec.ts` — education comparison flow.
- `e2e/projection.spec.ts` — salary projection calculator flow.
- `e2e/transitions-and-compare.spec.ts` — career transitions + compare
  careers flow.

## Missing test areas (highest-value first)

1. **`accessibility-score.ts`, `career-value-score.ts`,
   `salary-opportunity-score.ts`** — the only 3 of 10 scoring files with no
   unit test. See `TASKS.md` TASK-003.
2. **Server Actions** — no test coverage found for
   `src/lib/actions/*.ts` (auth, profile, saved-occupations, comparisons,
   admin) beyond what the E2E specs incidentally exercise via the UI.
3. **API route handlers** — no direct test coverage for
   `/api/search`, `/api/export/saved`, `/api/cron/update-trends` beyond
   E2E incidental coverage (search is exercised by
   `search-and-role.spec.ts`/`compare-selector` flows; export and cron are
   not exercised by any E2E spec found).
4. **Data provider connectors** (`src/lib/providers/*.ts`) — no test
   coverage found (unit tests mocking `fetch`, or integration tests against
   recorded fixtures, would catch normalization/validation regressions
   without hitting live external APIs).
5. **`/admin/data-status` auth gap** — once TASK-001 is fixed, a test
   should assert unauthorized access is actually rejected, to prevent
   regression.

## Manual testing steps (smoke-test checklist)

Use a **disposable** database for all of the below — never the
`DATABASE_URL` currently configured in `.env`/`.env.local` unless you've
confirmed with the user that it's safe to write to.

### Setup
1. `npm install`
2. Point `DATABASE_URL` at a disposable Postgres (or flip to SQLite per
   `README.md`'s "Falling back to SQLite").
3. `npm run db:migrate`
4. `npm run db:seed` (~2-3 min)
5. `npm run dev`, open `http://localhost:3000`.

### Core browsing (no account needed)
- [ ] Landing page loads, shows real industry/occupation/transition counts.
- [ ] `/salary` — filter by industry/seniority/country/metro, results
  update, cost-of-living adjustment reflects the selected metro.
- [ ] `/roles` and `/roles/[role]` — search/filter roles, open a detail
  page, see salary by seniority, skills, certifications, education
  requirements.
- [ ] `/careers` and nested industry/subindustry pages browse correctly.
- [ ] `/transitions` and `/transitions/[from]/[to]` — table + detail page,
  the SVG transition graph renders and links work.
- [ ] `/education` and `/education/compare` — add/remove comparison slots
  (up to 4), adjust cost/years/forgone-earnings, toggle 10 vs. 20-year
  horizon.
- [ ] `/trends` — momentum leaderboard renders, sub-scores visible.
- [ ] `/projection` — sliders update the projected-salary chart live.
- [ ] `/compare` — add up to 5 roles via the search selector, bar/radar
  charts render, URL reflects `?roles=...`.
- [ ] `/methodology` and `/data-sources` — render without error.
- [ ] Every simulated figure shows an amber "Simulated" badge; nothing
  simulated is presented without one.

### Account flow
- [ ] `/sign-up` — create an account, redirected to `/dashboard`.
- [ ] `/sign-in` — sign in with a wrong password, see the generic "Invalid
  email or password" message (not a specific "wrong password" leak).
- [ ] `/dashboard` — personalized snapshot appears once `/profile` is filled
  in.
- [ ] `/profile` — fill in and save; changes persist and affect
  `/dashboard`.
- [ ] Save a career from a role detail page; confirm it appears on `/saved`;
  unsave and confirm it disappears.
- [ ] `/saved` — CSV export downloads and contains the expected columns.
- [ ] Save a comparison from `/compare`; confirm it appears on `/saved`;
  delete it.
- [ ] `/settings` — toggle theme (light/dark/system), confirm it persists
  across reload.
- [ ] Delete account from `/settings`; confirm redirected to `/` and can no
  longer sign in with those credentials.

### Admin / data connectors (only against a disposable DB and non-production keys)
- [ ] `/admin/data-status` renders connector list and any seeded
  `EconomicIndicator`s.
- [ ] Click "Run now" on a keyless connector (`bls-ces`, `bls-oews`,
  `onet`, or `revelio-rpls`); confirm a toast shows success/partial/failed
  and the row's "last successful update" updates.
- [ ] Click "Run now" on `world-bank`/`oecd`/`ilo`/`eurostat` — confirm the
  currently-broken behavior described in `TASKS.md` TASK-005 (unhandled
  error) before treating a fix as verified.
- [ ] Once `CENSUS_API_KEY`/`COLLEGE_SCORECARD_API_KEY` are set, confirm
  those connectors run and populate `EconomicIndicator`/`Institution`
  tuition data.
- [ ] `curl http://localhost:3000/api/cron/update-trends` returns a JSON
  summary of all configured connectors.

## Test data / fixtures / mocks

No dedicated fixture files exist — the "fixture" for E2E tests is the full
deterministic seed dataset (`npm run db:seed`), and
`save-career.spec.ts` generates its own throwaway test user
(`e2e-${Date.now()}@example.com`) rather than relying on a pre-seeded
account. No secrets appear in any test file (confirmed by reading all 5
E2E specs' visible portions and the 7 unit test files' existence — none
reference real API keys).

## Test environment variables

Playwright's `webServer` runs `npm run start`, which needs a successful
`npm run build` first and whatever `DATABASE_URL`/`AUTH_SECRET` are in the
environment at that time — no separate `.env.test` file was found, meaning
E2E tests currently run against whatever the ambient `.env`/`.env.local`
resolves to. **This is a real gap**: there's no built-in isolation
preventing E2E tests from running against a shared/production database.
Recommend adding a `.env.test` with a disposable database before routinely
running `npm run test:e2e`.

## Coverage gaps

See "Missing test areas" above. `@vitest/coverage-v8` is installed but no
`coverage` script or CI config was found invoking it — no coverage
percentage is currently tracked or enforced.

## Critical untested flows

1. Authentication (sign-up/sign-in/sign-out) — only indirectly exercised
   via `save-career.spec.ts`'s incidental sign-up step, not a dedicated
   auth-focused spec.
2. Account deletion — no E2E or unit coverage found.
3. The admin data-import trigger and its (missing) authorization — no
   coverage, and per `SECURITY.md` this is the area needing it most.
4. CSV export correctness (escaping, column order) — no test coverage.
5. All 6 data-provider connectors' `normalizeData`/`validateData` logic —
   no test coverage; a change to BLS's/O*NET's/Revelio's/Census's/College
   Scorecard's response shape would only be caught by a live, manual
   `/admin/data-status` run.

## Known flaky tests

None identified — the unit suite ran clean and deterministic (34/34 pass,
355ms) this audit. No flakiness data exists for the E2E suite since it was
not run this audit (would need a CI history or repeated local runs to
characterize).

## Pre-release checklist

Before any deploy/release (adapted from what this audit could verify plus
what `README.md`/`vercel.json` imply is needed):
- [ ] `npm run lint` clean.
- [ ] `npx tsc --noEmit` clean.
- [ ] `npm run test` all passing.
- [ ] `npm run test:e2e` passing against a disposable database (not run
  routinely today — recommend adding to CI once a `.env.test` exists).
- [ ] `npm run build` succeeds against a disposable/staging database.
- [ ] Manual smoke test checklist above completed at least once per
  release, especially the account and data-connector sections.
- [ ] Confirm `AUTH_SECRET` is a real generated value (not the
  `.env.example` placeholder) in the target environment.
- [ ] Confirm `CRON_SECRET` is set in production if you don't want
  `/api/cron/update-trends` publicly triggerable.
- [ ] No CI/CD pipeline currently exists in the repo (no
  `.github/workflows/`) — all of the above is manual today.

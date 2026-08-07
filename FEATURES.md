# FEATURES.md — Feature-by-Feature Status

Status classifications: Verified complete / Mostly complete / Partially
implemented / UI only / Backend only / Mocked / Planned / Broken /
Deprecated / Unable to verify. Each was traced from UI → client logic →
server logic → DB → validation → auth → error/loading/empty states by
reading the actual source files (not inferred from file existence alone).
No dev server was started, so "works at runtime" reflects static tracing,
not live interaction — flagged per feature where that matters.

## Salary Explorer (`/salary`)

**Purpose**: browse percentile-based compensation by role, seniority,
country, metro (with cost-of-living adjustment).
**Status: Verified complete** (statically traced).
- Frontend: `src/app/(app)/salary/page.tsx`,
  `salary-filters.tsx` (role/industry/seniority/country/metro selects),
  `salary-results-table.tsx`.
- Backend: `src/lib/data/salary.ts`.
- Scoring: `src/lib/scoring/cost-of-living.ts` (unit-tested).
- DB: `SalaryPercentile`, `SalaryObservation`, `CostOfLivingIndex`.
- Validation: filter inputs come from typed `<Select>` options, not free text.
- Data status: every row carries `dataStatus`, rendered via
  `data-status-badge.tsx`.
- Known issue: none found.

## Role Detail (`/roles/[role]`)

**Purpose**: single-occupation deep dive — summary, responsibilities,
skills, certifications, salary by seniority, education requirements, save
button.
**Status: Verified complete.**
- Frontend: `src/app/(app)/roles/[role]/page.tsx`, `role-salary-section.tsx`
  (seniority selector), `src/components/save-career-button.tsx`.
- Backend: `src/lib/data/occupations.ts`.
- Auth: save/unsave requires sign-in (`toggleSavedOccupation`); page itself
  is public.
- DB: `Occupation` and its full relation graph (skills, certs, aliases,
  seniority levels, salary percentiles/observations/history/forecasts,
  education requirements).

## Roles / Career Explorer listing (`/roles`, `/careers`, `/careers/[industry]`, `/careers/[industry]/[subindustry]`)

**Purpose**: browse the taxonomy (Industry → Subindustry → Occupation), with
search/filter.
**Status: Verified complete.**
- Frontend: `src/app/(app)/roles/page.tsx` + `role-filters.tsx`,
  `src/app/(app)/careers/page.tsx` and nested `[industry]`/`[subindustry]`
  pages.
- Backend: `src/lib/data/industries.ts`, `src/lib/data/occupations.ts`.

## Global search (command-K style)

**Purpose**: fast role/title/alias search from anywhere in the app.
**Status: Verified complete.**
- Frontend: `src/components/layout/global-search.tsx`.
- Backend: `GET /api/search` (`src/app/api/search/route.ts`) — in-memory
  case-insensitive scan over all occupations + aliases, exact/prefix/alias/
  substring ranking, capped at 10 results.
- Edge case handled: empty query returns `{ results: [] }` immediately
  without querying the DB.
- Known scaling note: comment in the route explicitly says the in-memory
  approach is a deliberate tradeoff for a ~1-2k row catalog — would need a
  real search index if the catalog grows much larger.

## Career Transitions (`/transitions`, `/transitions/[from]/[to]`)

**Purpose**: show where people in a role typically move next, salary delta,
compatibility/difficulty scores, skill gaps, and a visual transition graph.
**Status: Verified complete.**
- Frontend: `src/app/(app)/transitions/page.tsx` + `transition-table.tsx`,
  `src/app/(app)/transitions/[from]/[to]/page.tsx`,
  `src/components/transition-graph.tsx` (hand-rolled SVG radial graph, not a
  charting library — positions up to 8 nodes around a center node, colored
  by transition category).
- Backend: `src/lib/data/transitions.ts`.
- Scoring: `src/lib/scoring/transition-score.ts` (compatibility, difficulty,
  category classification — unit-tested).
- DB: `CareerTransition`, `TransitionSkillGap`.

## Education Impact (`/education`, `/education/compare`)

**Purpose**: compare degrees/majors/bootcamps by entry salary, ROI, and
break-even year; user-adjustable cost/years/forgone-earnings overrides.
**Status: Verified complete.**
- Frontend: `src/app/(app)/education/page.tsx` + `education-filters.tsx`,
  `src/app/(app)/education/compare/page.tsx` +
  `education-compare-tool.tsx` (client component: up to 4 comparison slots,
  editable cost/years/forgone-earnings per slot, 10 vs. 20-year horizon
  toggle).
- Backend: `src/lib/data/education.ts`.
- Scoring: `src/lib/scoring/education-roi.ts` (unit-tested).
- DB: `Major`, `Institution`, `EducationProgram`, `EducationOutcome`,
  `CollegeCost`, `OccupationEducationRequirement`,
  `EducationRoiScenario` (user-scoped, but no UI was found that persists a
  scenario to this table — see "Known issues" below).
- Data status: baseline no-college salary is explicitly labeled
  reported/simulated via `baselineIsReported` prop threaded into the tool.

## Industry Trends / Job Market Momentum (`/trends`)

**Purpose**: leaderboard of industries by a 9-factor, user-explorable
momentum score, with trailing quarterly trend.
**Status: Verified complete.**
- Frontend: `src/app/(app)/trends/page.tsx`, `momentum-leaderboard.tsx`.
- Backend: `src/lib/data/trends.ts`.
- Scoring: `src/lib/scoring/momentum-score.ts` (`DEFAULT_MOMENTUM_WEIGHTS`,
  unit-tested).
- DB: `IndustryMomentumScore` (component sub-scores + weights stored per
  snapshot, 4 trailing quarters seeded), `IndustryStatistic`,
  `LayoffStatistic`, `RemoteWorkStatistic`, `SkillDemandStatistic`.
- Note: README describes "full drag-and-drop weight editing" as implemented
  for Momentum but not yet for Career Value — this audit did not
  interactively verify drag-and-drop reweighting in a browser (no dev server
  was started); the stored `weights` JSON field and
  `DEFAULT_MOMENTUM_WEIGHTS` export needed for it do exist in code.

## Salary Projection Calculator (`/projection`)

**Purpose**: model 1/3/5/10-year salary outcomes across
conservative/expected/aggressive scenarios, with user-adjustable sliders
(promotion probability, education factor, skill demand, general wage
growth) and a live BLS wage-growth default.
**Status: Verified complete.**
- Frontend: `src/app/(app)/projection/page.tsx`,
  `projection-calculator.tsx` (client component, `useMemo`-computed results
  table + `SalaryTrendChart`).
- Scoring: `src/lib/scoring/projection.ts` (unit-tested), called both
  client-side here (live recompute on slider change) and in
  `prisma/seed.ts` (to seed baseline forecasts).
- Live data: `liveWageGrowthPct` prop is sourced from the `bls-ces`
  connector's `EconomicIndicator` row (`dataStatus: "reported"`) when
  available, falling back to `3.2` (hardcoded default) otherwise — this
  fallback is intentional and documented, not an oversight.

## Compare Careers (`/compare`)

**Purpose**: put up to 5 occupations side by side on pay/growth/
accessibility/flexibility, save a comparison, share via URL.
**Status: Verified complete.**
- Frontend: `src/app/(app)/compare/page.tsx`, `compare-selector.tsx`
  (debounced search-and-add, URL state via `?roles=slug1,slug2`, capped at
  5), `src/components/charts/comparison-bar-chart.tsx` and
  `comparison-radar-chart.tsx`, `src/components/save-comparison-button.tsx`.
- Backend: `src/lib/data/compare.ts`.
- Actions: `saveComparison`/`deleteSavedComparison` (auth-required).
- DB: `SavedComparison` (nullable `userId` in schema — the model itself
  supports anonymous saved comparisons via a share slug, but the action
  requires a session; anonymous save is schema-supported, not UI-exposed).

## Saved Careers (`/saved`)

**Purpose**: list a signed-in user's saved occupations and comparisons; CSV
export.
**Status: Verified complete.**
- Frontend: `src/app/(app)/saved/page.tsx` — explicitly renders a graceful
  "sign in to save careers" empty state (with Sign in / Create account
  buttons) when `session?.user?.id` is absent, rather than redirecting.
- Backend: `src/lib/data/saved.ts`.
- Export: `GET /api/export/saved` — auth-gated, CSV with proper
  quote-escaping (`csvEscape`).

## Dashboard (`/dashboard`)

**Purpose**: landing page after sign-in — trending industries/roles,
declining roles, education ROI snapshot, recently updated occupations, plus
a personalized snapshot (current-salary percentile, 5-year forecast) if the
user has a profile.
**Status: Verified complete**, with graceful degradation for anonymous
users (personalized sections conditionally fetched only `if (userId)`).
- Frontend: `src/app/(app)/dashboard/page.tsx`.
- Backend: `src/lib/data/dashboard.ts` (7 parallel queries via
  `Promise.all`).
- Scoring: `src/lib/scoring/percentile-rank.ts` (unit-tested) for
  "where does your current salary rank."

## Profile (`/profile`)

**Purpose**: user-entered career profile (education, industry, role,
location, salary goal, current salary, years experience, degree, major,
company size, skills CSV) that personalizes the dashboard.
**Status: Verified complete.**
- Frontend: `src/app/(app)/profile/page.tsx`, `profile-form.tsx`.
- Backend: `upsertProfile` Server Action (`src/lib/actions/profile.ts`) —
  auth-required, upserts `UserProfile` 1:1 with `User`.
- Validation: manual (not Zod) — reads `FormData` with typed `num()`/`str()`
  coercion helpers, no explicit range/format validation beyond
  presence/type coercion (e.g. no bound check on `salaryGoal` or
  `expectedGraduationYear`).

## Settings (`/settings`) / Account deletion

**Purpose**: theme settings, account deletion.
**Status: Verified complete.**
- Frontend: `src/app/(app)/settings/page.tsx`,
  `src/components/theme-settings.tsx`,
  `src/components/delete-account-button.tsx`.
- Backend: `deleteAccountAction` (`src/lib/actions/account.ts`) —
  auth-required, hard-deletes the `User` row (cascades via Prisma
  `onDelete: Cascade` to all owned data per the schema).
- No confirmation-dialog code was located in the delete-account button file
  during this audit's read window — **unable to verify** whether a
  confirm-before-delete UX exists without a deeper read of that component;
  flagged for follow-up rather than assumed either way.

## Authentication (sign up / sign in / sign out)

**Purpose**: email+password auth.
**Status: Verified complete.**
- Frontend: `src/app/(auth)/sign-in/page.tsx`, `sign-up/page.tsx`.
- Backend: `src/lib/actions/auth.ts` (Zod validation, bcrypt hashing,
  duplicate-email check, generic invalid-credentials error), `src/lib/auth.ts`
  (NextAuth Credentials config).
- DB: `User`, `Account`, `Session` (NextAuth-compatible via
  `@auth/prisma-adapter`).
- E2E coverage exists (`e2e/save-career.spec.ts` signs up as part of its
  flow) but was not run this audit (see `TESTING.md`).

## Methodology page (`/methodology`)

**Purpose**: publicly explain every scoring formula and the
reported/estimated/forecast/simulated status system.
**Status: Verified complete.**
- Frontend: `src/app/(app)/methodology/page.tsx`.
- DB: `MethodologyVersion` (seeded from `src/lib/seed-data/methodology.ts`).

## Data Sources page (`/data-sources`)

**Purpose**: public-facing list of every data source the app can pull from
(real or planned), separate from the admin operational view.
**Status: Verified complete.**
- Frontend: `src/app/(app)/data-sources/page.tsx`.
- DB: `DataSource` (seeded from `src/lib/seed-data/data-sources.ts`).

## Admin → Data Status (`/admin/data-status`)

**Purpose**: connector health dashboard — last success/attempt, rows
imported/rejected, quality warnings, manual "Run now" trigger per source.
**Status: Verified complete functionally, but Broken from a security
standpoint** — see `SECURITY.md` and `TASKS.md` TASK-001. The feature does
exactly what it's supposed to do; it just does it for anyone, not just an
admin, because no auth/authorization check exists anywhere in its call path
(`page.tsx` → `listDataSourceStatus`/`listEconomicIndicators`,
`run-import-button.tsx` → `triggerDataImport`).
- Frontend: `src/app/(app)/admin/data-status/page.tsx`,
  `src/components/run-import-button.tsx`.
- Backend: `src/lib/data/admin.ts`, `src/lib/actions/admin.ts`.

## Live data connectors (BLS CES, BLS OEWS, O*NET, Revelio RPLS, Census ACS, College Scorecard)

**Purpose**: replace simulated figures with real official/licensed data
where available.
**Status: Verified complete** for all six — each implements the full
`DataProvider` contract (`fetchData → normalizeData → validateData →
upsertData`), is registered in `registry.ts`, has a `DataSource` seed row,
and (where required) documents its env var in `.env.example`.
- `bls-ces` / `bls-oews` / `onet` / `revelio-rpls`: keyless, always
  "configured."
- `census-acs` / `college-scorecard`: require `CENSUS_API_KEY` /
  `COLLEGE_SCORECARD_API_KEY` respectively; gracefully report "not
  configured" and are skipped by `runAllConfiguredImports()` when the key is
  absent.
- Orchestration: `src/lib/providers/run-import.ts`, triggered by
  `GET /api/cron/update-trends` (Vercel Cron, daily) or manually per-source
  via the admin page.
- **Correction to README.md**: the checked-in README still describes Census
  ACS and College Scorecard as unimplemented ("env vars and DataSource rows
  scaffolded, but no connector code"). Both are fully implemented as of
  commits `fd94d85` and `90ef269`. Flagged, not fixed (out of this audit's
  scope) — see `TASKS.md` TASK-002.

## Planned-but-not-implemented connectors (World Bank, OECD, ILOSTAT, Eurostat)

**Status: Planned.** Each has a `DataSource` seed row in
`src/lib/seed-data/data-sources.ts` (no `apiKeyEnvVar`, `requiresApiKey:
false`) but **no matching file** exists under `src/lib/providers/` and none
are in `PROVIDER_REGISTRY`. They will always show as "not_configured" with
no "Run now" button meaningfully wired to real data (the button would only
appear if `!s.requiresApiKey`, which is true for these, but clicking it
would fail with "Unknown data source" since `runDataImport` looks the slug
up in `PROVIDER_REGISTRY` and throws if not found — **this is a real UI
inconsistency**: the "Run now" button renders for these 4 sources but
calling it throws an unhandled error inside the Server Action, since
`triggerDataImport` doesn't catch it before `runDataImport`'s own `throw new
Error(...)`. Flagged as a bug candidate in `TASKS.md`.)

## PDF report export

**Status: Not implemented** (by explicit design, per `README.md` — CSV
export of saved careers exists instead). Confirmed no PDF-generation
dependency exists in `package.json`.

## Supabase Auth

**Status: Not implemented** (by explicit design — NextAuth Credentials is
used instead; `README.md` describes swapping to Supabase Auth as a possible
future change). Confirmed `@supabase/*` packages are absent from
`package.json`.

## Drag-and-drop weight editing for Career Value Score

**Status: Planned / Partially implemented.** README states this exists for
Momentum Score but not yet for Career Value Score.
`src/lib/scoring/career-value-score.ts` exists (combines sub-scores into one
number) but has no unit test, and this audit did not locate a
drag-and-drop UI component for it (only `momentum-score.ts`'s weights are
visibly surfaced via `DEFAULT_MOMENTUM_WEIGHTS` in the seeded
`weights` JSON column). Treat as **Unable to verify** whether any partial
UI exists beyond the underlying scoring function, without a deeper
component-tree read.

# TASKS.md — Active Execution Queue

This file did not exist before the 2026-08-06 documentation audit. All tasks
below were **discovered** during that audit (via static code reading, lint,
typecheck, and unit tests) — none were fixed, since the audit's brief was
documentation-only, no behavior changes.

## Current task

**There is no in-progress product task.** The repository was in a clean,
shipped state when this audit began (see `PROJECT_STATE.md`). The nearest
thing to a "current task" is: **pick one of the High/Medium items below and
fix it**, starting with TASK-001.

A brand-new account resuming from here should:
1. Read `CLAUDE.md`, this file, and `HANDOFF.md`.
2. Run `git status && git log -5` to confirm nothing has changed since this
   audit.
3. Run `npm run lint && npx tsc --noEmit && npm run test` to confirm the
   clean baseline still holds.
4. Pick TASK-001 (or whichever the user directs) and follow its acceptance
   criteria below.

## Next up

Nothing is queued beyond the tasks below — this audit found no partially
started feature branches or WIP code.

## Blocked

None.

## High priority

### TASK-001 — Add authentication/authorization to `/admin/data-status` and `triggerDataImport`
**Status**: Open (discovered, not fixed).
**Description**: `src/app/(app)/admin/data-status/page.tsx` and
`src/lib/actions/admin.ts`'s `triggerDataImport` have no `auth()` call at
all — any visitor, signed in or not, can view connector internals (last run
times, row counts, error messages) and trigger a real outbound data-import
run against BLS/O*NET/Revelio (always) and Census/College Scorecard (if
those API keys are configured).
**Relevant files**: `src/app/(app)/admin/data-status/page.tsx`,
`src/lib/actions/admin.ts`, `src/components/run-import-button.tsx`,
`src/lib/auth.ts` (no role field exists on `User` — a role/permission model
would need to be added to `prisma/schema.prisma` for a real "admin" concept,
or a simpler stopgap of "any signed-in user" / a hardcoded email allowlist /
reusing `CRON_SECRET` as a query param could be used instead).
**Dependencies**: Decide the desired access model first (signed-in-only vs.
true admin role vs. environment-gated) — this is a product decision, not
just an implementation detail.
**Acceptance criteria**: `/admin/data-status` and `triggerDataImport` reject
unauthorized access in a way that matches the chosen model; existing
authorized access (whatever that ends up being) still works;
`npm run lint && npx tsc --noEmit && npm run test` stay clean.
**Validation steps**: manually verify (with a dev server, pointed at a
disposable database) that an anonymous request is rejected and an
authorized one succeeds.
**Blockers**: none technical; needs a product decision on the access model.
**Notes**: this is the single highest-value fix found in this audit.

### TASK-005 — Fix "Run now" throwing an unhandled error for unimplemented data sources
**Status**: Open (discovered, not fixed).
**Description**: `src/app/(app)/admin/data-status/page.tsx` renders a "Run
now" button (`RunImportButton`) for every `DataSource` where
`!s.requiresApiKey`. Four seeded sources — `world-bank`, `oecd`, `ilo`,
`eurostat` — have `requiresApiKey: false` but have **no matching entry** in
`PROVIDER_REGISTRY` (`src/lib/providers/registry.ts`). Clicking "Run now"
for any of them calls `triggerDataImport(slug)` →
`runDataImport(slug)` (`src/lib/providers/run-import.ts`), which does
`if (!provider || !dataSource) throw new Error(...)` with no surrounding
try/catch in either `runDataImport` or the calling Server Action — this
throws inside the transition with no catch in `run-import-button.tsx`
either, so the click fails ungracefully instead of showing a toast error.
**Relevant files**: `src/lib/actions/admin.ts`,
`src/lib/providers/run-import.ts`, `src/components/run-import-button.tsx`,
`src/app/(app)/admin/data-status/page.tsx`.
**Acceptance criteria**: clicking "Run now" for an unimplemented source
either (a) doesn't render the button for sources with no registered
provider, or (b) fails gracefully with a `toast.error` message instead of
an unhandled exception. Option (a) is simpler and matches user intent
better (don't offer an action that can't work).
**Validation steps**: with a dev server against a disposable DB, click "Run
now" on the World Bank / OECD / ILOSTAT / Eurostat rows and confirm no
unhandled error.
**Dependencies**: none. **Blockers**: none.

## Medium priority

### TASK-002 — Reconcile `README.md` with the now-implemented connectors
**Status**: Open (discovered, not fixed — out of scope for this
documentation-only audit).
**Description**: `README.md`'s "What's simulated, what's real, and what's
not implemented" section still lists Census ACS and College Scorecard as
"env vars and `DataSource` rows are scaffolded, but no connector code."
Both were implemented in commits `fd94d85` (2026-07-31) and `90ef269`
(2026-08-01) — `src/lib/providers/census-acs-provider.ts` and
`src/lib/providers/college-scorecard-provider.ts` both exist, are
registered, and are documented in `.env.example`.
**Relevant files**: `README.md` (the "Reported vs. estimated..." and
"What's simulated, what's real..." sections specifically).
**Acceptance criteria**: README accurately lists all 6 working connectors
and correctly narrows "not implemented" to only the genuinely unimplemented
items (World Bank/OECD/ILOSTAT/Eurostat, PDF export, Supabase Auth,
Career-Value-Score weight editing).
**Dependencies**: none. **Blockers**: none.

### TASK-003 — Add unit tests for the 3 untested scoring functions
**Status**: Open (discovered, not fixed).
**Description**: `src/lib/scoring/accessibility-score.ts`,
`src/lib/scoring/career-value-score.ts`, and
`src/lib/scoring/salary-opportunity-score.ts` have no `*.test.ts`, unlike
the other 7 scoring files (`confidence`, `cost-of-living`, `education-roi`,
`momentum-score`, `percentile-rank`, `projection`, `transition-score`, all
of which do).
**Relevant files**: the 3 files above; use any of the 7 existing
`*.test.ts` files as the pattern to follow (Vitest, `describe`/`it`,
straightforward input/output assertions against the pure functions).
**Acceptance criteria**: each of the 3 functions has a `*.test.ts` covering
at least its normal-input behavior and one edge case (e.g. zero/negative
input, boundary value); `npm run test` passes with the new files included.
**Dependencies**: none. **Blockers**: none.

### TASK-004 — Prune unused Vercel/Neon integration env vars from `.env.local`
**Status**: Open (discovered, not fixed).
**Description**: `.env.local` contains ~17 variables
(`DATABASE_URL_UNPOOLED`, `NEON_AUTH_BASE_URL`, `NEON_PROJECT_ID`,
`PGDATABASE`, `PGHOST`, `PGHOST_UNPOOLED`, `PGPASSWORD`, `PGUSER`,
`POSTGRES_DATABASE`, `POSTGRES_HOST`, `POSTGRES_PASSWORD`,
`POSTGRES_PRISMA_URL`, `POSTGRES_URL`, `POSTGRES_URL_NON_POOLING`,
`POSTGRES_URL_NO_SSL`, `POSTGRES_USER`, `VERCEL_OIDC_TOKEN`,
`VITE_NEON_AUTH_URL`) not referenced anywhere in `src/` (confirmed via
repo-wide grep). Likely auto-injected by a Vercel↔Neon marketplace
integration.
**Relevant files**: `.env.local` (gitignored, local-only — this is
low-stakes cleanup, not a shipped-code issue).
**Acceptance criteria**: `.env.local` contains only variables the app
actually reads (`DATABASE_URL`, `AUTH_SECRET`, `CRON_SECRET`,
`BLS_API_KEY`, `CENSUS_API_KEY`, `COLLEGE_SCORECARD_API_KEY`).
**Dependencies**: none. **Blockers**: none. **Priority note**: genuinely
low-stakes — do this only when convenient, never as a reason to delay
higher-priority work.

## Low priority

### TASK-006 — Verify (or add) a delete-confirmation dialog on account deletion
**Status**: Open (discovered as "unable to verify," not confirmed as a bug).
**Description**: `deleteAccountAction` (`src/lib/actions/account.ts`)
hard-deletes the signed-in user's `User` row with no server-side
confirmation step. This audit read `src/lib/actions/account.ts` but did not
do a deep read of `src/components/delete-account-button.tsx` to confirm
whether it wraps the click in an `AlertDialog` (the primitive exists in
`src/components/ui/alert-dialog.tsx`) before calling the action.
**Relevant files**: `src/components/delete-account-button.tsx`,
`src/components/ui/alert-dialog.tsx`.
**Acceptance criteria**: read `delete-account-button.tsx` fully; if no
confirmation step exists, add one using the existing `AlertDialog`
primitive before calling `deleteAccountAction`.
**Dependencies**: none. **Blockers**: none.

## Bugs

- **TASK-005** (see High priority above) — "Run now" throws an unhandled
  error for World Bank/OECD/ILOSTAT/Eurostat.
- No other bugs were found via static reading, lint, typecheck, or the unit
  test suite. This is not a guarantee no other bugs exist — no dev server
  was started and no manual/E2E testing was performed this audit (see
  `TESTING.md`).

## Technical debt

- No centralized auth/authorization gate (`middleware.ts` or a shared
  `requireAuth()` helper) — every page/action re-implements its own check,
  which is how TASK-001 happened. Worth a broader refactor beyond just
  patching the admin page.
- `src/app/page.tsx` is the only place outside `src/lib/data/` that calls
  `prisma` directly from a page component — minor inconsistency with the
  otherwise-consistent "reads go through `src/lib/data/`" convention.
- No `error.tsx`/`not-found.tsx` boundary files were located under
  `src/app/` during this audit's read window — worth confirming and adding
  if genuinely absent, for a better production error UX.

## Testing needed

- Unit tests for `accessibility-score.ts`, `career-value-score.ts`,
  `salary-opportunity-score.ts` (TASK-003).
- A verified (disposable-database) run of `npm run test:e2e` — never run
  this audit against the live-configured `DATABASE_URL`.
- A verified (disposable-database) run of `npm run build` — never run this
  audit for the same reason.
- Manual smoke test of the full user journey in a real browser (see
  `TESTING.md`'s checklist) — this audit's feature-completeness
  classifications are based on code reading, not live interaction.

## Documentation needed

- `README.md` needs the TASK-002 fix (stale "not implemented" list).
- Beyond that, this audit itself is the documentation deliverable — the 17
  files listed in `CHANGELOG.md`'s audit entry.

## Recently completed (from git history, not this audit)

- Commit the 2026-08-06 documentation audit's 17-file doc set (`d4c16f7`,
  2026-08-06) — see `CHANGELOG.md`. A 2026-08-07 checkpoint pass then fixed
  staleness the commit itself introduced (see `SESSION_LOG.md`'s latest
  entry).
- Add custom favicon (`0b10636`, 2026-08-06).
- Add Census ACS connector (`90ef269`, 2026-08-01).
- Add College Scorecard connector (`fd94d85`, 2026-07-31).
- Add Revelio Public Labor Statistics connector (`151f0f3`, 2026-07-29).
- Add real O*NET connector (`0dbb940`, 2026-07-28).
- Add real BLS OEWS salary connector (`fbb4dd0`, 2026-07-27).
- Full initial build (`4efbc64`, 2026-07-26).

## Deferred

Nothing explicitly deferred in the repo (no `TODO`/`FIXME`/`DEFERRED`
comments found anywhere in `src/`, `prisma/`, or `e2e/` during this audit's
grep pass).

## Rejected ideas

None found recorded anywhere in the repo (no rejected-ideas log, no
commented-out abandoned features, no `.md` design-decision file predating
this audit).

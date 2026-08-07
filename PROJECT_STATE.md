# PROJECT_STATE.md — Exact Handoff Snapshot

This file reflects the repository's exact state as observed during the
2026-08-06 documentation audit. It is meant to be re-verified (git status,
git log) at the start of every future session, not trusted blindly.

## Audit timestamp

2026-08-06, performed by a Claude Code session (account/agent identity not
tracked by this session — see `SESSION_LOG.md`). No prior `PROJECT_STATE.md`
existed before this audit.

## Git state (verified this session)

- **Branch**: `main`
- **Tracking**: up to date with `origin/main` (`git status` reported "Your
  branch is up to date with 'origin/main'.")
- **Working tree**: clean — `git status` reported "nothing to commit, working
  tree clean" at the start of this session.
- **Untracked files**: none (repo-tracked scope). Directories `.agents/`,
  `.claude/`, `.windsurf/`, `test-results/`, `playwright-report/`, `.next/`,
  `.vercel/`, `node_modules/`, `tsconfig.tsbuildinfo` exist on disk but are
  all covered by `.gitignore`.
- **Latest commit**: `0b10636` — "Add custom favicon matching the app's
  chart-mark branding" (2026-08-06 03:41:19 -0700).
- **Full commit history** (8 commits, oldest first):
  1. `1d06f96` — Initial commit from Create Next App (2026-07-24)
  2. `4efbc64` — Build CareerAtlas: full-stack career salary, transitions,
     education, and industry trend tracker (2026-07-26) — the large initial
     build
  3. `fbb4dd0` — Add real BLS OEWS salary connector, replacing simulated
     data for 27 occupations (2026-07-27)
  4. `0dbb940` — Add real O*NET connector: education requirements +
     alternate job titles (2026-07-28)
  5. `151f0f3` — Add Revelio Public Labor Statistics connector for real
     posting-growth trend (2026-07-29)
  6. `fd94d85` — Add College Scorecard connector: real per-institution
     tuition (2026-07-31)
  7. `90ef269` — Add Census ACS connector: real median earnings by
     education level (2026-08-01)
  8. `0b10636` — Add custom favicon matching the app's chart-mark branding
     (2026-08-06) — **HEAD**
- **Remote**: `origin` → `https://github.com/Gariyuuu/careeratlas.git`
- This audit made **no commits** and changed **no application code** — only
  the 17 documentation files listed in `CHANGELOG.md`'s audit entry.

## Active objective

Before this audit, there was no in-progress feature work recorded anywhere
(no `TASKS.md` existed, no WIP branch, no uncommitted diff). The repository
was in a **shipped, stable state**: full feature set built in commit
`4efbc64`, five real-data connectors added one per commit afterward, and a
cosmetic favicon commit most recently. There is no evidence (via `git log`,
`git status`, or file timestamps) of an interrupted task.

**This audit's own objective** (now complete): bring
`careeratlas`'s documentation up to the same standard as sibling projects
`chamber-seven` and `buildstrike-arena` — create the 16 missing handoff docs
and revise `CLAUDE.md`, based purely on inspecting this repo.

## Last completed task

The most recent product work (prior to this documentation audit) was commit
`0b10636`, a one-line SVG favicon addition. Before that, the five connector
commits (BLS OEWS → O*NET → Revelio RPLS → College Scorecard → Census ACS)
each appear complete and self-contained: each is registered in
`src/lib/providers/registry.ts`, has a matching `DataSource` row in
`src/lib/seed-data/data-sources.ts`, and (where required) an env var
documented in `.env.example`.

## Current unfinished task

**None in the product sense.** The one open, well-defined piece of unfinished
work this audit surfaced is documentation/process debt, tracked as
`TASKS.md` TASK-001 through TASK-004:

- **TASK-001** (High): `/admin/data-status` and its `triggerDataImport`
  Server Action have no auth/authorization check — anyone can view connector
  internals and trigger real outbound API calls. Related files:
  `src/app/(app)/admin/data-status/page.tsx`,
  `src/lib/actions/admin.ts`, `src/components/run-import-button.tsx`.
- **TASK-002** (Medium): `README.md`'s "not implemented" section is stale —
  it says Census ACS and College Scorecard connectors don't exist; they do
  (commits `fd94d85`, `90ef269`). Related file: `README.md`.
- **TASK-003** (Medium): 3 of 10 scoring functions have no unit tests
  (`src/lib/scoring/accessibility-score.ts`,
  `src/lib/scoring/career-value-score.ts`,
  `src/lib/scoring/salary-opportunity-score.ts`).
- **TASK-004** (Low): ~17 unused Vercel/Neon-integration env vars sitting in
  `.env.local`, not referenced anywhere in `src/`.

None of these were fixed by this audit — they are documented findings only,
per the task's explicit "do not implement any new features or change
application behavior" instruction.

## What has been attempted (this session)

Full repository audit: read every source file group (app routes, components,
lib/actions, lib/data, lib/providers, lib/scoring, lib/seed-data), the Prisma
schema and the one migration, `package.json`/lockfile, all config files
(`next.config.ts`, `tsconfig.json`, `eslint.config.mjs`, `vitest.config.ts`,
`playwright.config.ts`, `components.json`, `vercel.json`), `.gitignore`,
`.env.example` plus the variable *names* (not values) present in `.env` and
`.env.local`, `README.md`, `AGENTS.md`, git log/status, and the two sibling
projects' doc sets purely for structural reference. Ran `npm run lint`,
`npx tsc --noEmit`, and `npm run test` as safe non-destructive verification.

## What currently works (verified this audit)

- `npm run lint` — passes (1 harmless React Compiler warning on
  `src/components/data-table.tsx`, not an error).
- `npx tsc --noEmit` — passes, zero type errors.
- `npm run test` (Vitest) — 34/34 tests pass across 7 files
  (`confidence`, `cost-of-living`, `education-roi`, `momentum-score`,
  `percentile-rank`, `projection`, `transition-score`).
- Repo-wide code hygiene checks came back clean: no `console.log/error/warn`,
  no `as any`/`@ts-ignore`/`@ts-expect-error`, no `.skip`/`.only` tests, no
  empty catch blocks found in `src/`.

## What currently fails / is unverified

- **`npm run build`** — not run this audit. `DATABASE_URL` in this working
  copy points at a live Neon Postgres database; several Server Components
  query the database with no visible `force-dynamic` override, so a
  production build risks connecting to that real database during static
  generation. Unverified by design (see `CLAUDE.md`'s "Essential commands"
  note).
- **`npm run test:e2e`** (Playwright) — not run this audit. Its `webServer`
  config runs `npm run start` (which needs a successful build first) against
  whatever `DATABASE_URL` is set, and `e2e/save-career.spec.ts` performs a
  real sign-up against that database. Unverified by design.
- **Actual runtime behavior of the app in a browser** — not observed this
  audit (no dev server was started, per the task's non-destructive
  constraints). All feature-completeness classifications in `FEATURES.md`
  are based on static code reading (full-flow tracing from UI → action/data
  function → Prisma → schema), not live interaction.

## Errors observed this session

None. Lint, typecheck, and unit tests all passed on the first run; no
crashes or exceptions encountered while reading the codebase.

## Blockers

None for the documentation task itself. For **future** product work, the
practical blocker is the same one noted throughout: this working copy's
`DATABASE_URL` is a live, shared Neon database, so any DB-touching
verification (build, e2e, seed, migrate, reset) needs a disposable database
first, or explicit user sign-off that the configured one is safe to write to.

## Assumptions currently in effect (not independently re-verified beyond what's stated)

- The Neon Postgres database at the host visible in `.env`/`.env.local` is
  assumed to be this project's real/working database (not a throwaway) —
  never verified live (no query was run against it), inferred from it being
  the value actually configured rather than the `.env.example` placeholder.
- Vercel is assumed to be the deployment target, based on `.vercel/` and
  `vercel.json` existing and `README.md`'s deployment section describing
  Vercel steps — no other hosting config was found, but no live Vercel
  project was queried to confirm.
- Node `v26.3.0` (observed via `node -v` on the auditing machine) is **not**
  assumed to be a repo requirement — no `engines` field or version file pins
  it.

## Next three recommended actions

1. **Decide on and fix TASK-001** (admin page/action auth gap) — either add
   an explicit role check, protect it behind `CRON_SECRET` too, or
   deliberately document it as "intentionally open for a personal demo
   project" if that's the real intent. This is the only finding in this
   audit with real security weight.
2. **Reconcile `README.md` with reality** (TASK-002) — update its "not
   implemented" list now that Census ACS and College Scorecard connectors
   exist, so user-facing docs match the AI-facing ones created this session.
3. **Add unit tests for the 3 untested scoring functions** (TASK-003) —
   `accessibility-score.ts`, `career-value-score.ts`,
   `salary-opportunity-score.ts` — following the existing pattern in any of
   the 7 files that already have one.

## Verification required before continuing any of the above

- Confirm which database `DATABASE_URL` currently points to and whether it's
  safe to run `npm run build` / `npm run test:e2e` against it, or set up a
  disposable one first.
- Re-run `git status`/`git log` to confirm no other session has since
  changed the branch state described here.
- Re-run `npm run lint && npx tsc --noEmit && npm run test` before and after
  any change, to keep the clean baseline this audit established.

# PROJECT_STATE.md — Exact Handoff Snapshot

> **Update 2026-09-05 — W9 UI/UX overhaul pass (uncommitted).**
> This repo was polished as part of group **W9** of `~/Projects/OVERHAUL-GROUPS.md`
> (numbers-first surfaces). Working tree is now **dirty and uncommitted**: 26
> file(s) changed. Nothing was committed, pushed or deployed.
> No product architecture, backend logic, schema, auth or route changes.
> Full detail: this repo's `SESSION_LOG.md` (newest entry) and `UI_SYSTEM.md`.
> Verification run this pass: `npx tsc --noEmit` 0 errors; `npm run lint` 0 errors / 1 pre-existing warning; `npm run test` 34/34. `build`/`test:e2e` not run (live Neon).
> The group's shared tokens are a **new portfolio design-system layer**,
> `~/Projects/.design-system/families/numerics.css` (v1.0). `MASTER.css` is unchanged.

This file reflects the repository's exact state as of the **2026-08-17**
onboarding-verification pass (superseding the 2026-08-06/07 snapshot below,
which is kept for history). It is meant to be re-verified (`git status`,
`git log`) at the start of every future session, not trusted blindly.

## Audit timestamp

- **2026-08-06** — original audit, performed by a Claude Code session
  (account/agent identity not tracked by that session — see
  `SESSION_LOG.md`). No prior `PROJECT_STATE.md` existed before that audit.
- **2026-08-07** — follow-up re-verification/checkpoint pass. Confirmed the
  2026-08-06 audit's doc set was itself committed as `d4c16f7` (it had
  described itself as uncommitted, which was accurate at the moment it was
  written but went stale the instant that commit landed — fixed then).
  Also corrected a wrong Prisma model count (37 → 51, see `DATABASE.md`)
  found stale across multiple files.
- **2026-08-13 to 2026-08-16** — real product work, **not** a documentation
  pass: `80a7961` fixed TASK-001 (admin auth gap); `fb63183` added
  OpenGraph/sitemap/robots metadata; `fb450a0` added a cosmetic bookmark
  animation; three merge commits. None of this was done by (or for) the
  memory-doc system — it's ordinary development that happened while the
  docs sat unread.
- **2026-08-17** (this update) — onboarding-mode re-verification. Found the
  doc set 6 commits stale, most importantly still describing TASK-001 (the
  headline security finding) as open when it had been fixed 4 days earlier.
  Corrected `CLAUDE.md`, `SECURITY.md`, `TASKS.md`, `HANDOFF.md`,
  `FEATURES.md`, `API_REFERENCE.md`, `FILE_MAP.md`, `CHANGELOG.md`, and this
  file. Also found `.env.example` itself (not just `README.md`) has stale
  "not yet wired" comments on `CENSUS_API_KEY`/`COLLEGE_SCORECARD_API_KEY`
  — new finding, tracked as `TASKS.md` TASK-007. Re-ran
  `lint`/`tsc`/`test` — all still clean/passing, same baseline as before.

## Git state (re-verified 2026-08-17)

- **Branch**: `main`
- **Tracking**: up to date with `origin/main` at last check (re-verify
  yourself — not re-confirmed via `git fetch` this pass).
- **Working tree**: clean at the start of this pass — `git status` reported
  "nothing to commit, working tree clean" before any memory-doc edits.
- **Untracked files**: none tracked-relevant. Directories `.agents/`,
  `.claude/`, `.windsurf/`, `test-results/`, `playwright-report/`, `.next/`,
  `.vercel/`, `node_modules/`, `tsconfig.tsbuildinfo` exist on disk but are
  all covered by `.gitignore`.
- **Latest commit**: `63a5a6f` — "Merge branch 'chore/polish' into main"
  (2026-08-16) — **HEAD** (as of the start of this pass, before any memory
  commit).
- **Full commit history** (16 commits, oldest first) — the first 9 match
  the 2026-08-07 snapshot exactly; 7 more have landed since:
  1. `1d06f96` — Initial commit from Create Next App (2026-07-24)
  2. `4efbc64` — Build CareerAtlas: full-stack career salary, transitions,
     education, and industry trend tracker (2026-07-26) — the large initial
     build
  3. `fbb4dd0` — Add real BLS OEWS salary connector (2026-07-27)
  4. `0dbb940` — Add real O*NET connector (2026-07-28)
  5. `151f0f3` — Add Revelio Public Labor Statistics connector (2026-07-29)
  6. `fd94d85` — Add College Scorecard connector (2026-07-31)
  7. `90ef269` — Add Census ACS connector (2026-08-01)
  8. `0b10636` — Add custom favicon (2026-08-06)
  9. `d4c16f7` — docs: add full handoff documentation system (2026-08-06)
  10. `6ebad6b` — docs: fix staleness found in final transfer checkpoint
      pass (2026-08-07)
  11. `80a7961` — fix: gate the admin data-import action, not the status
      page (TASK-001) (2026-08-13)
  12. `fb63183` — chore: add OpenGraph metadata, sitemap, and robots.txt
      (2026-08-13)
  13. `2b26360` — Merge chore/admin-auth (2026-08-13)
  14. `498fd2c` — Merge chore/metadata-og (2026-08-15)
  15. `fb450a0` — feat(ui): add bookmark pop animation to save-career
      button (2026-08-15)
  16. `63a5a6f` — Merge branch 'chore/polish' into main (2026-08-16) —
      **HEAD**
- **Remote**: `origin` → `https://github.com/Gariyuuu/careeratlas.git`
  (not re-confirmed reachable this pass).
- This 2026-08-17 pass changed **no application code** — only memory/
  documentation files, per its explicit brief.

## Active objective

Originally (2026-08-06), there was no in-progress feature work recorded
anywhere; the repository was in a shipped, stable state. **As of
2026-08-17**, this remains true in the product sense — `git log`/`git
status` show no interrupted task, just a sequence of complete, self-
contained commits (TASK-001 fix, SEO metadata, bookmark animation, each
merged cleanly).

**The 2026-08-06/07 audit's objective** (complete): bring `careeratlas`'s
documentation up to the same standard as sibling projects `chamber-seven`
and `buildstrike-arena`.

**This 2026-08-17 pass's objective** (complete): re-sync that doc set
against 6 commits of product work it never saw, most importantly
correcting every place it still claimed TASK-001 was open.

## Last completed task

The most recent commit on `main` is `63a5a6f` (2026-08-16, merges
`chore/polish`). See "Git state" above for the full 16-commit list. The
most recent *documentation-only* pass before this one was `6ebad6b`
(2026-08-07); everything from `80a7961` through `63a5a6f` is real product
work that happened without any doc update in between — which is exactly
the staleness this 2026-08-17 pass exists to fix.

## Current unfinished task

**Current task ID: `T-005`** (maps to `TASKS.md` **TASK-005** — this repo's
backlog uses `TASK-XXX` numbering; `T-005` is the stable cross-file ID for
this repo-memory system).

**None in the product sense** — the app is shipped and stable. The open
backlog, tracked in `TASKS.md`, is documentation/process/hardening debt:

- **TASK-001 — CLOSED.** [Verified 2026-08-17] Fixed in commit `80a7961`
  (2026-08-13): `/admin/data-status` and `triggerDataImport` are now gated
  behind an `ADMIN_EMAILS` allowlist (`src/lib/admin-auth.ts`), fail-closed
  if unset. This section previously described TASK-001 as open/current —
  that was stale (the audit that wrote it predates the fix); corrected here.
  See `SECURITY.md` and `CLAUDE.md` → Current status.
- **TASK-005 / `T-005` (High) — this is the current task.** "Run now"
  throws an unhandled error for four seeded data sources
  (World Bank/OECD/ILOSTAT/Eurostat) that have no matching provider
  registered. Related files: `src/lib/actions/admin.ts`,
  `src/lib/providers/run-import.ts`, `src/components/run-import-button.tsx`,
  `src/app/(app)/admin/data-status/page.tsx`. See `TASKS.md` TASK-005 for
  full acceptance criteria.
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

## What has been attempted (2026-08-17 session)

Re-read all 19 existing memory files; ran `git log`/`git show` on every
commit since `d4c16f7` to see what changed since the last doc pass;
re-read the changed source directly (`src/lib/actions/admin.ts`,
`src/lib/admin-auth.ts`, `src/lib/sanitize.ts`,
`src/app/(app)/admin/data-status/page.tsx`,
`src/components/run-import-button.tsx`, `src/app/layout.tsx`,
`src/app/opengraph-image.tsx`, `src/app/robots.ts`, `src/app/sitemap.ts`,
`src/components/save-career-button.tsx`,
`src/components/delete-account-button.tsx`); re-checked `README.md`,
`.env.local`'s variable *names*, `.env.example`, and
`src/lib/providers/run-import.ts` against each open `TASKS.md` item; ran
`npm run lint`, `npx tsc --noEmit`, and `npm run test`.

## What has been attempted (2026-08-06/07 audits, for history)

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

1. **Fix TASK-005 / `T-005`** (unhandled error on "Run now" for
   unimplemented data sources) — the current task; see `TASKS.md` for full
   acceptance criteria. (`TASK-001`, the admin auth gap, is already closed —
   fixed in `80a7961`.)
2. **Reconcile `README.md` with reality** (TASK-002) — update its "not
   implemented" list now that Census ACS and College Scorecard connectors
   exist, so user-facing docs match the AI-facing ones created this session.
3. **Add unit tests for the 3 untested scoring functions** (TASK-003) —
   `src/lib/scoring/accessibility-score.ts`, `src/lib/scoring/career-value-score.ts`,
   `src/lib/scoring/salary-opportunity-score.ts` — following the existing pattern in any of
   the 7 files that already have one.

## Verification required before continuing any of the above

- Confirm which database `DATABASE_URL` currently points to and whether it's
  safe to run `npm run build` / `npm run test:e2e` against it, or set up a
  disposable one first.
- Re-run `git status`/`git log` to confirm no other session has since
  changed the branch state described here.
- Re-run `npm run lint && npx tsc --noEmit && npm run test` before and after
  any change, to keep the clean baseline this audit established.

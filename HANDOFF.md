# HANDOFF.md — Start Here

Short, high-signal onboarding doc. Read this first, then `CLAUDE.md` for
full depth.

## What is this project?

**CareerAtlas** — a full-stack Next.js 16 career-analytics web app: salary
explorer, career-transition mapper, education ROI calculator, and industry
momentum/trends tracker. It ships with a large deterministic simulated demo
dataset (50 industries, 1,000+ occupations) so it's fully explorable with
zero configuration, plus 6 working live data connectors (BLS CES, BLS OEWS,
O*NET, Revelio, Census ACS, College Scorecard) that layer in real official
data. Every number in the app is labeled `reported`/`estimated`/`forecast`/
`simulated` — this labeling discipline is the app's core design principle.

Repo: `/Users/gariyuu/Projects/careeratlas`. GitHub:
`https://github.com/Gariyuuu/careeratlas`.

## What should I read first?

1. `CLAUDE.md` — full operating manual (stack, commands, conventions,
   "DO NOT CHANGE WITHOUT REVIEW", known issues, AI working instructions).
2. `PROJECT_STATE.md` — exact current git/task state.
3. `TASKS.md` — what's queued, what's blocked, what's the current task.
4. This file, for the fastest orientation.
5. Everything else (`ARCHITECTURE.md`, `FILE_MAP.md`, `FEATURES.md`,
   `DATABASE.md`, `API_REFERENCE.md`, `UI_SYSTEM.md`, `SECURITY.md`,
   `TESTING.md`, `DEPLOYMENT.md`, `DECISIONS.md`, `ROADMAP.md`,
   `CHANGELOG.md`, `SESSION_LOG.md`) as needed for depth on a specific area.

## Current task

**Current task ID: `T-005`** (maps to `TASKS.md` **TASK-005**; this repo's
backlog uses `TASK-XXX` numbering, `T-005` is the stable cross-file ID).

**[Verified 2026-08-17]** **TASK-001 is closed** — fixed for real in commit
`80a7961` (2026-08-13): `/admin/data-status` and `triggerDataImport` are now
gated behind an `ADMIN_EMAILS` allowlist. This section previously
recommended TASK-001 as the next task; that was stale (written before the
fix landed) and is corrected here.

There is no in-progress product task — the repo is shipped and stable. The
recommended next task, if you're picking this project up to do real work, is
**TASK-005 / `T-005`** in `TASKS.md`: fix "Run now" throwing an unhandled
error for four seeded-but-unimplemented data sources
(World Bank/OECD/ILOSTAT/Eurostat) — see `TASKS.md` for full acceptance
criteria.

## What was the previous agent doing?

The 2026-08-06 session performed a full, read-only repository audit and
produced this entire documentation set (`CLAUDE.md` revised, 16 other files
created), then committed it as `d4c16f7`. A 2026-08-07 follow-up session
re-verified that doc set against the real repo state as a "final transfer
checkpoint" pass, fixed two categories of staleness it found (the doc set's
description of its own git HEAD, and a wrong Prisma model count — see
`CHANGELOG.md`'s 2026-08-07 entry), and reconfirmed all previously-open
tasks (TASK-001/002/003) were still genuinely open **as of that pass**.
**[Verified 2026-08-17]** TASK-001 has since been fixed for real, in commit
`80a7961` (2026-08-13) — see "Current task" above. TASK-002/003 remain open.
Neither documentation session changed any application code. See
`SESSION_LOG.md` for the complete record of all sessions.

## What works right now?

Verified this audit (lint/typecheck/unit tests, plus full-flow static
tracing of every major feature — see `FEATURES.md`): Salary Explorer, Role
Detail, Career Explorer/taxonomy browsing, global search, Career
Transitions (with skill-gap detail and a visual graph), Education Impact +
compare tool, Industry Trends/Momentum leaderboard, Salary Projection
calculator, Compare Careers (up to 5), Saved Careers + CSV export,
Dashboard (personalized + anonymous), Profile, Settings + account deletion,
full email/password auth, Methodology and Data Sources pages, all 6 live
data connectors, and the daily Vercel Cron job. `npm run lint`,
`npx tsc --noEmit`, and `npm run test` all pass cleanly.

## What is broken?

Nothing crashes or fails outright based on static review. One real issue
remains open (a second was closed since the last checkpoint, a third
turned out not to be a bug):
1. ~~`/admin/data-status` + `triggerDataImport` have no auth check at
   all`~~ — **fixed** `80a7961` (2026-08-13), TASK-001 closed. See
   `SECURITY.md`.
2. **The admin page's "Run now" button, when clicked for World Bank/OECD/
   ILOSTAT/Eurostat** (4 seeded-but-unimplemented data sources), still
   throws an unhandled error instead of failing gracefully. **This is the
   current task** (TASK-005 / `T-005`, `TASKS.md`).
3. ~~Account deletion might lack a confirmation dialog~~ — **[Verified
   2026-08-17] confirmed not a bug**: `src/components/delete-account-button.tsx` already
   wraps the delete in an `AlertDialog`. TASK-006 resolved.

Additionally, `README.md` (TASK-002) and, newly found 2026-08-17,
`.env.example` itself (TASK-007) are both stale about which connectors are
implemented; 3 of 10 scoring functions still have no unit tests (TASK-003).

## What should I do next?

1. Confirm the state described here still holds: `git status`, `git log -5`.
2. Re-run `npm run lint && npx tsc --noEmit && npm run test` to confirm the
   clean baseline.
3. If doing product work: start with TASK-005 / `T-005` (see `TASKS.md`
   for full acceptance criteria) unless the user directs otherwise —
   TASK-001 is already closed.
4. If asked to verify the build or run E2E tests: **do not** run them
   against the `DATABASE_URL` currently in `.env`/`.env.local` — it's a
   live Neon database — set up a disposable database first or get explicit
   confirmation it's safe.

## Which files are most important?

- `prisma/schema.prisma` — the entire data model (51 models, re-counted
  2026-08-07; a prior audit undercounted this as 37 — see `DATABASE.md`).
- `src/lib/auth.ts` — the entire auth system.
- `src/lib/scoring/*.ts` — every user-facing formula, unit-tested and
  shared between the seed script and live pages.
- `src/lib/providers/*.ts` + `src/lib/providers/registry.ts` — the live-data-connector plugin
  system.
- `prisma/seed.ts` — how the entire deterministic demo dataset is generated.
- `src/components/data-status-badge.tsx` — small file, large importance:
  the visual enforcement of the reported/estimated/forecast/simulated
  labeling discipline.

Full file-by-file map with call graphs and edit-risk ratings:
`FILE_MAP.md`.

## Which areas are dangerous to modify?

See `CLAUDE.md`'s "DO NOT CHANGE WITHOUT REVIEW" section in full. Short
version: `prisma/schema.prisma` and its migrations, `src/lib/auth.ts` and
the NextAuth route, `prisma/seed.ts` and `src/lib/seed-data/*` (RNG-seeded
determinism is fragile to careless edits), `src/lib/scoring/*.ts`
(user-facing "transparent methodology" numbers), and never printing/
committing the real values in `.env`/`.env.local`.

## Which commands should I run first?

From the repo root (`/Users/gariyuu/Projects/careeratlas`):
```bash
git status && git log -5
npm run lint
npx tsc --noEmit
npm run test
```
All four should be clean/passing, matching this audit's baseline. If any
of them aren't, something changed since this handoff was written —
investigate before proceeding, and update `PROJECT_STATE.md` accordingly.

## How do I verify the app still works?

Given the live-database caveat, **do not** simply run `npm run dev` against
`.env`'s configured `DATABASE_URL` without first confirming with the user
that database is safe to use, since interacting with the app writes to it
(sign-ups, saves, admin-triggered data imports). If a disposable database
is available: `npm run db:migrate && npm run db:seed && npm run dev`, then
work through the manual smoke-test checklist in `TESTING.md` (core
browsing, account flow, admin/connector checks). At minimum, always keep
`npm run lint`, `npx tsc --noEmit`, and `npm run test` passing after any
change.

---

## Prompt for the next Claude Code account

```
Before making any changes to this repository (~/Projects/careeratlas),
read all of the core memory/handoff files in this order: CLAUDE.md,
PROJECT_STATE.md, TASKS.md, HANDOFF.md, then skim ARCHITECTURE.md,
FEATURES.md, DATABASE.md, SECURITY.md, and DECISIONS.md for depth on
whatever area you're about to touch.

Then, independently:
1. Run `git status`, `git log -5`, and (if a remote is configured)
   `git fetch origin` read-only, and compare against what PROJECT_STATE.md
   claims — flag any contradiction before doing anything else. As of the
   2026-08-17 re-verification pass, HEAD is `63a5a6f` ("Merge branch
   'chore/polish' into main", 16 commits total on main) and the tree was
   clean before any memory-doc commit. This doc set has already been caught
   describing a 6-commit-stale HEAD once (see `CHANGELOG.md`'s 2026-08-17
   entry) — don't assume this line stays accurate without re-checking.
2. Run `npm run lint && npx tsc --noEmit && npm run test` and confirm they
   still pass (they did as of the 2026-08-06 audit, the 2026-08-07
   checkpoint, and the 2026-08-17 pass: 1 harmless lint warning, 0 type
   errors, 34/34 unit tests).
3. Summarize your understanding of the current state and the task you're
   about to do back to the user BEFORE editing anything, and explicitly
   flag any documentation you find stale, contradictory, or unverifiable
   against the actual code. Note: this doc set has already been caught
   going stale once by describing itself before its own commit landed
   (see SESSION_LOG.md's 2026-08-07 entry) — if you edit and commit these
   docs, update any "latest commit"/"N commits total" claims as the very
   last step before committing, not before, or you'll reintroduce the same
   bug.

Continue the current recommended task (TASK-005 / T-005 in TASKS.md — fix
"Run now" throwing an unhandled error for unimplemented data sources —
unless the user directs you elsewhere; TASK-001 is already closed) without
redoing work that's already finished.
Preserve the existing architecture, conventions, and the
reported/estimated/forecast/simulated data-labeling discipline described in
CLAUDE.md unless you have a strong, explicitly-discussed reason to change
it.

Never run `npm run build`, `npm run test:e2e`, `npm run db:reset`, or any
other command that could write to or heavily query the database, without
first confirming DATABASE_URL points at a disposable database or getting
explicit user sign-off — the credentials committed in this working copy's
.env/.env.local point at a live Neon Postgres instance. Never print a real
secret value from .env/.env.local into chat, logs, or any file.

After completing any meaningful work, update PROJECT_STATE.md, TASKS.md,
SESSION_LOG.md (append a new dated entry), and DECISIONS.md (if you made or
discovered an architectural decision) before ending your session — per the
permanent rules at the bottom of CLAUDE.md.
```

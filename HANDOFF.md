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

## What is the current task?

**There is no in-progress product task.** The repo was shipped and clean
when the 2026-08-06 documentation audit began, and the audit itself
(documentation only, no code changes) is now complete. The recommended next
task, if you're picking this project up to do real work, is **TASK-001**
in `TASKS.md`: add an authentication/authorization check to
`/admin/data-status` (`src/app/(app)/admin/data-status/page.tsx`) and its
`triggerDataImport` Server Action (`src/lib/actions/admin.ts`), which
currently have none at all — see `SECURITY.md` for the full writeup.

## What was the previous agent doing?

The previous session (2026-08-06) performed a full, read-only repository
audit and produced this entire documentation set (`CLAUDE.md` revised, 16
other files created). It changed no application code. See
`SESSION_LOG.md`'s first entry for the complete record of what was read,
what was run, and what was found.

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

Nothing crashes or fails outright based on static review, but two real
issues were found:
1. **`/admin/data-status` + `triggerDataImport` have no auth check at
   all** — anyone can view connector internals and trigger real outbound
   API calls. (TASK-001, `SECURITY.md`.)
2. **The admin page's "Run now" button, when clicked for World Bank/OECD/
   ILOSTAT/Eurostat** (4 seeded-but-unimplemented data sources), throws an
   unhandled error instead of failing gracefully. (TASK-005, `TASKS.md`.)

Additionally, `README.md` (the user-facing doc, separate from this
AI-facing set) is stale about which connectors are implemented (TASK-002),
and 3 of 10 scoring functions have no unit tests (TASK-003).

## What should I do next?

1. Confirm the state described here still holds: `git status`, `git log -5`.
2. Re-run `npm run lint && npx tsc --noEmit && npm run test` to confirm the
   clean baseline.
3. If doing product work: start with TASK-001 (see `TASKS.md` for full
   acceptance criteria) unless the user directs otherwise.
4. If asked to verify the build or run E2E tests: **do not** run them
   against the `DATABASE_URL` currently in `.env`/`.env.local` — it's a
   live Neon database — set up a disposable database first or get explicit
   confirmation it's safe.

## Which files are most important?

- `prisma/schema.prisma` — the entire data model (37 models).
- `src/lib/auth.ts` — the entire auth system.
- `src/lib/scoring/*.ts` — every user-facing formula, unit-tested and
  shared between the seed script and live pages.
- `src/lib/providers/*.ts` + `registry.ts` — the live-data-connector plugin
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
1. Run `git status` and `git log -5` and compare against what
   PROJECT_STATE.md claims — flag any contradiction before doing anything
   else.
2. Run `npm run lint && npx tsc --noEmit && npm run test` and confirm they
   still pass (they did as of the 2026-08-06 documentation audit).
3. Summarize your understanding of the current state and the task you're
   about to do back to the user BEFORE editing anything, and explicitly
   flag any documentation you find stale, contradictory, or unverifiable
   against the actual code.

Continue the current recommended task (TASK-001 in TASKS.md — adding
auth/authorization to /admin/data-status and triggerDataImport — unless the
user directs you elsewhere) without redoing work that's already finished.
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

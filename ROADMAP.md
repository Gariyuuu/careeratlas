# ROADMAP.md — Product Roadmap

No time estimates are given anywhere in this file — none exist in the repo
(no project-management file, no milestone dates beyond git commit
timestamps) and none are invented here.

## Current milestone

**Milestone**: Documentation & handoff readiness (this audit).
**Objective**: bring `careeratlas`'s AI-facing documentation up to the same
standard as sibling projects `chamber-seven`/`buildstrike-arena`.
**Priority**: High (explicitly requested).
**Status**: Complete as of this audit — 17 files created/updated (see
`CHANGELOG.md`).
**Dependencies**: none.
**Difficulty**: Low (documentation, not code).
**Risk**: Low — no application behavior was changed.
**Definition of done**: all 17 files exist, are internally consistent, and
every claim in them was verified against the actual repository rather than
assumed. Met.

## Next milestone

**Milestone**: Close the security/consistency gaps this audit surfaced.
**Objective**: fix TASK-001 (admin auth gap) at minimum; TASK-002 through
TASK-006 as time allows.
**Priority**: High for TASK-001, Medium/Low for the rest (see `TASKS.md`).
**Status**: Not started.
**Dependencies**: a product decision on the desired access model for
`/admin/data-status` (see TASK-001).
**Difficulty**: Low–Medium — TASK-001 needs either a simple "require
sign-in" gate or a small schema addition (a `role` field on `User`)
depending on how strict the desired access control is.
**Risk**: Low if done carefully (auth changes always carry some risk of
locking out legitimate access — test against a disposable database first).
**Definition of done**: `/admin/data-status` and `triggerDataImport` reject
unauthorized requests; `README.md` matches actual connector implementation
status; the 3 untested scoring functions have tests; `.env.local` no longer
carries unused variables.

## MVP completion

Based on the repository's own `README.md` and the breadth of implemented
features found during this audit (Salary Explorer, Role Detail, Career
Explorer, Career Transitions with skill-gap detail, Education ROI
calculator, Industry Trends/Momentum, Salary Projection calculator, Compare
Careers, Saved Careers with CSV export, Dashboard, Profile, Settings, full
auth, 6 live data connectors, admin data-status dashboard, methodology and
data-sources transparency pages) — **the MVP, as the developer originally
scoped it in `README.md`, appears complete.** This is an inference from the
breadth and completeness of what exists, not a claim the original developer
explicitly declared "MVP done" anywhere in the repo (no such statement was
found).

## Post-MVP

Items explicitly called out as intentionally deferred in `README.md`'s "What's
simulated, what's real, and what's not implemented" section (Verified —
this is the developer's own stated scope, not this audit's inference):
- **PDF report export** — CSV export of saved careers was built instead.
- **Full drag-and-drop weight editing for the Career Value Score** —
  implemented for the Momentum Score, not yet for Career Value.
- **World Bank / OECD / ILOSTAT / Eurostat connectors** — seeded as
  `DataSource` rows, described in `README.md`'s "Adding a new data
  provider" section as the next candidates, no connector code yet.

## Long-term ideas

None are recorded anywhere in the repo — no roadmap file, no GitHub issues
(not checked live, but no local issue-tracker cache exists), no
design-doc folder. Nothing to report here without inventing content, per
this task's explicit "never fabricate" instruction.

## Optional improvements

Inferred (not stated anywhere in the repo) from patterns observed during
this audit — labeled as suggestions, not commitments:
- A `middleware.ts`-based (or shared-helper-based) centralized auth gate,
  to prevent a repeat of the `/admin/data-status` gap.
- A real `role` field on `User` if any admin-only feature is going to keep
  existing, rather than relying on "nobody happens to find the URL."
- `error.tsx`/`not-found.tsx` App Router boundary files if genuinely absent
  (see `TASKS.md` technical debt note — this was not conclusively confirmed
  absent, just not located during this audit's read window).
- Explicit `dynamic`/`revalidate` exports on database-backed pages, to make
  static-vs-dynamic rendering behavior intentional rather than inferred
  from Next.js defaults (see `ARCHITECTURE.md`'s "Major architectural
  risks" #3).

## Out of scope

Explicitly stated as out of scope in `README.md` (Verified):
- Supabase Auth (NextAuth Credentials was chosen instead; README documents
  the swap path if ever wanted).

Explicitly out of scope for **this audit** (task instruction, not a
product decision):
- No new features, no application-behavior changes, no fixes to any of the
  findings in `TASKS.md` — documentation only.

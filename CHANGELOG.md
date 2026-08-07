# CHANGELOG.md — Repository / Engineering Changelog

No `CHANGELOG.md` existed before this audit. There is no user-facing
version-numbering scheme anywhere in the repo (`package.json`'s
`"version": "0.1.0"` has never been bumped across any commit). This file
starts here; entries below are either this audit's own work or reconstructed
from `git log` — nothing is invented.

## 2026-08-06 — Documentation & handoff audit

Performed a full repository audit and brought `careeratlas`'s AI-facing
documentation up to the same standard as sibling projects `chamber-seven`
and `buildstrike-arena`, per explicit task instructions. **No application
behavior was intentionally changed** — this was a documentation-only pass;
no source files under `src/`, `prisma/`, `e2e/`, or config files were
modified.

**Files created** (16, all previously did not exist):
`PROJECT_STATE.md`, `ARCHITECTURE.md`, `FILE_MAP.md`, `FEATURES.md`,
`TASKS.md`, `ROADMAP.md`, `DECISIONS.md`, `DATABASE.md`,
`API_REFERENCE.md`, `UI_SYSTEM.md`, `SECURITY.md`, `TESTING.md`,
`DEPLOYMENT.md`, `CHANGELOG.md` (this file), `SESSION_LOG.md`,
`HANDOFF.md`.

**Files revised**:
`CLAUDE.md` — previously just `@AGENTS.md` (a one-line Next.js-16-breaking-
changes reminder); replaced with a full operating manual (project identity,
verified tech stack versions, essential commands, repository structure,
architecture summary, coding conventions, UI/design system, environment
setup, database/auth/API summaries, testing/deployment summaries, a
"DO NOT CHANGE WITHOUT REVIEW" section, a "Known issues" section, 18
numbered AI working instructions, and permanent before/after-task rules).
The original `@AGENTS.md` content is preserved verbatim at the bottom of
the file.

**Verification performed** (all passing, non-destructive):
`npm run lint` (1 harmless warning, 0 errors), `npx tsc --noEmit` (0
errors), `npm run test` (34/34 Vitest tests passing across 7 files).
**Not run**, deliberately, to avoid touching the live Neon database
configured in this working copy's `.env`/`.env.local`: `npm run build`,
`npm run test:e2e`.

**Problems discovered** (documented in `TASKS.md`/`SECURITY.md`, **not
fixed** — out of scope for a documentation-only audit):
- `/admin/data-status` and its `triggerDataImport` Server Action have no
  authentication or authorization check at all (TASK-001, the most
  significant finding).
- The "Run now" button on the admin page is offered for 4 data sources
  (World Bank, OECD, ILOSTAT, Eurostat) that have no registered connector
  implementation; clicking it throws an unhandled error (TASK-005).
- `README.md`'s "not implemented" section is stale — it still lists Census
  ACS and College Scorecard connectors as unimplemented; both were
  completed in commits `fd94d85` and `90ef269` (TASK-002).
- 3 of 10 scoring functions (`accessibility-score.ts`,
  `career-value-score.ts`, `salary-opportunity-score.ts`) have no unit
  tests (TASK-003).
- `.env.local` carries ~17 unused Vercel/Neon-integration environment
  variables not referenced anywhere in `src/` (TASK-004).
- `EducationRoiScenario`, `SalaryScenario`, and `LearningPlan`/
  `LearningPlanItem` exist as full Prisma models with no corresponding
  Server Action or page found that writes to them — likely
  schema-ahead-of-UI or genuinely dead schema (documented in `DATABASE.md`,
  not resolved).

**Confirmation**: no commits, pushes, deploys, resets, or destructive git
operations were performed. No secrets were written into any documentation
file — every environment-variable example uses a placeholder.

## Prior history (reconstructed from `git log`, not from any prior changelog)

- **2026-08-06** — `0b10636`: Add custom favicon matching the app's
  chart-mark branding.
- **2026-08-01** — `90ef269`: Add Census ACS connector: real median
  earnings by education level.
- **2026-07-31** — `fd94d85`: Add College Scorecard connector: real
  per-institution tuition.
- **2026-07-29** — `151f0f3`: Add Revelio Public Labor Statistics
  connector for real posting-growth trend.
- **2026-07-28** — `0dbb940`: Add real O*NET connector: education
  requirements + alternate job titles.
- **2026-07-27** — `fbb4dd0`: Add real BLS OEWS salary connector,
  replacing simulated data for 27 occupations.
- **2026-07-26** — `4efbc64`: Build CareerAtlas: full-stack career salary,
  transitions, education, and industry trend tracker. (The large initial
  build — nearly the entire application as it exists today.)
- **2026-07-24** — `1d06f96`: Initial commit from Create Next App.

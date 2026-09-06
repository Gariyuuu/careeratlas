# CHANGELOG.md — Repository / Engineering Changelog

No `CHANGELOG.md` existed before the 2026-08-06 audit. There is no
user-facing version-numbering scheme anywhere in the repo (`package.json`'s
`"version": "0.1.0"` has never been bumped across any commit). Entries below
are either a documentation pass's own work or reconstructed from `git log`
— nothing is invented.

## 2026-09-05 — W9 UI/UX overhaul (numbers-first design pass)

Polish pass via the `/overhaul` skill against group **W9** of
`~/Projects/OVERHAUL-GROUPS.md`. No product architecture, backend logic, schema, auth
or route changes. The group's shared decisions now live in a new portfolio design-system
layer, `~/Projects/.design-system/families/numerics.css` (v1.0), vendored here — see
`UI_SYSTEM.md`. `MASTER.css` itself was not modified.

### Added
- Numerics family layer (vendored) + `src/components/numeric/`.
- `DataTable` supports `meta: { numeric: true }`, applying right-aligned tabular
  treatment to a column's header and body cells together.
- `src/components/charts/chart-theme.ts` — shared tooltip/axis styling, `SERIES_DASH`,
  and `useChartAnimation()`.

### Fixed
- **Six colour-only up/down cues** (salary YoY, transition salary delta, education
  compare, role-detail related list, dashboard trending/declining, trends leaderboards)
  were green/red text with no shape cue. All now use `<Delta>` with an explicit
  screen-reader phrasing.
- **`salary-trend-chart` gave its three scenario lines the same `"4 3"` dash**, leaving
  them distinguished by hue alone — a MASTER chart-rule violation. Each now carries its
  own pattern.
- All four Recharts wrappers now honour `prefers-reduced-motion`.
- Clickable table rows responded only to a mouse; they are now keyboard-operable
  (`role="link"`, `tabIndex`, Enter/Space).
- 13 × `text-[10px]` raised to the 12px floor; 6 × `transition-all` replaced.

## 2026-08-17 — Documentation re-verification (onboarding pass)

Onboarding-mode pass: arrived at the repo, found the existing 19-file
memory doc set had not been touched since `d4c16f7`/`6ebad6b`
(2026-08-06/07) while 6 more commits of real product work had landed
(`80a7961` through `63a5a6f`, 2026-08-13 to 2026-08-16). Re-verified every
open finding against current code and git history and corrected the
resulting drift. No application code was touched.

**Most significant correction**: the doc set still described TASK-001
(missing auth on `/admin/data-status`/`triggerDataImport`, the headline
finding of the entire 2026-08-06 security review) as open. It had actually
been fixed 4 days earlier, in commit `80a7961` — `triggerDataImport` now
requires `isAdminSession()` (new `src/lib/admin-auth.ts`, gated by an
`ADMIN_EMAILS` allowlist that fails closed); `/admin/data-status` itself
stays intentionally public by product decision. Corrected in `CLAUDE.md`,
`SECURITY.md`, `TASKS.md`, `PROJECT_STATE.md`, `HANDOFF.md`, `FEATURES.md`,
`API_REFERENCE.md`, and `FILE_MAP.md`.

**Other corrections**:
- `TASKS.md` TASK-006 (delete-account confirmation, previously "unable to
  verify") — read `src/components/delete-account-button.tsx` in full; it already wraps the
  delete in an `AlertDialog`. Resolved, not a bug.
- Two new, previously-undocumented features from the same commit range now
  described: OpenGraph/Twitter metadata + generated `opengraph-image` +
  `src/app/robots.ts` + `src/app/sitemap.ts` (`fb63183`); a cosmetic bookmark-pop animation
  on `src/components/save-career-button.tsx` (`fb450a0`). Neither changes app behavior in
  a way that affects other findings.
- `CLAUDE.md`'s "no `console.*` in `src/`" convention line was itself
  stale — `80a7961` deliberately added one `console.warn` (an
  unauthorized-admin-action denial). Documented as an intentional, sole
  exception rather than silently left contradicting the code.
- Git state (`CLAUDE.md`, `PROJECT_STATE.md`, `HANDOFF.md`) updated from
  HEAD `d4c16f7`/9 commits to HEAD `63a5a6f`/16 commits.

**New finding (not previously flagged)**: `.env.example`'s
`CENSUS_API_KEY`/`COLLEGE_SCORECARD_API_KEY` comments still say "not yet
wired to a connector" — the same staleness as `README.md`'s TASK-002, but
in a config file, predating both connector implementations and never
caught before. Tracked as new `TASKS.md` TASK-007.

**Re-verified unchanged/still open**: `npm run lint` (1 harmless warning),
`npx tsc --noEmit` (0 errors), `npm run test` (34/34) all still pass;
TASK-002 (`README.md` still stale), TASK-003 (3 of 10 scoring functions
still untested), TASK-004 (~17 unused env vars in `.env.local`), TASK-005
(unhandled error on "Run now" for unregistered sources) all re-confirmed
genuinely still open. No secrets found in any tracked file or
documentation file; no application code changed.

Full session detail: `SESSION_LOG.md`'s 2026-08-17 entry.

## 2026-08-13 to 2026-08-16 — Product work (not a documentation pass, reconstructed from `git log`)

- **2026-08-16** — `63a5a6f`: merge `chore/polish` into `main`.
- **2026-08-15** — `fb450a0`: add a cosmetic CSS "pop" animation to the
  save-career button.
- **2026-08-15** — `498fd2c`: merge `chore/metadata-og` (site metadata, OG
  card, robots, sitemap) into `main`.
- **2026-08-13** — `2b26360`: merge `chore/admin-auth` (gate data-import
  behind an admin allowlist) into `main`.
- **2026-08-13** — `fb63183`: add OpenGraph metadata, `src/app/sitemap.ts`,
  `src/app/robots.ts`.
- **2026-08-13** — `80a7961`: fix TASK-001 — gate `triggerDataImport`
  behind a new `ADMIN_EMAILS` allowlist (`src/lib/admin-auth.ts`) rather
  than adding auth to the status page itself; also adds
  `src/lib/sanitize.ts` for rendered error/warning text. Full rationale in
  the commit message; summarized in `SECURITY.md`.

## 2026-08-07 — Documentation re-verification / final transfer checkpoint

Follow-up pass re-verifying the 2026-08-06 doc set against the real repo
state, per an explicit "final transfer checkpoint" task. No application
code was touched.

**Verified unchanged/still accurate**: `git status` clean and up to date
with `origin/main`; `npm run lint` (1 harmless warning), `npx tsc --noEmit`
(0 errors), `npm run test` (34/34) all still pass; TASK-001
(admin-page/action auth gap), TASK-002 (`README.md` still stale re:
Census ACS/College Scorecard), and TASK-003 (3 of 10 scoring functions
still untested) all re-confirmed as genuinely still open. No secrets found
in any tracked file or documentation file.

**Fixed (stale docs)**:
- `PROJECT_STATE.md` and `CLAUDE.md` described HEAD as `0b10636` and "8
  commits", but the 2026-08-06 doc set was itself committed afterward as
  `d4c16f7` (9th commit), which the docs never got updated to reflect —
  corrected in both files, plus a corrective note in `SESSION_LOG.md`.
- `DATABASE.md`, `HANDOFF.md`, `FILE_MAP.md`, and `CLAUDE.md` (3 places)
  all claimed the Prisma schema has "37 models"; a direct count
  (`grep -c "^model " prisma/schema.prisma`) returns **51**. Corrected in
  all 4 files.
- `TASKS.md`'s "Recently completed" list and `HANDOFF.md`'s "Prompt for the
  next Claude Code account" section refreshed to match.

Full session detail: `SESSION_LOG.md`'s 2026-08-07 entry.

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
- 3 of 10 scoring functions (`src/lib/scoring/accessibility-score.ts`,
  `src/lib/scoring/career-value-score.ts`, `src/lib/scoring/salary-opportunity-score.ts`) have no unit
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

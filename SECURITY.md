# SECURITY.md — Defensive Security Review

This is a defensive, read-only review performed by static code inspection
during the 2026-08-06 documentation audit. **No destructive or exploit
testing was performed** — no attempt was made to actually call the admin
action, no fuzzing, no live network requests against production. All
findings below are traced from source code.

**2026-08-17 update**: this review's headline finding (missing auth on
`/admin/data-status`/`triggerDataImport`) was fixed in commit `80a7961`
(2026-08-13, "fix: gate the admin data-import action, not the status page
(TASK-001)") — verified by reading the current `src/lib/actions/admin.ts`
and the new `src/lib/admin-auth.ts` directly. The rest of this file's
findings (rate limiting, email verification, no centralized auth gate,
etc.) were re-checked and remain accurate/still open as of this pass. See
"Admin access" and "Recommended fixes" below for the corrected detail —
sections describing this as an open, unfixed gap have been updated in
place rather than left contradicting each other.

## Authentication boundaries

- Single Credentials (email+password) provider, `src/lib/auth.ts`. Password
  hashing: bcrypt, cost factor 10 (`bcrypt.hash(password, 10)` in
  `src/lib/actions/auth.ts`). Comparison: `bcrypt.compare`. No plaintext
  password is ever stored or logged (confirmed: no `console.log` calls
  exist anywhere in `src/`, and `passwordHash` is the only password-related
  field persisted).
- Session: JWT strategy (`session: { strategy: "jwt" }`), `trustHost: true`.
  No explicit `AUTH_SECRET`/JWT expiry customization was found — relies on
  NextAuth's defaults.
- Sign-in error messages are generic ("Invalid email or password.") — no
  user-enumeration leak via differing error text for "no such user" vs.
  "wrong password."
- **No email verification flow found.** `User.emailVerified` exists in the
  schema but no code path sets it.
- **No password-reset flow found** under `src/app/` or `src/lib/actions/`.
- **No rate limiting on sign-in/sign-up** — no dependency, no hand-rolled
  throttle found. A credential-stuffing or brute-force attempt against
  `signInAction` would not be slowed by the application itself (NextAuth
  itself does not rate-limit Credentials attempts by default either).

## Authorization boundaries

- No `middleware.ts` exists — no route is protected by default; every page
  or Server Action that needs identity calls `auth()` itself.
- Verified auth-gated: `/profile` mutations (`upsertProfile`),
  `/settings`'s `deleteAccountAction`, `toggleSavedOccupation`,
  `saveComparison`/`deleteSavedComparison`, `GET /api/export/saved`.
- **[Outdated as of `80a7961`, 2026-08-13]** This bullet previously read
  "not auth-gated" for both `/admin/data-status` and `triggerDataImport`.
  Re-verified 2026-08-17: **`/admin/data-status` (the page) is still
  intentionally public** (a deliberate product decision, per that commit's
  message — connector status/env-var-names/public indicators are treated
  as a legitimate public surface). **`triggerDataImport` (the Server
  Action) is now gated** — it calls `isAdminSession()`
  (`src/lib/admin-auth.ts`) first and denies (returns a failed
  `ImportReport`, does not throw) if the caller's session email isn't in
  the `ADMIN_EMAILS` allowlist. Verified by reading both files directly.
- `deleteSavedComparison` correctly scopes its delete by both `id` AND
  `userId` (`deleteMany({ where: { id, userId } })`), which prevents an
  authenticated user from deleting another user's comparison even if they
  guess/obtain its `id` — a well-implemented ownership check, worth calling
  out as a positive example.
- Still no `User.role` field or Prisma-level role/permission model — the
  fix above is an **env-var allowlist**, not a schema-backed role, per the
  commit's explicit note that it avoids a schema change (see `DECISIONS.md`
  DEC-012 for the full rationale and its consequences).

## Protected routes

| Route/Action | Auth required? | Verified how |
|---|---|---|
| `/profile` (`upsertProfile`) | Yes | explicit `auth()` check, returns error object |
| `/settings` (`deleteAccountAction`) | Yes | explicit `auth()` check |
| `toggleSavedOccupation` | Yes | explicit `auth()` check |
| `saveComparison` / `deleteSavedComparison` | Yes | explicit `auth()` check |
| `GET /api/export/saved` | Yes | explicit `auth()` check, 401 response |
| `/admin/data-status` (page) | **No — intentionally public** | product decision, `80a7961` commit message; no `auth()` call, by design |
| `triggerDataImport` | **Yes, as of `80a7961`** | `isAdminSession()` (`ADMIN_EMAILS` allowlist, fails closed) |
| `GET /api/cron/update-trends` | Conditional | only if `CRON_SECRET` env var is set |
| All other `(app)` pages (dashboard, salary, careers, roles, transitions, education, trends, compare, methodology, data-sources) | No (by design) | app is meant to be browsable anonymously; personalization degrades gracefully |

## Secret handling

- Secrets read: `DATABASE_URL`, `AUTH_SECRET`, `CRON_SECRET`,
  `BLS_API_KEY`, `CENSUS_API_KEY`, `COLLEGE_SCORECARD_API_KEY` — all read
  via `process.env.*` inside server-only files (`src/lib/prisma.ts`,
  `src/lib/auth.ts`, `src/app/api/cron/update-trends/route.ts`,
  `src/lib/providers/*.ts`). None found referenced from any `"use client"`
  file.
- `.env`, `.env.local` are gitignored (`.env*` excluded except
  `.env.example` — confirmed via `git ls-files`, which shows only
  `.env.example` tracked).
- This audit did not write any real secret value into any documentation
  file — every example in `CLAUDE.md`/this file uses placeholders only.
  `DATABASE_URL` values were only ever read in masked form (password
  portion redacted) during investigation.
- `src/lib/providers/census-acs-provider.ts` and `src/lib/providers/college-scorecard-provider.ts` both build
  their outbound request URL with `url.searchParams.set("key"/"api_key",
  process.env.X!)` — the key goes into the URL query string of an
  **outbound, server-to-server** request only (never returned to the
  client, never logged), so this is standard practice for these specific
  public government APIs (which document key-in-query-string as their
  expected auth method) rather than a leak.

## Environment variables — client-exposed vs. server-only

**All** env vars used in this app are server-only. No `NEXT_PUBLIC_*`
variables exist anywhere in `.env.example`, `.env`, `.env.local`, or `src/`
(confirmed via grep) — meaning **nothing is deliberately exposed to the
client bundle**. This is a clean, low-risk posture on this dimension.

## Input validation

- Zod is used for the two highest-stakes inputs: `signInAction`/
  `signUpAction` (email format, password length 8-200).
- `upsertProfile` uses manual type coercion (`num()`/`str()` helpers) with
  **no range or format validation** — e.g. `expectedGraduationYear` or
  `salaryGoal` could be set to a negative number, an absurdly large number,
  or (for string fields) arbitrary length text. Low severity (self-service
  profile data, not exploitable beyond a user corrupting their own
  record), but worth tightening if this data is ever surfaced in aggregate
  reports.
- `toggleSavedOccupation`/`saveComparison` validate existence
  (`findUnique`) before acting, not just trusting the client-supplied slug/
  id blindly.
- `GET /api/search`'s `q` parameter has no length cap — an extremely long
  query string would still trigger a full in-memory scan of all
  occupations before filtering; low real-world risk given no rate limiting
  exists to prevent repeated abuse either, but the two compound.

## Output encoding / XSS risk

- React's default JSX escaping is relied on throughout — no
  `dangerouslySetInnerHTML` usage was found anywhere in `src/` during this
  audit's reads (not exhaustively grepped across every single file, but
  none surfaced in any component read).
- CSV export (`GET /api/export/saved`) escapes values via a local
  `csvEscape()` (doubles embedded quotes, wraps in quotes if the value
  contains a comma/quote/newline) — mitigates CSV-formula-injection-style
  breakage of the exported file's structure, though it does not
  specifically neutralize Excel/Sheets "formula injection" (a value
  starting with `=`/`+`/`-`/`@` is not prefixed/escaped against being
  interpreted as a formula by the receiving spreadsheet app). Low severity
  for a self-export-your-own-data feature, but a known general CSV-export
  gotcha worth flagging.

## SQL injection risk

None found — all database access goes through Prisma's query builder
(`prisma.<model>.<method>(...)`); no raw SQL (`$queryRaw`/`$executeRaw`) was
found anywhere in `src/` or `prisma/seed.ts`.

## CSRF protections

Relies on Next.js Server Actions' built-in CSRF protection (same-origin
enforcement via the framework, standard for App Router Server Actions) and
NextAuth's own CSRF token handling for its auth endpoints. No custom CSRF
middleware exists, none is needed given the above — this is a reasonable,
current-best-practice posture for this framework combination, not a gap.

## File upload risks

None — no file upload functionality exists anywhere in the app.

## Webhook verification

Not applicable — the app has no incoming webhook receivers (see
`API_REFERENCE.md`'s "What does NOT exist").

## Rate limiting

**None exists anywhere** — not on sign-in/sign-up, not on `/api/search`,
not on `/api/cron/update-trends`. `triggerDataImport` is now auth-gated
(`80a7961`) but still has **no rate limit** on top of that gate — an
authorized admin (or anyone who obtains admin-allowlisted credentials)
could still hammer it repeatedly. Real-world severity is low (no cost to
this app beyond noise, and the external APIs are public/free).

## Admin access

**[Outdated — fixed 2026-08-13, re-verified 2026-08-17]** This section
previously described `/admin/data-status` and `triggerDataImport` as
having zero access control. Current state:
- `/admin/data-status` (`src/app/(app)/admin/data-status/page.tsx`)
  **remains intentionally public** — a deliberate product decision (see
  `80a7961`'s commit message): connector status, env var *names*, and
  public economic indicators are treated as a legitimate public surface.
  Anyone can still view last success/attempt times, rows imported/
  rejected, quality-check warnings, and (now sanitized via
  `sanitizeErrorText()`) error messages.
- `triggerDataImport` (`src/lib/actions/admin.ts`) **now requires**
  `isAdminSession()` to return `true` — the caller's session email must be
  in the `ADMIN_EMAILS` allowlist (comma-separated, case-insensitive,
  fails closed if unset/empty). `RunImportButton` is also hidden from
  non-admins client-side, but the server-side check in the action is the
  real gate (verified: the check is inside `triggerDataImport` itself, not
  only in the UI).
- **Residual gaps**: still no `User.role` schema field (the fix is an
  env-var allowlist, not a DB-backed role); still no rate limiting on the
  now-gated action; the daily Vercel Cron path
  (`runAllConfiguredImports()` → `runDataImport()`) never goes through
  `triggerDataImport`/`isAdminSession()` at all, so it is unaffected by
  (and doesn't need) this change — confirmed via the commit's own grep of
  every `triggerDataImport` reference.
- **Recommended fix**: TASK-001 is closed. See `TASKS.md` TASK-005 for the
  remaining open admin-page issue (unhandled error for unregistered
  sources).

## Database policies

No Row-Level Security policies exist (plain Prisma/Postgres, not
Supabase-managed RLS) — all authorization is enforced in application code.
This means a future direct-database-access path (a raw SQL admin tool,
a different app connecting to the same DB, a Prisma Studio session left
open) would have no database-level safety net; every access path must
re-implement the same authorization logic the Next.js app does. Not a bug
in this app specifically, but a property worth knowing before adding any
second consumer of this database.

## Logging of sensitive data

**[Outdated]** This previously said no `console.*` calls exist anywhere in
`src/`. As of `80a7961` (2026-08-13) there is exactly **one**:
`triggerDataImport` (`src/lib/actions/admin.ts`) calls
`console.warn(...)` on an unauthorized-access denial, logging only the
requested `slug` — no secret, session token, or user-identifying data is
included in that log line (verified by reading the call site). This was a
deliberate, documented exception (see the commit message and `CLAUDE.md`),
not a regression of the "no console.* in src/" convention — it's the sole
instance and was added specifically so an auth denial is distinguishable
from a real provider failure in logs. Prisma's own internal query-error
logging
(`src/lib/prisma.ts`: `["error", "warn"]` in dev, `["error"]` in
production) could theoretically include query parameter values in error
output depending on Prisma's own logging verbosity, but this is standard
ORM behavior, not something this app's code controls beyond the log-level
setting shown.

## Dependency concerns

- `next-auth@5.0.0-beta.32` — still a beta release of NextAuth v5. Beta
  software can carry unpatched issues that a stable release wouldn't; worth
  monitoring for a stable v5 release to upgrade to.
- No automated dependency-vulnerability scanning config was found in the
  repo (no `.github/dependabot.yml`, no Snyk config) — **unable to verify**
  whether the current dependency tree has any known CVEs without running an
  actual `npm audit` (not run this audit, as it would require network
  access this audit didn't attempt to characterize as safe/unsafe either
  way — flagged as unverified rather than assumed clean).
- `package.json`'s `allowScripts` field (see `DECISIONS.md` DEC-011)
  restricts which dependencies can run install-time scripts — a positive
  security practice already in place.

## Production security gaps (headline list)

1. ~~`/admin/data-status` + `triggerDataImport` have no auth/authz`~~ —
   **fixed `80a7961` (2026-08-13)**, TASK-001 closed. `/admin/data-status`
   itself stays public by design; `triggerDataImport` is now gated by an
   `ADMIN_EMAILS` allowlist.
2. **No rate limiting anywhere** — still open, including on the now-gated
   `triggerDataImport`, and a general hardening gap for sign-in/sign-up.
3. **No centralized auth middleware** — still open; structural risk of a
   future route repeating the pattern TASK-001 just fixed one instance of.
4. **No email verification / password reset** — not a vulnerability per se,
   but means a typo'd or lost-access email has no recovery path today, and
   there's no proof-of-email-ownership step at signup.
5. **`AUTH_SECRET`'s dev placeholder** (`"dev-only-insecure-secret-change-
   me"` in `.env.example`) must never reach production — this is
   documented in the file itself as a placeholder, and `README.md` /
   `CLAUDE.md` both instruct generating a real one, but there's no runtime
   check in the app itself that refuses to boot with an insecure/default
   secret in production. Worth adding as a startup assertion if this app
   is ever deployed by someone less careful than the original developer.

## Recommended fixes (priority order)

1. ~~Add an `auth()` check to `/admin/data-status` and
   `triggerDataImport`.~~ **Done — `80a7961`, TASK-001 closed 2026-08-13.**
2. Add basic rate limiting to `signInAction`/`signUpAction` at minimum, and
   consider it for `triggerDataImport` and `/api/search` too.
3. Consider a `middleware.ts`-based or shared-helper-based auth gate so new
   routes can't as easily repeat gap #1.
4. Add a runtime guard that refuses to start (or at least logs a loud
   warning) in production if `AUTH_SECRET` is unset or equals the
   `.env.example` placeholder value.
5. Add CSV formula-injection escaping (prefix values starting with
   `=+-@` with a `'`/tab) to `GET /api/export/saved`, low-priority hardening.
6. Consider email verification before treating an account as fully trusted,
   if this app ever handles anything higher-stakes than career-planning
   data.

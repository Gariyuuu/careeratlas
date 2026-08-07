# SECURITY.md — Defensive Security Review

This is a defensive, read-only review performed by static code inspection
during the 2026-08-06 documentation audit. **No destructive or exploit
testing was performed** — no attempt was made to actually call the
unauthenticated admin action, no fuzzing, no live network requests against
production. All findings below are traced from source code.

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
- Verified **NOT** auth-gated (public by omission, not by design):
  **`/admin/data-status` (page) and `triggerDataImport` (Server Action)** —
  no `auth()` call anywhere in either file's code path. This is the
  headline finding of this review.
- `deleteSavedComparison` correctly scopes its delete by both `id` AND
  `userId` (`deleteMany({ where: { id, userId } })`), which prevents an
  authenticated user from deleting another user's comparison even if they
  guess/obtain its `id` — a well-implemented ownership check, worth calling
  out as a positive example alongside the admin gap.
- No role/permission model exists anywhere in the schema — "admin" is
  purely a route name (`/admin/data-status`), not an enforced concept. There
  is no `User.role` field, no allowlist, nothing.

## Protected routes

| Route/Action | Auth required? | Verified how |
|---|---|---|
| `/profile` (`upsertProfile`) | Yes | explicit `auth()` check, returns error object |
| `/settings` (`deleteAccountAction`) | Yes | explicit `auth()` check |
| `toggleSavedOccupation` | Yes | explicit `auth()` check |
| `saveComparison` / `deleteSavedComparison` | Yes | explicit `auth()` check |
| `GET /api/export/saved` | Yes | explicit `auth()` check, 401 response |
| **`/admin/data-status` (page)** | **No** | no `auth()` call found |
| **`triggerDataImport`** | **No** | no `auth()` call found |
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
- `census-acs-provider.ts` and `college-scorecard-provider.ts` both build
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
not on `/api/cron/update-trends`, not on `triggerDataImport`. Combined with
the missing auth on the admin action, this means an anonymous actor could
in principle hammer `triggerDataImport` repeatedly, generating excessive
outbound calls to BLS/O*NET/Revelio (and Census/College Scorecard if keyed)
and excessive `DataImportRun` rows. Real-world severity is low (no cost to
this app beyond noise, and the external APIs are public/free), but it's the
kind of gap that compounds with the auth issue.

## Admin access

**This is the headline finding of this review.** `/admin/data-status`
(`src/app/(app)/admin/data-status/page.tsx`) and `triggerDataImport`
(`src/lib/actions/admin.ts`) have **zero access control**:
- Anyone who navigates to `/admin/data-status` (linked from the public
  landing page's footer) sees connector operational internals: last
  success/attempt times, rows imported/rejected, quality-check warnings,
  and raw error messages from failed import attempts.
- Anyone can click "Run now" for any connector, which calls
  `triggerDataImport(slug)` server-side with no identity check whatsoever —
  not even "is this user signed in," let alone "is this user an admin."
- **Severity**: Low-to-Medium in practice for this specific app (no
  destructive action results — worst case is wasted external API calls,
  minor `DataImportRun` table bloat, and information disclosure of
  operational status/error text that isn't itself sensitive). **But** it is
  a textbook missing-authorization bug, and the pattern (no centralized
  gate, easy to forget on a new route) could recur on a future, higher-
  stakes admin feature if not fixed at the root.
- **Recommended fix**: see `TASKS.md` TASK-001.

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

No `console.log`/`console.error`/`console.warn` calls exist anywhere in
`src/` (confirmed by repo-wide grep) — so there's no risk of this app's own
code accidentally logging a password, session token, or API key to
stdout/a log aggregator. Prisma's own internal query-error logging
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

1. **`/admin/data-status` + `triggerDataImport` have no auth/authz** (see
   above) — the single most important finding.
2. **No rate limiting anywhere** — compounds gap #1 and is a general
   hardening gap for sign-in/sign-up too.
3. **No centralized auth middleware** — structural risk of repeating gap #1
   on a future route.
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

1. Add an `auth()` check (at minimum "must be signed in"; ideally a real
   role check) to `/admin/data-status` and `triggerDataImport`. (TASK-001)
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

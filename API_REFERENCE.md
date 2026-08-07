# API_REFERENCE.md

CareerAtlas has no separate REST/GraphQL API layer — most functionality is
Server Component reads and Server Action writes, invisible as "endpoints" in
the traditional sense. This file covers the actual HTTP route handlers under
`src/app/api/`, plus every Server Action, since Server Actions are the
closest thing this app has to a mutation API.

## HTTP route handlers (`src/app/api/`)

### `GET /api/search`
**Source**: `src/app/api/search/route.ts`.
**Purpose**: role/title/alias search, powers the global command-K search and
the compare-selector's role picker.
**Auth**: none — fully public.
**Params**: query string `q` (string, trimmed/lowercased; empty/whitespace
returns `{ results: [] }` immediately without a DB query).
**Response**: `200 { results: { slug, title, industry, matchedAlias? }[] }`
(max 10, ranked exact → alias-exact → title-prefix → substring).
**Validation**: none beyond the empty-string short-circuit — no length cap
on `q`, no rate limiting.
**Side effects**: none (read-only).
**DB ops**: one `prisma.occupation.findMany` selecting slug/title/jobFamily
chain/aliases for **every** occupation, then filters/scores/sorts
in-memory (see `DECISIONS.md` DEC-010 for why).
**External calls**: none.
**Errors**: none explicitly handled — an unexpected Prisma error would
surface as a Next.js default 500.

### `GET /api/export/saved`
**Source**: `src/app/api/export/saved/route.ts`.
**Purpose**: CSV export of the signed-in user's saved occupations.
**Auth**: required — calls `auth()`; returns `401 { error: "not_signed_in"
}` if no session.
**Params**: none.
**Response**: `200`, `Content-Type: text/csv`,
`Content-Disposition: attachment; filename=careeratlas-saved-careers.csv`,
body columns `title,industry,job_family,saved_at,note`.
**Validation**: CSV values are escaped via a local `csvEscape()` helper
(quotes doubled, field wrapped in quotes if it contains a comma/quote/
newline) — mitigates CSV injection/formatting breakage, not a security
control against malicious input beyond formatting correctness.
**Side effects**: none (read-only).
**DB ops**: `prisma.savedOccupation.findMany` scoped to
`session.user.id`, with nested `include` through
occupation→jobFamily→subindustry→industry.
**External calls**: none.
**Errors**: `401` for unauthenticated; otherwise no explicit error handling.

### `GET /api/cron/update-trends`
**Source**: `src/app/api/cron/update-trends/route.ts`.
**Purpose**: runs every *configured* data connector (`bls-ces`,
`bls-oews`, `onet`, `revelio-rpls` always; `census-acs`,
`college-scorecard` if their API keys are set).
**Auth**: **conditional** — if `process.env.CRON_SECRET` is set, requires
header `Authorization: Bearer <CRON_SECRET>` or returns `401 { error:
"unauthorized" }`. **If `CRON_SECRET` is unset (the local-dev default),
this endpoint is completely unauthenticated.**
**Params**: none.
**Response**: `200 { ranAt: ISOString, results: { slug, status }[] }`.
**Validation**: none beyond the bearer-token check.
**Side effects**: writes `DataImportRun`/`DataQualityCheck` rows, updates
`DataSource.status`, and (for successful providers) writes real
occupation/education/economic-indicator data — i.e. this endpoint has real,
if benign, write side effects and makes outbound HTTP calls to BLS/O*NET/
Revelio (and Census/College Scorecard if keyed).
**DB ops**: see `runAllConfiguredImports` → `runDataImport` →
per-provider `upsertData` in `DATABASE.md`/`FILE_MAP.md`.
**External calls**: BLS public API (2 series), O*NET database download,
Revelio public CSVs, optionally Census ACS API and College Scorecard API.
**Errors**: individual provider failures are caught inside `runProvider`
(`src/lib/providers/types.ts`) and converted to a `status: "failed"` entry
in the response rather than a 500 — the endpoint itself always returns 200
if it got past the auth check, even if every connector failed.
**Scheduling**: `vercel.json` triggers this daily at `0 6 * * *` via Vercel
Cron, which automatically sends the `CRON_SECRET` as a bearer token when
configured in the Vercel Cron UI (per `README.md`).

### `ALL /api/auth/[...nextauth]`
**Source**: `src/app/api/auth/[...nextauth]/route.ts` — thin re-export of
`handlers` from `src/lib/auth.ts` (`export const { GET, POST } = handlers`
pattern, standard for NextAuth v5's route handler integration).
**Purpose**: NextAuth's own sign-in/sign-out/session/callback machinery for
the Credentials provider.
**Auth**: this IS the auth system — no separate check.
**Details**: see `ARCHITECTURE.md`'s "Authentication flow" and
`SECURITY.md`.

## Server Actions (`src/lib/actions/*.ts`, all `"use server"`)

These aren't HTTP-addressable in the traditional sense (Next.js compiles
each into a POST to an internal action-id endpoint), but they're the
mutation surface of the app and worth documenting the same way.

### `signInAction(prevState, formData)` — `src/lib/actions/auth.ts`
**Purpose**: email+password sign-in.
**Auth**: none required (this is how you get one).
**Params (FormData)**: `email` (string, Zod `.email()`), `password`
(string, Zod `.min(1)`).
**Response**: on validation failure, `{ error: "Enter a valid email and
password." }`; on `AuthError`, `{ error: "Invalid email or password." }`
(no user-enumeration detail); on success, calls NextAuth `signIn(...)`
which redirects to `/dashboard` (throws a redirect internally, so no
explicit return on the success path).
**Side effects**: establishes a session (JWT cookie).
**DB ops**: none directly (delegated to `Credentials.authorize` in
`src/lib/auth.ts`, which does one `prisma.user.findUnique`).

### `signUpAction(prevState, formData)` — `src/lib/actions/auth.ts`
**Purpose**: account creation.
**Auth**: none required.
**Params (FormData)**: `name` (1-100 chars), `email` (Zod `.email()`),
`password` (8-200 chars).
**Response**: `{ error: <first Zod issue message> }` on validation failure;
`{ error: "An account with that email already exists." }` on duplicate
(case-insensitive email check); on success, creates the user then signs
in and redirects to `/dashboard`; `{ error: "Account created, but sign-in
failed. Try signing in manually." }` in the edge case where creation
succeeds but the immediate sign-in throws.
**Side effects**: creates a `User` row (`passwordHash` via
`bcrypt.hash(password, 10)`), then establishes a session.
**DB ops**: `prisma.user.findUnique` (dup check), `prisma.user.create`.

### `deleteAccountAction()` — `src/lib/actions/account.ts`
**Purpose**: permanently delete the signed-in user's account.
**Auth**: required — `{ error: "not_signed_in" }` if no session.
**Params**: none.
**Side effects**: `prisma.user.delete` (cascades to all owned data per
schema, see `DATABASE.md`), then `signOut({ redirectTo: "/" })`.
**Note**: irreversible; see `TASKS.md` TASK-006 for the unverified
confirmation-dialog question.

### `upsertProfile(prevState, formData)` — `src/lib/actions/profile.ts`
**Purpose**: create/update the signed-in user's `UserProfile`.
**Auth**: required — `{ error: "not_signed_in" }` if no session.
**Params (FormData)**: `educationStatus`, `currentIndustry`,
`currentRoleSlug`, `location`, `expectedGraduationYear` (number),
`skillsCsv`, `salaryGoal` (number), `workArrangementPref`, `currentSalary`
(number), `yearsExperience` (number), `degreeLevel`, `major`,
`companySize` — all optional, coerced via local `num()`/`str()` helpers,
**no Zod schema, no range/format validation** beyond type coercion.
**Response**: `{ success: true }` on success.
**Side effects**: `revalidatePath("/profile")`,
`revalidatePath("/dashboard")`.
**DB ops**: `prisma.userProfile.upsert`.

### `toggleSavedOccupation(occupationSlug)` — `src/lib/actions/saved-occupations.ts`
**Purpose**: save/unsave an occupation.
**Auth**: required — `{ error: "not_signed_in" }` if no session.
**Params**: `occupationSlug: string`.
**Response**: `{ saved: boolean }` or `{ error: "not_signed_in" |
"not_found" }`.
**Side effects**: `revalidatePath("/saved")`,
`revalidatePath(`/roles/${occupationSlug}`)`.
**DB ops**: `prisma.occupation.findUnique` (existence check),
`prisma.savedOccupation.findUnique` (toggle check), then
`create`/`delete`.

### `isOccupationSaved(occupationSlug)` — `src/lib/actions/saved-occupations.ts`
**Purpose**: read-only helper — is this occupation saved by the current
user (or `false` if anonymous/not found).
**Auth**: none required (degrades to `false`).
**DB ops**: `prisma.occupation.findUnique`,
`prisma.savedOccupation.findUnique`.

### `saveComparison(slugs)` — `src/lib/actions/comparisons.ts`
**Purpose**: persist a saved/shareable career comparison.
**Auth**: required — `{ error: "not_signed_in" }`.
**Params**: `slugs: string[]` — `{ error: "empty" }` if `[]`. **No explicit
cap enforcement at the action level** — the schema/UI convention is "max
5" but this function does not itself reject a 6+ element array.
**Response**: `{ ok: true }` or `{ error }`.
**Side effects**: `revalidatePath("/saved")`.
**DB ops**: `prisma.savedComparison.create` with a generated
`shareSlug` (`cmp-${Math.random().toString(36).slice(2, 9)}` — **not
cryptographically random**, collision-checked nowhere, acceptable for a
low-stakes shareable-link use case but worth knowing).

### `deleteSavedComparison(id)` — `src/lib/actions/comparisons.ts`
**Purpose**: delete a saved comparison.
**Auth**: implicitly enforced via the query itself — silently no-ops if not
signed in (`if (!session?.user?.id) return;`) rather than returning an
error object.
**DB ops**: `prisma.savedComparison.deleteMany({ where: { id, userId }
})` — scoped by both `id` and `userId`, so a user cannot delete another
user's comparison even by guessing an id (ownership enforced at the query
level, correctly).

### `triggerDataImport(slug)` — `src/lib/actions/admin.ts`
**Purpose**: manually run one data connector.
**Auth**: **NONE — no `auth()` call at all.** See `SECURITY.md` and
`TASKS.md` TASK-001.
**Params**: `slug: string`.
**Response**: an `ImportReport` (`{ status, rowsImported, rowsRejected,
warnings, errorMessage? }`), or an **unhandled thrown Error** if `slug`
doesn't match a registered provider (see `TASKS.md` TASK-005).
**Side effects**: `revalidatePath("/admin/data-status")`, plus everything
`runDataImport` does (DB writes, outbound HTTP calls).
**DB ops / external calls**: delegated to `runDataImport` — see
`GET /api/cron/update-trends` above.

## What does NOT exist

- No GraphQL endpoint.
- No public REST API beyond the 4 route handlers above (no `/api/v1/*`,
  no OpenAPI/Swagger spec).
- No webhook receivers (nothing verifies incoming webhook signatures because
  there are no incoming webhooks — the 6 data connectors are all
  outbound-only `fetch` calls initiated by this app).
- No file upload endpoint.
- No rate limiting on any route or action (confirmed: no
  `@upstash/ratelimit` or similar dependency in `package.json`, no
  hand-rolled rate-limit logic found in any route/action file read).
- No API authentication scheme beyond NextAuth session cookies and the
  optional `CRON_SECRET` bearer token — no API keys issued to end users, no
  OAuth client-credentials flow for third parties.

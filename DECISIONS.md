# DECISIONS.md — Architectural Decision Log

Every entry is labeled **Verified** (stated explicitly somewhere in the
repo — a code comment, `README.md`, or an unambiguous structural fact) or
**Inferred** (this audit's best-effort reconstruction of *why*, based on
what the code does — never presented as the original developer's actual
stated reasoning, since no design-decision log existed before this audit).

### DEC-001 — Enum-like fields are plain `String`, not native Postgres enums
**Status**: Verified (explicit comment at the top of `prisma/schema.prisma`
and in `README.md`'s "Database setup" section).
**Decision**: every enum-like field (`dataStatus`, `workArrangement`,
`degreeLevel`, `category`, etc.) is a plain `String` column, validated only
by convention/comments, not a Prisma-native enum or Postgres `CHECK`
constraint.
**Reasoning (verified, from the schema's own header comment)**: "this
schema intentionally avoids Postgres-only features (native scalar-list
columns, native enums)... so it can also run unchanged on SQLite for
disconnected local development if needed."
**Consequence**: no database-level guarantee that e.g. `dataStatus` is
always one of the 4 valid values — correctness relies entirely on
application code (seed script, provider `upsertData` methods) writing valid
values. No invalid value was found in any code path read during this audit.

### DEC-002 — Every data-bearing row carries a `dataStatus` field, capped-confidence for simulated data
**Status**: Verified (schema comment, `src/lib/scoring/confidence.ts`
comment, `README.md`'s "Reported vs. estimated vs. forecast vs. simulated"
section, and the UI's `data-status-badge.tsx`).
**Decision**: `computeConfidence()` hard-caps simulated data's confidence
score at `0.55` "regardless of sample size" (direct quote from the
function's own comment), and every simulated figure gets a visible amber
badge.
**Reasoning (verified)**: to guarantee simulated placeholder data can never
be mistaken for verified real-world data, even as more real connectors are
added over time.
**Consequence**: this is the single most load-bearing design principle in
the app — see `CLAUDE.md`'s "DO NOT CHANGE WITHOUT REVIEW" and instruction
#8.

### DEC-003 — Deterministic, seeded RNG for all simulated data
**Status**: Verified (`src/lib/seed-data/rng.ts`'s existence and its use
throughout `prisma/seed.ts` via `rngSeeded("category", ...identifiers)`
patterns, e.g. `rngSeeded("salary", occ.slug)`, `rngSeeded("momentum",
industry.slug, q)`).
**Decision**: every "random" simulated value is generated from a PRNG
seeded by a stable string built from stable identifiers (occupation slug,
industry slug, quarter index, etc.), not `Math.random()`.
**Reasoning (Inferred)**: guarantees `npm run db:seed` produces the exact
same dataset every time it's run, making the demo reproducible and
diffable, and making it possible to reason about "did my schema/logic
change break the seed" independent of randomness.
**Consequence**: any change to iteration order, seed-string composition, or
which entities exist changes downstream generated numbers even if the
*logic* is unchanged — a subtle trap for anyone editing `seed-data/*` files
without re-running and diffing the seed.

### DEC-004 — NextAuth v5 (beta) with Credentials provider, not Supabase Auth or OAuth
**Status**: Verified (`src/lib/auth.ts`'s single `Credentials` provider;
`README.md`'s explicit statement: "Supabase Auth is not wired in by
default... swapping to Supabase Auth would mean replacing `src/lib/auth.ts`
with a Supabase client").
**Decision**: self-hosted email+password auth via NextAuth, backed by
`@auth/prisma-adapter`, JWT session strategy.
**Reasoning (Inferred)**: keeps the app's data model and session logic
entirely inside the Next.js/Prisma stack rather than depending on
Supabase's auth product specifically — the Prisma schema is written to be
portable to any Postgres host (see DEC-001), and coupling auth to Supabase
specifically would undercut that portability.
**Consequence**: no OAuth/social login exists; no email verification flow
exists (`emailVerified` field exists on `User` but this audit found no code
path that sets it); no password-reset flow was located in
`src/lib/actions/auth.ts` or elsewhere during this audit — **unable to
verify** whether one exists without a repo-wide search beyond what was
already grepped (no `reset-password`/`forgot-password` route or page was
found under `src/app/`, which suggests it does not exist, but this was not
exhaustively confirmed page-by-page).

### DEC-005 — JWT session strategy, `trustHost: true`
**Status**: Verified (`src/lib/auth.ts`: `session: { strategy: "jwt" }`,
`trustHost: true` with a comment: "Required for self-hosted deployments
(Vercel infers this automatically)").
**Reasoning (verified via comment)**: needed for the app to work correctly
when deployed somewhere Auth.js can't automatically infer the trusted host.
**Consequence**: sessions are stateless (no `Session` table row lookup on
every request) even though the `Session` Prisma model exists (kept for
`PrismaAdapter` compatibility / potential future strategy change, not
actively queried per-request in JWT mode).

### DEC-006 — No centralized auth middleware; every protected page/action self-checks
**Status**: Verified (no `middleware.ts` file exists anywhere in the repo;
every auth-dependent page/action calls `auth()` inline — confirmed via
repo-wide grep for `auth()` calls in `src/app/`).
**Reasoning**: Unable to verify the original intent — no comment or doc
explains this choice. **Inferred**, weakly: for an app where most pages are
deliberately public/browsable-without-signup (per the "browsing
anonymously" empty state on `/saved`), a blanket middleware gate would be
the wrong default; per-page opt-in matches the product's "mostly public,
selectively personalized" model.
**Consequence**: this is also the direct cause of TASK-001 (the
`/admin/data-status` gap) — the per-page-opt-in model has no safety net for
a page that forgets to opt in. This audit does **not** claim the original
lack-of-gate-on-admin was intentional; it reads as an oversight, not a
decision (no comment or doc anywhere suggests admin was meant to be public).

### DEC-007 — `DataProvider` interface as a plugin contract for external data sources
**Status**: Verified (`src/lib/providers/types.ts`'s doc comment: "New
sources plug in without touching the rest of the app: implement this
interface, register the connector in `registry.ts`, and add a matching row
to `src/lib/seed-data/data-sources.ts`").
**Decision**: every external data source — regardless of whether it needs
an API key, what format it returns, or how it maps into the schema — is
wrapped in a uniform 4-step interface (`fetchData → normalizeData →
validateData → upsertData`), and orchestration (`runDataImport`) is
completely decoupled from any individual connector's internals.
**Reasoning (verified via comment)**: to add new official/licensed data
sources "without touching the rest of the app."
**Consequence**: this is why 6 connectors could be added one-per-commit
over 6 days (per git history) with minimal risk to the rest of the app —
each commit only touched its own new provider file, `registry.ts`, and
`data-sources.ts`.

### DEC-008 — Import runs never delete previously valid data on failure
**Status**: Verified (`README.md`: "it never deletes previously valid data
on failure"; `run-import.ts`'s `runDataImport` only ever creates/updates
`DataImportRun`/`DataQualityCheck` rows and calls each provider's
`upsertData`, which is additive/upsert-only in every provider implementation
read during this audit — none contain a bulk `deleteMany` gated on the
overall run's success/failure).
**Reasoning (Inferred)**: a transient API failure or a partial/malformed
response should degrade to "stale but present" data, not "missing" data —
safer default for a product whose core value proposition is trustworthy
data labeling.
**Consequence**: stale data can persist indefinitely if a connector starts
failing silently and nobody checks `/admin/data-status` (which, per
TASK-001, anyone actually can check, ironically — but nothing currently
alerts a human to a failing connector).

### DEC-009 — Client-computed scoring functions are shared with the seed script, not duplicated
**Status**: Verified (`prisma/seed.ts` imports directly from
`src/lib/scoring/*`; `projection-calculator.tsx` imports the same
`projectSalary` used to seed baseline forecasts).
**Reasoning (Inferred, but strongly supported by the code structure and by
`README.md`'s "Every formula is transparent by design" framing)**: guarantees
the number a user sees when they interactively adjust the Projection
Calculator's sliders is computed by the exact same formula that produced
the seeded baseline forecast — no drift between "what we seeded" and "what
the live calculator shows," and no logic duplicated (and potentially
diverging) between server-seed-time and client-interactive-time.
**Consequence**: scoring functions must stay side-effect-free and
environment-independent (no `process.env`, no Prisma calls) to work in both
contexts — verified true for all 10 files in `src/lib/scoring/`.

### DEC-010 — Case-insensitive search implemented in-memory, not via a DB search index
**Status**: Verified (comment in `src/app/api/search/route.ts`: "SQLite's
`contains` filter is case-sensitive, so we do the match in-memory — the
occupation catalog is small enough (~1-2k rows) that this stays fast without
a search index").
**Reasoning (verified via comment)**: works around SQLite's
case-sensitivity limitation (relevant because the schema is meant to be
SQLite-portable per DEC-001) while the dataset is still small enough for a
full in-memory scan to be fast.
**Consequence**: this is an explicitly acknowledged scaling limit, not an
oversight — but it would need revisiting (a real search index, or at least
a Postgres-specific `ILIKE`/trigram approach) if the occupation catalog
grows well beyond its current ~1,000+ rows.

### DEC-011 — `package.json`'s `allowScripts` field enumerates specific packages allowed to run install scripts
**Status**: Verified (`package.json` lines 79–88: `esbuild`, `sharp`,
`unrs-resolver`, `@prisma/client`, `@prisma/engines`, `fsevents` ×2,
`prisma`).
**Reasoning (Inferred)**: this field's shape matches npm's newer
opt-in-to-lifecycle-scripts security feature, restricting which
dependencies are trusted to run arbitrary install-time scripts, rather than
trusting the entire dependency tree by default.
**Consequence**: if a new dependency that needs install scripts is ever
added, this field will need a corresponding entry or that dependency's
scripts silently won't run (which could cause confusing native-binary
build failures, e.g. for another native module beyond `sharp`/`fsevents`).

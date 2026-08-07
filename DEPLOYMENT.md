# DEPLOYMENT.md

## Hosting provider

**Vercel**, inferred from: a `.vercel/` directory present in the working
copy (local Vercel CLI project-link metadata — not itself proof of a live
deployment, but strong evidence one was set up), `vercel.json` (Vercel
Cron configuration, a Vercel-specific file with no equivalent meaning on
other hosts), and `README.md`'s "Deployment (Vercel)" section giving
explicit Vercel steps. No other hosting configuration (no
`netlify.toml`, no `Dockerfile`, no `railway.json`, no Fly.io config) was
found anywhere in the repo. This audit did **not** query the live Vercel
API/dashboard to confirm an active deployment or its URL — that would
require credentials/network access outside this audit's read-only,
local-file-based scope.

## Build command / output

Standard Next.js on Vercel: `next build` (`npm run build` in
`package.json`), output managed by Vercel's Next.js runtime (no custom
`output`/`distDir` override in `next.config.ts`, which is otherwise empty).
**Not run this audit** — see `CLAUDE.md`/`PROJECT_STATE.md`/`TESTING.md`
for why (risk of connecting to the live `DATABASE_URL` configured in this
working copy during static generation).

## Installation command

`npm install` (there's a `package-lock.json`, no other lockfile — Vercel
will detect and use `npm` automatically).

## Runtime version

No `engines` field in `package.json`, no `.nvmrc`/`.node-version` file.
Vercel will use its own default/inferred Node.js runtime version for this
project unless explicitly configured in the Vercel project settings
(not verifiable from this repo alone). Node `v26.3.0` was observed on the
local machine that ran `npm install`/tests during this audit, but that is
**not** a pin — a future session or Vercel's actual runtime could differ.

## Environment variables (deployment-specific)

Per `README.md`'s deployment section and this audit's own read of
`.env.example`, production needs at minimum:
- `DATABASE_URL` — pointing at the production Postgres instance.
- `AUTH_SECRET` — a real generated secret (`openssl rand -base64 32`), never
  the `.env.example` placeholder.

Optional in production:
- `CRON_SECRET` — strongly recommended in production; without it,
  `/api/cron/update-trends` is publicly, unauthenticated-ly triggerable
  (see `SECURITY.md`). `README.md` notes Vercel Cron will automatically
  send this as a bearer token once it's configured in the Vercel Cron UI.
- `BLS_API_KEY`, `CENSUS_API_KEY`, `COLLEGE_SCORECARD_API_KEY` — raise
  rate limits / unlock the two key-gated connectors respectively.

**Do not set** the ~17 unused Vercel/Neon-integration variables found in
this working copy's `.env.local` (`PGHOST`, `POSTGRES_URL`, etc.) as
deliberate app configuration — they're not read by any app code (see
`CLAUDE.md`'s "Environment setup"); if they appear in a Vercel project's
env var list, they were likely auto-injected by a Vercel↔Neon
marketplace integration, not something this codebase requires.

## Domains

Not documented anywhere in the repo — no `NEXT_PUBLIC_APP_URL` or similar
was found, no custom domain config file. **Unable to verify** what
production domain(s), if any, this project is actually served from without
querying Vercel directly (out of this audit's scope).

## Preview deployments

Standard Vercel behavior for any project connected to GitHub (branch
pushes / PRs get preview URLs) would apply if this repo is connected that
way — not independently confirmed from repo files alone, since Vercel's
Git integration is configured on Vercel's side, not in-repo (beyond the
`.vercel/` link metadata, which was not deeply parsed for privacy/scope
reasons — it may contain a project ID that ties to the live Vercel
project).

## Production deployment steps (per `README.md`, reproduced and verified against actual config)

1. Push the repo to GitHub and import it into Vercel (already done, per
   git remote `https://github.com/Gariyuuu/careeratlas.git` and the
   presence of `.vercel/`).
2. Set `DATABASE_URL` and `AUTH_SECRET` (and ideally `CRON_SECRET`) in
   Vercel's environment variables.
3. Vercel Cron is already configured via `vercel.json` — no additional
   dashboard configuration is strictly required for the cron job itself to
   run, though setting `CRON_SECRET` requires configuring it in the Vercel
   Cron UI too (per `README.md`) for Vercel to actually send it as the
   bearer token.
4. Run `prisma migrate deploy` (or `npm run db:migrate` — though
   `migrate dev` is meant for development; `migrate deploy` is the
   production-appropriate command and is what `README.md` actually
   recommends) against the production database as part of the deploy
   step, then `npm run db:seed` once to populate the demo dataset (skip in
   a "real data only" deployment once official connectors are fully
   populated, per `README.md`).

## First-time / fresh-clone setup step easy to miss

Per `README.md` and confirmed against `package.json`: `prisma generate`
(`npm run db:generate`) must run at least once (Vercel's build process
typically runs this automatically as part of `npm install`'s postinstall
hook for Prisma projects, but a fresh local clone should run it explicitly
if `npm install` alone doesn't trigger it, before `npm run dev` will work).

## Database deployment / migrations

One migration exists (`20260727202821_init`) — a fresh production database
needs `prisma migrate deploy` run against it once, followed by
`npm run db:seed` if the demo dataset should be included. There is no
tooling in this repo for partial/selective seeding — `db:seed` always
generates the full deterministic dataset from scratch (or fails/duplicates
if run against an already-seeded database without a preceding reset, since
several `createMany` calls have no `skipDuplicates` handling visible in
`prisma/seed.ts`'s reads during this audit — re-running seed against a
non-empty database is likely to throw unique-constraint errors rather than
being idempotent; **treat `db:seed` as run-once-on-empty-database**, not
safe to re-run).

## Storage setup

None needed — no file/object storage integration exists.

## External service setup

- **BLS, O*NET, Revelio**: no signup required, connectors work
  out-of-the-box (though `BLS_API_KEY` raises BLS's rate limit).
- **Census ACS**: requires a free API key from
  `census.gov/developers`, set as `CENSUS_API_KEY`.
- **College Scorecard**: requires a free API key from `api.data.gov`, set
  as `COLLEGE_SCORECARD_API_KEY`.
- **Database**: any Postgres host works (Supabase, Neon, Vercel Postgres);
  this working copy uses Neon. For serverless hosting, `README.md`
  specifically recommends the pooled/transaction-pooler connection string
  over a direct connection, to avoid exhausting Postgres connections under
  serverless cold-start churn.

## Scheduled jobs / webhooks

Only one: `vercel.json`'s Cron entry —
`GET /api/cron/update-trends`, daily at `0 6 * * *` (06:00 UTC). No
webhooks (incoming or outgoing) exist.

## Known build failures / runtime limitations

- **Not verified this audit** whether `npm run build` actually succeeds —
  deliberately not run, to avoid touching the live-configured
  `DATABASE_URL`. This is the single biggest deployment-readiness unknown
  left by this audit; a future session should verify it against a
  disposable/staging database before trusting a production deploy blindly.
- No `output: "standalone"` or other custom build output config — relies on
  Vercel's default Next.js build handling.

## Rollback procedure

Not documented anywhere in the repo (no rollback script, no documented
process). Standard Vercel rollback (redeploy a previous successful
deployment via the Vercel dashboard/CLI) would apply by default, but this
is a Vercel-platform capability, not something this repo configures or
guarantees compatibility with — in particular, if a rollback also needs a
**database** rollback (e.g. after a schema migration), there is no
down-migration tooling verified in this repo (Prisma migrations are
forward-only by default unless a manual down-migration is written, and none
exist here beyond the single init migration).

## Health checks

None exist — no `/api/health` or `/api/status` endpoint was found. The
closest thing is `/admin/data-status`, which reports data-connector health,
not app/infrastructure health, and (per `SECURITY.md`) is currently
unauthenticated.

## Post-deployment verification

Recommended (not documented in-repo, inferred as reasonable given what
exists):
1. Load the production URL, confirm the landing page's live counts render
   (proves `DATABASE_URL` connectivity).
2. Sign up a test account, confirm session persists (proves `AUTH_SECRET`
   is correctly set and NextAuth is functioning).
3. `curl https://<prod-domain>/api/cron/update-trends` with the correct
   `Authorization: Bearer <CRON_SECRET>` header (if set) to confirm the
   cron endpoint and at least the keyless connectors work in production.
4. Check `/admin/data-status` (bearing in mind it's currently public — see
   `SECURITY.md`) to confirm connector statuses look healthy after the
   first cron run.
5. Run through the manual smoke-test checklist in `TESTING.md` against the
   production (or a staging) URL.

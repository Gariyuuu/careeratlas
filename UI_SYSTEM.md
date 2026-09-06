# UI_SYSTEM.md

## Layout system

- Root: `src/app/layout.tsx` — `<html>`/`<body>` shell, Geist fonts,
  `ThemeProvider`, `SessionProvider`, `TooltipProvider`, `Toaster`.
- Main app shell: `src/app/(app)/layout.tsx` — fixed-width desktop sidebar
  (`md:pl-64` offset on the content column), `Topbar`, `DemoDataBanner`,
  a `max-w-[1600px]` centered `<main>`, and a mobile bottom nav
  (`MobileNav`) shown only below the `md` breakpoint.
- Auth shell: `src/app/(auth)/layout.tsx` — separate, minimal layout (no
  sidebar) for `/sign-in` and `/sign-up`.
- Landing page (`src/app/page.tsx`) uses its own header/footer, not the app
  shell — it's outside the `(app)` route group.

## Navigation

- Desktop: `src/components/layout/sidebar.tsx` — fixed left sidebar
  (`w-64`), logo/wordmark, then the full `NAV_ITEMS` list from
  `src/components/layout/nav-items.ts` (Dashboard, Career Explorer, Salary
  Explorer, Career Transitions, Education Impact, Industry Trends, Compare,
  Saved Careers, Methodology, Data Sources, Settings), active-state
  highlighting via `usePathname()` (exact match or prefix match), and a
  footer note linking to `/methodology`.
- Mobile: `src/components/layout/mobile-nav.tsx` — a bottom bar showing
  `MOBILE_PRIMARY_NAV` (the first 4 items: Dashboard, Career Explorer,
  Salary Explorer, Career Transitions), with the rest presumably reachable
  via a "More" affordance (per the comment in `src/components/layout/nav-items.ts`; this audit did
  not read `src/components/layout/mobile-nav.tsx`'s full implementation to confirm the exact "More"
  UX).
- Top bar: `src/components/layout/topbar.tsx` — houses the global search
  trigger and user menu (`src/components/layout/user-menu.tsx`).
- Global search: `src/components/layout/global-search.tsx` — command-K
  style dialog (built on the `src/components/ui/command.tsx` primitive, which wraps `cmdk`),
  debounced fetch to `/api/search`.
- Note: `NAV_ITEMS` has no explicit "Admin" entry — `/admin/data-status` is
  only linked from the landing page's footer (`src/app/page.tsx`), not from
  the main app sidebar, which is presumably why the missing-auth issue
  (`TASKS.md` TASK-001) went unnoticed — it isn't prominently surfaced in
  normal navigation, even though it's fully reachable by URL.

## Page structure

Nearly every `(app)` page follows the same shape: a Server Component
route `**/page.tsx` that (1) fetches data via `src/lib/data/*`, (2) renders a
`PageHeader` (`src/components/page-header.tsx`) with title/description, then
(3) composes `Card`/`Table`/chart components, delegating any interactive
filtering/state to a colocated client component (e.g. `src/app/(app)/salary/salary-filters.tsx`,
`src/app/(app)/roles/role-filters.tsx`, `src/app/(app)/compare/compare-selector.tsx`, `src/app/(app)/projection/projection-calculator.tsx`,
`src/app/(app)/education/compare/education-compare-tool.tsx`, `src/app/(app)/trends/momentum-leaderboard.tsx`,
`src/app/(app)/transitions/transition-table.tsx`, `src/app/(app)/profile/profile-form.tsx`).

## Reusable components

- **shadcn/ui primitives** (`src/components/ui/`): accordion, alert,
  alert-dialog, avatar, badge, breadcrumb, button, card, checkbox, command,
  dialog, dropdown-menu, input, input-group, label, popover, progress,
  radio-group, select, separator, sheet, skeleton, slider, sonner (toast),
  switch, table, tabs, textarea, tooltip.
- **App-specific shared components** (`src/components/`):
  `src/components/data-status-badge.tsx` (the reported/estimated/forecast/simulated
  badge — see below), `src/components/data-table.tsx` (TanStack Table wrapper),
  `src/components/page-header.tsx`, `src/components/role-picker.tsx` (command-palette-style role
  selector), `src/components/run-import-button.tsx`, `src/components/save-career-button.tsx`,
  `src/components/save-comparison-button.tsx`, `src/components/delete-account-button.tsx`,
  `src/components/session-provider.tsx`, `src/components/theme-provider.tsx`, `src/components/theme-settings.tsx`,
  `src/components/theme-toggle.tsx`, `src/components/transition-graph.tsx` (hand-rolled SVG radial graph).
- **Charts** (`src/components/charts/`, Recharts-based):
  `src/components/charts/comparison-bar-chart.tsx`, `src/components/charts/comparison-radar-chart.tsx`,
  `src/components/charts/salary-distribution-chart.tsx`, `src/components/charts/salary-trend-chart.tsx`.

## The `DataStatusBadge` component (`src/components/data-status-badge.tsx`)

Central to the product's core trust principle. Maps `dataStatus` →
label + color: `reported` → green ("Reported"), `estimated` → blue
("Estimated"), `forecast` → violet ("Forecast"), `simulated` → amber
("Simulated"), each with light/dark variants via Tailwind's `dark:`
modifier (not the app's own CSS-variable theme tokens — this component uses
hardcoded Tailwind color utilities like `emerald-100`/`emerald-950` rather
than `--chart-*`/`--status-*` tokens, a minor inconsistency worth noting but
not a bug).

## Themes

`next-themes` (`src/components/theme-provider.tsx`,
`attribute="class"`, `defaultTheme="system"`, `enableSystem`,
`disableTransitionOnChange`). Toggle: `src/components/theme-toggle.tsx`
(landing page + presumably topbar). Full settings UI:
`src/components/theme-settings.tsx` (`/settings` page). Dark mode is a
`.dark` class on `<html>`, matching Tailwind v4's `@custom-variant dark
(&:is(.dark *))` declaration in `src/app/globals.css`.

## Colors

Defined as OKLCH CSS custom properties in `src/app/globals.css`, under
`:root` (light) and `.dark` (dark), surfaced to Tailwind via `@theme inline`
at the top of the file:
- Semantic tokens: `background`, `foreground`, `card`(+foreground),
  `popover`(+foreground), `primary`(+foreground), `secondary`(+foreground),
  `muted`(+foreground), `accent`(+foreground), `destructive`, `border`,
  `input`, `ring`.
- Sidebar-specific tokens: `sidebar`, `sidebar-foreground`,
  `sidebar-primary`(+foreground), `sidebar-accent`(+foreground),
  `sidebar-border`, `sidebar-ring`.
- Categorical chart palette: `--chart-1` through `--chart-8`, hex values
  (not OKLCH), explicitly commented "validated for CVD-safety, see dataviz
  skill" — different hex values for light vs. dark mode.
- Status colors (separate from `DataStatusBadge`'s own hardcoded classes):
  `--status-good`, `--status-warning`, `--status-serious`,
  `--status-critical` — identical values in light and dark mode.
- Base color for shadcn/ui generation: `neutral` (per `components.json`).

## Typography

`Geist` (sans) and `Geist Mono` via `next/font/google`, wired as CSS
variables (`--font-geist-sans`, `--font-geist-mono`) in
`src/app/layout.tsx`, mapped to Tailwind's `--font-sans`/`--font-mono`
theme tokens in `src/app/globals.css`. `--font-heading` is aliased to
`--font-sans` (no separate heading typeface).

## Spacing / border radius

`--radius: 0.625rem` as the base; `--radius-sm` through `--radius-4xl` are
all derived from it via `calc()` multipliers (0.6× up to 2.6×) in the
`@theme inline` block — a single source of truth for the whole radius
scale. Standard Tailwind spacing scale otherwise (no custom spacing tokens
found).

## Breakpoints

Standard Tailwind breakpoints (no custom `screens` config found — Tailwind
v4's defaults apply). The desktop/mobile split throughout the app shell
consistently uses `md:` (sidebar/topbar shown ≥`md`, `MobileNav` shown
below).

## Animation

`tw-animate-css` (imported in `src/app/globals.css`) provides animation utility
classes used by shadcn/ui's dialog/dropdown/sheet/popover open/close
transitions. `disableTransitionOnChange` on `ThemeProvider` prevents a
flash of transitioning colors on theme switch.

## Icon system

`lucide-react` exclusively (per `components.json`'s `iconLibrary`) — no
other icon set found in the codebase.

## Image assets

`public/` contains only the 5 default Next.js placeholder SVGs
(`file.svg`, `globe.svg`, `next.svg`, `vercel.svg`, `window.svg`) — **none
are actually used as product imagery** based on the component files read
during this audit (they appear to be Create Next App scaffolding leftovers,
not deliberately kept assets). The app's only custom visual asset is
`src/app/icon.svg` (the custom favicon added in the most recent commit,
`0b10636`) and `src/app/favicon.ico`.

## Modals

Built on the `src/components/ui/dialog.tsx` primitive (Radix Dialog) and `src/components/ui/sheet.tsx` (Radix
Dialog variant for slide-in panels, likely used by `MobileNav`'s "More"
menu and/or filter panels on mobile — not exhaustively confirmed per-page
this audit). Command-palette-style overlays (`src/components/layout/global-search.tsx`,
`src/components/role-picker.tsx`, `src/app/(app)/compare/compare-selector.tsx`) use `src/components/ui/command.tsx`'s
`CommandDialog`.

## Notifications / toasts

`sonner` (`src/components/ui/sonner.tsx` wrapper, `<Toaster />` mounted once
in the root layout). Used for async action feedback, e.g.
`src/components/run-import-button.tsx`'s `toast.success`/`toast.error` after a manual data
import.

## Forms

Mix of two patterns: (1) native `<form action={serverAction}>` /
`useActionState`-style Server Action forms for auth and profile
(`signInAction`/`signUpAction`/`upsertProfile` all take
`(prevState, formData)`), and (2) plain client-side `useState`-driven
controlled inputs for interactive tools that don't need a page
submit/reload (projection calculator sliders, education-compare-tool
overrides, all the filter components). No cross-cutting form library
(no react-hook-form in `package.json`) — validation is Zod (auth actions
only) or manual coercion (`src/lib/actions/profile.ts`).

## Loading states

`src/components/ui/skeleton.tsx` primitive exists in `src/components/ui/`. This audit did not
exhaustively confirm every data-fetching page renders a skeleton via a
`loading.tsx` file (App Router's file-based loading-state convention) —
no `loading.tsx` files were enumerated in the `find src -type f` listing
taken during this audit, which suggests **no route-level `loading.tsx`
files exist**, meaning Next.js's automatic Suspense-boundary loading UI is
not used; any in-component loading state (e.g. `useTransition`'s `pending`
flag, used in `src/components/run-import-button.tsx` and presumably other action-triggering
buttons) is handled ad hoc per component instead.

## Empty states

Explicitly handled and verified in at least one place:
`/saved` (`src/app/(app)/saved/page.tsx`) renders a dedicated "You're
browsing anonymously" card with Sign in / Create account buttons when
there's no session, rather than an empty table or a redirect. Other pages'
empty-state handling (e.g. Salary Explorer with an over-narrow filter
combination) was not individually verified this audit.

## Error states

No custom `error.tsx` boundary files were located under `src/app/` during
this audit's file enumeration — see `TASKS.md` technical debt note. Server
Action failures surface as returned `{ error: string }` objects rendered
inline by the calling client component (confirmed pattern across
`src/lib/actions/auth.ts`, `src/lib/actions/profile.ts`, `src/lib/actions/saved-occupations.ts`, `src/lib/actions/comparisons.ts`) rather
than thrown exceptions reaching a React error boundary, **except** for
`triggerDataImport` on an unregistered provider slug, which does throw
unhandled (see `TASKS.md` TASK-005).

## Accessibility

- `TransitionGraph`'s SVG has `role="img"` and a descriptive `aria-label`.
- Radix-based primitives (dialog, dropdown, select, tooltip, etc.) inherit
  Radix's built-in accessibility behavior (focus trapping, ARIA
  attributes, keyboard navigation) by virtue of using `radix-ui` rather
  than hand-rolled equivalents.
- `suppressHydrationWarning` is set on `<html>` in the root layout,
  standard/necessary practice for `next-themes` to avoid a
  server/client class-attribute mismatch warning — not an accessibility
  concern itself.
- No dedicated accessibility audit (axe, Lighthouse a11y score, etc.) was
  run or found documented in the repo — **unable to verify** overall a11y
  compliance beyond the structural observations above.

## Responsive design

Sidebar/topbar/main-content layout hidden below `md`, replaced by
`MobileNav`'s bottom bar; `main` content area gets extra bottom padding on
mobile (`pb-24 md:pb-6`) to clear the bottom nav. Individual pages use
Tailwind's responsive prefixes (`sm:`/`md:`/`lg:`) for grid column counts
(e.g. landing page's stats grid `grid-cols-2 sm:grid-cols-4`).

## Browser support

Not explicitly documented anywhere in the repo (no `.browserslistrc`, no
stated support matrix). Relies on Next.js/Tailwind v4's own defaults.

## The W9 numerics family layer (added 2026-09-05)

**Source of truth:** `~/Projects/.design-system/families/numerics.css` (v1.0).
**Vendored here as** ``src/app/design-system/numerics.css``, imported from ``src/app/globals.css`` immediately after
`master.css`. The copy is byte-identical to the source apart from a two-line header.
**Do not patch the vendored copy** — fix the source and re-vendor, exactly as with
`MASTER.css`.

### What it is

A *family* layer, sitting between `MASTER.css` and per-project overrides:

```
MASTER.css  ->  families/numerics.css  ->  overrides/<project>.css  ->  this repo's globals.css
```

MASTER holds what all 115 portfolio repos need. A family layer holds what one kind of
surface needs and no one else does. "Green means up" is meaningless in a 3D world or a
narrative game; tabular numerals are wrong for prose. Twelve numbers-first repos share
this one (see `~/Projects/OVERHAUL-GROUPS.md` group W9).

### What it provides

| Class | Use |
|---|---|
| `.num` | tabular figures on any element |
| `.num-col` | right-aligned tabular column — **apply to the `<th>` and the `<td>`** |
| `.num-mono` | monospaced identifier column (ticker, order id) with a slashed zero |
| `.num-display` | a headline figure |
| `.delta[data-dir="up\|down\|flat"]` | a signed change (see the rule below) |
| `.delta-chip` | the same, as a filled pill |
| `.spark` / `.spark-line` / `.spark-area` / `.spark-dot` | one sparkline stroke spec |
| `.feed-card` + `-meta` / `-title` / `-body` / `-foot` / `-link` | the shared feed entry |
| `.freshness[data-state="live\|stale\|offline\|loading"]` + `.freshness-dot` | refresh state |
| `.no-data` + `.no-data-title` / `.no-data-body` | a surface with a known shape and nothing in it |
| `.is-stale`, `.num-flash`, `.num-ghost` | stale region, value-change flash, ghost row |

### The rule this layer exists to enforce

**A signed number never states its direction in colour alone.** Red/green is the most
common colour-vision collision (deuteranopia, ~6% of men) and every surface in this
family is one where a sign is the point. `.delta` emits ▲/▼/– from `::before`, so a
call site *cannot* forget it. If a surface genuinely cannot carry the glyph, use
`data-cue="sign"` (explicit +/−) — still redundant, still non-colour. `data-cue="none"`
exists only for values that already print their own sign, and using it is a decision to
be justified, not a default.

`content` is deliberately declared **twice** on `.delta::before`. The second is the
CSS alt-text form (`content: "▲" / ""`), which marks the glyph decorative so assistive
tech reads the number rather than "black up-pointing triangle" — but it is only
understood by Chrome 77+, Firefox 118+, Safari 17.4+. In an older engine that whole
declaration is invalid and the glyph would vanish, taking the accessible cue with it.
The plain declaration is the fallback. Do not "clean up" the duplicate.

### Dark mode is opt-in by selector

Dark values attach only to `.dark`, `[data-theme="dark"]` and `[data-scheme="dark"]` —
never to `prefers-color-scheme`, because a light-only app on a dark-OS machine would
otherwise inherit the dark ramp on a white background and fail contrast everywhere.
This repo uses `next-themes` with `attribute="class"`, which sets `.dark` — no extra hook needed.

### Contrast

Every family token clears **4.5:1 as text** on the MASTER surface stack in both ramps
(light: up 4.67, down 5.13, flat 5.03, warn 4.54; dark: 8.04 / 5.28 / 5.69 / 7.45).
Re-measure after any re-tint with `python3 ~/Projects/.design-system/tools/contrast.py <ink> <surface>`.

### Numeric table columns

`DataTable` (`src/components/data-table.tsx`) declares a typed column option:

```ts
{ accessorKey: "median", header: "Median", meta: { numeric: true } }
```

which applies `.num-col` to the header **and** the body cell together. Never set the
alignment on only one of them — a right-aligned column under a left-aligned heading was
the single most common table defect found across this group.

### Charts

`src/components/charts/chart-theme.ts` is the shared chart language: `TOOLTIP_STYLE`
(with tabular figures), `AXIS_TICK`, `SERIES_DASH`, and `useChartAnimation()`.

- **`useChartAnimation()` is not optional.** Recharts animates SVG attributes in
  JavaScript, so MASTER's CSS reduced-motion clamp cannot reach it. Pass its result to
  `isAnimationActive` on every animated series.
- **`SERIES_DASH` is MASTER's pattern-before-hue rule.** `salary-trend-chart` used to
  give its three scenario lines the same `"4 3"` dash, leaving them distinguished by
  hue alone. Series `n` gets `SERIES_DASH[n]`.

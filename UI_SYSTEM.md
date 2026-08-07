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
  via a "More" affordance (per the comment in `nav-items.ts`; this audit did
  not read `mobile-nav.tsx`'s full implementation to confirm the exact "More"
  UX).
- Top bar: `src/components/layout/topbar.tsx` — houses the global search
  trigger and user menu (`src/components/layout/user-menu.tsx`).
- Global search: `src/components/layout/global-search.tsx` — command-K
  style dialog (built on the `command.tsx` primitive, which wraps `cmdk`),
  debounced fetch to `/api/search`.
- Note: `NAV_ITEMS` has no explicit "Admin" entry — `/admin/data-status` is
  only linked from the landing page's footer (`src/app/page.tsx`), not from
  the main app sidebar, which is presumably why the missing-auth issue
  (`TASKS.md` TASK-001) went unnoticed — it isn't prominently surfaced in
  normal navigation, even though it's fully reachable by URL.

## Page structure

Nearly every `(app)` page follows the same shape: a Server Component
`page.tsx` that (1) fetches data via `src/lib/data/*`, (2) renders a
`PageHeader` (`src/components/page-header.tsx`) with title/description, then
(3) composes `Card`/`Table`/chart components, delegating any interactive
filtering/state to a colocated client component (e.g. `salary-filters.tsx`,
`role-filters.tsx`, `compare-selector.tsx`, `projection-calculator.tsx`,
`education-compare-tool.tsx`, `momentum-leaderboard.tsx`,
`transition-table.tsx`, `profile-form.tsx`).

## Reusable components

- **shadcn/ui primitives** (`src/components/ui/`): accordion, alert,
  alert-dialog, avatar, badge, breadcrumb, button, card, checkbox, command,
  dialog, dropdown-menu, input, input-group, label, popover, progress,
  radio-group, select, separator, sheet, skeleton, slider, sonner (toast),
  switch, table, tabs, textarea, tooltip.
- **App-specific shared components** (`src/components/`):
  `data-status-badge.tsx` (the reported/estimated/forecast/simulated
  badge — see below), `data-table.tsx` (TanStack Table wrapper),
  `page-header.tsx`, `role-picker.tsx` (command-palette-style role
  selector), `run-import-button.tsx`, `save-career-button.tsx`,
  `save-comparison-button.tsx`, `delete-account-button.tsx`,
  `session-provider.tsx`, `theme-provider.tsx`, `theme-settings.tsx`,
  `theme-toggle.tsx`, `transition-graph.tsx` (hand-rolled SVG radial graph).
- **Charts** (`src/components/charts/`, Recharts-based):
  `comparison-bar-chart.tsx`, `comparison-radar-chart.tsx`,
  `salary-distribution-chart.tsx`, `salary-trend-chart.tsx`.

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
(&:is(.dark *))` declaration in `globals.css`.

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
theme tokens in `globals.css`. `--font-heading` is aliased to
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

`tw-animate-css` (imported in `globals.css`) provides animation utility
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

Built on the `dialog.tsx` primitive (Radix Dialog) and `sheet.tsx` (Radix
Dialog variant for slide-in panels, likely used by `MobileNav`'s "More"
menu and/or filter panels on mobile — not exhaustively confirmed per-page
this audit). Command-palette-style overlays (`global-search.tsx`,
`role-picker.tsx`, `compare-selector.tsx`) use `command.tsx`'s
`CommandDialog`.

## Notifications / toasts

`sonner` (`src/components/ui/sonner.tsx` wrapper, `<Toaster />` mounted once
in the root layout). Used for async action feedback, e.g.
`run-import-button.tsx`'s `toast.success`/`toast.error` after a manual data
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
only) or manual coercion (`profile.ts`).

## Loading states

`skeleton.tsx` primitive exists in `src/components/ui/`. This audit did not
exhaustively confirm every data-fetching page renders a skeleton via a
`loading.tsx` file (App Router's file-based loading-state convention) —
no `loading.tsx` files were enumerated in the `find src -type f` listing
taken during this audit, which suggests **no route-level `loading.tsx`
files exist**, meaning Next.js's automatic Suspense-boundary loading UI is
not used; any in-component loading state (e.g. `useTransition`'s `pending`
flag, used in `run-import-button.tsx` and presumably other action-triggering
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
`auth.ts`, `profile.ts`, `saved-occupations.ts`, `comparisons.ts`) rather
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

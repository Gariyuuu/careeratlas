"use client";

import { useSyncExternalStore } from "react";

/** One tooltip look for every chart in the app. Tabular figures matter here
 *  as much as in a table -- a tooltip that reflows as the cursor moves along
 *  a series is unreadable. */
export const TOOLTIP_STYLE = {
  background: "var(--popover)",
  color: "var(--popover-foreground)",
  border: "1px solid var(--border)",
  borderRadius: 8,
  fontSize: 12,
  fontVariantNumeric: "tabular-nums" as const,
  boxShadow: "0 4px 16px -4px oklch(0 0 0 / 0.18)",
};

export const AXIS_TICK = { fontSize: 12, fill: "var(--muted-foreground)" };

/**
 * Stroke patterns, in series order. MASTER's chart rule is pattern first, hue
 * second: three scenario lines that share one dash pattern are distinguished
 * by colour alone, which is exactly what the rule exists to prevent.
 * Values mirror MASTER's --series-dash-* tokens; Recharts takes the dash array
 * as a prop, not as CSS, so it cannot read the token directly.
 */
export const SERIES_DASH = [undefined, "6 4", "1 4", "10 4 2 4", "2 2"] as const;

const QUERY = "(prefers-reduced-motion: reduce)";

function subscribe(onChange: () => void) {
  if (typeof window === "undefined") return () => {};
  const mq = window.matchMedia(QUERY);
  mq.addEventListener("change", onChange);
  return () => mq.removeEventListener("change", onChange);
}

/**
 * Recharts animates on mount by default -- bars grow from zero, lines draw in.
 * That motion lives in JS-driven SVG attributes, so MASTER's CSS reduced-motion
 * clamp cannot reach it. This is the only way to honour the preference here.
 * Returns what to pass as `isAnimationActive`.
 */
export function useChartAnimation() {
  return !useSyncExternalStore(
    subscribe,
    () => window.matchMedia(QUERY).matches,
    () => false, // the server cannot know; assume motion and let the client correct
  );
}

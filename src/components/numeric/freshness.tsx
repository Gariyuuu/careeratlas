"use client";

import { useSyncExternalStore } from "react";

const MINUTE = 60_000;

function relative(from: Date, now: number) {
  const diff = Math.max(0, now - from.getTime());
  if (diff < MINUTE) return "just now";
  const mins = Math.round(diff / MINUTE);
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs} hr${hrs === 1 ? "" : "s"} ago`;
  const days = Math.round(hrs / 24);
  return `${days} day${days === 1 ? "" : "s"} ago`;
}

/** Ticks the subscriber often enough to catch a minute boundary promptly,
 *  without re-rendering every second. */
function subscribe(onChange: () => void) {
  const id = setInterval(onChange, 15_000);
  return () => clearInterval(id);
}
/** Bucketed to the minute so the snapshot is stable between boundaries --
 *  returning a raw Date.now() here would re-render on every check. */
const currentMinute = () => Math.floor(Date.now() / MINUTE);

export type FreshnessState = "live" | "stale" | "offline" | "loading";

/**
 * "Updated 4 min ago" with a state dot.
 *
 * THE TIMESTAMP IS THE POINT. A green dot on its own says a feed is healthy
 * without saying how recently it proved it, which is exactly the claim a data
 * surface must not make loosely. The dot is the glance; the <time> is the
 * answer, and it is machine-readable either way.
 *
 * The server has no "now", so a relative string rendered there and again on
 * the client is a guaranteed hydration mismatch. useSyncExternalStore's server
 * snapshot is null, which renders the absolute date until mount.
 *
 * State is derived from age unless the caller overrides it -- a caller that
 * already knows the upstream is dead should say so rather than let the clock
 * guess its way there.
 */
export function Freshness({
  at,
  staleAfterMinutes = 15,
  state,
  label = "Updated",
  className,
}: {
  at: Date | string | number | null;
  staleAfterMinutes?: number;
  state?: FreshnessState;
  label?: string;
  className?: string;
}) {
  const minute = useSyncExternalStore(subscribe, currentMinute, () => null);
  const now = minute == null ? null : minute * MINUTE;

  const date = at == null ? null : at instanceof Date ? at : new Date(at);

  if (!date || Number.isNaN(date.getTime())) {
    return (
      <span className={`freshness ${className ?? ""}`} data-state={state ?? "offline"}>
        <span className="freshness-dot" />
        <span>No data yet</span>
      </span>
    );
  }

  const ageMin = now == null ? 0 : Math.max(0, now - date.getTime()) / MINUTE;
  const derived: FreshnessState =
    ageMin > staleAfterMinutes * 4 ? "offline" : ageMin > staleAfterMinutes ? "stale" : "live";
  const resolved = state ?? derived;

  return (
    <span className={`freshness ${className ?? ""}`} data-state={resolved}>
      <span className="freshness-dot" />
      <span>
        {label}{" "}
        <time dateTime={date.toISOString()} title={date.toLocaleString()} suppressHydrationWarning>
          {now == null ? date.toLocaleDateString() : relative(date, now)}
        </time>
        {resolved === "offline" && " — feed may be down"}
      </span>
    </span>
  );
}

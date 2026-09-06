"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Counts from the previous value to the new one when the value changes.
 *
 * Two rules this follows that most counter components do not:
 *  1. It renders the REAL value on the server and on first paint, and only
 *     animates on a later change. A counter that starts at 0 flashes a wrong
 *     number at anyone whose JS is slow, and it moves layout on arrival.
 *  2. Under prefers-reduced-motion it commits immediately. A number that ticks
 *     is exactly the trigger the query exists for, and nothing is lost by
 *     skipping it -- the value is the value.
 */
export function AnimatedNumber({
  value,
  duration = 600,
  format = (v: number) => v.toLocaleString(),
  className,
}: {
  value: number;
  duration?: number;
  format?: (v: number) => string;
  className?: string;
}) {
  const [shown, setShown] = useState(value);
  const from = useRef(value);

  useEffect(() => {
    const origin = from.current;
    const delta = value - origin;
    if (delta === 0) return;

    const reduced =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    // Zero duration still routes through requestAnimationFrame, so the state
    // update lands in a frame callback rather than synchronously in the effect
    // body -- one code path, and no cascading render on mount.
    const ms = reduced ? 0 : duration;

    let raf = 0;
    const start = performance.now();
    const tick = (t: number) => {
      const p = ms === 0 ? 1 : Math.min(1, (t - start) / ms);
      // easeOutCubic: fast commit, soft landing. No overshoot -- a count that
      // overshoots displays a wrong value for two frames.
      const eased = 1 - Math.pow(1 - p, 3);
      setShown(origin + delta * eased);
      if (p < 1) raf = requestAnimationFrame(tick);
      else from.current = value;
    };
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      from.current = value;
    };
  }, [value, duration]);

  return (
    <span className={className} suppressHydrationWarning>
      {format(Math.round(shown))}
    </span>
  );
}

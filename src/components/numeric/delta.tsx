import { cn } from "@/lib/utils";

export type DeltaDirection = "up" | "down" | "flat";

/** Which way is good. A rejection count going up is not a win, so surfaces
 *  that track a bad-is-up metric pass invert and keep the same call site. */
export function directionOf(value: number, invert = false): DeltaDirection {
  if (value === 0 || Number.isNaN(value)) return "flat";
  const up = value > 0;
  return (invert ? !up : up) ? "up" : "down";
}

/**
 * A signed change. Colour is never the only cue -- the `.delta` class in the
 * numerics layer emits a ▲/▼/– through ::before, using the CSS alt-text form
 * so assistive tech reads the number and its label, not the glyph.
 *
 * `srLabel` is what a screen reader announces in place of the bare figure;
 * without it "+3" and "-3" sound identical to a colour cue nobody can hear.
 */
export function Delta({
  value,
  format,
  invert = false,
  cue,
  chip = false,
  srLabel,
  className,
}: {
  value: number;
  format?: (v: number) => string;
  invert?: boolean;
  cue?: "sign" | "none";
  chip?: boolean;
  srLabel?: string;
  className?: string;
}) {
  const dir = directionOf(value, invert);
  const shown = format ? format(value) : `${value > 0 ? "+" : ""}${value}`;
  const spoken = srLabel ?? `${dir === "up" ? "up" : dir === "down" ? "down" : "no change,"} ${shown}`;

  return (
    <span
      className={cn("delta", chip && "delta-chip", className)}
      data-dir={dir}
      data-cue={cue}
    >
      <span aria-hidden="true">{shown}</span>
      <span className="sr-only">{spoken}</span>
    </span>
  );
}

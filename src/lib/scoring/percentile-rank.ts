export interface PercentileAnchors {
  p10: number;
  p25: number;
  median: number;
  p75: number;
  p90: number;
}

const ANCHOR_POINTS: [keyof PercentileAnchors, number][] = [
  ["p10", 10],
  ["p25", 25],
  ["median", 50],
  ["p75", 75],
  ["p90", 90],
];

/**
 * Estimates a salary's percentile rank (0-100) within a distribution
 * described by five known points, via piecewise-linear interpolation.
 * Clamps to [1, 99] outside the p10-p90 range rather than extrapolating
 * wildly.
 */
export function estimateSalaryPercentileRank(salary: number, anchors: PercentileAnchors): number {
  const points = ANCHOR_POINTS.map(([key, pct]) => ({ value: anchors[key], pct }));

  if (salary < points[0].value) return 1;
  if (salary > points.at(-1)!.value) return 99;

  for (let i = 0; i < points.length - 1; i++) {
    const a = points[i];
    const b = points[i + 1];
    if (salary >= a.value && salary <= b.value) {
      if (b.value === a.value) return a.pct;
      const t = (salary - a.value) / (b.value - a.value);
      return Math.round(a.pct + t * (b.pct - a.pct));
    }
  }
  return 50;
}

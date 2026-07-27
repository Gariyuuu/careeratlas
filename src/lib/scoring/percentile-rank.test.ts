import { describe, expect, it } from "vitest";
import { estimateSalaryPercentileRank } from "./percentile-rank";

const anchors = { p10: 60_000, p25: 75_000, median: 95_000, p75: 120_000, p90: 145_000 };

describe("estimateSalaryPercentileRank", () => {
  it("returns 50 at the median", () => {
    expect(estimateSalaryPercentileRank(95_000, anchors)).toBe(50);
  });

  it("returns 10 at p10 and 90 at p90", () => {
    expect(estimateSalaryPercentileRank(60_000, anchors)).toBe(10);
    expect(estimateSalaryPercentileRank(145_000, anchors)).toBe(90);
  });

  it("clamps below p10 to 1", () => {
    expect(estimateSalaryPercentileRank(10_000, anchors)).toBe(1);
  });

  it("clamps above p90 to 99", () => {
    expect(estimateSalaryPercentileRank(500_000, anchors)).toBe(99);
  });

  it("interpolates between anchors", () => {
    const rank = estimateSalaryPercentileRank(85_000, anchors); // between p25 and median
    expect(rank).toBeGreaterThan(25);
    expect(rank).toBeLessThan(50);
  });
});

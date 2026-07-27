import { describe, expect, it } from "vitest";
import { computeEducationRoi } from "./education-roi";

describe("computeEducationRoi", () => {
  it("computes a positive break-even year when the degree pays off", () => {
    const result = computeEducationRoi({
      totalCost: 40_000,
      yearsInSchool: 4,
      forgoneEarningsPerYear: 30_000,
      postGradSalary: 75_000,
      baselineSalary: 40_000,
      annualGrowthPct: 0.03,
      horizonYears: 20,
    });
    expect(result.breakEvenYear).not.toBeNull();
    expect(result.breakEvenYear).toBeGreaterThan(0);
    expect(result.cumulativeReturn).toBeGreaterThan(0);
  });

  it("returns null break-even when the degree never pays off within the horizon", () => {
    const result = computeEducationRoi({
      totalCost: 300_000,
      yearsInSchool: 6,
      forgoneEarningsPerYear: 60_000,
      postGradSalary: 62_000,
      baselineSalary: 60_000,
      annualGrowthPct: 0.02,
      horizonYears: 10,
    });
    expect(result.breakEvenYear).toBeNull();
    expect(result.cumulativeReturn).toBeLessThan(0);
  });

  it("includes forgone earnings in net cost", () => {
    const withForgone = computeEducationRoi({
      totalCost: 20_000,
      yearsInSchool: 2,
      forgoneEarningsPerYear: 50_000,
      postGradSalary: 70_000,
      baselineSalary: 50_000,
      annualGrowthPct: 0.03,
      horizonYears: 10,
    });
    expect(withForgone.netCost).toBe(20_000 + 50_000 * 2);
  });
});

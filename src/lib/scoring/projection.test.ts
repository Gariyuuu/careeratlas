import { describe, expect, it } from "vitest";
import { projectSalary } from "./projection";

const baseInputs = {
  currentSalary: 100_000,
  yearsOut: 5 as const,
  generalWageGrowthPct: 0.03,
  occupationGrowthPct: 0.02,
  industryMomentumScore: 65,
  yearsExperience: 4,
  educationFactor: 0.7,
  skillDemandScore: 0.6,
  promotionOrTransitionProbability: 0.4,
};

describe("projectSalary", () => {
  it("returns the input salary unchanged at 0 years out", () => {
    const result = projectSalary({ ...baseInputs, yearsOut: 0, scenario: "expected" });
    expect(result.projectedSalary).toBe(100_000);
  });

  it("grows salary over time in the expected scenario", () => {
    const result = projectSalary({ ...baseInputs, scenario: "expected" });
    expect(result.projectedSalary).toBeGreaterThan(baseInputs.currentSalary);
  });

  it("orders scenarios conservative <= expected <= aggressive", () => {
    const conservative = projectSalary({ ...baseInputs, scenario: "conservative" });
    const expected = projectSalary({ ...baseInputs, scenario: "expected" });
    const aggressive = projectSalary({ ...baseInputs, scenario: "aggressive" });
    expect(conservative.projectedSalary).toBeLessThanOrEqual(expected.projectedSalary);
    expect(expected.projectedSalary).toBeLessThanOrEqual(aggressive.projectedSalary);
  });

  it("projects further out for longer horizons", () => {
    const fiveYear = projectSalary({ ...baseInputs, yearsOut: 5, scenario: "expected" });
    const tenYear = projectSalary({ ...baseInputs, yearsOut: 10, scenario: "expected" });
    expect(tenYear.projectedSalary).toBeGreaterThan(fiveYear.projectedSalary);
  });

  it("returns a full factor breakdown for transparency", () => {
    const result = projectSalary({ ...baseInputs, scenario: "expected" });
    expect(Object.keys(result.factors)).toEqual([
      "generalWageGrowthFactor",
      "occupationGrowthFactor",
      "industryMomentumFactor",
      "experienceFactor",
      "educationFactor",
      "skillDemandFactor",
      "promotionFactor",
    ]);
    for (const value of Object.values(result.factors)) {
      expect(value).toBeGreaterThan(0);
    }
  });
});

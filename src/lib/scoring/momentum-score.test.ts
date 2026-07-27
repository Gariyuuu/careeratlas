import { describe, expect, it } from "vitest";
import { computeMomentumScore, DEFAULT_MOMENTUM_WEIGHTS, type MomentumSubscores } from "./momentum-score";

const allHigh: MomentumSubscores = {
  employmentGrowthScore: 100,
  postingGrowthScore: 100,
  salaryGrowthScore: 100,
  hiringVelocityScore: 100,
  layoffRiskScore: 100,
  skillDemandScore: 100,
  automationSafetyScore: 100,
  entryLevelScore: 100,
  geographicDiversityScore: 100,
};

describe("computeMomentumScore", () => {
  it("returns 100 when every subscore is 100", () => {
    expect(computeMomentumScore(allHigh).score).toBe(100);
  });

  it("returns 0 when every subscore is 0", () => {
    const allZero = Object.fromEntries(Object.keys(allHigh).map((k) => [k, 0])) as unknown as MomentumSubscores;
    expect(computeMomentumScore(allZero).score).toBe(0);
  });

  it("respects custom weights", () => {
    const subscores = { ...allHigh, salaryGrowthScore: 0 };
    const defaultResult = computeMomentumScore(subscores, DEFAULT_MOMENTUM_WEIGHTS);
    const zeroedWeight = computeMomentumScore(subscores, { ...DEFAULT_MOMENTUM_WEIGHTS, salaryGrowthScore: 0 });
    expect(zeroedWeight.score).toBeGreaterThan(defaultResult.score);
  });

  it("echoes back the weights used", () => {
    const result = computeMomentumScore(allHigh);
    expect(result.weights).toBe(DEFAULT_MOMENTUM_WEIGHTS);
  });
});

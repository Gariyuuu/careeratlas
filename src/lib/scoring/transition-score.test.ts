import { describe, expect, it } from "vitest";
import {
  classifyTransitionCategory,
  computeCompatibilityScore,
  computeTransitionDifficulty,
} from "./transition-score";

describe("computeCompatibilityScore", () => {
  it("returns 100 for perfect overlap on every dimension", () => {
    const result = computeCompatibilityScore({
      skillOverlap: 1,
      educationOverlap: 1,
      experienceOverlap: 1,
      industrySimilarity: 1,
    });
    expect(result.compatibilityScore).toBe(100);
  });

  it("returns 0 for no overlap on any dimension", () => {
    const result = computeCompatibilityScore({
      skillOverlap: 0,
      educationOverlap: 0,
      experienceOverlap: 0,
      industrySimilarity: 0,
    });
    expect(result.compatibilityScore).toBe(0);
  });

  it("weights skill overlap most heavily", () => {
    const skillHeavy = computeCompatibilityScore({
      skillOverlap: 1,
      educationOverlap: 0,
      experienceOverlap: 0,
      industrySimilarity: 0,
    });
    const industryHeavy = computeCompatibilityScore({
      skillOverlap: 0,
      educationOverlap: 0,
      experienceOverlap: 0,
      industrySimilarity: 1,
    });
    expect(skillHeavy.compatibilityScore).toBeGreaterThan(industryHeavy.compatibilityScore);
  });
});

describe("computeTransitionDifficulty", () => {
  it("is low when overlap is high and no seniority jump is required", () => {
    const difficulty = computeTransitionDifficulty({
      skillOverlap: 0.9,
      educationOverlap: 0.9,
      seniorityJump: 0,
      missingSkillCount: 1,
    });
    expect(difficulty).toBeLessThan(20);
  });

  it("is high when overlap is low and seniority jump is large", () => {
    const difficulty = computeTransitionDifficulty({
      skillOverlap: 0.1,
      educationOverlap: 0.1,
      seniorityJump: 4,
      missingSkillCount: 10,
    });
    expect(difficulty).toBeGreaterThan(70);
  });

  it("never exceeds 100", () => {
    const difficulty = computeTransitionDifficulty({
      skillOverlap: 0,
      educationOverlap: 0,
      seniorityJump: 20,
      missingSkillCount: 50,
    });
    expect(difficulty).toBeLessThanOrEqual(100);
  });
});

describe("classifyTransitionCategory", () => {
  it("classifies a big pay bump as highest_paying", () => {
    expect(
      classifyTransitionCategory({ salaryDeltaPct: 40, transitionDifficulty: 50, demandScore: 50, seniorityJump: 0 }),
    ).toBe("highest_paying");
  });

  it("classifies an easy transition as minimal_retraining", () => {
    expect(
      classifyTransitionCategory({ salaryDeltaPct: 5, transitionDifficulty: 10, demandScore: 50, seniorityJump: 0 }),
    ).toBe("minimal_retraining");
  });

  it("classifies a big seniority jump as ambitious", () => {
    expect(
      classifyTransitionCategory({ salaryDeltaPct: 10, transitionDifficulty: 60, demandScore: 50, seniorityJump: 3 }),
    ).toBe("ambitious");
  });
});

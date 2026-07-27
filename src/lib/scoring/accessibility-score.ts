export interface AccessibilityInputs {
  entryLevelOpeningSharePct: number; // 0-100
  typicalYearsExperienceRequired: number;
  degreeRequirementStrictnessPct: number; // 0-100, share of postings requiring a degree
  skillGapSize: number; // 0-20+, missing-skill count for a typical entrant
  geographicMarketCount: number; // number of metro areas actively hiring
}

export const ACCESSIBILITY_WEIGHTS = {
  entryLevelOpenings: 0.3,
  experienceRequirement: 0.25,
  degreeRequirement: 0.2,
  skillGap: 0.15,
  geographicReach: 0.1,
} as const;

export function computeAccessibilityScore(inputs: AccessibilityInputs) {
  const entryLevelOpenings = Math.min(100, inputs.entryLevelOpeningSharePct);
  const experienceRequirement = Math.max(0, 100 - inputs.typicalYearsExperienceRequired * 12);
  const degreeRequirement = 100 - inputs.degreeRequirementStrictnessPct;
  const skillGap = Math.max(0, 100 - inputs.skillGapSize * 6);
  const geographicReach = Math.min(100, inputs.geographicMarketCount * 8);

  const w = ACCESSIBILITY_WEIGHTS;
  const score =
    entryLevelOpenings * w.entryLevelOpenings +
    experienceRequirement * w.experienceRequirement +
    degreeRequirement * w.degreeRequirement +
    skillGap * w.skillGap +
    geographicReach * w.geographicReach;

  return {
    score: Math.round(score),
    components: { entryLevelOpenings, experienceRequirement, degreeRequirement, skillGap, geographicReach },
    weights: w,
  };
}

export interface CareerValueInputs {
  salaryOpportunityScore: number; // 0-100
  momentumScore: number; // 0-100
  accessibilityScore: number; // 0-100
  automationSafetyScore: number; // 0-100 (100 = fully safe)
  remoteFlexibilityScore: number; // 0-100
  educationCostScore: number; // 0-100 (100 = cheapest to enter)
}

export type CareerValueWeights = Record<keyof CareerValueInputs, number>;

export const DEFAULT_CAREER_VALUE_WEIGHTS: CareerValueWeights = {
  salaryOpportunityScore: 0.3,
  momentumScore: 0.2,
  accessibilityScore: 0.15,
  automationSafetyScore: 0.15,
  remoteFlexibilityScore: 0.1,
  educationCostScore: 0.1,
};

export function computeCareerValueScore(inputs: CareerValueInputs, weights: CareerValueWeights = DEFAULT_CAREER_VALUE_WEIGHTS) {
  const keys = Object.keys(inputs) as (keyof CareerValueInputs)[];
  const weightSum = keys.reduce((s, k) => s + (weights[k] ?? 0), 0) || 1;
  const score = keys.reduce((s, k) => s + inputs[k] * (weights[k] ?? 0), 0) / weightSum;
  return {
    score: Math.round(Math.min(100, Math.max(0, score))),
    components: inputs,
    weights,
  };
}

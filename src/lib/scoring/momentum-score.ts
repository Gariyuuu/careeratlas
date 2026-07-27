export interface MomentumSubscores {
  employmentGrowthScore: number; // 0-100
  postingGrowthScore: number;
  salaryGrowthScore: number;
  hiringVelocityScore: number;
  layoffRiskScore: number; // higher = safer (already inverted)
  skillDemandScore: number;
  automationSafetyScore: number; // higher = less exposed (already inverted)
  entryLevelScore: number;
  geographicDiversityScore: number;
}

export type MomentumWeights = Record<keyof MomentumSubscores, number>;

// Sums to 1.0. Exposed so the UI can let users drag sliders and recompute.
export const DEFAULT_MOMENTUM_WEIGHTS: MomentumWeights = {
  employmentGrowthScore: 0.16,
  postingGrowthScore: 0.14,
  salaryGrowthScore: 0.14,
  hiringVelocityScore: 0.1,
  layoffRiskScore: 0.12,
  skillDemandScore: 0.12,
  automationSafetyScore: 0.1,
  entryLevelScore: 0.06,
  geographicDiversityScore: 0.06,
};

export function computeMomentumScore(subscores: MomentumSubscores, weights: MomentumWeights = DEFAULT_MOMENTUM_WEIGHTS) {
  const keys = Object.keys(subscores) as (keyof MomentumSubscores)[];
  const weightSum = keys.reduce((s, k) => s + (weights[k] ?? 0), 0) || 1;
  const score = keys.reduce((s, k) => s + subscores[k] * (weights[k] ?? 0), 0) / weightSum;
  return {
    score: Math.round(Math.min(100, Math.max(0, score))),
    subscores,
    weights,
  };
}

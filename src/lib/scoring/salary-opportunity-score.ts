export interface SalaryOpportunityInputs {
  medianTotalCompPercentileRank: number; // 0-100, vs. all occupations
  fiveYearSalaryGrowthPct: number; // e.g. 18 for 18%
  salaryCeilingSpreadPct: number; // (p90 - median) / median * 100
  colAdjustedCompPercentileRank: number; // 0-100
}

export const SALARY_OPPORTUNITY_WEIGHTS = {
  medianRank: 0.35,
  growth: 0.25,
  ceiling: 0.2,
  colAdjustedRank: 0.2,
} as const;

export function computeSalaryOpportunityScore(inputs: SalaryOpportunityInputs) {
  const growthScore = Math.min(100, Math.max(0, inputs.fiveYearSalaryGrowthPct * 3));
  const ceilingScore = Math.min(100, inputs.salaryCeilingSpreadPct * 1.2);

  const w = SALARY_OPPORTUNITY_WEIGHTS;
  const score =
    inputs.medianTotalCompPercentileRank * w.medianRank +
    growthScore * w.growth +
    ceilingScore * w.ceiling +
    inputs.colAdjustedCompPercentileRank * w.colAdjustedRank;

  return {
    score: Math.round(score),
    components: {
      medianRank: inputs.medianTotalCompPercentileRank,
      growthScore,
      ceilingScore,
      colAdjustedRank: inputs.colAdjustedCompPercentileRank,
    },
    weights: w,
  };
}

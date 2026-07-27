export interface EducationRoiInputs {
  totalCost: number; // full program tuition + fees
  yearsInSchool: number;
  /** What the person could have earned per year working instead of studying. */
  forgoneEarningsPerYear: number;
  /** Estimated salary immediately after completing the program. */
  postGradSalary: number;
  /** Estimated salary for the counterfactual (no-degree) baseline path. */
  baselineSalary: number;
  /** Assumed annual salary growth rate applied to both paths, e.g. 0.03. */
  annualGrowthPct: number;
  horizonYears: number; // e.g. 10 or 20
}

export interface EducationRoiResult {
  netCost: number;
  breakEvenYear: number | null; // years after graduation; null if never within horizon
  cumulativeReturn: number; // dollar value at horizon
  returnOnInvestmentPct: number; // cumulativeReturn / netCost, at horizon
}

/**
 * Simple, transparent ROI model: compares cumulative post-grad earnings
 * against the counterfactual baseline path, net of tuition and forgone
 * earnings while in school. This is a historical-correlation estimate, not
 * a causal guarantee — see the Methodology page for caveats.
 */
export function computeEducationRoi(inputs: EducationRoiInputs): EducationRoiResult {
  const netCost = inputs.totalCost + inputs.forgoneEarningsPerYear * inputs.yearsInSchool;

  let cumulativeDelta = -netCost;
  let breakEvenYear: number | null = null;

  for (let year = 1; year <= inputs.horizonYears; year++) {
    const growth = Math.pow(1 + inputs.annualGrowthPct, year - 1);
    const gradEarnings = inputs.postGradSalary * growth;
    const baselineEarnings = inputs.baselineSalary * growth;
    cumulativeDelta += gradEarnings - baselineEarnings;
    if (breakEvenYear === null && cumulativeDelta >= 0) {
      breakEvenYear = year;
    }
  }

  return {
    netCost: Math.round(netCost),
    breakEvenYear,
    cumulativeReturn: Math.round(cumulativeDelta),
    returnOnInvestmentPct: netCost > 0 ? Math.round((cumulativeDelta / netCost) * 1000) / 10 : 0,
  };
}

export type ProjectionScenario = "conservative" | "expected" | "aggressive";

export interface ProjectionInputs {
  currentSalary: number;
  yearsOut: number; // 1, 3, 5, or 10
  scenario: ProjectionScenario;
  /** Annual economy-wide wage growth, e.g. 0.032 for 3.2%. */
  generalWageGrowthPct: number;
  /** BLS-style annualized occupation employment growth, e.g. 0.015. */
  occupationGrowthPct: number;
  /** Industry Momentum Score, 0-100. */
  industryMomentumScore: number;
  /** Years of experience today — more senior workers see flatter raise curves. */
  yearsExperience: number;
  /** 0-1, higher education correlates with faster historical wage growth. */
  educationFactor: number;
  /** 0-1, growth in demand for the person's core skills. */
  skillDemandScore: number;
  /** 0-1, likelihood of a promotion or role change within the window. */
  promotionOrTransitionProbability: number;
}

export interface ProjectionFactorBreakdown {
  generalWageGrowthFactor: number;
  occupationGrowthFactor: number;
  industryMomentumFactor: number;
  experienceFactor: number;
  educationFactor: number;
  skillDemandFactor: number;
  promotionFactor: number;
}

export interface ProjectionResult {
  projectedSalary: number;
  totalGrowthMultiple: number;
  factors: ProjectionFactorBreakdown;
}

// Scenario multipliers scale every growth factor down (conservative) or up
// (aggressive) around the expected case — see METHODOLOGY_VERSIONS in
// src/lib/seed-data/methodology.ts for the human-readable explanation shown
// in the app's Methodology panel.
const SCENARIO_MULTIPLIER: Record<ProjectionScenario, number> = {
  conservative: 0.55,
  expected: 1,
  aggressive: 1.6,
};

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

/**
 * Transparent, explainable multiplicative salary projection. Every factor is
 * returned alongside the result so the UI can show exactly how the number
 * was produced instead of hiding it behind an opaque model.
 */
export function projectSalary(inputs: ProjectionInputs): ProjectionResult {
  const scenarioMult = SCENARIO_MULTIPLIER[inputs.scenario];

  const generalWageGrowthFactor = Math.pow(1 + inputs.generalWageGrowthPct * scenarioMult, inputs.yearsOut);

  const occupationGrowthFactor = Math.pow(
    1 + clamp(inputs.occupationGrowthPct, -0.5, 0.5) * scenarioMult * 0.5,
    inputs.yearsOut,
  );

  // Momentum is 0-100; convert to an annualized nudge of at most ~2%/yr.
  const momentumAnnual = ((inputs.industryMomentumScore - 50) / 50) * 0.02 * scenarioMult;
  const industryMomentumFactor = Math.pow(1 + momentumAnnual, inputs.yearsOut);

  // Early-career workers historically see steeper raises; this decays with
  // tenure (diminishing returns) and is dampened per scenario.
  const experienceDecay = 1 / (1 + inputs.yearsExperience / 12);
  const experienceFactor = Math.pow(1 + 0.02 * experienceDecay * scenarioMult, inputs.yearsOut);

  const educationFactor = Math.pow(1 + clamp(inputs.educationFactor, 0, 1) * 0.01 * scenarioMult, inputs.yearsOut);

  const skillDemandFactor = Math.pow(1 + clamp(inputs.skillDemandScore, 0, 1) * 0.015 * scenarioMult, inputs.yearsOut);

  // Promotions/transitions are modeled as discrete step-ups rather than
  // compounding annually: probability × an assumed ~18% bump, expected to
  // occur roughly once every ~3 years within the window.
  const expectedPromotions = (inputs.yearsOut / 3) * clamp(inputs.promotionOrTransitionProbability, 0, 1) * scenarioMult;
  const promotionFactor = Math.pow(1.18, expectedPromotions);

  const factors: ProjectionFactorBreakdown = {
    generalWageGrowthFactor,
    occupationGrowthFactor,
    industryMomentumFactor,
    experienceFactor,
    educationFactor,
    skillDemandFactor,
    promotionFactor,
  };

  const totalGrowthMultiple =
    generalWageGrowthFactor *
    occupationGrowthFactor *
    industryMomentumFactor *
    experienceFactor *
    educationFactor *
    skillDemandFactor *
    promotionFactor;

  return {
    projectedSalary: Math.round(inputs.currentSalary * totalGrowthMultiple),
    totalGrowthMultiple,
    factors,
  };
}

export const PROJECTION_HORIZONS_YEARS = [1, 3, 5, 10] as const;
export const PROJECTION_SCENARIOS: ProjectionScenario[] = ["conservative", "expected", "aggressive"];

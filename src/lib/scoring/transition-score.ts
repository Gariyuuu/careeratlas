export interface TransitionScoreInputs {
  /** 0-1 share of destination-role core skills the source role already covers. */
  skillOverlap: number;
  /** 0-1 similarity of typical education requirements between the two roles. */
  educationOverlap: number;
  /** 0-1 similarity of typical experience/seniority level. */
  experienceOverlap: number;
  /** 0-1 similarity of industry/job-family context. */
  industrySimilarity: number;
}

export const TRANSITION_SCORE_WEIGHTS = {
  skillOverlap: 0.4,
  educationOverlap: 0.2,
  experienceOverlap: 0.2,
  industrySimilarity: 0.2,
} as const;

/** 0-100 compatibility score, plus the weighted components for transparency. */
export function computeCompatibilityScore(inputs: TransitionScoreInputs) {
  const w = TRANSITION_SCORE_WEIGHTS;
  const weighted =
    inputs.skillOverlap * w.skillOverlap +
    inputs.educationOverlap * w.educationOverlap +
    inputs.experienceOverlap * w.experienceOverlap +
    inputs.industrySimilarity * w.industrySimilarity;
  return {
    compatibilityScore: Math.round(weighted * 100),
    components: inputs,
    weights: w,
  };
}

export interface TransitionDifficultyInputs {
  skillOverlap: number; // 0-1
  educationOverlap: number; // 0-1
  seniorityJump: number; // ranks of seniority increase required, can be negative
  missingSkillCount: number;
}

/** 0-100, higher = harder. */
export function computeTransitionDifficulty(inputs: TransitionDifficultyInputs): number {
  const skillGapPenalty = (1 - inputs.skillOverlap) * 45;
  const educationGapPenalty = (1 - inputs.educationOverlap) * 20;
  const seniorityPenalty = Math.max(0, inputs.seniorityJump) * 8;
  const missingSkillPenalty = Math.min(inputs.missingSkillCount * 3, 20);
  return Math.round(Math.min(100, skillGapPenalty + educationGapPenalty + seniorityPenalty + missingSkillPenalty));
}

export function classifyTransitionCategory(params: {
  salaryDeltaPct: number;
  transitionDifficulty: number;
  demandScore: number;
  seniorityJump: number;
}): "adjacent" | "ambitious" | "lower_risk" | "highest_paying" | "minimal_retraining" | "strongest_demand" {
  if (params.salaryDeltaPct >= 25) return "highest_paying";
  if (params.transitionDifficulty <= 25) return "minimal_retraining";
  if (params.demandScore >= 80) return "strongest_demand";
  if (params.seniorityJump >= 2) return "ambitious";
  if (params.transitionDifficulty <= 45 && params.salaryDeltaPct >= -5) return "lower_risk";
  return "adjacent";
}

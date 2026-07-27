export interface MethodologyVersionSeed {
  scoreName: string;
  version: string;
  description: string;
  formula: string;
}

export const METHODOLOGY_VERSIONS: MethodologyVersionSeed[] = [
  {
    scoreName: "salary_projection",
    version: "1.0",
    description: "Projects future salary from current salary using transparent multiplicative factors rather than a black-box ML model.",
    formula:
      "Projected Salary = Current Salary × (1 + general wage growth)^years × occupation growth factor × industry momentum factor × experience factor × education factor × skill demand factor × promotion/transition factor. Conservative/Expected/Aggressive scenarios shift each factor down/center/up.",
  },
  {
    scoreName: "momentum_score",
    version: "1.0",
    description: "Composite 0-100 Job Market Momentum Score for an industry, built from nine weighted, user-adjustable sub-scores.",
    formula:
      "Score = Σ(weight_i × subscore_i) over: employment growth, posting growth, salary growth, hiring velocity, layoff risk (inverted), skill demand growth, automation safety (inverted exposure), entry-level availability, geographic diversity. Default weights sum to 1.0 and are shown in the UI, which lets users override them.",
  },
  {
    scoreName: "transition_score",
    version: "1.0",
    description: "Scores how compatible and attractive a transition between two occupations is.",
    formula:
      "Compatibility = weighted overlap of skills, education requirements, experience level, and industry/job-family similarity. Opportunity, demand, and confidence are scored separately and shown alongside compatibility rather than blended into one hidden number.",
  },
  {
    scoreName: "education_roi",
    version: "1.0",
    description: "Estimates the financial return on an education path from cost, time, and post-graduation earnings.",
    formula:
      "Net Cost = Total Tuition + Fees − Earnings During School (if part-time work assumed). Break-even Year = first year cumulative (post-grad earnings − no-degree baseline earnings) exceeds Net Cost + forgone earnings while in school. 10/20-year return = cumulative earnings differential over that horizon minus Net Cost, expressed as a percentage of Net Cost.",
  },
  {
    scoreName: "salary_opportunity_score",
    version: "1.0",
    description: "Scores an occupation's compensation attractiveness.",
    formula: "Score = weighted blend of median total compensation percentile rank, 5-year salary growth, salary ceiling (p90/median spread), and cost-of-living-adjusted compensation percentile rank.",
  },
  {
    scoreName: "accessibility_score",
    version: "1.0",
    description: "Scores how accessible an occupation is to enter.",
    formula: "Score = weighted blend of entry-level opening share, inverse of typical required experience, inverse of degree-requirement strictness, inverse of skill-gap size, and number of geographic markets hiring for the role.",
  },
  {
    scoreName: "career_value_score",
    version: "1.0",
    description: "Optional combined score blending compensation, growth, accessibility, stability, flexibility, and transition potential.",
    formula: "Score = user-weighted average of Salary Opportunity Score, Momentum Score, Accessibility Score, Automation Safety, Remote Flexibility, and (inverted) Education Cost.",
  },
  {
    scoreName: "confidence_score",
    version: "1.0",
    description: "Estimates how much to trust a given data point.",
    formula: "Confidence = function of sample size, data recency, and whether the value is reported (highest), estimated, forecast, or simulated (lowest baseline confidence).",
  },
];

/**
 * Cost-of-living adjustment. `costOfLivingIndex` is 100 = US national
 * baseline (see src/lib/seed-data/geography.ts). A nominal salary in an
 * expensive metro (index 190) buys less than the same number in a
 * baseline-cost metro, so the COL-adjusted figure divides it back down to
 * baseline purchasing power for apples-to-apples comparison.
 */
export function adjustForCostOfLiving(nominalSalary: number, costOfLivingIndex: number): number {
  if (costOfLivingIndex <= 0) return nominalSalary;
  return Math.round(nominalSalary / (costOfLivingIndex / 100));
}

export function nominalFromColAdjusted(colAdjustedSalary: number, costOfLivingIndex: number): number {
  return Math.round(colAdjustedSalary * (costOfLivingIndex / 100));
}

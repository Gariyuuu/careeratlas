import { describe, expect, it } from "vitest";
import { adjustForCostOfLiving, nominalFromColAdjusted } from "./cost-of-living";

describe("adjustForCostOfLiving", () => {
  it("leaves salary unchanged at the baseline index of 100", () => {
    expect(adjustForCostOfLiving(100_000, 100)).toBe(100_000);
  });

  it("reduces adjusted salary in an expensive metro", () => {
    expect(adjustForCostOfLiving(150_000, 190)).toBeLessThan(150_000);
  });

  it("increases adjusted salary in a cheap metro", () => {
    expect(adjustForCostOfLiving(80_000, 80)).toBeGreaterThan(80_000);
  });

  it("round-trips through nominalFromColAdjusted", () => {
    const nominal = 137_000;
    const index = 142;
    const adjusted = adjustForCostOfLiving(nominal, index);
    expect(nominalFromColAdjusted(adjusted, index)).toBeCloseTo(nominal, -1);
  });
});

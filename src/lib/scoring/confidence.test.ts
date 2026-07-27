import { describe, expect, it } from "vitest";
import { computeConfidence, confidenceLabel } from "./confidence";

const now = new Date("2026-01-01T00:00:00Z");

describe("computeConfidence", () => {
  it("gives simulated data a low ceiling regardless of sample size", () => {
    const score = computeConfidence({
      sampleSize: 1_000_000,
      dataStatus: "simulated",
      observedAt: now,
      now,
    });
    expect(score).toBeLessThanOrEqual(0.55);
  });

  it("ranks reported data above estimated above forecast above simulated", () => {
    const args = { sampleSize: 500, observedAt: now, now };
    const reported = computeConfidence({ ...args, dataStatus: "reported" });
    const estimated = computeConfidence({ ...args, dataStatus: "estimated" });
    const forecast = computeConfidence({ ...args, dataStatus: "forecast" });
    const simulated = computeConfidence({ ...args, dataStatus: "simulated" });
    expect(reported).toBeGreaterThan(estimated);
    expect(estimated).toBeGreaterThan(forecast);
    expect(forecast).toBeGreaterThan(simulated);
  });

  it("reduces confidence for stale data", () => {
    const fresh = computeConfidence({
      sampleSize: 500,
      dataStatus: "reported",
      observedAt: now,
      now,
    });
    const stale = computeConfidence({
      sampleSize: 500,
      dataStatus: "reported",
      observedAt: new Date("2020-01-01T00:00:00Z"),
      now,
    });
    expect(stale).toBeLessThan(fresh);
  });
});

describe("confidenceLabel", () => {
  it("labels scores correctly", () => {
    expect(confidenceLabel(0.9)).toBe("high");
    expect(confidenceLabel(0.5)).toBe("moderate");
    expect(confidenceLabel(0.1)).toBe("low");
  });
});

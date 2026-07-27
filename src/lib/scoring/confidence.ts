export type DataStatus = "reported" | "estimated" | "forecast" | "simulated";

// Simulated data is capped low no matter how large the "sample size" is —
// it must never look as trustworthy as real observations.
const STATUS_BASE_CONFIDENCE: Record<DataStatus, number> = {
  reported: 0.9,
  estimated: 0.7,
  forecast: 0.55,
  simulated: 0.35,
};

export interface ConfidenceInputs {
  sampleSize: number;
  dataStatus: DataStatus;
  observedAt: Date;
  now?: Date;
}

/**
 * 0-1 confidence score. Sample size and data age adjust a status-based
 * baseline; simulated data can never exceed a fixed ceiling regardless of
 * inputs, so it can't be mistaken for verified data.
 */
export function computeConfidence(inputs: ConfidenceInputs): number {
  const now = inputs.now ?? new Date();
  const base = STATUS_BASE_CONFIDENCE[inputs.dataStatus];

  const sampleFactor = Math.min(1, Math.log10(Math.max(inputs.sampleSize, 1) + 1) / Math.log10(1000));

  const ageDays = Math.max(0, (now.getTime() - inputs.observedAt.getTime()) / 86_400_000);
  const recencyFactor = Math.max(0.5, 1 - ageDays / 730); // linear decay over ~2 years, floor at 0.5

  const raw = base * (0.5 + 0.35 * sampleFactor + 0.15 * recencyFactor);
  const ceiling = inputs.dataStatus === "simulated" ? 0.55 : 1;
  return Math.round(Math.min(raw, ceiling) * 100) / 100;
}

export function confidenceLabel(score: number): "low" | "moderate" | "high" {
  if (score >= 0.7) return "high";
  if (score >= 0.45) return "moderate";
  return "low";
}

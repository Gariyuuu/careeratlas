import type { IndustryCategory } from "./industries";
import { createRng, rngRange, rngSeeded } from "./rng";

// Deterministic, order-of-magnitude compensation model used only to
// populate the demo/seed database. Every row this feeds into is stamped
// dataStatus="simulated" so the UI never presents it as verified pay data.

export const CATEGORY_PAY_CURVE: Record<IndustryCategory, { entryBase: number; topMultiplier: number }> = {
  technology: { entryBase: 95_000, topMultiplier: 11 },
  finance: { entryBase: 88_000, topMultiplier: 13 },
  "professional-services": { entryBase: 75_000, topMultiplier: 9 },
  "healthcare-science": { entryBase: 72_000, topMultiplier: 8 },
  "public-education": { entryBase: 54_000, topMultiplier: 6 },
  "industrial-energy": { entryBase: 68_000, topMultiplier: 8 },
  "consumer-retail": { entryBase: 50_000, topMultiplier: 7 },
  "creative-media": { entryBase: 55_000, topMultiplier: 7 },
  "trades-services": { entryBase: 48_000, topMultiplier: 4.5 },
};

const MAX_RANK = 13;

export function baseSalaryForRank(category: IndustryCategory, rank: number): number {
  const { entryBase, topMultiplier } = CATEGORY_PAY_CURVE[category];
  const t = Math.min(rank, MAX_RANK) / MAX_RANK;
  return entryBase * Math.pow(topMultiplier, t);
}

const KEYWORD_MULTIPLIERS: [RegExp, number][] = [
  [/physician|chief medical officer|medical director/i, 1.75],
  [/quantitative|algorithmic trad|market maker|derivatives trader|low-latency/i, 1.3],
  [/actuary|actuarial/i, 1.15],
  [/machine learning|ai research|applied scientist|research scientist|ai safety/i, 1.2],
  [/nurse practitioner|physician assistant/i, 1.2],
  [/registered nurse/i, 0.95],
  [/teacher|educator/i, 0.85],
  [/apprentice/i, 0.55],
  [/intern\b/i, 0.45],
  [/pharmacist/i, 1.25],
  [/attorney|counsel/i, 1.3],
];

export function occupationTierMultiplier(title: string, occupationSlug: string): number {
  let mult = 1;
  for (const [re, m] of KEYWORD_MULTIPLIERS) {
    if (re.test(title)) mult *= m;
  }
  const rng = createRng(rngSeeded("tier", occupationSlug));
  return mult * rngRange(rng, 0.92, 1.1);
}

export const COMPANY_SIZE_MULTIPLIER: Record<string, number> = {
  startup: 0.92,
  small: 0.95,
  mid: 1.0,
  large: 1.08,
  enterprise: 1.15,
};

export const WORK_ARRANGEMENT_MULTIPLIER: Record<string, number> = {
  onsite: 1.0,
  hybrid: 1.02,
  remote: 0.98,
};

export const EQUITY_HEAVY_CATEGORIES: IndustryCategory[] = ["technology", "finance"];

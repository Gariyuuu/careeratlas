import { prisma } from "@/lib/prisma";
import { computeConfidence } from "@/lib/scoring/confidence";
import { BLS_OCCUPATION_MAPPING } from "@/lib/seed-data/bls-occupation-mapping";
import { getUsCountryId } from "@/lib/data/geography";
import type { DataProvider } from "./types";

// U.S. Occupational Employment and Wage Statistics (OEWS) — real national
// wage percentiles and employment counts by Standard Occupational
// Classification (SOC) code. Unlike the average-hourly-earnings connector,
// this one replaces per-occupation simulated salary data with real reported
// figures for every occupation in BLS_OCCUPATION_MAPPING.
//
// Series ID format (25 chars), reverse-engineered against the live API:
//   "OEUN" + 13 zero-padded digits (national, all industries)
//   + 6-digit SOC code + 2-digit data type code
// Data type codes used: 01 = employment, 11-15 = annual 10th/25th/median/
// 75th/90th percentile wage. (03/04 = hourly/annual mean; not used here.)
const DATATYPE = {
  employment: "01",
  p10: "11",
  p25: "12",
  median: "13",
  p75: "14",
  p90: "15",
} as const;

const BLS_API_URL = "https://api.bls.gov/publicAPI/v2/timeseries/data/";
const MAX_SERIES_PER_REQUEST = 50;

function buildSeriesId(socCode: string, datatype: string): string {
  return `OEUN${"0".repeat(13)}${socCode}${datatype}`;
}

interface BlsSeriesDatum {
  year: string;
  value: string;
}

interface BlsBatchResponse {
  status: string;
  message: string[];
  Results?: { series: { seriesID: string; data: BlsSeriesDatum[] }[] };
}

export interface OewsRow {
  socCode: string;
  employment: number;
  p10: number;
  p25: number;
  median: number;
  p75: number;
  p90: number;
}

function chunk<T>(arr: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

export const blsOewsProvider: DataProvider<Map<string, number>, OewsRow> = {
  slug: "bls-oews",

  isConfigured() {
    return true; // works unauthenticated at a low rate limit
  },

  async fetchData() {
    const apiKey = process.env.BLS_API_KEY;
    const uniqueSocCodes = [...new Set(BLS_OCCUPATION_MAPPING.map((m) => m.socCode))];
    const datatypes = Object.values(DATATYPE);
    const allSeriesIds = uniqueSocCodes.flatMap((soc) => datatypes.map((dt) => buildSeriesId(soc, dt)));

    const valuesBySeriesId = new Map<string, number>();
    for (const batch of chunk(allSeriesIds, MAX_SERIES_PER_REQUEST)) {
      const res = await fetch(BLS_API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ seriesid: batch, registrationkey: apiKey || undefined }),
        signal: AbortSignal.timeout(20_000),
      });
      if (!res.ok) throw new Error(`BLS API responded with ${res.status}`);
      const json = (await res.json()) as BlsBatchResponse;
      if (json.status !== "REQUEST_SUCCEEDED") throw new Error(json.message?.join("; ") || "BLS OEWS request failed");
      for (const series of json.Results?.series ?? []) {
        const latest = series.data[0]; // API returns most-recent-first
        if (latest) valuesBySeriesId.set(series.seriesID, Number(latest.value));
      }
    }
    return valuesBySeriesId;
  },

  normalizeData(raw) {
    const uniqueSocCodes = [...new Set(BLS_OCCUPATION_MAPPING.map((m) => m.socCode))];
    const rows: OewsRow[] = [];
    for (const socCode of uniqueSocCodes) {
      const get = (dt: string) => raw.get(buildSeriesId(socCode, dt));
      const employment = get(DATATYPE.employment);
      const p10 = get(DATATYPE.p10);
      const p25 = get(DATATYPE.p25);
      const median = get(DATATYPE.median);
      const p75 = get(DATATYPE.p75);
      const p90 = get(DATATYPE.p90);
      if ([employment, p10, p25, median, p75, p90].every((v) => v != null)) {
        rows.push({ socCode, employment: employment!, p10: p10!, p25: p25!, median: median!, p75: p75!, p90: p90! });
      }
    }
    return rows;
  },

  validateData(rows) {
    const warnings: string[] = [];
    let rejected = 0;
    const valid = rows.filter((r) => {
      const monotonic = r.p10 <= r.p25 && r.p25 <= r.median && r.median <= r.p75 && r.p75 <= r.p90;
      const positive = [r.employment, r.p10, r.p25, r.median, r.p75, r.p90].every((v) => v > 0);
      if (!monotonic || !positive) {
        rejected++;
        return false;
      }
      return true;
    });
    if (rejected > 0) warnings.push(`${rejected} SOC code(s) rejected for non-monotonic or non-positive wage data.`);
    const missingSocCodes = [...new Set(BLS_OCCUPATION_MAPPING.map((m) => m.socCode))].filter(
      (soc) => !rows.some((r) => r.socCode === soc),
    );
    if (missingSocCodes.length > 0) {
      warnings.push(`No data returned for SOC code(s): ${missingSocCodes.join(", ")}`);
    }
    return { valid, rejected, warnings };
  },

  async upsertData(rows) {
    const source = await prisma.dataSource.findUnique({ where: { slug: "bls-oews" } });
    const usCountryId = await getUsCountryId();
    const now = new Date();
    let updatedOccupations = 0;

    const bySocCode = new Map(rows.map((r) => [r.socCode, r]));

    for (const mapping of BLS_OCCUPATION_MAPPING) {
      const data = bySocCode.get(mapping.socCode);
      if (!data) continue;

      const occupation = await prisma.occupation.findUnique({
        where: { slug: mapping.occupationSlug },
        select: { id: true },
      });
      if (!occupation) continue;

      const confidence = computeConfidence({ sampleSize: data.employment, dataStatus: "reported", observedAt: now, now });

      // BLS OEWS doesn't break wages out by seniority — every seniority
      // level's percentile row is replaced with the same national,
      // all-experience-levels figures, clearly marked "reported".
      await prisma.salaryPercentile.updateMany({
        where: { occupationId: occupation.id, countryId: usCountryId },
        data: {
          p10: data.p10,
          p25: data.p25,
          median: data.median,
          p75: data.p75,
          p90: data.p90,
          mean: Math.round((data.p10 + data.p25 + data.median + data.p75 + data.p90) / 5),
          sampleSize: data.employment,
          observedAt: now,
          dataStatus: "reported",
          confidence,
          sourceId: source?.id,
        },
      });

      await prisma.employmentStatistic.updateMany({
        where: { occupationId: occupation.id, countryId: usCountryId },
        data: {
          employedCount: data.employment,
          dataStatus: "reported",
          sourceId: source?.id,
        },
      });

      updatedOccupations++;
    }

    return updatedOccupations;
  },
};

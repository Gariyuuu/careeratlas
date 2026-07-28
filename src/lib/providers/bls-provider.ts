import { prisma } from "@/lib/prisma";
import type { DataProvider } from "./types";

// U.S. average hourly earnings, total private (seasonally adjusted).
// Used as a real, live "general wage growth" reference point — the seed
// dataset's per-role numbers stay simulated, but this one indicator is
// genuinely fetched from the BLS public API.
const SERIES_ID = "CES0500000003";
const BLS_BASE_URL = "https://api.bls.gov/publicAPI/v2/timeseries/data/";

interface BlsDataPoint {
  year: string;
  period: string; // "M01".."M12"
  periodName: string;
  value: string;
}

interface BlsResponse {
  status: string;
  message: string[];
  Results?: { series: { seriesID: string; data: BlsDataPoint[] }[] };
}

export interface NormalizedWagePoint {
  year: number;
  month: number;
  value: number;
}

export const blsAverageHourlyEarningsProvider: DataProvider<BlsResponse, NormalizedWagePoint> = {
  slug: "bls-ces",

  isConfigured() {
    // BLS's public API works unauthenticated at a low daily rate limit; a
    // free registration key just raises that quota, so this connector is
    // always "configured" — no key required to run it.
    return true;
  },

  async fetchData() {
    const apiKey = process.env.BLS_API_KEY;
    const url = apiKey ? `${BLS_BASE_URL}${SERIES_ID}?registrationkey=${apiKey}` : `${BLS_BASE_URL}${SERIES_ID}`;
    const res = await fetch(url, { headers: { Accept: "application/json" }, signal: AbortSignal.timeout(15_000) });
    if (!res.ok) throw new Error(`BLS API responded with ${res.status}`);
    const json = (await res.json()) as BlsResponse;
    if (json.status !== "REQUEST_SUCCEEDED") throw new Error(json.message?.join("; ") || "BLS request failed");
    return json;
  },

  normalizeData(raw) {
    const points = raw.Results?.series[0]?.data ?? [];
    return points
      .filter((p) => p.period.startsWith("M") && p.period !== "M13")
      .map((p) => ({ year: Number(p.year), month: Number(p.period.slice(1)), value: Number(p.value) }));
  },

  validateData(rows) {
    const warnings: string[] = [];
    let rejected = 0;
    const valid = rows.filter((r) => {
      if (!Number.isFinite(r.value) || r.value <= 0) {
        rejected++;
        return false;
      }
      return true;
    });
    if (valid.length < 13) {
      warnings.push("Fewer than 13 months of data returned — YoY growth could not be computed for all points.");
    }
    return { valid, rejected, warnings };
  },

  async upsertData(rows) {
    if (rows.length === 0) return 0;
    const sorted = [...rows].sort((a, b) => a.year * 12 + a.month - (b.year * 12 + b.month));
    const latest = sorted.at(-1);
    const yearAgoIndex = sorted.length - 13;
    const yearAgo = yearAgoIndex >= 0 ? sorted[yearAgoIndex] : undefined;
    if (!latest) return 0;

    const source = await prisma.dataSource.findUnique({ where: { slug: "bls-ces" } });

    await prisma.economicIndicator.upsert({
      where: { slug: "us-avg-hourly-earnings-level" },
      create: {
        slug: "us-avg-hourly-earnings-level",
        label: "US Average Hourly Earnings, Total Private",
        value: latest.value,
        unit: "usd",
        observedAt: new Date(latest.year, latest.month - 1, 1),
        dataStatus: "reported",
        sourceId: source?.id,
      },
      update: {
        value: latest.value,
        observedAt: new Date(latest.year, latest.month - 1, 1),
        dataStatus: "reported",
        sourceId: source?.id,
      },
    });

    let imported = 1;
    if (yearAgo) {
      const yoyPct = ((latest.value - yearAgo.value) / yearAgo.value) * 100;
      await prisma.economicIndicator.upsert({
        where: { slug: "us-avg-hourly-earnings-yoy" },
        create: {
          slug: "us-avg-hourly-earnings-yoy",
          label: "US Average Hourly Earnings, YoY Growth",
          value: Math.round(yoyPct * 100) / 100,
          unit: "pct",
          observedAt: new Date(latest.year, latest.month - 1, 1),
          dataStatus: "reported",
          sourceId: source?.id,
        },
        update: {
          value: Math.round(yoyPct * 100) / 100,
          observedAt: new Date(latest.year, latest.month - 1, 1),
          dataStatus: "reported",
          sourceId: source?.id,
        },
      });
      imported = 2;
    }
    return imported;
  },
};

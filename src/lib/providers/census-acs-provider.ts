import { prisma } from "@/lib/prisma";
import { computeConfidence } from "@/lib/scoring/confidence";
import type { DataProvider } from "./types";

// U.S. Census Bureau American Community Survey (ACS 1-year), Subject Table
// S1501 — real national median earnings by educational attainment. This is
// the cleanly available cross-tabulation; ACS does NOT publish earnings by
// specific college major/field at this aggregate level (that level of
// detail only exists in restricted PUMS microdata), so this connector
// upgrades the degree-LEVEL baseline (no college / some college / bachelor's
// / graduate) rather than per-major figures, attached to a general
// "no declared major" bucket plus economy-wide reference indicators.
const ACS_URL = "https://api.census.gov/data/2023/acs/acs1/subject";

// S1501 Total-estimate variable codes, in order: <HS, HS grad, some
// college/associate, bachelor's, graduate/professional.
const VARIABLES = ["S1501_C01_060E", "S1501_C01_061E", "S1501_C01_062E", "S1501_C01_063E", "S1501_C01_064E"] as const;

export interface AcsEarningsRow {
  lessThanHs: number;
  hsGraduate: number;
  someCollegeOrAssociate: number;
  bachelor: number;
  graduateOrProfessional: number;
}

export const censusAcsProvider: DataProvider<AcsEarningsRow, AcsEarningsRow> = {
  slug: "census-acs",

  isConfigured() {
    return !!process.env.CENSUS_API_KEY;
  },

  async fetchData() {
    const url = new URL(ACS_URL);
    url.searchParams.set("get", `NAME,${VARIABLES.join(",")}`);
    url.searchParams.set("for", "us:*");
    url.searchParams.set("key", process.env.CENSUS_API_KEY!);
    const res = await fetch(url, { signal: AbortSignal.timeout(15_000) });
    if (!res.ok) throw new Error(`Census ACS API responded with ${res.status}`);
    const rows = (await res.json()) as string[][];
    const [header, data] = rows;
    const idx = (v: string) => header.indexOf(v);
    return {
      lessThanHs: Number(data[idx("S1501_C01_060E")]),
      hsGraduate: Number(data[idx("S1501_C01_061E")]),
      someCollegeOrAssociate: Number(data[idx("S1501_C01_062E")]),
      bachelor: Number(data[idx("S1501_C01_063E")]),
      graduateOrProfessional: Number(data[idx("S1501_C01_064E")]),
    };
  },

  normalizeData(raw) {
    return [raw];
  },

  validateData(rows) {
    const warnings: string[] = [];
    let rejected = 0;
    const valid = rows.filter((r) => {
      const values = Object.values(r);
      const ok = values.every((v) => Number.isFinite(v) && v > 0) && r.lessThanHs < r.hsGraduate && r.hsGraduate < r.bachelor;
      if (!ok) rejected++;
      return ok;
    });
    return { valid, rejected, warnings };
  },

  async upsertData(rows) {
    const row = rows[0];
    if (!row) return 0;

    const source = await prisma.dataSource.findUnique({ where: { slug: "census-acs" } });
    const now = new Date();
    let written = 0;

    // Economy-wide reference indicators (shown on the admin data-status page).
    const indicators: [string, string, number][] = [
      ["us-median-earnings-less-than-hs", "US Median Earnings — Less Than High School", row.lessThanHs],
      ["us-median-earnings-hs-grad", "US Median Earnings — High School Graduate", row.hsGraduate],
      ["us-median-earnings-some-college", "US Median Earnings — Some College or Associate's Degree", row.someCollegeOrAssociate],
      ["us-median-earnings-bachelor", "US Median Earnings — Bachelor's Degree", row.bachelor],
      ["us-median-earnings-graduate", "US Median Earnings — Graduate or Professional Degree", row.graduateOrProfessional],
    ];
    for (const [slug, label, value] of indicators) {
      await prisma.economicIndicator.upsert({
        where: { slug },
        create: { slug, label, value, unit: "usd", observedAt: now, dataStatus: "reported", sourceId: source?.id },
        update: { value, observedAt: now, dataStatus: "reported", sourceId: source?.id },
      });
      written++;
    }

    // General/no-declared-major education outcomes — the one place ACS's
    // degree-LEVEL (not major-specific) earnings cleanly fits our schema.
    const generalMajor = await prisma.major.upsert({
      where: { slug: "general-no-declared-major" },
      create: { slug: "general-no-declared-major", name: "General / No Declared Major", category: "General" },
      update: {},
    });

    const outcomeRows: [string, number][] = [
      ["no_college", row.hsGraduate],
      ["some_college", row.someCollegeOrAssociate],
      ["associate", row.someCollegeOrAssociate],
      ["bachelor", row.bachelor],
      ["master", row.graduateOrProfessional],
    ];
    for (const [degreeLevel, entrySalaryMedian] of outcomeRows) {
      const sampleSize = 50_000; // ACS 1-year national sample is large; this is a conservative stand-in
      await prisma.educationOutcome.deleteMany({ where: { majorId: generalMajor.id, degreeLevel } });
      await prisma.educationOutcome.create({
        data: {
          majorId: generalMajor.id,
          degreeLevel,
          entrySalaryMedian,
          salaryPremiumPct: Math.round(((entrySalaryMedian - row.hsGraduate) / row.hsGraduate) * 1000) / 10,
          sampleSize,
          dataStatus: "reported",
          confidence: computeConfidence({ sampleSize, dataStatus: "reported", observedAt: now, now }),
          sourceId: source?.id,
        },
      });
      written++;
    }

    return written;
  },
};

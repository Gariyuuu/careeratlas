import { prisma } from "@/lib/prisma";
import { INSTITUTIONS } from "@/lib/seed-data/education";
import type { DataProvider } from "./types";

// U.S. Department of Education College Scorecard — real per-institution
// tuition, sourced live for the subset of CareerAtlas's seeded institutions
// that are real U.S. Title-IV institutions College Scorecard actually
// covers (bootcamps and non-U.S. schools in the seed data aren't in scope).
const API_URL = "https://api.data.gov/ed/collegescorecard/v1/schools";

interface ScorecardResult {
  "school.name": string;
  "latest.cost.tuition.in_state": number | null;
  "latest.cost.tuition.out_of_state": number | null;
}

export interface CollegeScorecardRow {
  institutionSlug: string;
  tuitionInState: number;
  tuitionOutState: number;
}

const US_TRADITIONAL_INSTITUTIONS = INSTITUTIONS.filter(
  (i) => i.countryCode === "US" && (i.levelType === "four_year" || i.levelType === "two_year"),
);

// College Scorecard's official school.name doesn't always match common
// usage (multi-campus systems in particular) — override the search term
// for the handful that don't resolve under their common name.
const SEARCH_NAME_OVERRIDES: Record<string, string> = {
  "university-of-california-berkeley": "University of California-Berkeley",
  "arizona-state-university": "Arizona State University Campus Immersion",
};

export const collegeScorecardProvider: DataProvider<Map<string, ScorecardResult>, CollegeScorecardRow> = {
  slug: "college-scorecard",

  isConfigured() {
    return !!process.env.COLLEGE_SCORECARD_API_KEY;
  },

  async fetchData() {
    const apiKey = process.env.COLLEGE_SCORECARD_API_KEY;
    const results = new Map<string, ScorecardResult>();
    for (const inst of US_TRADITIONAL_INSTITUTIONS) {
      const url = new URL(API_URL);
      url.searchParams.set("school.name", SEARCH_NAME_OVERRIDES[inst.slug] ?? inst.name);
      url.searchParams.set("fields", "school.name,latest.cost.tuition.in_state,latest.cost.tuition.out_of_state");
      url.searchParams.set("api_key", apiKey!);
      const res = await fetch(url, { signal: AbortSignal.timeout(15_000) });
      if (!res.ok) continue; // don't fail the whole run for one bad lookup
      const json = (await res.json()) as { results?: ScorecardResult[] };
      const match = json.results?.[0];
      if (match) results.set(inst.slug, match);
    }
    return results;
  },

  normalizeData(raw) {
    const rows: CollegeScorecardRow[] = [];
    for (const [slug, r] of raw) {
      const inState = r["latest.cost.tuition.in_state"];
      const outState = r["latest.cost.tuition.out_of_state"];
      if (inState != null || outState != null) {
        rows.push({ institutionSlug: slug, tuitionInState: inState ?? outState!, tuitionOutState: outState ?? inState! });
      }
    }
    return rows;
  },

  validateData(rows) {
    const warnings: string[] = [];
    let rejected = 0;
    const valid = rows.filter((r) => {
      const ok = r.tuitionInState > 0 && r.tuitionInState < 200_000 && r.tuitionOutState > 0 && r.tuitionOutState < 200_000;
      if (!ok) rejected++;
      return ok;
    });
    const missing = US_TRADITIONAL_INSTITUTIONS.filter((i) => !rows.some((r) => r.institutionSlug === i.slug));
    if (missing.length > 0) warnings.push(`No match found for: ${missing.map((m) => m.name).join(", ")}`);
    return { valid, rejected, warnings };
  },

  async upsertData(rows) {
    const source = await prisma.dataSource.findUnique({ where: { slug: "college-scorecard" } });
    let written = 0;

    for (const row of rows) {
      const institution = await prisma.institution.findUnique({ where: { slug: row.institutionSlug } });
      if (!institution) continue;

      await prisma.institution.update({
        where: { id: institution.id },
        data: { annualTuitionInState: row.tuitionInState, annualTuitionOutState: row.tuitionOutState },
      });

      const years = institution.levelType === "two_year" ? 2 : 4;
      const degreeLevel = institution.levelType === "two_year" ? "associate" : "bachelor";
      const totalCost = Math.round(row.tuitionInState * years);

      await prisma.collegeCost.deleteMany({ where: { institutionId: institution.id, degreeLevel } });
      await prisma.collegeCost.create({
        data: { institutionId: institution.id, degreeLevel, totalCost, years, dataStatus: "reported", sourceId: source?.id },
      });
      written++;
    }

    return written;
  },
};

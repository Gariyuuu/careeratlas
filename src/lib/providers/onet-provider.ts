import { unzipSync, strFromU8 } from "fflate";
import { prisma } from "@/lib/prisma";
import { BLS_OCCUPATION_MAPPING } from "@/lib/seed-data/bls-occupation-mapping";
import type { DataProvider } from "./types";

// O*NET database flat files — real, free, no API key required (unlike
// O*NET's Web Services API, which is key-gated). Publishes real education
// requirements and alternate job titles per O*NET-SOC code, sourced from
// actual job-incumbent and occupational-expert surveys run for the U.S.
// Department of Labor.
const ONET_DB_URL = "https://www.onetcenter.org/dl_files/database/db_29_1_text.zip";
const ZIP_ROOT = "db_29_1_text/";

// O*NET's 12-point "Required Level of Education" scale, collapsed onto
// CareerAtlas's degree-level taxonomy.
const RL_CATEGORY_TO_DEGREE_LEVEL: Record<string, string> = {
  "1": "no_college",
  "2": "no_college",
  "3": "certificate",
  "4": "some_college",
  "5": "associate",
  "6": "bachelor",
  "7": "certificate",
  "8": "master",
  "9": "certificate",
  "10": "professional",
  "11": "doctorate",
  "12": "doctorate",
};

interface EducationRow {
  socCode: string; // 6-digit, no dash
  degreeLevel: string;
  pct: number; // 0-1
}

interface AliasRow {
  socCode: string;
  alias: string;
}

export interface OnetData {
  education: EducationRow[];
  aliases: AliasRow[];
}

function toSixDigitSoc(onetSocCode: string): string {
  // "29-1141.00" -> "291141"
  return onetSocCode.split(".")[0].replace("-", "");
}

function parseTsv(text: string): string[][] {
  return text
    .split("\n")
    .filter((line) => line.trim().length > 0)
    .map((line) => line.split("\t"));
}

export const onetProvider: DataProvider<{ files: Record<string, string> }, EducationRow | AliasRow> = {
  slug: "onet",

  isConfigured() {
    return true; // fully keyless
  },

  async fetchData() {
    const res = await fetch(ONET_DB_URL, { signal: AbortSignal.timeout(30_000) });
    if (!res.ok) throw new Error(`O*NET database download responded with ${res.status}`);
    const buf = new Uint8Array(await res.arrayBuffer());
    const unzipped = unzipSync(buf, {
      filter: (file) =>
        file.name === `${ZIP_ROOT}Education, Training, and Experience.txt` || file.name === `${ZIP_ROOT}Alternate Titles.txt`,
    });
    const files: Record<string, string> = {};
    for (const [name, data] of Object.entries(unzipped)) files[name] = strFromU8(data);
    return { files };
  },

  normalizeData(raw) {
    const socCodesOfInterest = new Set(BLS_OCCUPATION_MAPPING.map((m) => m.socCode));
    const rows: (EducationRow | AliasRow)[] = [];

    const eduText = raw.files[`${ZIP_ROOT}Education, Training, and Experience.txt`];
    if (eduText) {
      const [header, ...lines] = parseTsv(eduText);
      const idx = {
        soc: header.indexOf("O*NET-SOC Code"),
        elementId: header.indexOf("Element ID"),
        category: header.indexOf("Category"),
        dataValue: header.indexOf("Data Value"),
      };
      for (const cols of lines) {
        if (cols[idx.elementId] !== "2.D.1") continue; // "Required Level of Education" only
        if (!cols[idx.soc].endsWith(".00")) continue; // skip O*NET detailed sub-occupations (e.g. "29-1141.01 Acute Care Nurses")
        const socCode = toSixDigitSoc(cols[idx.soc]);
        if (!socCodesOfInterest.has(socCode)) continue;
        const degreeLevel = RL_CATEGORY_TO_DEGREE_LEVEL[cols[idx.category]];
        const pct = Number(cols[idx.dataValue]) / 100;
        if (degreeLevel && Number.isFinite(pct) && pct > 0) {
          rows.push({ socCode, degreeLevel, pct });
        }
      }
    }

    const aliasText = raw.files[`${ZIP_ROOT}Alternate Titles.txt`];
    if (aliasText) {
      const [header, ...lines] = parseTsv(aliasText);
      const idx = { soc: header.indexOf("O*NET-SOC Code"), title: header.indexOf("Alternate Title") };
      const seenPerSoc = new Map<string, number>();
      for (const cols of lines) {
        if (!cols[idx.soc].endsWith(".00")) continue; // base occupation only, not O*NET detailed sub-occupations
        const socCode = toSixDigitSoc(cols[idx.soc]);
        if (!socCodesOfInterest.has(socCode)) continue;
        const count = seenPerSoc.get(socCode) ?? 0;
        if (count >= 6) continue; // cap per occupation — O*NET lists 100+ for some
        seenPerSoc.set(socCode, count + 1);
        rows.push({ socCode, alias: cols[idx.title] });
      }
    }

    return rows;
  },

  validateData(rows) {
    const warnings: string[] = [];
    let rejected = 0;
    const valid = rows.filter((r) => {
      if ("pct" in r) {
        const ok = r.pct > 0 && r.pct <= 1;
        if (!ok) rejected++;
        return ok;
      }
      const ok = typeof r.alias === "string" && r.alias.trim().length > 0;
      if (!ok) rejected++;
      return ok;
    });
    const socCodesOfInterest = new Set(BLS_OCCUPATION_MAPPING.map((m) => m.socCode));
    const socCodesWithEducation = new Set(valid.filter((r): r is EducationRow => "pct" in r).map((r) => r.socCode));
    const missing = [...socCodesOfInterest].filter((s) => !socCodesWithEducation.has(s));
    if (missing.length > 0) warnings.push(`No education data for SOC code(s): ${missing.join(", ")}`);
    return { valid, rejected, warnings };
  },

  async upsertData(rows) {
    const source = await prisma.dataSource.findUnique({ where: { slug: "onet" } });
    const educationRows = rows.filter((r): r is EducationRow => "pct" in r);
    const aliasRows = rows.filter((r): r is AliasRow => "alias" in r);

    let written = 0;

    // Education requirements: replace the simulated rows with real O*NET
    // percentages, keeping only the top 4 degree levels per occupation.
    const eduBySoc = new Map<string, EducationRow[]>();
    for (const r of educationRows) {
      if (!eduBySoc.has(r.socCode)) eduBySoc.set(r.socCode, []);
      eduBySoc.get(r.socCode)!.push(r);
    }

    for (const mapping of BLS_OCCUPATION_MAPPING) {
      const occupation = await prisma.occupation.findUnique({ where: { slug: mapping.occupationSlug }, select: { id: true } });
      if (!occupation) continue;

      const eduForSoc = eduBySoc.get(mapping.socCode);
      if (eduForSoc && eduForSoc.length > 0) {
        // Merge duplicate degree levels (multiple O*NET categories can
        // collapse onto the same CareerAtlas level) by summing percentages.
        const merged = new Map<string, number>();
        for (const r of eduForSoc) merged.set(r.degreeLevel, (merged.get(r.degreeLevel) ?? 0) + r.pct);
        const top = [...merged.entries()].sort((a, b) => b[1] - a[1]).slice(0, 4);

        await prisma.occupationEducationRequirement.deleteMany({ where: { occupationId: occupation.id } });
        for (const [degreeLevel, pct] of top) {
          await prisma.occupationEducationRequirement.create({
            data: {
              occupationId: occupation.id,
              degreeLevel,
              requiresPct: Math.round(pct * 100) / 100,
              prefersPct: Math.round(pct * 100) / 100,
              dataStatus: "reported",
              sourceId: source?.id,
            },
          });
          written++;
        }
      }

      const aliasesForSoc = aliasRows.filter((r) => r.socCode === mapping.socCode);
      if (aliasesForSoc.length > 0) {
        // Clear any O*NET-sourced synonyms from a prior run before
        // re-inserting, so re-runs are idempotent rather than accumulating.
        await prisma.occupationAlias.deleteMany({ where: { occupationId: occupation.id, kind: "synonym" } });
        const seenLower = new Set<string>();
        for (const a of aliasesForSoc) {
          if (seenLower.has(a.alias.toLowerCase())) continue;
          seenLower.add(a.alias.toLowerCase());
          await prisma.occupationAlias.create({
            data: { occupationId: occupation.id, alias: a.alias, kind: "synonym" },
          });
          written++;
        }
      }
    }

    return written;
  },
};

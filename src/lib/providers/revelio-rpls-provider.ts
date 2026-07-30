import { prisma } from "@/lib/prisma";
import { BLS_OCCUPATION_MAPPING } from "@/lib/seed-data/bls-occupation-mapping";
import type { DataProvider } from "./types";

// Revelio Public Labor Statistics (RPLS) — a free, monthly-updated public
// dataset of real job-posting and employment trends, published as plain
// CSVs on S3 (no key, no signup). Coverage is by 2-digit SOC major group
// (e.g. "15 Computer and Mathematical"), not by the specific 6-digit
// occupation, so results are stamped dataStatus="estimated" rather than
// "reported": the growth rate is real for the broader occupational family,
// applied as an estimate for the specific role, and the absolute posting
// count is scaled down from the group total using each occupation's real
// BLS employment share of that group.
const POSTINGS_URL = "https://info0.s3.amazonaws.com/rpls/latest/postings/postings_by_occupation.csv";
const EMPLOYMENT_URL = "https://info0.s3.amazonaws.com/rpls/latest/employment/employment_soc.csv";

interface CsvRow {
  month: string;
  soc2d: string;
  value: number; // seasonally adjusted
}

function parseCsv(text: string, valueCol: string): CsvRow[] {
  const lines = text.trim().split("\n");
  const header = lines[0].split(",");
  const monthIdx = header.indexOf("month");
  const socIdx = header.indexOf("soc2d_code");
  const valueIdx = header.indexOf(valueCol);
  return lines.slice(1).map((line) => {
    const cols = line.split(",");
    return { month: cols[monthIdx], soc2d: cols[socIdx], value: Number(cols[valueIdx]) };
  });
}

function latestAndYearAgo(rows: CsvRow[], soc2d: string): { latest?: CsvRow; yearAgo?: CsvRow } {
  const forGroup = rows.filter((r) => r.soc2d === soc2d).sort((a, b) => a.month.localeCompare(b.month));
  const latest = forGroup.at(-1);
  if (!latest) return {};
  const [y, m] = latest.month.split("-").map(Number);
  const yearAgoMonth = `${y - 1}-${String(m).padStart(2, "0")}`;
  const yearAgo = forGroup.find((r) => r.month === yearAgoMonth);
  return { latest, yearAgo };
}

export interface RplsRow {
  socCode: string; // 6-digit occupation code (from our mapping)
  soc2d: string;
  activePostings: number;
  postingGrowthPct: number;
  groupEmployment: number;
}

export const revelioRplsProvider: DataProvider<{ postings: CsvRow[]; employment: CsvRow[] }, RplsRow> = {
  slug: "revelio-rpls",

  isConfigured() {
    return true; // fully keyless public dataset
  },

  async fetchData() {
    const [postingsRes, employmentRes] = await Promise.all([
      fetch(POSTINGS_URL, { signal: AbortSignal.timeout(20_000) }),
      fetch(EMPLOYMENT_URL, { signal: AbortSignal.timeout(20_000) }),
    ]);
    if (!postingsRes.ok || !employmentRes.ok) {
      throw new Error(`RPLS download failed: postings=${postingsRes.status} employment=${employmentRes.status}`);
    }
    const postings = parseCsv(await postingsRes.text(), "active_postings_sa");
    const employment = parseCsv(await employmentRes.text(), "employment_sa");
    return { postings, employment };
  },

  normalizeData(raw) {
    const soc2dCodes = [...new Set(BLS_OCCUPATION_MAPPING.map((m) => m.socCode.slice(0, 2)))];
    const rows: RplsRow[] = [];
    for (const soc2d of soc2dCodes) {
      const { latest, yearAgo } = latestAndYearAgo(raw.postings, soc2d);
      const employmentLatest = latestAndYearAgo(raw.employment, soc2d).latest;
      if (!latest || !yearAgo || !employmentLatest) continue;
      const postingGrowthPct = ((latest.value - yearAgo.value) / yearAgo.value) * 100;
      for (const mapping of BLS_OCCUPATION_MAPPING) {
        if (mapping.socCode.slice(0, 2) !== soc2d) continue;
        rows.push({
          socCode: mapping.socCode,
          soc2d,
          activePostings: latest.value,
          postingGrowthPct,
          groupEmployment: employmentLatest.value,
        });
      }
    }
    return rows;
  },

  validateData(rows) {
    const warnings: string[] = [];
    let rejected = 0;
    const valid = rows.filter((r) => {
      const ok = r.activePostings > 0 && r.groupEmployment > 0 && Number.isFinite(r.postingGrowthPct);
      if (!ok) rejected++;
      return ok;
    });
    return { valid, rejected, warnings };
  },

  async upsertData(rows) {
    const source = await prisma.dataSource.findUnique({ where: { slug: "revelio-rpls" } });
    const now = new Date();
    let written = 0;

    for (const mapping of BLS_OCCUPATION_MAPPING) {
      const row = rows.find((r) => r.socCode === mapping.socCode);
      if (!row) continue;

      const occupation = await prisma.occupation.findUnique({
        where: { slug: mapping.occupationSlug },
        include: { jobPostingStats: { take: 1 } },
      });
      if (!occupation) continue;

      // RPLS's absolute posting count is a monthly aggregate at the
      // 2-digit occupation-group level, not a verified point-in-time count
      // for this specific role — scaling it down by employment share would
      // produce a number that *looks* precise but isn't one we can vouch
      // for. Only the year-over-year growth rate (a ratio, less sensitive
      // to that ambiguity) is trustworthy enough to treat as real; the
      // existing simulated active-openings count is left as is.
      const existingActiveOpenings = occupation.jobPostingStats[0]?.activeOpenings ?? 100;
      const existingMedianDaysToFill = occupation.jobPostingStats[0]?.medianDaysToFill ?? null;

      await prisma.jobPostingStatistic.deleteMany({ where: { occupationId: occupation.id } });
      await prisma.jobPostingStatistic.create({
        data: {
          occupationId: occupation.id,
          observedAt: now,
          activeOpenings: existingActiveOpenings,
          medianDaysToFill: existingMedianDaysToFill,
          postingGrowthPct: Math.round(row.postingGrowthPct * 10) / 10,
          dataStatus: "estimated",
          sourceId: source?.id,
        },
      });
      written++;
    }

    return written;
  },
};

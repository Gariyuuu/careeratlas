import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";
import { getUsCountryId } from "@/lib/data/geography";
import { adjustForCostOfLiving } from "@/lib/scoring/cost-of-living";

export interface SalaryExplorerFilters {
  q?: string;
  industrySlug?: string;
  seniorityRank?: number;
  countryCode?: string;
  metroSlug?: string;
  page?: number;
  pageSize?: number;
  sortBy?: "median" | "title" | "yoy";
  sortDir?: "asc" | "desc";
}

export async function listSeniorityLevels() {
  return prisma.seniorityLevel.findMany({ orderBy: { rank: "asc" } });
}

export async function getSalaryExplorerResults(filters: SalaryExplorerFilters) {
  const page = Math.max(1, filters.page ?? 1);
  const pageSize = filters.pageSize ?? 20;
  const seniorityRank = filters.seniorityRank ?? 4; // default: "Senior"

  const country = filters.countryCode
    ? await prisma.country.findUnique({ where: { code: filters.countryCode } })
    : await prisma.country.findUnique({ where: { code: "US" } });
  const countryId = country?.id ?? (await getUsCountryId());

  const metro = filters.metroSlug ? await prisma.metroArea.findUnique({ where: { slug: filters.metroSlug }, include: { costOfLivingIndex: true } }) : null;
  const colIndex = metro?.costOfLivingIndex[0]?.index ?? 100;

  const occupationWhere: Prisma.OccupationWhereInput = {};
  if (filters.q) occupationWhere.title = { contains: filters.q };
  if (filters.industrySlug) occupationWhere.jobFamily = { subindustry: { industry: { slug: filters.industrySlug } } };

  const [total, percentiles] = await Promise.all([
    prisma.salaryPercentile.count({ where: { countryId, seniorityRank, occupation: occupationWhere } }),
    prisma.salaryPercentile.findMany({
      where: { countryId, seniorityRank, occupation: occupationWhere },
      include: {
        occupation: {
          select: {
            slug: true,
            title: true,
            jobFamily: { select: { subindustry: { select: { industry: { select: { name: true, slug: true } } } } } },
            salaryHistory: { where: { countryId }, orderBy: { year: "desc" }, take: 1 },
          },
        },
      },
      orderBy:
        filters.sortBy === "title"
          ? { occupation: { title: filters.sortDir ?? "asc" } }
          : { median: filters.sortDir ?? "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
  ]);

  const rows = percentiles.map((p) => ({
    slug: p.occupation.slug,
    title: p.occupation.title,
    industry: p.occupation.jobFamily.subindustry.industry.name,
    industrySlug: p.occupation.jobFamily.subindustry.industry.slug,
    median: p.median,
    medianColAdjusted: adjustForCostOfLiving(p.median, colIndex),
    p10: p.p10,
    p90: p.p90,
    yoyChangePct: p.occupation.salaryHistory[0]?.yoyChangePct ?? null,
    confidence: p.confidence,
    sampleSize: p.sampleSize,
    dataStatus: p.dataStatus,
    observedAt: p.observedAt,
  }));

  return {
    total,
    page,
    pageSize,
    pageCount: Math.max(1, Math.ceil(total / pageSize)),
    rows,
    colIndex,
    metroName: metro?.name ?? null,
  };
}

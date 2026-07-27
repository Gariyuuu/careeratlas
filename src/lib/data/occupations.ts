import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";
import { getUsCountryId } from "@/lib/data/geography";

export interface OccupationListFilters {
  q?: string;
  industrySlug?: string;
  page?: number;
  pageSize?: number;
}

export async function listOccupationsPaged(filters: OccupationListFilters) {
  const page = Math.max(1, filters.page ?? 1);
  const pageSize = filters.pageSize ?? 24;

  const where: Prisma.OccupationWhereInput = {};
  if (filters.q) {
    where.title = { contains: filters.q };
  }
  if (filters.industrySlug) {
    where.jobFamily = { subindustry: { industry: { slug: filters.industrySlug } } };
  }

  const usCountryId = await getUsCountryId();

  const [total, occupations] = await Promise.all([
    prisma.occupation.count({ where }),
    prisma.occupation.findMany({
      where,
      orderBy: { title: "asc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
      select: {
        slug: true,
        title: true,
        summary: true,
        automationExposure: true,
        remoteFriendliness: true,
        jobFamily: {
          select: {
            name: true,
            subindustry: { select: { industry: { select: { slug: true, name: true } } } },
          },
        },
        salaryPercentiles: {
          where: { countryId: usCountryId },
          orderBy: { seniorityRank: "asc" },
          take: 1,
          select: { median: true },
        },
      },
    }),
  ]);

  return {
    total,
    page,
    pageSize,
    pageCount: Math.max(1, Math.ceil(total / pageSize)),
    occupations,
  };
}

export async function getOccupationDetail(slug: string) {
  const occupation = await prisma.occupation.findUnique({
    where: { slug },
    include: {
      jobFamily: { include: { subindustry: { include: { industry: true } } } },
      aliases: true,
      skills: { include: { skill: true }, orderBy: { importance: "desc" } },
      certifications: { include: { certification: true } },
      seniorityLevels: { include: { seniorityLevel: true }, orderBy: { seniorityLevel: { rank: "asc" } } },
      salaryPercentiles: { orderBy: { seniorityRank: "asc" } },
      salaryObservations: { orderBy: { workArrangement: "asc" } },
      salaryHistory: { orderBy: { year: "asc" } },
      salaryForecasts: { orderBy: [{ scenario: "asc" }, { yearsOut: "asc" }] },
      employmentStats: { orderBy: { year: "desc" }, take: 1 },
      jobPostingStats: { orderBy: { observedAt: "desc" }, take: 1 },
      educationRequirement: true,
      transitionsFrom: {
        include: { toOccupation: { select: { slug: true, title: true } } },
        orderBy: { opportunityScore: "desc" },
        take: 8,
      },
      transitionsTo: {
        include: { fromOccupation: { select: { slug: true, title: true } } },
        orderBy: { opportunityScore: "desc" },
        take: 8,
      },
    },
  });
  return occupation;
}

export async function listOccupationSlugsForStaticParams(limit = 60) {
  return prisma.occupation.findMany({ select: { slug: true }, take: limit });
}

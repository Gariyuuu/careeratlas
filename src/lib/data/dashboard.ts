import { prisma } from "@/lib/prisma";
import { getUsCountryId } from "@/lib/data/geography";

export async function getTrendingIndustries(limit = 5) {
  const industries = await prisma.industry.findMany({
    include: { momentumScores: { orderBy: { observedAt: "desc" }, take: 1 } },
  });
  return industries
    .filter((i) => i.momentumScores[0])
    .sort((a, b) => b.momentumScores[0].score - a.momentumScores[0].score)
    .slice(0, limit)
    .map((i) => ({ slug: i.slug, name: i.name, score: i.momentumScores[0].score }));
}

export async function getTrendingRoles(limit = 6) {
  const postings = await prisma.jobPostingStatistic.findMany({
    orderBy: { postingGrowthPct: "desc" },
    take: limit,
    include: { occupation: { select: { slug: true, title: true } } },
  });
  return postings.map((p) => ({ slug: p.occupation.slug, title: p.occupation.title, growthPct: p.postingGrowthPct }));
}

export async function getDecliningRoles(limit = 6) {
  const postings = await prisma.jobPostingStatistic.findMany({
    orderBy: { postingGrowthPct: "asc" },
    take: limit,
    include: { occupation: { select: { slug: true, title: true } } },
  });
  return postings.map((p) => ({ slug: p.occupation.slug, title: p.occupation.title, growthPct: p.postingGrowthPct }));
}

export async function getEducationRoiSnapshot(limit = 3) {
  const outcomes = await prisma.educationOutcome.findMany({
    where: { tenYearReturnPct: { not: null } },
    orderBy: { tenYearReturnPct: "desc" },
    take: limit,
    include: { major: true },
  });
  return outcomes;
}

export async function getRecentlyUpdatedOccupations(limit = 5) {
  const rows = await prisma.salaryPercentile.findMany({
    orderBy: { observedAt: "desc" },
    take: limit,
    distinct: ["occupationId"],
    include: { occupation: { select: { slug: true, title: true } } },
  });
  return rows.map((r) => ({ slug: r.occupation.slug, title: r.occupation.title, observedAt: r.observedAt }));
}

export async function getPersonalizedSnapshot(userId: string) {
  const profile = await prisma.userProfile.findUnique({ where: { userId } });
  if (!profile?.currentRoleSlug) return { profile, occupation: null };

  const usCountryId = await getUsCountryId();
  const occupation = await prisma.occupation.findUnique({
    where: { slug: profile.currentRoleSlug },
    include: {
      salaryPercentiles: { where: { countryId: usCountryId } },
      salaryForecasts: { where: { countryId: usCountryId, scenario: "expected" } },
      transitionsFrom: {
        orderBy: { opportunityScore: "desc" },
        take: 3,
        include: { toOccupation: { select: { slug: true, title: true } } },
      },
    },
  });

  return { profile, occupation };
}

export async function getSavedCount(userId: string) {
  return prisma.savedOccupation.count({ where: { userId } });
}

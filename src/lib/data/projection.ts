import { prisma } from "@/lib/prisma";
import { getUsCountryId } from "@/lib/data/geography";

export async function getLiveWageGrowthPct(): Promise<number | null> {
  const indicator = await prisma.economicIndicator.findUnique({ where: { slug: "us-avg-hourly-earnings-yoy" } });
  return indicator?.value ?? null;
}

export async function getProjectionSeed(slug: string) {
  const occupation = await prisma.occupation.findUnique({
    where: { slug },
    select: {
      slug: true,
      title: true,
      jobFamily: { select: { subindustry: { select: { industry: { select: { name: true, slug: true } } } } } },
      salaryPercentiles: { orderBy: { seniorityRank: "asc" } },
      employmentStats: { orderBy: { year: "desc" }, take: 1 },
    },
  });
  if (!occupation) return null;

  const usCountryId = await getUsCountryId();
  const usPercentiles = occupation.salaryPercentiles.filter((p) => p.countryId === usCountryId);
  const midPercentile = usPercentiles[Math.floor(usPercentiles.length / 2)] ?? usPercentiles[0];

  const industry = await prisma.industry.findUnique({
    where: { slug: occupation.jobFamily.subindustry.industry.slug },
    include: { momentumScores: { orderBy: { observedAt: "desc" }, take: 1 } },
  });

  return {
    slug: occupation.slug,
    title: occupation.title,
    industryName: occupation.jobFamily.subindustry.industry.name,
    currentSalary: midPercentile?.median ?? 90_000,
    yearsExperience: (midPercentile?.seniorityRank ?? 4) * 1.5,
    occupationGrowthPct: (occupation.employmentStats[0]?.projectedGrowthPct ?? 3) / 100,
    industryMomentumScore: industry?.momentumScores[0]?.score ?? 50,
  };
}

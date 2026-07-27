import { prisma } from "@/lib/prisma";
import { getUsCountryId } from "@/lib/data/geography";

export async function getComparisonData(slugs: string[]) {
  const usCountryId = await getUsCountryId();

  const occupations = await prisma.occupation.findMany({
    where: { slug: { in: slugs } },
    include: {
      jobFamily: { include: { subindustry: { include: { industry: { include: { momentumScores: { orderBy: { observedAt: "desc" }, take: 1 } } } } } } },
      salaryPercentiles: { where: { countryId: usCountryId }, orderBy: { seniorityRank: "asc" } },
      salaryForecasts: { where: { countryId: usCountryId, scenario: "expected" } },
      employmentStats: { orderBy: { year: "desc" }, take: 1 },
      jobPostingStats: { orderBy: { observedAt: "desc" }, take: 1 },
      educationRequirement: { orderBy: { requiresPct: "desc" }, take: 1 },
      skills: { include: { skill: true }, orderBy: { importance: "desc" }, take: 5 },
      seniorityLevels: { include: { seniorityLevel: true }, orderBy: { seniorityLevel: { rank: "asc" } } },
    },
  });

  // Preserve the order the user picked, ignoring slugs that didn't resolve.
  const bySlug = new Map(occupations.map((o) => [o.slug, o]));
  const ordered = slugs.map((s) => bySlug.get(s)).filter((o): o is NonNullable<typeof o> => !!o);

  return ordered.map((o) => {
    const percentiles = o.salaryPercentiles;
    const entry = percentiles[0];
    const mid = percentiles[Math.floor(percentiles.length / 2)];
    const forecast5 = o.salaryForecasts.find((f) => f.yearsOut === 5);
    const forecast10 = o.salaryForecasts.find((f) => f.yearsOut === 10);
    const seniorityRange = o.seniorityLevels;

    return {
      slug: o.slug,
      title: o.title,
      industry: o.jobFamily.subindustry.industry.name,
      medianSalary: mid?.median ?? null,
      entrySalary: entry?.median ?? null,
      projected5yr: forecast5?.projectedTotalComp ?? null,
      projected10yr: forecast10?.projectedTotalComp ?? null,
      topDegree: o.educationRequirement[0]?.degreeLevel ?? null,
      yearsExperienceMin: seniorityRange[Math.floor(seniorityRange.length / 2)]?.yearsExperienceMin ?? null,
      activeOpenings: o.jobPostingStats[0]?.activeOpenings ?? null,
      employmentGrowthPct: o.employmentStats[0]?.projectedGrowthPct ?? null,
      momentumScore: o.jobFamily.subindustry.industry.momentumScores[0]?.score ?? null,
      automationExposure: o.automationExposure,
      remoteFriendliness: o.remoteFriendliness,
      topSkills: o.skills.map((s) => s.skill.name),
    };
  });
}

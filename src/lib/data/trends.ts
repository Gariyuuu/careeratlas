import { prisma } from "@/lib/prisma";

export async function listIndustryMomentumLatest() {
  const industries = await prisma.industry.findMany({
    include: {
      momentumScores: { orderBy: { observedAt: "desc" }, take: 4 },
      industryStats: { orderBy: { year: "desc" }, take: 1 },
      layoffStats: { orderBy: { observedAt: "desc" }, take: 1 },
      remoteWorkStats: { orderBy: { observedAt: "desc" }, take: 1 },
    },
  });

  return industries
    .map((i) => {
      const latest = i.momentumScores[0];
      const prior = i.momentumScores[3]; // ~3 quarters ago
      return {
        slug: i.slug,
        name: i.name,
        icon: i.icon,
        latest,
        historyAsc: [...i.momentumScores].reverse(),
        change: latest && prior ? latest.score - prior.score : null,
        employmentGrowthPct: i.industryStats[0]?.employmentGrowthPct ?? null,
        layoffCount: i.layoffStats[0]?.layoffCount ?? null,
        remoteSharePct: i.remoteWorkStats[0]?.remoteSharePct ?? null,
      };
    })
    .filter((i) => i.latest);
}

export async function listSkillTrends() {
  const skills = await prisma.skillDemandStatistic.findMany({
    include: { skill: true },
    orderBy: { demandGrowthPct: "desc" },
  });
  return skills;
}

import { prisma } from "@/lib/prisma";

export async function listIndustriesWithCounts() {
  const industries = await prisma.industry.findMany({
    orderBy: { name: "asc" },
    include: {
      _count: { select: { subindustries: true } },
      momentumScores: { orderBy: { observedAt: "desc" }, take: 1 },
    },
  });

  const occupationCounts = await prisma.occupation.groupBy({
    by: ["jobFamilyId"],
    _count: true,
  });

  // Occupation counts are per job family; roll them up to industry via a
  // second lightweight query rather than a heavy nested include.
  const jobFamilies = await prisma.jobFamily.findMany({
    select: { id: true, subindustry: { select: { industryId: true } } },
  });
  const occByJobFamily = new Map(occupationCounts.map((o) => [o.jobFamilyId, o._count]));
  const occByIndustry = new Map<string, number>();
  for (const jf of jobFamilies) {
    const count = occByJobFamily.get(jf.id) ?? 0;
    occByIndustry.set(jf.subindustry.industryId, (occByIndustry.get(jf.subindustry.industryId) ?? 0) + count);
  }

  return industries.map((i) => ({
    slug: i.slug,
    name: i.name,
    description: i.description,
    icon: i.icon,
    subindustryCount: i._count.subindustries,
    occupationCount: occByIndustry.get(i.id) ?? 0,
    momentumScore: i.momentumScores[0]?.score ?? null,
  }));
}

export async function getIndustryBySlug(slug: string) {
  const industry = await prisma.industry.findUnique({
    where: { slug },
    include: {
      subindustries: {
        orderBy: { name: "asc" },
        include: {
          jobFamilies: {
            include: { _count: { select: { occupations: true } } },
          },
        },
      },
      momentumScores: { orderBy: { observedAt: "desc" }, take: 4 },
      industryStats: { orderBy: { year: "desc" }, take: 1 },
      layoffStats: { orderBy: { observedAt: "desc" }, take: 1 },
      remoteWorkStats: { orderBy: { observedAt: "desc" }, take: 1 },
    },
  });
  return industry;
}

export async function getSubindustryDetail(industrySlug: string, subSlug: string) {
  const industry = await prisma.industry.findUnique({ where: { slug: industrySlug } });
  if (!industry) return null;
  const subindustry = await prisma.subindustry.findFirst({
    where: { slug: subSlug, industryId: industry.id },
    include: {
      industry: true,
      jobFamilies: {
        orderBy: { name: "asc" },
        include: {
          occupations: {
            select: { slug: true, title: true, summary: true, automationExposure: true, remoteFriendliness: true },
          },
        },
      },
    },
  });
  return subindustry;
}

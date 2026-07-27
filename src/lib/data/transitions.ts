import { prisma } from "@/lib/prisma";

export async function getOccupationForTransitions(slug: string) {
  return prisma.occupation.findUnique({
    where: { slug },
    select: { id: true, slug: true, title: true },
  });
}

export async function listTransitionsFrom(occupationId: string) {
  return prisma.careerTransition.findMany({
    where: { fromOccupationId: occupationId },
    include: {
      toOccupation: {
        select: {
          slug: true,
          title: true,
          jobFamily: { select: { subindustry: { select: { industry: { select: { name: true } } } } } },
        },
      },
    },
    orderBy: { opportunityScore: "desc" },
  });
}

export async function getTransitionDetail(fromSlug: string, toSlug: string) {
  const [fromOcc, toOcc] = await Promise.all([
    prisma.occupation.findUnique({ where: { slug: fromSlug }, select: { id: true, slug: true, title: true } }),
    prisma.occupation.findUnique({ where: { slug: toSlug }, select: { id: true, slug: true, title: true } }),
  ]);
  if (!fromOcc || !toOcc) return null;

  const transition = await prisma.careerTransition.findUnique({
    where: { fromOccupationId_toOccupationId: { fromOccupationId: fromOcc.id, toOccupationId: toOcc.id } },
    include: {
      fromOccupation: { include: { jobFamily: { include: { subindustry: { include: { industry: true } } } }, salaryPercentiles: true } },
      toOccupation: { include: { jobFamily: { include: { subindustry: { include: { industry: true } } } }, salaryPercentiles: true, educationRequirement: true, certifications: { include: { certification: true } } } },
      skillGaps: { include: { skill: true } },
    },
  });
  return transition;
}

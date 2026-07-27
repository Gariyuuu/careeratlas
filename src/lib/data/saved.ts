import { prisma } from "@/lib/prisma";

export async function listSavedOccupations(userId: string) {
  return prisma.savedOccupation.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    include: {
      occupation: {
        include: { jobFamily: { include: { subindustry: { include: { industry: true } } } } },
      },
    },
  });
}

export async function listSavedComparisons(userId: string) {
  return prisma.savedComparison.findMany({ where: { userId }, orderBy: { createdAt: "desc" } });
}

import { prisma } from "@/lib/prisma";

let usCountryIdCache: string | null = null;

export async function getUsCountryId(): Promise<string> {
  if (usCountryIdCache) return usCountryIdCache;
  const us = await prisma.country.findUniqueOrThrow({ where: { code: "US" } });
  usCountryIdCache = us.id;
  return us.id;
}

export async function listCountries() {
  return prisma.country.findMany({ orderBy: [{ supportLevel: "asc" }, { name: "asc" }] });
}

export async function listMetroAreas(countryId?: string) {
  return prisma.metroArea.findMany({
    where: countryId ? { region: { countryId } } : undefined,
    include: { region: true, costOfLivingIndex: { take: 1 } },
    orderBy: { name: "asc" },
  });
}

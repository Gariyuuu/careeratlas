import { prisma } from "@/lib/prisma";

export async function listDataSourceStatus() {
  const sources = await prisma.dataSource.findMany({
    orderBy: { name: "asc" },
    include: {
      importRuns: { orderBy: { startedAt: "desc" }, take: 5, include: { qualityChecks: true } },
    },
  });

  return sources.map((s) => {
    const lastSuccess = s.importRuns.find((r) => r.status === "success" || r.status === "partial");
    const lastAttempt = s.importRuns[0];
    return {
      slug: s.slug,
      name: s.name,
      organization: s.organization,
      requiresApiKey: s.requiresApiKey,
      apiKeyEnvVar: s.apiKeyEnvVar,
      status: s.status,
      lastSuccessAt: lastSuccess?.finishedAt ?? null,
      lastAttemptAt: lastAttempt?.startedAt ?? null,
      lastAttemptStatus: lastAttempt?.status ?? null,
      rowsImported: lastAttempt?.rowsImported ?? 0,
      rowsRejected: lastAttempt?.rowsRejected ?? 0,
      warnings: lastAttempt?.warnings ? (JSON.parse(lastAttempt.warnings) as string[]) : [],
      errorMessage: lastAttempt?.errorMessage ?? null,
      recentRuns: s.importRuns,
    };
  });
}

export async function listEconomicIndicators() {
  return prisma.economicIndicator.findMany({ orderBy: { label: "asc" }, include: { source: true } });
}

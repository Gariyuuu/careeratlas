import { prisma } from "@/lib/prisma";
import { runProvider } from "./types";
import { PROVIDER_REGISTRY } from "./registry";

/**
 * Runs one connector end-to-end and records the outcome in
 * DataImportRun/DataQualityCheck — mirroring steps 1-9 of the daily update
 * pipeline (fetch, normalize, validate, upsert, log, never delete prior
 * valid data on failure).
 */
export async function runDataImport(slug: string) {
  const provider = PROVIDER_REGISTRY.find((p) => p.slug === slug);
  const dataSource = await prisma.dataSource.findUnique({ where: { slug } });
  if (!provider || !dataSource) throw new Error(`Unknown data source: ${slug}`);

  const run = await prisma.dataImportRun.create({
    data: { dataSourceId: dataSource.id, status: "running" },
  });

  const report = await runProvider(provider);

  await prisma.dataImportRun.update({
    where: { id: run.id },
    data: {
      status: report.status,
      finishedAt: new Date(),
      rowsImported: report.rowsImported,
      rowsRejected: report.rowsRejected,
      warnings: JSON.stringify(report.warnings),
      errorMessage: report.errorMessage,
    },
  });

  await prisma.dataQualityCheck.create({
    data: {
      importRunId: run.id,
      checkName: "rows_imported_gt_zero",
      passed: report.rowsImported > 0,
      detail: `${report.rowsImported} rows imported, ${report.rowsRejected} rejected`,
    },
  });

  await prisma.dataSource.update({
    where: { id: dataSource.id },
    data: { status: report.status === "failed" ? "error" : report.status === "partial" ? "degraded" : "active" },
  });

  return report;
}

export async function runAllConfiguredImports() {
  const results: { slug: string; status: string }[] = [];
  for (const provider of PROVIDER_REGISTRY) {
    if (!provider.isConfigured()) continue;
    const report = await runDataImport(provider.slug);
    results.push({ slug: provider.slug, status: report.status });
  }
  return results;
}

import Link from "next/link";
import { getSalaryExplorerResults, listSeniorityLevels } from "@/lib/data/salary";
import { prisma } from "@/lib/prisma";
import { listCountries, listMetroAreas } from "@/lib/data/geography";
import { PageHeader } from "@/components/page-header";
import { SalaryFilters } from "./salary-filters";
import { SalaryResultsTable } from "./salary-results-table";
import { Button } from "@/components/ui/button";

export const metadata = { title: "Salary Explorer — CareerAtlas" };

export default async function SalaryExplorerPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; industry?: string; rank?: string; country?: string; metro?: string; page?: string }>;
}) {
  const sp = await searchParams;
  const rank = Number(sp.rank) || 4;
  const page = Number(sp.page) || 1;

  const [industries, seniorityLevels, countries, metros, results] = await Promise.all([
    prisma.industry.findMany({ select: { slug: true, name: true }, orderBy: { name: "asc" } }),
    listSeniorityLevels(),
    listCountries(),
    listMetroAreas(),
    getSalaryExplorerResults({
      q: sp.q,
      industrySlug: sp.industry,
      seniorityRank: rank,
      countryCode: sp.country,
      metroSlug: sp.metro,
      page,
    }),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Salary Explorer"
        description="Compare compensation across roles, industries, seniority levels, and geographies."
        actions={
          <Button asChild>
            <Link href="/projection">Build a projection</Link>
          </Button>
        }
      />

      <SalaryFilters
        industries={industries.map((i) => ({ value: i.slug, label: i.name }))}
        seniorityLevels={seniorityLevels}
        countries={countries.map((c) => ({ value: c.code, label: c.name }))}
        metros={metros.map((m) => ({ value: m.slug, label: m.name }))}
        defaults={{ q: sp.q, industry: sp.industry, rank: sp.rank, country: sp.country, metro: sp.metro }}
      />

      <p className="text-sm text-muted-foreground">
        {results.total.toLocaleString()} matching roles
        {results.metroName && ` · cost-of-living adjusted to ${results.metroName} (index ${results.colIndex})`}
      </p>

      <SalaryResultsTable rows={results.rows.map((r) => ({ ...r, observedAt: r.observedAt.toISOString() }))} showColAdjusted={!!results.metroName} />

      {results.pageCount > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button variant="outline" size="sm" disabled={page <= 1} asChild={page > 1}>
            {page > 1 ? <Link href={buildPageHref(sp, page - 1)}>Previous</Link> : <span>Previous</span>}
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {page} of {results.pageCount}
          </span>
          <Button variant="outline" size="sm" disabled={page >= results.pageCount} asChild={page < results.pageCount}>
            {page < results.pageCount ? <Link href={buildPageHref(sp, page + 1)}>Next</Link> : <span>Next</span>}
          </Button>
        </div>
      )}
    </div>
  );
}

function buildPageHref(sp: Record<string, string | undefined>, page: number) {
  const params = new URLSearchParams();
  for (const [k, v] of Object.entries(sp)) if (v) params.set(k, v);
  params.set("page", String(page));
  return `/salary?${params.toString()}`;
}

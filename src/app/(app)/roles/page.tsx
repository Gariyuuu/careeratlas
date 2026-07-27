import Link from "next/link";
import { listOccupationsPaged } from "@/lib/data/occupations";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RoleFilters } from "./role-filters";

export const metadata = { title: "Role Directory — CareerAtlas" };

export default async function RolesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string }>;
}) {
  const sp = await searchParams;
  const page = Number(sp.page) || 1;
  const { occupations, total, pageCount } = await listOccupationsPaged({ q: sp.q, page, pageSize: 24 });

  return (
    <div className="space-y-6">
      <PageHeader title="Role Directory" description={`Search across ${total.toLocaleString()} standardized roles.`} />
      <RoleFilters defaultQuery={sp.q ?? ""} />

      {occupations.length === 0 ? (
        <div className="rounded-lg border border-dashed p-10 text-center text-sm text-muted-foreground">
          No roles matched &ldquo;{sp.q}&rdquo;. Try a broader term or an abbreviation like &ldquo;SWE&rdquo; or &ldquo;MLE&rdquo;.
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {occupations.map((occ) => (
            <Link key={occ.slug} href={`/roles/${occ.slug}`}>
              <Card className="h-full hover:border-primary/50 hover:shadow-sm transition-all">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">{occ.title}</CardTitle>
                  <p className="text-xs text-muted-foreground">{occ.jobFamily.subindustry.industry.name}</p>
                </CardHeader>
                <CardContent className="flex items-center justify-between">
                  <span className="text-sm font-semibold">
                    {occ.salaryPercentiles[0] ? `$${Math.round(occ.salaryPercentiles[0].median / 1000)}k` : "—"}
                  </span>
                  <Badge variant="secondary" className="text-[11px]">
                    {occ.jobFamily.name}
                  </Badge>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}

      {pageCount > 1 && (
        <div className="flex items-center justify-center gap-2 pt-2">
          <Button variant="outline" size="sm" disabled={page <= 1} asChild={page > 1}>
            {page > 1 ? (
              <Link href={`/roles?${new URLSearchParams({ ...(sp.q ? { q: sp.q } : {}), page: String(page - 1) })}`}>
                Previous
              </Link>
            ) : (
              <span>Previous</span>
            )}
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {page} of {pageCount}
          </span>
          <Button variant="outline" size="sm" disabled={page >= pageCount} asChild={page < pageCount}>
            {page < pageCount ? (
              <Link href={`/roles?${new URLSearchParams({ ...(sp.q ? { q: sp.q } : {}), page: String(page + 1) })}`}>
                Next
              </Link>
            ) : (
              <span>Next</span>
            )}
          </Button>
        </div>
      )}
    </div>
  );
}

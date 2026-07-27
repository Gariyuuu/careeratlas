import Link from "next/link";
import { notFound } from "next/navigation";
import { getIndustryBySlug } from "@/lib/data/industries";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/page-header";
import { DataStatusBadge } from "@/components/data-status-badge";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

export async function generateMetadata({ params }: { params: Promise<{ industry: string }> }) {
  const { industry: slug } = await params;
  const industry = await getIndustryBySlug(slug);
  return { title: industry ? `${industry.name} — CareerAtlas` : "Industry — CareerAtlas" };
}

export default async function IndustryDetailPage({ params }: { params: Promise<{ industry: string }> }) {
  const { industry: slug } = await params;
  const industry = await getIndustryBySlug(slug);
  if (!industry) notFound();

  const latestMomentum = industry.momentumScores[0];
  const stats = industry.industryStats[0];
  const layoffs = industry.layoffStats[0];
  const remote = industry.remoteWorkStats[0];
  const totalRoles = industry.subindustries.reduce(
    (sum, sub) => sum + sub.jobFamilies.reduce((s, jf) => s + jf._count.occupations, 0),
    0,
  );

  return (
    <div className="space-y-6">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/careers">Career Explorer</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{industry.name}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <PageHeader title={industry.name} description={industry.description} />

      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <StatCard label="Job Market Momentum" value={latestMomentum ? `${latestMomentum.score}/100` : "—"} sub={<DataStatusBadge status={latestMomentum?.dataStatus} />} />
        <StatCard label="Employment growth" value={stats?.employmentGrowthPct != null ? `${stats.employmentGrowthPct > 0 ? "+" : ""}${stats.employmentGrowthPct}%` : "—"} sub={<DataStatusBadge status={stats?.dataStatus} />} />
        <StatCard label="Remote-friendly openings" value={remote ? `${remote.remoteSharePct}%` : "—"} sub={<DataStatusBadge status={remote?.dataStatus} />} />
        <StatCard label="Recent layoffs tracked" value={layoffs ? layoffs.layoffCount.toLocaleString() : "—"} sub={<DataStatusBadge status={layoffs?.dataStatus} />} />
      </div>

      <p className="text-sm text-muted-foreground">
        {industry.subindustries.length} subindustries · {totalRoles} roles ·{" "}
        <Link href={`/trends?industry=${industry.slug}`} className="underline underline-offset-2 hover:text-foreground">
          view full trend breakdown
        </Link>
      </p>

      <div className="space-y-8">
        {industry.subindustries.map((sub) => (
          <div key={sub.id} className="space-y-3">
            <div className="flex items-baseline justify-between">
              <Link href={`/careers/${industry.slug}/${sub.slug}`} className="text-lg font-semibold hover:underline underline-offset-2">
                {sub.name}
              </Link>
              <span className="text-xs text-muted-foreground">{sub.jobFamilies.length} job families</span>
            </div>
            <p className="text-sm text-muted-foreground max-w-3xl">{sub.description}</p>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {sub.jobFamilies.map((fam) => (
                <Card key={fam.id}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">{fam.name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-xs text-muted-foreground line-clamp-2 mb-2">{fam.description}</p>
                    <Badge variant="secondary" className="text-[11px]">
                      {fam._count.occupations} roles
                    </Badge>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function StatCard({ label, value, sub }: { label: string; value: string; sub?: React.ReactNode }) {
  return (
    <Card>
      <CardContent className="pt-5">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-xl font-semibold mt-1">{value}</p>
        {sub && <div className="mt-2">{sub}</div>}
      </CardContent>
    </Card>
  );
}

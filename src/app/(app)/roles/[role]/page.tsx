import Link from "next/link";
import { notFound } from "next/navigation";
import { getOccupationDetail } from "@/lib/data/occupations";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { DataStatusBadge } from "@/components/data-status-badge";
import { SalaryTrendChart, type SalaryTrendPoint } from "@/components/charts/salary-trend-chart";
import { RoleSalarySection } from "./role-salary-section";
import { DEGREE_LEVEL_LABELS } from "@/lib/seed-data/education";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { SaveCareerButton } from "@/components/save-career-button";
import { isOccupationSaved } from "@/lib/actions/saved-occupations";

export async function generateMetadata({ params }: { params: Promise<{ role: string }> }) {
  const { role: slug } = await params;
  const occ = await getOccupationDetail(slug);
  return { title: occ ? `${occ.title} Salary & Career Data — CareerAtlas` : "Role — CareerAtlas" };
}

export default async function RoleDetailPage({ params }: { params: Promise<{ role: string }> }) {
  const { role: slug } = await params;
  const occ = await getOccupationDetail(slug);
  if (!occ) notFound();
  const saved = await isOccupationSaved(occ.slug);

  const industry = occ.jobFamily.subindustry.industry;
  const employment = occ.employmentStats[0];
  const postings = occ.jobPostingStats[0];
  const hasReportedSalaryData = occ.salaryPercentiles.some((p) => p.dataStatus === "reported");
  const hasReportedEducationData = occ.educationRequirement.some((r) => r.dataStatus === "reported");

  const trendData: SalaryTrendPoint[] = [
    ...occ.salaryHistory.map((h) => ({ label: String(h.year), historical: h.medianTotalComp })),
  ];
  const lastHistoricalYear = occ.salaryHistory.at(-1)?.year ?? new Date().getFullYear();
  const horizonYears = [1, 3, 5, 10];
  for (const yearsOut of horizonYears) {
    const point: SalaryTrendPoint = { label: `+${yearsOut}y` };
    for (const scenario of ["conservative", "expected", "aggressive"] as const) {
      const forecast = occ.salaryForecasts.find((f) => f.yearsOut === yearsOut && f.scenario === scenario);
      if (forecast) point[scenario] = forecast.projectedTotalComp;
    }
    trendData.push(point);
  }
  const seniorityOptions = occ.seniorityLevels.map((s) => ({ rank: s.seniorityLevel.rank, name: s.seniorityLevel.name }));

  return (
    <div className="space-y-8">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/roles">Role Directory</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href={`/careers/${industry.slug}`}>{industry.name}</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{occ.title}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <PageHeader
        title={occ.title}
        description={occ.summary}
        actions={
          <>
            <SaveCareerButton occupationSlug={occ.slug} initiallySaved={saved} />
            <Button variant="outline" asChild>
              <Link href={`/projection?role=${occ.slug}`}>Project salary</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href={`/compare?roles=${occ.slug}`}>Add to compare</Link>
            </Button>
          </>
        }
      />

      {occ.aliases.length > 0 && (
        <div className="flex flex-wrap gap-1.5 -mt-4">
          <span className="text-xs text-muted-foreground">Also known as:</span>
          {occ.aliases.map((a) => (
            <Badge key={a.id} variant="secondary" className="text-[11px]">
              {a.alias}
            </Badge>
          ))}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Compensation by seniority</CardTitle>
            </CardHeader>
            <CardContent>
              <RoleSalarySection
                percentiles={occ.salaryPercentiles.map((p) => ({ ...p, observedAt: p.observedAt.toISOString() }))}
                seniorityOptions={seniorityOptions}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Historical trend &amp; projection</CardTitle>
              <p className="text-xs text-muted-foreground">
                Median total compensation at the typical seniority level for this role, {lastHistoricalYear - 4}–{lastHistoricalYear}, projected forward under three scenarios.
              </p>
            </CardHeader>
            <CardContent>
              <SalaryTrendChart data={trendData} />
              <DataStatusBadge status="simulated" className="mt-2" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Common skills</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {occ.skills.slice(0, 10).map((s) => (
                <div key={s.id} className="flex items-center gap-3">
                  <span className="text-sm w-48 shrink-0 truncate">{s.skill.name}</span>
                  <Progress value={s.importance * 100} className="h-2" />
                  {s.isCore && (
                    <Badge variant="secondary" className="text-[10px] shrink-0">
                      Core
                    </Badge>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>

          {occ.certifications.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Common certifications</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-2">
                {occ.certifications.map((c) => (
                  <Badge key={c.id} variant="outline">
                    {c.certification.name} · {Math.round(c.frequency * 100)}% of postings
                  </Badge>
                ))}
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader className="flex flex-row items-start justify-between gap-2">
              <div>
                <CardTitle className="text-base">Education requirements</CardTitle>
                <p className="text-xs text-muted-foreground">
                  {occ.educationRequirement.some((r) => r.dataStatus === "reported")
                    ? "Share of surveyed workers/experts reporting each education level as typical for this occupation (O*NET)."
                    : "Share of postings that require or prefer each level — a signal of typical hiring bars, not a hard rule."}
                </p>
              </div>
              <DataStatusBadge status={occ.educationRequirement[0]?.dataStatus} className="shrink-0" />
            </CardHeader>
            <CardContent className="space-y-3">
              {occ.educationRequirement.map((r) => (
                <div key={r.id} className="flex items-center gap-3">
                  <span className="text-sm w-40 shrink-0">{DEGREE_LEVEL_LABELS[r.degreeLevel as keyof typeof DEGREE_LEVEL_LABELS] ?? r.degreeLevel}</span>
                  <div className="flex-1 flex items-center gap-2">
                    <Progress value={r.requiresPct * 100} className="h-2" />
                    <span className="text-xs text-muted-foreground w-24 shrink-0">
                      {r.dataStatus === "reported" ? `${Math.round(r.requiresPct * 100)}% typical` : `${Math.round(r.requiresPct * 100)}% require · ${Math.round(r.prefersPct * 100)}% prefer`}
                    </span>
                  </div>
                </div>
              ))}
              <Link href="/education" className="text-xs underline underline-offset-2 text-muted-foreground hover:text-foreground">
                Explore education impact for related majors →
              </Link>
            </CardContent>
          </Card>

          <div className="grid sm:grid-cols-2 gap-6">
            <TransitionList title="Common next roles" items={occ.transitionsFrom.map((t) => ({ slug: t.toOccupation.slug, title: t.toOccupation.title, delta: t.salaryDeltaPct, from: occ.slug }))} />
            <TransitionList title="Common previous roles" items={occ.transitionsTo.map((t) => ({ slug: t.fromOccupation.slug, title: t.fromOccupation.title, delta: -t.salaryDeltaPct, from: undefined }))} />
          </div>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Demand snapshot</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <Row label="Active openings (simulated)" value={postings?.activeOpenings.toLocaleString() ?? "—"} />
              <Row
                label={`Posting growth${postings?.dataStatus === "estimated" ? " (est. from real category-level trend)" : ""}`}
                value={postings ? `${postings.postingGrowthPct > 0 ? "+" : ""}${postings.postingGrowthPct}%` : "—"}
              />
              <Row label="Median days to fill" value={postings?.medianDaysToFill ? `${postings.medianDaysToFill} days` : "—"} />
              <DataStatusBadge status={postings?.dataStatus} />
              <div className="pt-2 border-t" />
              <Row label={`Employed (US${employment?.dataStatus === "reported" ? "" : ", simulated"})`} value={employment?.employedCount.toLocaleString() ?? "—"} />
              <Row label="Projected growth" value={employment?.projectedGrowthPct != null ? `${employment.projectedGrowthPct}%/yr` : "—"} />
              <DataStatusBadge status={employment?.dataStatus} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Role characteristics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-muted-foreground">Remote-friendliness</span>
                  <span>{Math.round(occ.remoteFriendliness * 100)}%</span>
                </div>
                <Progress value={occ.remoteFriendliness * 100} className="h-2" />
              </div>
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-muted-foreground">Automation exposure</span>
                  <span>{Math.round(occ.automationExposure * 100)}%</span>
                </div>
                <Progress value={occ.automationExposure * 100} className="h-2" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Sources &amp; freshness</CardTitle>
            </CardHeader>
            <CardContent className="text-xs text-muted-foreground space-y-2">
              <p>
                {hasReportedSalaryData ? (
                  <>
                    Compensation and employment figures on this page are <strong>real, reported data</strong> from the U.S. Bureau of
                    Labor Statistics OEWS survey (all experience levels combined — BLS doesn&apos;t break wages out by seniority).
                    {hasReportedEducationData && " Education requirements and some alternate titles are real data from O*NET."} Historical
                    trend, projections, and demand figures below remain simulated demo data.
                  </>
                ) : hasReportedEducationData ? (
                  <>
                    Education requirements on this page are <strong>real, reported data</strong> from O*NET. Compensation and demand
                    figures remain simulated demo data.
                  </>
                ) : (
                  <>
                    Compensation and demand figures on this page are <strong>simulated demo data</strong>, deterministically generated
                    for this build of CareerAtlas — not verified real-world observations.
                  </>
                )}
              </p>
              <Link href="/methodology" className="underline underline-offset-2 text-foreground">
                Read the full methodology
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}

function TransitionList({
  title,
  items,
}: {
  title: string;
  items: { slug: string; title: string; delta: number; from?: string }[];
}) {
  if (items.length === 0) return null;
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-1">
        {items.slice(0, 6).map((item) => (
          <Link
            key={item.slug}
            href={`/roles/${item.slug}`}
            className="flex items-center justify-between rounded-md px-2 py-1.5 -mx-2 text-sm hover:bg-muted"
          >
            <span>{item.title}</span>
            <span className={item.delta >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"}>
              {item.delta >= 0 ? "+" : ""}
              {item.delta.toFixed(1)}%
            </span>
          </Link>
        ))}
      </CardContent>
    </Card>
  );
}

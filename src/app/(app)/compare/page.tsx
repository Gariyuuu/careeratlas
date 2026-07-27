import Link from "next/link";
import { getComparisonData } from "@/lib/data/compare";
import { PageHeader } from "@/components/page-header";
import { CompareSelector } from "./compare-selector";
import { SaveComparisonButton } from "@/components/save-comparison-button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ComparisonRadarChart } from "@/components/charts/comparison-radar-chart";
import { ComparisonBarChart } from "@/components/charts/comparison-bar-chart";
import { DEGREE_LEVEL_LABELS, type DegreeLevel } from "@/lib/seed-data/education";
import { Badge } from "@/components/ui/badge";

export const metadata = { title: "Compare Careers — CareerAtlas" };

export default async function ComparePage({
  searchParams,
}: {
  searchParams: Promise<{ roles?: string }>;
}) {
  const sp = await searchParams;
  const slugs = (sp.roles ?? "software-engineer,data-scientist,product-manager").split(",").filter(Boolean).slice(0, 5);
  const rows = await getComparisonData(slugs);

  const maxSalary = Math.max(...rows.map((r) => r.medianSalary ?? 0), 1);
  const maxOpenings = Math.max(...rows.map((r) => r.activeOpenings ?? 0), 1);

  const radarSeries = rows.map((r) => ({
    name: r.title,
    values: {
      "Salary level": Math.round(((r.medianSalary ?? 0) / maxSalary) * 100),
      "Momentum": r.momentumScore ?? 0,
      "Automation safety": Math.round((1 - r.automationExposure) * 100),
      "Remote flexibility": Math.round(r.remoteFriendliness * 100),
      "Demand": Math.round(((r.activeOpenings ?? 0) / maxOpenings) * 100),
    },
  }));

  const salaryBarData = rows.map((r) => ({
    label: r.title,
    Entry: r.entrySalary ?? 0,
    Median: r.medianSalary ?? 0,
    "+10yr": r.projected10yr ?? 0,
  }));

  const demandBarData = rows.map((r) => ({
    label: r.title,
    "Active openings": r.activeOpenings ?? 0,
  }));

  return (
    <div className="space-y-6">
      <PageHeader title="Compare Careers" description="Compare up to five careers side by side. This URL is shareable." />
      <div className="flex flex-wrap items-center justify-between gap-3">
        <CompareSelector current={rows.map((r) => ({ slug: r.slug, title: r.title }))} />
        <SaveComparisonButton slugs={rows.map((r) => r.slug)} />
      </div>

      {rows.length === 0 ? (
        <div className="rounded-lg border border-dashed p-10 text-center text-sm text-muted-foreground">
          Add roles above to start comparing.
        </div>
      ) : (
        <>
          <div className="rounded-lg border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Dimension</TableHead>
                  {rows.map((r) => (
                    <TableHead key={r.slug}>
                      <Link href={`/roles/${r.slug}`} className="hover:underline">
                        {r.title}
                      </Link>
                      <p className="text-xs font-normal text-muted-foreground">{r.industry}</p>
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                <CompareRow label="Entry salary" rows={rows} render={(r) => (r.entrySalary ? `$${Math.round(r.entrySalary / 1000)}k` : "—")} />
                <CompareRow label="Median total comp" render={(r) => (r.medianSalary ? `$${Math.round(r.medianSalary / 1000)}k` : "—")} rows={rows} />
                <CompareRow label="5-year projected" render={(r) => (r.projected5yr ? `$${Math.round(r.projected5yr / 1000)}k` : "—")} rows={rows} />
                <CompareRow label="10-year projected" render={(r) => (r.projected10yr ? `$${Math.round(r.projected10yr / 1000)}k` : "—")} rows={rows} />
                <CompareRow label="Typical education" render={(r) => (r.topDegree ? DEGREE_LEVEL_LABELS[r.topDegree as DegreeLevel] ?? r.topDegree : "—")} rows={rows} />
                <CompareRow label="Typical experience" render={(r) => (r.yearsExperienceMin != null ? `${r.yearsExperienceMin.toFixed(1)}+ yrs` : "—")} rows={rows} />
                <CompareRow label="Active openings" render={(r) => r.activeOpenings?.toLocaleString() ?? "—"} rows={rows} />
                <CompareRow label="Employment growth" render={(r) => (r.employmentGrowthPct != null ? `${r.employmentGrowthPct}%/yr` : "—")} rows={rows} />
                <CompareRow label="Momentum score" render={(r) => (r.momentumScore != null ? `${r.momentumScore}/100` : "—")} rows={rows} />
                <CompareRow label="Automation exposure" render={(r) => `${Math.round(r.automationExposure * 100)}%`} rows={rows} />
                <CompareRow label="Remote availability" render={(r) => `${Math.round(r.remoteFriendliness * 100)}%`} rows={rows} />
                <TableRow>
                  <TableCell className="font-medium align-top">Top skills</TableCell>
                  {rows.map((r) => (
                    <TableCell key={r.slug} className="align-top">
                      <div className="flex flex-wrap gap-1 max-w-48">
                        {r.topSkills.map((s) => (
                          <Badge key={s} variant="outline" className="text-[10px]">
                            {s}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                  ))}
                </TableRow>
              </TableBody>
            </Table>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Overall profile</CardTitle>
              </CardHeader>
              <CardContent>
                <ComparisonRadarChart axes={["Salary level", "Momentum", "Automation safety", "Remote flexibility", "Demand"]} series={radarSeries} />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Salary comparison</CardTitle>
              </CardHeader>
              <CardContent>
                <ComparisonBarChart data={salaryBarData} bars={[{ key: "Entry", label: "Entry" }, { key: "Median", label: "Median" }, { key: "+10yr", label: "+10yr" }]} format="currency" />
              </CardContent>
            </Card>
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="text-base">Demand comparison</CardTitle>
              </CardHeader>
              <CardContent>
                <ComparisonBarChart data={demandBarData} bars={[{ key: "Active openings", label: "Active openings" }]} format="number" />
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}

function CompareRow<T extends { slug: string }>({ label, rows, render }: { label: string; rows: T[]; render: (r: T) => string }) {
  return (
    <TableRow>
      <TableCell className="font-medium">{label}</TableCell>
      {rows.map((r) => (
        <TableCell key={r.slug}>{render(r)}</TableCell>
      ))}
    </TableRow>
  );
}

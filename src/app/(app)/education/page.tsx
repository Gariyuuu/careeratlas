import Link from "next/link";
import { listEducationOutcomes, listMajors } from "@/lib/data/education";
import { PageHeader } from "@/components/page-header";
import { EducationFilters } from "./education-filters";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DataStatusBadge } from "@/components/data-status-badge";
import { DEGREE_LEVEL_LABELS, type DegreeLevel } from "@/lib/seed-data/education";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Info } from "lucide-react";

export const metadata = { title: "Education Impact — CareerAtlas" };

export default async function EducationPage({
  searchParams,
}: {
  searchParams: Promise<{ major?: string; degree?: string }>;
}) {
  const sp = await searchParams;
  const [outcomes, majors] = await Promise.all([
    listEducationOutcomes({ majorSlug: sp.major, degreeLevel: sp.degree }),
    listMajors(),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Education Impact"
        description="How degree level, major, and school type have historically related to entry salary and long-run outcomes."
        actions={
          <Button asChild>
            <Link href="/education/compare">Compare education paths</Link>
          </Button>
        }
      />

      <Alert>
        <Info className="size-4" />
        <AlertDescription>
          These figures describe historical correlations in a simulated demo dataset, not causal guarantees. A
          degree does not cause a specific salary — many other factors (school, major, market, individual) matter
          too.
        </AlertDescription>
      </Alert>

      <EducationFilters majors={majors.map((m) => ({ slug: m.slug, name: m.name }))} defaults={{ major: sp.major, degree: sp.degree }} />

      {outcomes.length === 0 ? (
        <div className="rounded-lg border border-dashed p-10 text-center text-sm text-muted-foreground">
          Not enough verified data for this comparison.
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {outcomes.map((o) => (
            <Card key={o.id}>
              <CardContent className="pt-5 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-sm font-medium">{o.major.name}</p>
                    <p className="text-xs text-muted-foreground">{DEGREE_LEVEL_LABELS[o.degreeLevel as DegreeLevel] ?? o.degreeLevel}</p>
                  </div>
                  <DataStatusBadge status={o.dataStatus} />
                </div>
                <p className="text-xl font-semibold">${Math.round(o.entrySalaryMedian / 1000)}k</p>
                <p className="text-xs text-muted-foreground">entry salary median</p>
                <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-xs pt-2 border-t">
                  <span className="text-muted-foreground">Salary premium</span>
                  <span className="text-right">{o.salaryPremiumPct != null ? `${o.salaryPremiumPct > 0 ? "+" : ""}${o.salaryPremiumPct.toFixed(0)}%` : "—"}</span>
                  <span className="text-muted-foreground">Time to first role</span>
                  <span className="text-right">{o.timeToFirstRoleMonths ? `${o.timeToFirstRoleMonths} mo` : "—"}</span>
                  <span className="text-muted-foreground">Employment rate</span>
                  <span className="text-right">{o.employmentRatePct ? `${o.employmentRatePct}%` : "—"}</span>
                  <span className="text-muted-foreground">10-yr return</span>
                  <span className="text-right">{o.tenYearReturnPct != null ? `${o.tenYearReturnPct}%` : "—"}</span>
                </div>
                <p className="text-[11px] text-muted-foreground pt-1">n={o.sampleSize.toLocaleString()} · {Math.round(o.confidence * 100)}% confidence</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

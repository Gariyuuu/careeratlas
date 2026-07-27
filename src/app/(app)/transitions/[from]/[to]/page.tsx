import Link from "next/link";
import { notFound } from "next/navigation";
import { getTransitionDetail } from "@/lib/data/transitions";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DataStatusBadge } from "@/components/data-status-badge";
import { DEGREE_LEVEL_LABELS } from "@/lib/seed-data/education";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

export default async function TransitionDetailPage({
  params,
}: {
  params: Promise<{ from: string; to: string }>;
}) {
  const { from, to } = await params;
  const transition = await getTransitionDetail(from, to);
  if (!transition) notFound();

  const fromMedian = transition.fromOccupation.salaryPercentiles[Math.floor(transition.fromOccupation.salaryPercentiles.length / 2)];
  const toMedian = transition.toOccupation.salaryPercentiles[Math.floor(transition.toOccupation.salaryPercentiles.length / 2)];

  const missing = transition.skillGaps.filter((g) => g.gapType === "missing").sort((a, b) => b.salaryValue - a.salaryValue);
  const transferable = transition.skillGaps.filter((g) => g.gapType === "transferable");
  const educationRequired: string[] = JSON.parse(transition.educationCommonlyRequired ?? "[]");

  return (
    <div className="space-y-6">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href={`/transitions?role=${from}`}>Career Transitions</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>
              {transition.fromOccupation.title} → {transition.toOccupation.title}
            </BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <PageHeader
        title={`${transition.fromOccupation.title} → ${transition.toOccupation.title}`}
        description={`${transition.fromOccupation.jobFamily.subindustry.industry.name} → ${transition.toOccupation.jobFamily.subindustry.industry.name}`}
      />

      <div className="grid gap-4 grid-cols-2 lg:grid-cols-5">
        <ScoreCard label="Compatibility" value={transition.compatibilityScore} />
        <ScoreCard label="Opportunity" value={transition.opportunityScore} />
        <ScoreCard label="Demand" value={transition.demandScore} />
        <ScoreCard label="Difficulty" value={transition.transitionDifficulty} inverse />
        <ScoreCard label="Confidence" value={transition.confidenceScore} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground font-normal">Before: {transition.fromOccupation.title}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold">{fromMedian ? `$${Math.round(fromMedian.median / 1000)}k` : "—"}</p>
            {fromMedian && <p className="text-xs text-muted-foreground">${Math.round(fromMedian.p10 / 1000)}k – ${Math.round(fromMedian.p90 / 1000)}k range</p>}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground font-normal">After: {transition.toOccupation.title}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold">
              {toMedian ? `$${Math.round(toMedian.median / 1000)}k` : "—"}{" "}
              <span className={transition.salaryDeltaPct >= 0 ? "text-emerald-600 dark:text-emerald-400 text-base" : "text-red-600 dark:text-red-400 text-base"}>
                ({transition.salaryDeltaPct >= 0 ? "+" : ""}
                {transition.salaryDeltaPct.toFixed(1)}%)
              </span>
            </p>
            {toMedian && <p className="text-xs text-muted-foreground">${Math.round(toMedian.p10 / 1000)}k – ${Math.round(toMedian.p90 / 1000)}k range</p>}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">What to learn next</CardTitle>
          <p className="text-xs text-muted-foreground">Missing skills, ranked by salary value, demand growth, and how long they typically take to learn.</p>
        </CardHeader>
        <CardContent className="space-y-3">
          {missing.length === 0 ? (
            <p className="text-sm text-muted-foreground">No major skill gaps identified — this is a low-retraining transition.</p>
          ) : (
            missing.map((gap) => (
              <div key={gap.id} className="flex items-center justify-between border-b last:border-0 pb-2 last:pb-0">
                <div>
                  <p className="text-sm font-medium">{gap.skill.name}</p>
                  <p className="text-xs text-muted-foreground">
                    In {Math.round(gap.postingFrequency * 100)}% of postings · ~{gap.monthsToLearn} months to learn
                  </p>
                </div>
                <Badge variant="secondary">{Math.round(gap.salaryValue * 100)} salary value</Badge>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {transferable.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Transferable skills</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            {transferable.map((g) => (
              <Badge key={g.id} variant="outline">
                {g.skill.name}
              </Badge>
            ))}
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Typical requirements</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <Row label="Typical transition time" value={`${transition.typicalTransitionMonths} months`} />
            <Row label="Education commonly required" value={educationRequired.map((d) => DEGREE_LEVEL_LABELS[d as keyof typeof DEGREE_LEVEL_LABELS] ?? d).join(", ")} />
            {transition.toOccupation.certifications.length > 0 && (
              <Row label="Common certifications" value={transition.toOccupation.certifications.map((c) => c.certification.name).join(", ")} />
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Data</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">Status:</span>
              <DataStatusBadge status={transition.dataStatus} />
            </div>
            <p className="text-xs text-muted-foreground">
              Transition scores are derived from skill, education, and experience overlap between these two roles —
              they describe historical compatibility, not a guaranteed outcome.
            </p>
            <Link href="/methodology" className="text-xs underline underline-offset-2">
              How transition scores are calculated
            </Link>
          </CardContent>
        </Card>
      </div>

      <div className="flex gap-3">
        <Link href={`/roles/${transition.fromOccupation.slug}`} className="text-sm underline underline-offset-2">
          ← Back to {transition.fromOccupation.title}
        </Link>
        <Link href={`/roles/${transition.toOccupation.slug}`} className="text-sm underline underline-offset-2">
          View {transition.toOccupation.title} details →
        </Link>
      </div>
    </div>
  );
}

function ScoreCard({ label, value, inverse }: { label: string; value: number; inverse?: boolean }) {
  const good = inverse ? value <= 40 : value >= 60;
  return (
    <Card>
      <CardContent className="pt-5">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className={`text-xl font-semibold mt-1 ${good ? "text-emerald-600 dark:text-emerald-400" : ""}`}>{value}/100</p>
      </CardContent>
    </Card>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4">
      <span className="text-muted-foreground shrink-0">{label}</span>
      <span className="font-medium text-right">{value}</span>
    </div>
  );
}

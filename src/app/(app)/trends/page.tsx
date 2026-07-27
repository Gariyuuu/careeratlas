import Link from "next/link";
import { listIndustryMomentumLatest, listSkillTrends } from "@/lib/data/trends";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MomentumLeaderboard, type MomentumRow } from "./momentum-leaderboard";

export const metadata = { title: "Industry Trends — CareerAtlas" };

export default async function TrendsPage() {
  const [industries, skills] = await Promise.all([listIndustryMomentumLatest(), listSkillTrends()]);

  const rows: MomentumRow[] = industries.map((i) => ({
    slug: i.slug,
    name: i.name,
    score: i.latest!.score,
    employmentGrowthScore: i.latest!.employmentGrowthScore,
    postingGrowthScore: i.latest!.postingGrowthScore,
    salaryGrowthScore: i.latest!.salaryGrowthScore,
    hiringVelocityScore: i.latest!.hiringVelocityScore,
    layoffRiskScore: i.latest!.layoffRiskScore,
    skillDemandScore: i.latest!.skillDemandScore,
    automationSafetyScore: i.latest!.automationSafetyScore,
    entryLevelScore: i.latest!.entryLevelScore,
    geographicDiversityScore: i.latest!.geographicDiversityScore,
    dataStatus: i.latest!.dataStatus,
    confidence: i.latest!.confidence,
    observedAt: i.latest!.observedAt.toISOString(),
  }));

  const byEmploymentGrowth = [...industries].filter((i) => i.employmentGrowthPct != null).sort((a, b) => b.employmentGrowthPct! - a.employmentGrowthPct!);
  const fastestGrowing = byEmploymentGrowth.slice(0, 5);
  const fastestDeclining = byEmploymentGrowth.slice(-5).reverse();
  const highestLayoffRisk = [...industries].sort((a, b) => a.latest!.layoffRiskScore - b.latest!.layoffRiskScore).slice(0, 5);
  const mostRemote = [...industries].filter((i) => i.remoteSharePct != null).sort((a, b) => b.remoteSharePct! - a.remoteSharePct!).slice(0, 5);

  const emergingSkills = skills.filter((s) => s.trendDirection === "emerging" || s.trendDirection === "rising").slice(0, 8);
  const decliningSkills = skills.filter((s) => s.trendDirection === "declining").slice(0, 8);

  return (
    <div className="space-y-8">
      <PageHeader
        title="Industry Trends"
        description="A transparent Job Market Momentum Score (0-100) for every industry, built from nine weighted, adjustable factors."
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Leaderboard title="Fastest-growing industries" items={fastestGrowing.map((i) => ({ slug: i.slug, label: i.name, value: `+${i.employmentGrowthPct?.toFixed(1)}%` }))} />
        <Leaderboard title="Fastest-declining industries" items={fastestDeclining.map((i) => ({ slug: i.slug, label: i.name, value: `${i.employmentGrowthPct?.toFixed(1)}%` }))} negative />
        <Leaderboard title="Highest layoff risk" items={highestLayoffRisk.map((i) => ({ slug: i.slug, label: i.name, value: `${i.latest!.layoffRiskScore}/100 safety` }))} negative />
        <Leaderboard title="Most remote-friendly" items={mostRemote.map((i) => ({ slug: i.slug, label: i.name, value: `${i.remoteSharePct}% remote` }))} />
      </div>

      <div>
        <h2 className="text-base font-semibold mb-3">Job Market Momentum, ranked</h2>
        <MomentumLeaderboard rows={rows} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Emerging &amp; rising skills</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            {emergingSkills.map((s) => (
              <Badge key={s.id} variant="secondary">
                {s.skill.name} · +{s.demandGrowthPct.toFixed(0)}%
              </Badge>
            ))}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Declining skills</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            {decliningSkills.length === 0 ? (
              <p className="text-sm text-muted-foreground">No skills currently trending down in this dataset.</p>
            ) : (
              decliningSkills.map((s) => (
                <Badge key={s.id} variant="outline">
                  {s.skill.name} · {s.demandGrowthPct.toFixed(0)}%
                </Badge>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function Leaderboard({ title, items, negative }: { title: string; items: { slug: string; label: string; value: string }[]; negative?: boolean }) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm">{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-1.5">
        {items.map((item) => (
          <Link key={item.slug} href={`/careers/${item.slug}`} className="flex items-center justify-between text-xs hover:underline">
            <span className="truncate">{item.label}</span>
            <span className={negative ? "text-red-600 dark:text-red-400 shrink-0" : "text-emerald-600 dark:text-emerald-400 shrink-0"}>{item.value}</span>
          </Link>
        ))}
      </CardContent>
    </Card>
  );
}

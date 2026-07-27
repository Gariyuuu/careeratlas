import Link from "next/link";
import { auth } from "@/lib/auth";
import {
  getDecliningRoles,
  getEducationRoiSnapshot,
  getPersonalizedSnapshot,
  getRecentlyUpdatedOccupations,
  getSavedCount,
  getTrendingIndustries,
  getTrendingRoles,
} from "@/lib/data/dashboard";
import { estimateSalaryPercentileRank } from "@/lib/scoring/percentile-rank";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

export const metadata = { title: "Dashboard — CareerAtlas" };

export default async function DashboardPage() {
  const session = await auth();
  const userId = session?.user?.id;

  const [trendingIndustries, trendingRoles, decliningRoles, educationRoi, recentlyUpdated, snapshot, savedCount] = await Promise.all([
    getTrendingIndustries(),
    getTrendingRoles(),
    getDecliningRoles(),
    getEducationRoiSnapshot(),
    getRecentlyUpdatedOccupations(),
    userId ? getPersonalizedSnapshot(userId) : Promise.resolve(null),
    userId ? getSavedCount(userId) : Promise.resolve(0),
  ]);

  const occ = snapshot?.occupation;
  const profile = snapshot?.profile;
  const currentPercentile = occ && profile?.currentSalary && occ.salaryPercentiles[0]
    ? estimateSalaryPercentileRank(profile.currentSalary, occ.salaryPercentiles[0])
    : null;
  const expectedForecast5 = occ?.salaryForecasts.find((f) => f.yearsOut === 5);

  return (
    <div className="space-y-8">
      <PageHeader
        title={session?.user?.name ? `Welcome back, ${session.user.name.split(" ")[0]}` : "Dashboard"}
        description="A snapshot of your career data — salaries, transitions, and market trends."
        actions={
          !session ? (
            <Button asChild>
              <Link href="/sign-up">Personalize your dashboard</Link>
            </Button>
          ) : !profile?.currentRoleSlug ? (
            <Button asChild>
              <Link href="/profile">Complete your profile</Link>
            </Button>
          ) : undefined
        }
      />

      {occ && profile && (
        <div className="grid gap-4 sm:grid-cols-3">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground font-normal">Your salary percentile</CardTitle>
            </CardHeader>
            <CardContent>
              {currentPercentile != null ? (
                <>
                  <p className="text-2xl font-semibold">{currentPercentile}th</p>
                  <p className="text-xs text-muted-foreground">among {occ.title} salaries in the US</p>
                </>
              ) : (
                <p className="text-sm text-muted-foreground">Add your current salary in your profile to see this.</p>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground font-normal">5-year projection</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-semibold">{expectedForecast5 ? `$${Math.round(expectedForecast5.projectedTotalComp / 1000)}k` : "—"}</p>
              <Link href={`/projection?role=${occ.slug}`} className="text-xs underline underline-offset-2 text-muted-foreground">
                Build a full projection
              </Link>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground font-normal">Saved careers</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-semibold">{savedCount}</p>
              <Link href="/saved" className="text-xs underline underline-offset-2 text-muted-foreground">
                View saved careers
              </Link>
            </CardContent>
          </Card>
        </div>
      )}

      {occ && occ.transitionsFrom.length > 0 && (
        <div>
          <h2 className="text-base font-semibold mb-3">Recommended transitions from {occ.title}</h2>
          <div className="grid gap-3 sm:grid-cols-3">
            {occ.transitionsFrom.map((t) => (
              <Link key={t.id} href={`/transitions/${occ.slug}/${t.toOccupation.slug}`}>
                <Card className="hover:border-primary/50 transition-all">
                  <CardContent className="pt-5">
                    <p className="text-sm font-medium">{t.toOccupation.title}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {t.salaryDeltaPct >= 0 ? "+" : ""}
                      {t.salaryDeltaPct.toFixed(1)}% salary · {t.opportunityScore}/100 opportunity
                    </p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Trending industries</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {trendingIndustries.map((i) => (
              <div key={i.slug} className="flex items-center gap-3">
                <Link href={`/careers/${i.slug}`} className="text-sm hover:underline flex-1 truncate">
                  {i.name}
                </Link>
                <Progress value={i.score} className="h-1.5 w-24" />
                <span className="text-xs text-muted-foreground w-10 text-right">{i.score}</span>
              </div>
            ))}
            <Link href="/trends" className="text-xs underline underline-offset-2 text-muted-foreground">
              View full trends dashboard →
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Education ROI snapshot</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {educationRoi.map((o) => (
              <div key={o.id} className="flex items-center justify-between text-sm">
                <span>{o.major.name}</span>
                <Badge variant="secondary">+{o.tenYearReturnPct}% 10yr</Badge>
              </div>
            ))}
            <Link href="/education" className="text-xs underline underline-offset-2 text-muted-foreground">
              Explore education impact →
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Trending roles</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1.5">
            {trendingRoles.map((r) => (
              <Link key={r.slug} href={`/roles/${r.slug}`} className="flex items-center justify-between text-sm hover:underline">
                <span className="truncate">{r.title}</span>
                <span className="text-emerald-600 dark:text-emerald-400 shrink-0">+{r.growthPct.toFixed(0)}%</span>
              </Link>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Roles losing demand</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1.5">
            {decliningRoles.map((r) => (
              <Link key={r.slug} href={`/roles/${r.slug}`} className="flex items-center justify-between text-sm hover:underline">
                <span className="truncate">{r.title}</span>
                <span className="text-red-600 dark:text-red-400 shrink-0">{r.growthPct.toFixed(0)}%</span>
              </Link>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Recently updated data</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          {recentlyUpdated.map((r) => (
            <Link key={r.slug} href={`/roles/${r.slug}`}>
              <Badge variant="outline">{r.title}</Badge>
            </Link>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

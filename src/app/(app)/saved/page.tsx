import Link from "next/link";
import { auth } from "@/lib/auth";
import { listSavedComparisons, listSavedOccupations } from "@/lib/data/saved";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SaveCareerButton } from "@/components/save-career-button";

export const metadata = { title: "Saved Careers — CareerAtlas" };

export default async function SavedPage() {
  const session = await auth();

  if (!session?.user?.id) {
    return (
      <div className="space-y-6">
        <PageHeader title="Saved Careers" description="Sign in to save careers, comparisons, and salary scenarios." />
        <Card>
          <CardContent className="pt-6 text-center space-y-4">
            <p className="text-sm text-muted-foreground">You&apos;re browsing anonymously — saved data is tied to an account.</p>
            <div className="flex justify-center gap-2">
              <Button asChild>
                <Link href="/sign-in">Sign in</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/sign-up">Create account</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const [occupations, comparisons] = await Promise.all([
    listSavedOccupations(session.user.id),
    listSavedComparisons(session.user.id),
  ]);

  return (
    <div className="space-y-8">
      <PageHeader title="Saved Careers" description="Roles, comparisons, and scenarios you've saved." />

      <div>
        <h2 className="text-base font-semibold mb-3">Saved roles</h2>
        {occupations.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No saved roles yet. Visit a <Link href="/roles" className="underline underline-offset-2">role page</Link> and click &ldquo;Save career.&rdquo;
          </p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {occupations.map((s) => (
              <Card key={s.id}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">
                    <Link href={`/roles/${s.occupation.slug}`} className="hover:underline">
                      {s.occupation.title}
                    </Link>
                  </CardTitle>
                  <p className="text-xs text-muted-foreground">{s.occupation.jobFamily.subindustry.industry.name}</p>
                </CardHeader>
                <CardContent>
                  <SaveCareerButton occupationSlug={s.occupation.slug} initiallySaved />
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <div>
        <h2 className="text-base font-semibold mb-3">Saved comparisons</h2>
        {comparisons.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No saved comparisons yet. Build one on the <Link href="/compare" className="underline underline-offset-2">Compare</Link> page.
          </p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {comparisons.map((c) => {
              const slugs: string[] = JSON.parse(c.occupationIds);
              return (
                <Card key={c.id}>
                  <CardContent className="pt-5">
                    <p className="text-sm font-medium">{slugs.length} roles compared</p>
                    <p className="text-xs text-muted-foreground mb-3">{new Date(c.createdAt).toLocaleDateString()}</p>
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/compare?roles=${slugs.join(",")}`}>View comparison</Link>
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

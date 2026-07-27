import { getOccupationForTransitions, listTransitionsFrom } from "@/lib/data/transitions";
import { PageHeader } from "@/components/page-header";
import { RolePicker } from "@/components/role-picker";
import { TransitionGraph } from "@/components/transition-graph";
import { TransitionTable } from "./transition-table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata = { title: "Career Transitions — CareerAtlas" };

export default async function TransitionsPage({
  searchParams,
}: {
  searchParams: Promise<{ role?: string }>;
}) {
  const sp = await searchParams;
  const roleSlug = sp.role ?? "software-engineer";
  const occupation = await getOccupationForTransitions(roleSlug);

  const transitions = occupation ? await listTransitionsFrom(occupation.id) : [];

  const tableRows = transitions.map((t) => ({
    fromSlug: roleSlug,
    toSlug: t.toOccupation.slug,
    title: t.toOccupation.title,
    industry: t.toOccupation.jobFamily.subindustry.industry.name,
    category: t.category,
    salaryDeltaPct: t.salaryDeltaPct,
    compatibilityScore: t.compatibilityScore,
    opportunityScore: t.opportunityScore,
    demandScore: t.demandScore,
    transitionDifficulty: t.transitionDifficulty,
    typicalTransitionMonths: t.typicalTransitionMonths,
  }));

  return (
    <div className="space-y-6">
      <PageHeader
        title="Career Transition Explorer"
        description="See where people in a role typically go next, how much it pays, and what it takes to get there."
        actions={<RolePicker basePath="/transitions" paramName="role" currentSlug={roleSlug} currentTitle={occupation?.title} />}
      />

      {!occupation ? (
        <p className="text-sm text-muted-foreground">Role not found.</p>
      ) : transitions.length === 0 ? (
        <div className="rounded-lg border border-dashed p-10 text-center text-sm text-muted-foreground">
          Not enough data to suggest transitions for this role yet.
        </div>
      ) : (
        <>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Transition map</CardTitle>
            </CardHeader>
            <CardContent>
              <TransitionGraph
                centerTitle={occupation.title}
                centerSlug={occupation.slug}
                nodes={transitions.map((t) => ({
                  slug: t.toOccupation.slug,
                  title: t.toOccupation.title,
                  opportunityScore: t.opportunityScore,
                  category: t.category,
                }))}
              />
            </CardContent>
          </Card>

          <div>
            <h2 className="text-base font-semibold mb-3">All transitions, ranked by opportunity</h2>
            <TransitionTable rows={tableRows} />
          </div>
        </>
      )}
    </div>
  );
}

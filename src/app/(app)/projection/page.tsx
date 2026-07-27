import { getProjectionSeed, getLiveWageGrowthPct } from "@/lib/data/projection";
import { PageHeader } from "@/components/page-header";
import { ProjectionCalculator } from "./projection-calculator";
import { RolePicker } from "@/components/role-picker";

export const metadata = { title: "Salary Projection Calculator — CareerAtlas" };

export default async function ProjectionPage({
  searchParams,
}: {
  searchParams: Promise<{ role?: string }>;
}) {
  const sp = await searchParams;
  const roleSlug = sp.role ?? "software-engineer";
  const [seed, liveWageGrowthPct] = await Promise.all([getProjectionSeed(roleSlug), getLiveWageGrowthPct()]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Salary Projection Calculator"
        description="Project 1, 3, 5, and 10-year salary scenarios with transparent, editable assumptions."
        actions={<RolePicker basePath="/projection" paramName="role" currentSlug={roleSlug} currentTitle={seed?.title} />}
      />
      {seed ? (
        <ProjectionCalculator seed={seed} liveWageGrowthPct={liveWageGrowthPct} />
      ) : (
        <p className="text-sm text-muted-foreground">Role not found. Pick a role above to get started.</p>
      )}
    </div>
  );
}

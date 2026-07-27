import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DataStatusBadge } from "@/components/data-status-badge";

export const metadata = { title: "Methodology — CareerAtlas" };

export default async function MethodologyPage() {
  const versions = await prisma.methodologyVersion.findMany({ orderBy: { scoreName: "asc" } });

  return (
    <div className="space-y-8 max-w-3xl">
      <PageHeader title="Methodology" description="How every number, score, and projection on CareerAtlas is calculated — and how much to trust it." />

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Data status labels</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <p className="text-muted-foreground">Every data-bearing figure on CareerAtlas is labeled with exactly one of four statuses:</p>
          <div className="grid gap-2 sm:grid-cols-2">
            <StatusRow status="reported" text="Directly observed from an official or licensed source (e.g. a live BLS series)." />
            <StatusRow status="estimated" text="Derived from official data with some interpolation or modeling." />
            <StatusRow status="forecast" text="A forward-looking projection, computed from a documented formula." />
            <StatusRow status="simulated" text="Deterministically generated placeholder data used to make the product usable before every connector is fully populated. Never treat as real-world observation." />
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Scoring formulas</h2>
        {versions.map((v) => (
          <Card key={v.id}>
            <CardHeader>
              <CardTitle className="text-base capitalize">{v.scoreName.replace(/_/g, " ")}</CardTitle>
              <p className="text-xs text-muted-foreground">version {v.version}</p>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p>{v.description}</p>
              <p className="text-xs bg-muted rounded-md p-3 font-mono leading-relaxed">{v.formula}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">What CareerAtlas does not claim</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>Salary projections are estimates based on transparent, documented assumptions — not promises.</p>
          <p>Education outcomes describe historical correlations, not causal guarantees. A degree does not cause a specific salary.</p>
          <p>Transition scores describe historical compatibility between two roles, not a guaranteed career path.</p>
          <p>Where data is insufficient, the product says so explicitly rather than guessing.</p>
        </CardContent>
      </Card>
    </div>
  );
}

function StatusRow({ status, text }: { status: string; text: string }) {
  return (
    <div className="flex items-start gap-2 rounded-md border p-3">
      <DataStatusBadge status={status} className="mt-0.5" />
      <p className="text-xs text-muted-foreground">{text}</p>
    </div>
  );
}

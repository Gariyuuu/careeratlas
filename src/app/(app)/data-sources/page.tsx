import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const metadata = { title: "Data Sources — CareerAtlas" };

const STATUS_VARIANT: Record<string, "default" | "secondary" | "destructive"> = {
  active: "default",
  degraded: "secondary",
  not_configured: "secondary",
  error: "destructive",
};

export default async function DataSourcesPage() {
  const sources = await prisma.dataSource.findMany({ orderBy: { name: "asc" } });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Data Sources"
        description="Every official, licensed, or seed-estimate source CareerAtlas draws from — and whether it's live in this deployment."
      />
      <div className="grid gap-4 sm:grid-cols-2">
        {sources.map((s) => (
          <Card key={s.id}>
            <CardHeader className="flex flex-row items-start justify-between gap-2">
              <div>
                <CardTitle className="text-sm">{s.name}</CardTitle>
                <p className="text-xs text-muted-foreground">{s.organization}</p>
              </div>
              <Badge variant={STATUS_VARIANT[s.status] ?? "secondary"}>{s.status.replace("_", " ")}</Badge>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p className="text-muted-foreground">{s.description}</p>
              {s.requiresApiKey && (
                <p className="text-xs">
                  Requires <code className="text-xs bg-muted px-1 py-0.5 rounded">{s.apiKeyEnvVar}</code> to activate.
                </p>
              )}
              {s.url && (
                <a href={s.url} target="_blank" rel="noreferrer" className="text-xs underline underline-offset-2 text-foreground">
                  {s.url}
                </a>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
      <p className="text-sm text-muted-foreground">
        See the <Link href="/admin/data-status" className="underline underline-offset-2">admin data-status page</Link> for live import history and connector health.
      </p>
    </div>
  );
}

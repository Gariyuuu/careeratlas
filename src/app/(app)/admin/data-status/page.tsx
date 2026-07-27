import { listDataSourceStatus, listEconomicIndicators } from "@/lib/data/admin";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RunImportButton } from "@/components/run-import-button";
import { DataStatusBadge } from "@/components/data-status-badge";

export const metadata = { title: "Data Status — CareerAtlas Admin" };

const STATUS_VARIANT: Record<string, "default" | "secondary" | "destructive"> = {
  active: "default",
  degraded: "secondary",
  not_configured: "secondary",
  error: "destructive",
};

export default async function AdminDataStatusPage() {
  const [sources, indicators] = await Promise.all([listDataSourceStatus(), listEconomicIndicators()]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Data Status"
        description="Connector health, last update times, and import quality for every data source CareerAtlas can pull from."
      />

      {indicators.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Live indicators</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            {indicators.map((ind) => (
              <div key={ind.id} className="flex items-center justify-between rounded-md border px-3 py-2">
                <div>
                  <p className="text-sm font-medium">{ind.label}</p>
                  <p className="text-xs text-muted-foreground">
                    {ind.source?.name} · {new Date(ind.observedAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-semibold">
                    {ind.unit === "pct" ? `${ind.value}%` : ind.unit === "usd" ? `$${ind.value}` : ind.value}
                  </p>
                  <DataStatusBadge status={ind.dataStatus} />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4">
        {sources.map((s) => (
          <Card key={s.slug}>
            <CardHeader className="flex flex-row items-start justify-between gap-3">
              <div>
                <CardTitle className="text-base">{s.name}</CardTitle>
                <p className="text-xs text-muted-foreground">{s.organization}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Badge variant={STATUS_VARIANT[s.status] ?? "secondary"}>{s.status.replace("_", " ")}</Badge>
                {!s.requiresApiKey && <RunImportButton slug={s.slug} />}
              </div>
            </CardHeader>
            <CardContent className="grid gap-3 sm:grid-cols-4 text-sm">
              <div>
                <p className="text-xs text-muted-foreground">Last successful update</p>
                <p className="font-medium">{s.lastSuccessAt ? new Date(s.lastSuccessAt).toLocaleString() : "Never"}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Last attempted</p>
                <p className="font-medium">{s.lastAttemptAt ? new Date(s.lastAttemptAt).toLocaleString() : "Never"}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Rows imported / rejected</p>
                <p className="font-medium">
                  {s.rowsImported.toLocaleString()} / {s.rowsRejected.toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Credential</p>
                <p className="font-medium">
                  {s.requiresApiKey ? (
                    <span>
                      requires <code className="text-xs">{s.apiKeyEnvVar}</code>
                    </span>
                  ) : (
                    "not required"
                  )}
                </p>
              </div>
              {s.warnings.length > 0 && (
                <div className="sm:col-span-4 text-xs text-amber-700 dark:text-amber-400">
                  {s.warnings.map((w, i) => (
                    <p key={i}>⚠ {w}</p>
                  ))}
                </div>
              )}
              {s.errorMessage && <p className="sm:col-span-4 text-xs text-red-600 dark:text-red-400">Error: {s.errorMessage}</p>}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

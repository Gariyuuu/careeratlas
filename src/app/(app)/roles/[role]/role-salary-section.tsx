"use client";

import * as React from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SalaryDistributionChart } from "@/components/charts/salary-distribution-chart";
import { DataStatusBadge } from "@/components/data-status-badge";
import { Card, CardContent } from "@/components/ui/card";

interface Percentile {
  seniorityRank: number;
  p10: number;
  p25: number;
  median: number;
  p75: number;
  p90: number;
  mean: number;
  sampleSize: number;
  dataStatus: string;
  confidence: number;
  observedAt: string;
}

interface SeniorityOption {
  rank: number;
  name: string;
}

export function RoleSalarySection({ percentiles, seniorityOptions }: { percentiles: Percentile[]; seniorityOptions: SeniorityOption[] }) {
  const available = seniorityOptions.filter((s) => percentiles.some((p) => p.seniorityRank === s.rank));
  const defaultRank = available[Math.floor(available.length / 2)]?.rank ?? available[0]?.rank;
  const [rank, setRank] = React.useState<number | undefined>(defaultRank);

  const current = percentiles.find((p) => p.seniorityRank === rank);
  if (!current) return null;

  const chartData = [
    { label: "P10", value: current.p10 },
    { label: "P25", value: current.p25 },
    { label: "Median", value: current.median },
    { label: "P75", value: current.p75 },
    { label: "P90", value: current.p90 },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Select value={String(rank)} onValueChange={(v) => setRank(Number(v))}>
          <SelectTrigger className="w-56">
            <SelectValue placeholder="Seniority level" />
          </SelectTrigger>
          <SelectContent>
            {available.map((s) => (
              <SelectItem key={s.rank} value={String(s.rank)}>
                {s.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <DataStatusBadge status={current.dataStatus} />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <MiniStat label="Median" value={current.median} emphasis />
        <MiniStat label="Mean" value={current.mean} />
        <MiniStat label="10th–90th pct" value={`$${Math.round(current.p10 / 1000)}k–$${Math.round(current.p90 / 1000)}k`} raw />
        <MiniStat label="Observations" value={current.sampleSize} raw />
      </div>

      <SalaryDistributionChart data={chartData} highlightIndex={2} />
      <p className="text-xs text-muted-foreground">
        Confidence: {Math.round(current.confidence * 100)}% · based on {current.sampleSize.toLocaleString()} simulated
        observations · last updated {new Date(current.observedAt).toLocaleDateString()}
      </p>
    </div>
  );
}

function MiniStat({ label, value, emphasis, raw }: { label: string; value: number | string; emphasis?: boolean; raw?: boolean }) {
  return (
    <Card>
      <CardContent className="py-3 px-3.5">
        <p className="text-[11px] text-muted-foreground">{label}</p>
        <p className={emphasis ? "text-lg font-semibold" : "text-sm font-medium"}>
          {raw ? value : `$${Math.round(Number(value) / 1000)}k`}
        </p>
      </CardContent>
    </Card>
  );
}

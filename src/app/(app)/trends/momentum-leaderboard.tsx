"use client";

import * as React from "react";
import Link from "next/link";
import { computeMomentumScore, DEFAULT_MOMENTUM_WEIGHTS, type MomentumWeights } from "@/lib/scoring/momentum-score";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { DataStatusBadge } from "@/components/data-status-badge";

export interface MomentumRow {
  slug: string;
  name: string;
  score: number;
  employmentGrowthScore: number;
  postingGrowthScore: number;
  salaryGrowthScore: number;
  hiringVelocityScore: number;
  layoffRiskScore: number;
  skillDemandScore: number;
  automationSafetyScore: number;
  entryLevelScore: number;
  geographicDiversityScore: number;
  dataStatus: string;
  confidence: number;
  observedAt: string;
}

const WEIGHT_LABELS: Record<keyof MomentumWeights, string> = {
  employmentGrowthScore: "Employment growth",
  postingGrowthScore: "Job posting growth",
  salaryGrowthScore: "Salary growth",
  hiringVelocityScore: "Hiring velocity",
  layoffRiskScore: "Layoff safety",
  skillDemandScore: "Skill demand growth",
  automationSafetyScore: "Automation safety",
  entryLevelScore: "Entry-level availability",
  geographicDiversityScore: "Geographic diversity",
};

export function MomentumLeaderboard({ rows }: { rows: MomentumRow[] }) {
  const [weights, setWeights] = React.useState<MomentumWeights>(DEFAULT_MOMENTUM_WEIGHTS);

  const ranked = React.useMemo(() => {
    return rows
      .map((r) => ({ ...r, recomputed: computeMomentumScore(r, weights).score }))
      .sort((a, b) => b.recomputed - a.recomputed);
  }, [rows, weights]);

  const weightSum = Object.values(weights).reduce((a, b) => a + b, 0);

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <Card className="lg:col-span-1 h-fit">
        <CardHeader>
          <CardTitle className="text-base">Adjust weights</CardTitle>
          <p className="text-xs text-muted-foreground">Weights are relative — they&apos;re normalized automatically. Current sum: {weightSum.toFixed(2)}</p>
        </CardHeader>
        <CardContent className="space-y-4">
          {(Object.keys(weights) as (keyof MomentumWeights)[]).map((key) => (
            <div key={key} className="space-y-1">
              <div className="flex justify-between text-xs">
                <Label>{WEIGHT_LABELS[key]}</Label>
                <span className="text-muted-foreground">{Math.round((weights[key] / weightSum) * 100)}%</span>
              </div>
              <Slider
                value={[weights[key]]}
                min={0}
                max={0.3}
                step={0.01}
                onValueChange={([v]) => setWeights({ ...weights, [key]: v })}
              />
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="lg:col-span-2 space-y-3">
        {ranked.map((r, i) => (
          <Card key={r.slug}>
            <Accordion type="single" collapsible>
              <AccordionItem value={r.slug} className="border-0">
                <div className="flex items-center gap-3 px-4 py-3">
                  <span className="text-sm text-muted-foreground w-5 shrink-0">{i + 1}</span>
                  <Link href={`/careers/${r.slug}`} className="text-sm font-medium hover:underline flex-1 min-w-0 truncate">
                    {r.name}
                  </Link>
                  <Badge variant={r.recomputed >= 60 ? "default" : "secondary"} className="shrink-0">
                    {r.recomputed}/100
                  </Badge>
                  <AccordionTrigger className="p-0 [&>svg]:size-4" />
                </div>
                <AccordionContent className="px-4 pb-4">
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                    {(Object.keys(WEIGHT_LABELS) as (keyof MomentumWeights)[]).map((key) => (
                      <div key={key} className="rounded-md border px-2 py-1.5">
                        <p className="text-muted-foreground">{WEIGHT_LABELS[key]}</p>
                        <p className="font-medium">{Math.round(r[key])}/100</p>
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center gap-2 mt-3">
                    <DataStatusBadge status={r.dataStatus} />
                    <span className="text-xs text-muted-foreground">
                      {Math.round(r.confidence * 100)}% confidence · updated {new Date(r.observedAt).toLocaleDateString()}
                    </span>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </Card>
        ))}
      </div>
    </div>
  );
}

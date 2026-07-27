"use client";

import * as React from "react";
import Link from "next/link";
import { projectSalary, PROJECTION_HORIZONS_YEARS, type ProjectionScenario } from "@/lib/scoring/projection";
import { SalaryTrendChart, type SalaryTrendPoint } from "@/components/charts/salary-trend-chart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface Seed {
  slug: string;
  title: string;
  industryName: string;
  currentSalary: number;
  yearsExperience: number;
  occupationGrowthPct: number;
  industryMomentumScore: number;
}

const SCENARIOS: ProjectionScenario[] = ["conservative", "expected", "aggressive"];

export function ProjectionCalculator({ seed, liveWageGrowthPct }: { seed: Seed; liveWageGrowthPct: number | null }) {
  const [currentSalary, setCurrentSalary] = React.useState(seed.currentSalary);
  const [yearsExperience, setYearsExperience] = React.useState(seed.yearsExperience);
  const [generalWageGrowthPct, setGeneralWageGrowthPct] = React.useState(liveWageGrowthPct ?? 3.2);
  const [promotionProbability, setPromotionProbability] = React.useState(35);
  const [educationFactor, setEducationFactor] = React.useState(60);
  const [skillDemandScore, setSkillDemandScore] = React.useState(55);

  const results = React.useMemo(() => {
    const byScenario: Record<ProjectionScenario, { yearsOut: number; projectedSalary: number }[]> = {
      conservative: [],
      expected: [],
      aggressive: [],
    };
    for (const scenario of SCENARIOS) {
      for (const yearsOut of PROJECTION_HORIZONS_YEARS) {
        const result = projectSalary({
          currentSalary,
          yearsOut,
          scenario,
          generalWageGrowthPct: generalWageGrowthPct / 100,
          occupationGrowthPct: seed.occupationGrowthPct,
          industryMomentumScore: seed.industryMomentumScore,
          yearsExperience,
          educationFactor: educationFactor / 100,
          skillDemandScore: skillDemandScore / 100,
          promotionOrTransitionProbability: promotionProbability / 100,
        });
        byScenario[scenario].push({ yearsOut, projectedSalary: result.projectedSalary });
      }
    }
    return byScenario;
  }, [currentSalary, yearsExperience, generalWageGrowthPct, promotionProbability, educationFactor, skillDemandScore, seed]);

  const expectedFactorBreakdown = React.useMemo(
    () =>
      projectSalary({
        currentSalary,
        yearsOut: 5,
        scenario: "expected",
        generalWageGrowthPct: generalWageGrowthPct / 100,
        occupationGrowthPct: seed.occupationGrowthPct,
        industryMomentumScore: seed.industryMomentumScore,
        yearsExperience,
        educationFactor: educationFactor / 100,
        skillDemandScore: skillDemandScore / 100,
        promotionOrTransitionProbability: promotionProbability / 100,
      }).factors,
    [currentSalary, yearsExperience, generalWageGrowthPct, promotionProbability, educationFactor, skillDemandScore, seed],
  );

  const chartData: SalaryTrendPoint[] = [
    { label: "Today", historical: currentSalary },
    ...PROJECTION_HORIZONS_YEARS.map((yearsOut, i) => ({
      label: `+${yearsOut}y`,
      conservative: results.conservative[i].projectedSalary,
      expected: results.expected[i].projectedSalary,
      aggressive: results.aggressive[i].projectedSalary,
    })),
  ];

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="lg:col-span-2 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              Projection for {seed.title} <span className="text-muted-foreground font-normal">· {seed.industryName}</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <SalaryTrendChart data={chartData} />
          </CardContent>
        </Card>

        <div className="grid sm:grid-cols-3 gap-4">
          {SCENARIOS.map((scenario) => (
            <Card key={scenario}>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm capitalize">{scenario}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-1.5">
                {results[scenario].map((r) => (
                  <div key={r.yearsOut} className="flex justify-between text-sm">
                    <span className="text-muted-foreground">+{r.yearsOut}y</span>
                    <span className="font-medium">${Math.round(r.projectedSalary / 1000)}k</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Methodology: how this was calculated</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p className="text-muted-foreground">
              Projected Salary = Current Salary × general wage growth × occupation growth × industry momentum ×
              experience × education × skill demand × promotion/transition factor, compounded per year. This is a
              transparent estimate, not a promise — see the <Link href="/methodology" className="underline underline-offset-2">Methodology page</Link> for the full formula.
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 text-xs">
              {Object.entries(expectedFactorBreakdown).map(([key, value]) => (
                <div key={key} className="rounded-md border px-2 py-1.5">
                  <p className="text-muted-foreground">{formatFactorLabel(key)}</p>
                  <p className="font-medium">{value.toFixed(3)}×</p>
                </div>
              ))}
            </div>
            <p className="text-xs text-muted-foreground pt-1">
              Factors shown are for the 5-year, expected scenario. Each factor is compounded annually except the
              promotion factor, which is applied as discrete step-ups.
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Assumptions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="space-y-1.5">
              <Label htmlFor="current-salary">Current salary (USD)</Label>
              <Input
                id="current-salary"
                type="number"
                value={currentSalary}
                onChange={(e) => setCurrentSalary(Number(e.target.value) || 0)}
              />
            </div>
            <SliderField label="Years of experience" value={yearsExperience} onChange={setYearsExperience} min={0} max={30} step={0.5} suffix=" yrs" />
            <SliderField label="Expected annual raise / inflation" value={generalWageGrowthPct} onChange={setGeneralWageGrowthPct} min={0} max={10} step={0.1} suffix="%" />
            <SliderField label="Promotion / transition likelihood" value={promotionProbability} onChange={setPromotionProbability} min={0} max={100} step={5} suffix="%" />
            <SliderField label="Education level factor" value={educationFactor} onChange={setEducationFactor} min={0} max={100} step={5} suffix="%" />
            <SliderField label="Skill demand strength" value={skillDemandScore} onChange={setSkillDemandScore} min={0} max={100} step={5} suffix="%" />
          </CardContent>
        </Card>

        <Accordion type="single" collapsible>
          <AccordionItem value="context">
            <AccordionTrigger className="text-sm">Where do the defaults come from?</AccordionTrigger>
            <AccordionContent className="text-xs text-muted-foreground space-y-1">
              <p>Current salary defaults to this role&apos;s simulated median at a mid seniority level.</p>
              <p>Industry momentum ({seed.industryMomentumScore}/100) and occupation growth ({(seed.occupationGrowthPct * 100).toFixed(1)}%/yr) come from {seed.industryName}&apos;s trend data.</p>
              {liveWageGrowthPct != null && (
                <p>The default annual raise ({liveWageGrowthPct}%) is a <strong>live, reported figure</strong> from the BLS Average Hourly Earnings series — not simulated.</p>
              )}
              <p>All other assumptions are editable starting points — adjust them to match your situation.</p>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </div>
  );
}

function SliderField({
  label,
  value,
  onChange,
  min,
  max,
  step,
  suffix,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  min: number;
  max: number;
  step: number;
  suffix: string;
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between text-sm">
        <Label>{label}</Label>
        <span className="text-muted-foreground">
          {value}
          {suffix}
        </span>
      </div>
      <Slider value={[value]} onValueChange={([v]) => onChange(v)} min={min} max={max} step={step} />
    </div>
  );
}

function formatFactorLabel(key: string): string {
  return key
    .replace(/Factor$/, "")
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (c) => c.toUpperCase())
    .trim();
}

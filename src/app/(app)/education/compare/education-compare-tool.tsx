"use client";

import * as React from "react";
import { computeEducationRoi } from "@/lib/scoring/education-roi";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { DataStatusBadge } from "@/components/data-status-badge";
import { X } from "lucide-react";

export interface OutcomeOption {
  id: string;
  label: string;
  degreeLevel: string;
  entrySalaryMedian: number;
  tenYearReturnPct: number | null;
}

export interface InstitutionCostOption {
  slug: string;
  name: string;
  degreeLevel: string;
  totalCost: number;
  years: number;
  dataStatus: string;
}

const GENERIC = "generic";

export function EducationCompareTool({
  options,
  institutionCosts,
  baselineNoCollegeSalary,
  baselineIsReported,
}: {
  options: OutcomeOption[];
  institutionCosts: InstitutionCostOption[];
  baselineNoCollegeSalary: number;
  baselineIsReported: boolean;
}) {
  const [selectedIds, setSelectedIds] = React.useState<string[]>(() => (options[0] ? [options[0].id] : []));
  const [overrides, setOverrides] = React.useState<Record<string, { totalCost: number; years: number; forgoneEarningsPerYear: number }>>({});
  const [schoolByCard, setSchoolByCard] = React.useState<Record<string, string>>({});
  const [horizon, setHorizon] = React.useState<10 | 20>(10);

  const addSlot = () => {
    if (selectedIds.length >= 4) return;
    const next = options.find((o) => !selectedIds.includes(o.id));
    if (next) setSelectedIds([...selectedIds, next.id]);
  };

  const defaultsFor = (opt: OutcomeOption) => {
    const isDegree = !["no_college", "self_taught"].includes(opt.degreeLevel);
    return {
      totalCost: isDegree ? 80_000 : 0,
      years: opt.degreeLevel === "bachelor" || opt.degreeLevel === "master" ? 4 : opt.degreeLevel === "mba" ? 2 : opt.degreeLevel === "associate" ? 2 : opt.degreeLevel === "bootcamp" ? 0.5 : 0,
      forgoneEarningsPerYear: 35_000,
    };
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <Select value={String(horizon)} onValueChange={(v) => setHorizon(Number(v) as 10 | 20)}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="10">10-year horizon</SelectItem>
            <SelectItem value="20">20-year horizon</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="outline" size="sm" onClick={addSlot} disabled={selectedIds.length >= 4}>
          Add education path
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {selectedIds.map((id) => {
          const opt = options.find((o) => o.id === id);
          if (!opt) return null;
          const values = overrides[id] ?? defaultsFor(opt);
          const schoolsForLevel = institutionCosts.filter((i) => i.degreeLevel === opt.degreeLevel);
          const schoolSlug = schoolByCard[id] ?? GENERIC;
          const selectedSchool = schoolsForLevel.find((s) => s.slug === schoolSlug);
          const roi = computeEducationRoi({
            totalCost: values.totalCost,
            yearsInSchool: values.years,
            forgoneEarningsPerYear: values.forgoneEarningsPerYear,
            postGradSalary: opt.entrySalaryMedian,
            baselineSalary: baselineNoCollegeSalary,
            annualGrowthPct: 0.03,
            horizonYears: horizon,
          });

          return (
            <Card key={id}>
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-1">
                  <CardTitle className="text-sm font-medium leading-snug">{opt.label}</CardTitle>
                  {selectedIds.length > 1 && (
                    <Button variant="ghost" size="icon" className="size-6 shrink-0" onClick={() => setSelectedIds(selectedIds.filter((s) => s !== id))}>
                      <X className="size-3.5" />
                    </Button>
                  )}
                </div>
                <Select value={id} onValueChange={(v) => setSelectedIds(selectedIds.map((s) => (s === id ? v : s)))}>
                  <SelectTrigger className="h-7 text-xs w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {options.map((o) => (
                      <SelectItem key={o.id} value={o.id}>
                        {o.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </CardHeader>
              <CardContent className="space-y-3">
                {schoolsForLevel.length > 0 && (
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">School (real tuition)</Label>
                    <Select
                      value={schoolSlug}
                      onValueChange={(v) => {
                        setSchoolByCard({ ...schoolByCard, [id]: v });
                        const school = schoolsForLevel.find((s) => s.slug === v);
                        if (school) {
                          setOverrides({ ...overrides, [id]: { ...values, totalCost: school.totalCost, years: school.years } });
                        } else {
                          setOverrides({ ...overrides, [id]: defaultsFor(opt) });
                        }
                      }}
                    >
                      <SelectTrigger className="h-8 text-xs w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={GENERIC}>Generic estimate</SelectItem>
                        {schoolsForLevel.map((s) => (
                          <SelectItem key={s.slug} value={s.slug}>
                            {s.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
                <FieldRow
                  id={`total-cost-${id}`}
                  label="Total cost"
                  value={values.totalCost}
                  onChange={(v) => setOverrides({ ...overrides, [id]: { ...values, totalCost: v } })}
                />
                <FieldRow
                  id={`years-${id}`}
                  label="Years in school"
                  value={values.years}
                  onChange={(v) => setOverrides({ ...overrides, [id]: { ...values, years: v } })}
                />
                <FieldRow
                  id={`forgone-${id}`}
                  label="Forgone earnings/yr"
                  value={values.forgoneEarningsPerYear}
                  onChange={(v) => setOverrides({ ...overrides, [id]: { ...values, forgoneEarningsPerYear: v } })}
                />
                {selectedSchool && <DataStatusBadge status={selectedSchool.dataStatus} />}
                <div className="pt-2 border-t space-y-1.5 text-sm">
                  <Row label="Net cost" value={`$${roi.netCost.toLocaleString()}`} />
                  <Row label="Break-even year" value={roi.breakEvenYear ? `Year ${roi.breakEvenYear}` : "Beyond horizon"} />
                  <Row
                    label={`${horizon}-yr return`}
                    value={`${roi.returnOnInvestmentPct >= 0 ? "+" : ""}${roi.returnOnInvestmentPct}%`}
                    positive={roi.returnOnInvestmentPct >= 0}
                  />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
      <p className="text-xs text-muted-foreground">
        Baseline (no-college) comparison salary: ${baselineNoCollegeSalary.toLocaleString()}/yr
        {baselineIsReported ? " — real median earnings for high school graduates (U.S. Census Bureau ACS)" : " (simulated estimate)"},
        growing 3%/yr. Total cost defaults to a generic estimate, or pick a real school above (tuition marked{" "}
        <DataStatusBadge status="reported" className="inline align-middle mx-0.5" /> is real, from the U.S. Department of Education). All
        figures editable — this is a transparent, simplified model, not financial advice.
      </p>
    </div>
  );
}

function FieldRow({ id, label, value, onChange }: { id: string; label: string; value: number; onChange: (v: number) => void }) {
  return (
    <div className="space-y-1">
      <Label htmlFor={id} className="text-xs text-muted-foreground">
        {label}
      </Label>
      <Input id={id} type="number" value={value} onChange={(e) => onChange(Number(e.target.value) || 0)} className="h-8" />
    </div>
  );
}

function Row({ label, value, positive }: { label: string; value: string; positive?: boolean }) {
  return (
    <div className="flex justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span className={`font-medium ${positive === undefined ? "" : positive ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"}`}>{value}</span>
    </div>
  );
}

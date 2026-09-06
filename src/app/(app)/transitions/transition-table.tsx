"use client";

import { useRouter } from "next/navigation";
import type { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/data-table";
import { Badge } from "@/components/ui/badge";
import { Delta } from "@/components/numeric/delta";

export interface TransitionRow {
  fromSlug: string;
  toSlug: string;
  title: string;
  industry: string;
  category: string;
  salaryDeltaPct: number;
  compatibilityScore: number;
  opportunityScore: number;
  demandScore: number;
  transitionDifficulty: number;
  typicalTransitionMonths: number;
}

const CATEGORY_LABEL: Record<string, string> = {
  adjacent: "Adjacent",
  ambitious: "Ambitious",
  lower_risk: "Lower risk",
  highest_paying: "Highest paying",
  minimal_retraining: "Minimal retraining",
  strongest_demand: "Strongest demand",
};

export function TransitionTable({ rows }: { rows: TransitionRow[] }) {
  const router = useRouter();

  const columns: ColumnDef<TransitionRow, unknown>[] = [
    { accessorKey: "title", header: "Destination role", cell: ({ row }) => <span className="font-medium">{row.original.title}</span> },
    { accessorKey: "industry", header: "Industry", cell: ({ row }) => <span className="text-muted-foreground">{row.original.industry}</span> },
    { accessorKey: "category", header: "Type", cell: ({ row }) => <Badge variant="secondary">{CATEGORY_LABEL[row.original.category] ?? row.original.category}</Badge> },
    {
      accessorKey: "salaryDeltaPct",
      header: "Salary delta",
      meta: { numeric: true },
      cell: ({ row }) => (
        <Delta
          value={row.original.salaryDeltaPct}
          format={(v) => `${v >= 0 ? "+" : ""}${v.toFixed(1)}%`}
          srLabel={`Salary ${row.original.salaryDeltaPct >= 0 ? "up" : "down"} ${Math.abs(row.original.salaryDeltaPct).toFixed(1)} percent moving to ${row.original.title}`}
        />
      ),
    },
    { accessorKey: "compatibilityScore", header: "Compatibility", meta: { numeric: true }, cell: ({ row }) => `${row.original.compatibilityScore}/100` },
    { accessorKey: "opportunityScore", header: "Opportunity", meta: { numeric: true }, cell: ({ row }) => `${row.original.opportunityScore}/100` },
    // Difficulty is the one score where high is bad, so it is deliberately not
    // given a delta treatment -- a green 90 here would mean the opposite of a
    // green 90 in the column beside it.
    { accessorKey: "transitionDifficulty", header: "Difficulty", meta: { numeric: true }, cell: ({ row }) => `${row.original.transitionDifficulty}/100` },
    { accessorKey: "typicalTransitionMonths", header: "Typical time", meta: { numeric: true }, cell: ({ row }) => `${row.original.typicalTransitionMonths} mo` },
  ];

  return <DataTable columns={columns} data={rows} onRowClick={(row) => router.push(`/transitions/${row.fromSlug}/${row.toSlug}`)} />;
}

"use client";

import { useRouter } from "next/navigation";
import type { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/data-table";
import { Badge } from "@/components/ui/badge";

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
      cell: ({ row }) => (
        <span className={row.original.salaryDeltaPct >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"}>
          {row.original.salaryDeltaPct >= 0 ? "+" : ""}
          {row.original.salaryDeltaPct.toFixed(1)}%
        </span>
      ),
    },
    { accessorKey: "compatibilityScore", header: "Compatibility", cell: ({ row }) => `${row.original.compatibilityScore}/100` },
    { accessorKey: "opportunityScore", header: "Opportunity", cell: ({ row }) => `${row.original.opportunityScore}/100` },
    { accessorKey: "transitionDifficulty", header: "Difficulty", cell: ({ row }) => `${row.original.transitionDifficulty}/100` },
    { accessorKey: "typicalTransitionMonths", header: "Typical time", cell: ({ row }) => `${row.original.typicalTransitionMonths} mo` },
  ];

  return <DataTable columns={columns} data={rows} onRowClick={(row) => router.push(`/transitions/${row.fromSlug}/${row.toSlug}`)} />;
}

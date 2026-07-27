"use client";

import { useRouter } from "next/navigation";
import type { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/data-table";
import { DataStatusBadge } from "@/components/data-status-badge";
import { Badge } from "@/components/ui/badge";

export interface SalaryRow {
  slug: string;
  title: string;
  industry: string;
  median: number;
  medianColAdjusted: number;
  p10: number;
  p90: number;
  yoyChangePct: number | null;
  confidence: number;
  sampleSize: number;
  dataStatus: string;
  observedAt: string;
}

const money = (v: number) => `$${Math.round(v / 1000)}k`;

export function SalaryResultsTable({ rows, showColAdjusted }: { rows: SalaryRow[]; showColAdjusted: boolean }) {
  const router = useRouter();

  const columns: ColumnDef<SalaryRow, unknown>[] = [
    { accessorKey: "title", header: "Role", cell: ({ row }) => <span className="font-medium">{row.original.title}</span> },
    { accessorKey: "industry", header: "Industry", cell: ({ row }) => <span className="text-muted-foreground">{row.original.industry}</span> },
    { accessorKey: "median", header: "Median (nominal)", cell: ({ row }) => money(row.original.median) },
    ...(showColAdjusted
      ? [{ accessorKey: "medianColAdjusted", header: "Median (COL-adjusted)", cell: ({ row }: { row: { original: SalaryRow } }) => money(row.original.medianColAdjusted) } as ColumnDef<SalaryRow, unknown>]
      : []),
    { accessorKey: "range", header: "P10–P90", cell: ({ row }) => `${money(row.original.p10)} – ${money(row.original.p90)}` },
    {
      accessorKey: "yoyChangePct",
      header: "YoY",
      cell: ({ row }) =>
        row.original.yoyChangePct == null ? (
          "—"
        ) : (
          <span className={row.original.yoyChangePct >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"}>
            {row.original.yoyChangePct >= 0 ? "+" : ""}
            {row.original.yoyChangePct.toFixed(1)}%
          </span>
        ),
    },
    { accessorKey: "sampleSize", header: "N", cell: ({ row }) => <Badge variant="outline">{row.original.sampleSize.toLocaleString()}</Badge> },
    { accessorKey: "dataStatus", header: "Status", cell: ({ row }) => <DataStatusBadge status={row.original.dataStatus} /> },
  ];

  return <DataTable columns={columns} data={rows} onRowClick={(row) => router.push(`/roles/${row.slug}`)} />;
}

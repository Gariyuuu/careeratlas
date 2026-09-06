"use client";

import { useRouter } from "next/navigation";
import type { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/data-table";
import { DataStatusBadge } from "@/components/data-status-badge";
import { Badge } from "@/components/ui/badge";
import { Delta } from "@/components/numeric/delta";

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
    { accessorKey: "median", header: "Median (nominal)", meta: { numeric: true }, cell: ({ row }) => money(row.original.median) },
    ...(showColAdjusted
      ? [{ accessorKey: "medianColAdjusted", header: "Median (COL-adjusted)", meta: { numeric: true }, cell: ({ row }: { row: { original: SalaryRow } }) => money(row.original.medianColAdjusted) } as ColumnDef<SalaryRow, unknown>]
      : []),
    { accessorKey: "range", header: "P10–P90", meta: { numeric: true }, cell: ({ row }) => `${money(row.original.p10)} – ${money(row.original.p90)}` },
    {
      accessorKey: "yoyChangePct",
      header: "YoY",
      meta: { numeric: true },
      // Was red/green text and nothing else, which is invisible to a red-green
      // colour deficiency. Delta adds the ▲/▼ and the screen-reader phrasing.
      cell: ({ row }) =>
        row.original.yoyChangePct == null ? (
          <span className="text-muted-foreground/60">—</span>
        ) : (
          <Delta
            value={row.original.yoyChangePct}
            format={(v) => `${v >= 0 ? "+" : ""}${v.toFixed(1)}%`}
            srLabel={`${row.original.title} year over year: ${row.original.yoyChangePct >= 0 ? "up" : "down"} ${Math.abs(row.original.yoyChangePct).toFixed(1)} percent`}
          />
        ),
    },
    {
      accessorKey: "sampleSize",
      header: "N",
      meta: { numeric: true },
      cell: ({ row }) => <Badge variant="outline" className="num">{row.original.sampleSize.toLocaleString()}</Badge>,
    },
    { accessorKey: "dataStatus", header: "Status", cell: ({ row }) => <DataStatusBadge status={row.original.dataStatus} /> },
  ];

  return <DataTable columns={columns} data={rows} onRowClick={(row) => router.push(`/roles/${row.slug}`)} />;
}

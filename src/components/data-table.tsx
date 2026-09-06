"use client";

import { flexRender, getCoreRowModel, useReactTable, type ColumnDef, type RowData } from "@tanstack/react-table";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";

/**
 * Column-level opt-in for numeric presentation. A column marked numeric gets
 * right alignment and tabular figures on BOTH its header and its cells -- the
 * two have to move together, or the heading floats away from its column.
 *
 *   { accessorKey: "median", header: "Median", meta: { numeric: true } }
 */
declare module "@tanstack/react-table" {
  /* eslint-disable @typescript-eslint/no-unused-vars */
  interface ColumnMeta<TData extends RowData, TValue> {
    numeric?: boolean;
  }
  /* eslint-enable @typescript-eslint/no-unused-vars */
}

export function DataTable<TData>({
  columns,
  data,
  onRowClick,
}: {
  columns: ColumnDef<TData, unknown>[];
  data: TData[];
  onRowClick?: (row: TData) => void;
}) {
  const table = useReactTable({ data, columns, getCoreRowModel: getCoreRowModel() });

  return (
    <div className="rounded-lg border overflow-x-auto">
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <TableHead
                  key={header.id}
                  className={cn("whitespace-nowrap", header.column.columnDef.meta?.numeric && "num-col")}
                >
                  {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows.length === 0 ? (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-24 text-center text-muted-foreground">
                No results.
              </TableCell>
            </TableRow>
          ) : (
            table.getRowModel().rows.map((row) => (
              <TableRow
                key={row.id}
                // A row that only responds to a mouse is unreachable by
                // keyboard. tabIndex + Enter/Space make it a real control, and
                // focus-visible gives it the same ring every other control has.
                {...(onRowClick
                  ? {
                      role: "link" as const,
                      tabIndex: 0,
                      onClick: () => onRowClick(row.original),
                      onKeyDown: (e: React.KeyboardEvent) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          onRowClick(row.original);
                        }
                      },
                    }
                  : {})}
                className={cn(
                  "transition-colors",
                  onRowClick && "cursor-pointer hover:bg-muted/50 focus-visible:bg-muted/50",
                )}
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell
                    key={cell.id}
                    className={cn("whitespace-nowrap", cell.column.columnDef.meta?.numeric && "num-col")}
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}

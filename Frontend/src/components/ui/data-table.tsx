"use client";

import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  type ColumnDef
} from "@tanstack/react-table";
import { cn } from "@/lib/utils";

type DataTableProps<TData> = {
  data: TData[];
  columns: ColumnDef<TData>[];
  emptyLabel: string;
  className?: string;
  maxHeightClassName?: string;
};

export function DataTable<TData>({
  data,
  columns,
  emptyLabel,
  className,
  maxHeightClassName = "max-h-[420px]"
}: DataTableProps<TData>) {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel()
  });

  return (
    <div
      className={cn(
        "min-w-0 overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--panel)] shadow-sm",
        className
      )}
    >
      <div className={cn("w-full overflow-auto", maxHeightClassName)}>
        <table className="w-full min-w-[920px] border-separate border-spacing-0 text-left">
          <thead className="sticky top-0 z-10 bg-[var(--surface-wash)]">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className="border-b border-[var(--border)] px-3 py-2.5 font-[var(--font-mono)] text-[11px] font-semibold uppercase tracking-normal text-[var(--muted)]"
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-3 py-10 text-sm font-semibold text-[var(--muted)]"
                >
                  <div className="sticky left-0 w-[min(calc(100vw-5rem),520px)] text-center">
                    {emptyLabel}
                  </div>
                </td>
              </tr>
            ) : (
              table.getRowModel().rows.map((row) => (
                <tr key={row.id} className="transition-colors hover:bg-[var(--teal-faint)]">
                  {row.getVisibleCells().map((cell) => (
                    <td
                      key={cell.id}
                      className="max-w-[280px] border-b border-[var(--border-soft)] px-3 py-3 text-[13px] font-medium text-[var(--muted-strong)]"
                    >
                      <div className="truncate">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </div>
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { useMemo } from "react";
import { DataTable } from "@/components/ui/data-table";
import type { CsvPreview } from "../types";

type CsvPreviewTableProps = {
  preview: CsvPreview;
};

const previewRowLimit = 50;

const delimiterLabel = (delimiter: CsvPreview["delimiter"]) => {
  if (delimiter === "\t") {
    return "tab";
  }

  if (delimiter === ";") {
    return "semicolon";
  }

  return "comma";
};

export function CsvPreviewTable({ preview }: CsvPreviewTableProps) {
  const previewRows = preview.rows.slice(0, previewRowLimit);
  const columns = useMemo<ColumnDef<Record<string, string>>[]>(
    () =>
      preview.columns.map((column) => ({
        accessorKey: column,
        header: column,
        cell: ({ row }) => row.original[column] || "-"
      })),
    [preview.columns]
  );

  return (
    <div>
      <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-extrabold text-[var(--foreground)]">
            CSV Preview
          </p>
          <p className="mt-1 text-xs font-bold text-[var(--muted)]">
            {preview.rowCount} rows x {preview.columnCount} columns detected
            with {delimiterLabel(preview.delimiter)} delimiter
          </p>
        </div>
        <p className="rounded-full bg-[var(--teal-faint)] px-3 py-1 text-xs font-extrabold text-[var(--teal-strong)]">
          No data has been sent anywhere yet
        </p>
      </div>
      <DataTable
        data={previewRows}
        columns={columns}
        emptyLabel="No rows found in this CSV."
        maxHeightClassName="max-h-[310px]"
      />
      {preview.rowCount > previewRows.length ? (
        <p className="mt-3 text-xs font-semibold text-[var(--muted)]">
          Showing first {previewRows.length} of {preview.rowCount} rows.
        </p>
      ) : null}
      {preview.errors.length ? (
        <p className="mt-3 text-xs font-semibold text-[var(--danger)]">
          {preview.errors[0]}
        </p>
      ) : null}
    </div>
  );
}

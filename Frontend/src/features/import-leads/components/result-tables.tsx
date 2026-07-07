"use client";

import type { ColumnDef } from "@tanstack/react-table";
import type {
  CrmLeadRecord,
  ErroredRecord,
  SkippedRecord
} from "@groweasy/shared";
import { useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/ui/data-table";
import { cn } from "@/lib/utils";

const statusTone = (status: CrmLeadRecord["crm_status"]) => {
  if (status === "SALE_DONE") {
    return "info";
  }
  if (status === "GOOD_LEAD_FOLLOW_UP") {
    return "success";
  }
  if (status === "BAD_LEAD") {
    return "danger";
  }
  return "neutral";
};

export const getLeadRecordKey = (record: CrmLeadRecord) =>
  [
    record.email,
    record.mobile_without_country_code,
    record.name,
    record.company
  ]
    .filter(Boolean)
    .join("|");

type ParsedRecordsTableProps = {
  records: CrmLeadRecord[];
  selectedRecordKey: string | undefined;
  onSelectRecord: (record: CrmLeadRecord) => void;
};

export function ParsedRecordsTable({
  records,
  selectedRecordKey,
  onSelectRecord
}: ParsedRecordsTableProps) {
  const columns = useMemo<ColumnDef<CrmLeadRecord>[]>(
    () => [
      {
        accessorKey: "name",
        header: "Lead Name",
        cell: ({ row }) => {
          const record = row.original;
          const recordKey = getLeadRecordKey(record);
          const isSelected = recordKey === selectedRecordKey;

          return (
            <button
              aria-label={`Open ${record.name || "lead"} details`}
              aria-pressed={isSelected}
              className={cn(
                "flex max-w-full items-center gap-2 rounded-xl px-2 py-1 text-left font-extrabold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus)] focus-visible:ring-offset-2",
                isSelected
                  ? "bg-[var(--teal-faint)] text-[var(--teal-strong)]"
                  : "text-[var(--foreground)] hover:bg-[var(--panel-muted)]"
              )}
              onClick={() => onSelectRecord(record)}
              type="button"
            >
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[var(--panel-muted)] text-xs text-[var(--teal-strong)]">
                {(record.name || "GE").slice(0, 1).toUpperCase()}
              </span>
              <span className="truncate">{record.name || "Unnamed lead"}</span>
            </button>
          );
        }
      },
      {
        accessorKey: "email",
        header: "Email",
        cell: ({ row }) => row.original.email || "-"
      },
      {
        id: "contact",
        header: "Contact",
        cell: ({ row }) =>
          row.original.mobile_without_country_code
            ? `${row.original.country_code} ${row.original.mobile_without_country_code}`.trim()
            : "-"
      },
      {
        accessorKey: "company",
        header: "Company",
        cell: ({ row }) => row.original.company || "-"
      },
      {
        accessorKey: "crm_status",
        header: "Status",
        cell: ({ row }) => (
          <Badge tone={statusTone(row.original.crm_status)}>
            {row.original.crm_status.replaceAll("_", " ")}
          </Badge>
        )
      },
      {
        accessorKey: "data_source",
        header: "Source",
        cell: ({ row }) => row.original.data_source || "-"
      },
      {
        accessorKey: "crm_note",
        header: "CRM Note",
        cell: ({ row }) => row.original.crm_note || "-"
      }
    ],
    [onSelectRecord, selectedRecordKey]
  );

  return (
    <DataTable
      data={records}
      columns={columns}
      emptyLabel="No imported records yet."
      maxHeightClassName="max-h-[520px]"
    />
  );
}

type IssueRecord = SkippedRecord | ErroredRecord;

const escapeCsvCell = (value: unknown) => {
  const cleaned = String(value ?? "")
    .split("\0")
    .join("")
    .replace(/\r?\n/g, "\\n");
  const safeValue = /^[=+\-@]/.test(cleaned) ? `'${cleaned}` : cleaned;
  return `"${safeValue.replaceAll('"', '""')}"`;
};

export const downloadIssueRowsCsv = ({
  filename,
  rows
}: {
  filename: string;
  rows: IssueRecord[];
}) => {
  if (rows.length === 0) {
    return;
  }

  const rawHeaders = Array.from(
    new Set(rows.flatMap((row) => Object.keys(row.raw ?? {})))
  );
  const headers = ["rowNumber", "reason", ...rawHeaders];
  const csvRows = [
    headers.map(escapeCsvCell).join(","),
    ...rows.map((row) =>
      [
        row.rowNumber,
        row.reason,
        ...rawHeaders.map((header) => row.raw?.[header] ?? "")
      ]
        .map(escapeCsvCell)
        .join(",")
    )
  ];
  const blob = new Blob([csvRows.join("\n")], {
    type: "text/csv;charset=utf-8"
  });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
};

function IssueRecordsTable({
  rows,
  emptyLabel
}: {
  rows: IssueRecord[];
  emptyLabel: string;
}) {
  const columns = useMemo<ColumnDef<IssueRecord>[]>(
    () => [
      {
        accessorKey: "rowNumber",
        header: "Row",
        cell: ({ row }) => row.original.rowNumber
      },
      {
        accessorKey: "reason",
        header: "Reason",
        cell: ({ row }) => row.original.reason
      },
      {
        id: "raw",
        header: "Original Data",
        cell: ({ row }) => {
          const raw = row.original.raw ?? {};
          const preview = Object.entries(raw)
            .slice(0, 4)
            .map(([key, value]) => `${key}: ${value}`)
            .join(" | ");
          return preview || "-";
        }
      }
    ],
    []
  );

  return (
    <DataTable
      data={rows}
      columns={columns}
      emptyLabel={emptyLabel}
      maxHeightClassName="max-h-[300px]"
    />
  );
}

export function SkippedRecordsTable({ skipped }: { skipped: SkippedRecord[] }) {
  return (
    <IssueRecordsTable
      rows={skipped}
      emptyLabel="No skipped rows."
    />
  );
}

export function ErroredRecordsTable({ errored }: { errored: ErroredRecord[] }) {
  return (
    <IssueRecordsTable
      rows={errored}
      emptyLabel="No errored rows."
    />
  );
}

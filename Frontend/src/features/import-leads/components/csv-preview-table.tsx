"use client";

import { useVirtualRows } from "@/components/ui/use-virtual-rows";
import type { CsvPreview } from "../types";
import {
  CSV_PREVIEW_COPY,
  CSV_PREVIEW_DELIMITER_LABELS,
  CSV_PREVIEW_EMPTY_CELL_VALUE,
  CSV_PREVIEW_FORMULA_ESCAPE_PATTERN,
  CSV_PREVIEW_NUMBER_FORMAT_LOCALE,
  CSV_PREVIEW_TABLE_LAYOUT
} from "../utils/csv-preview-table-config";

type CsvPreviewTableProps = {
  preview: CsvPreview;
};

const numberFormatter = new Intl.NumberFormat(CSV_PREVIEW_NUMBER_FORMAT_LOCALE);

export function CsvPreviewTable({ preview }: CsvPreviewTableProps) {
  const visibleRowsValue = preview.rows.length
    ? `${numberFormatter.format(preview.rows.length)} of ${numberFormatter.format(
        preview.rowCount
      )}`
    : "0";
  const firstVisibleRow = preview.rows.length ? 1 : 0;
  const lastVisibleRow = preview.rows.length;
  const virtualRows = useVirtualRows({
    rowCount: preview.rows.length,
    rowHeight: 30,
    overscan: 12,
    defaultViewportHeight: 360
  });

  return (
    <div className="space-y-2.5">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-bold text-[var(--foreground)]">
            {CSV_PREVIEW_COPY.title}
          </p>
          <p className="mt-0.5 text-xs font-semibold text-[var(--muted)]">
            {numberFormatter.format(preview.rowCount)}{" "}
            {CSV_PREVIEW_COPY.detectedSummaryRows} x{" "}
            {numberFormatter.format(preview.columnCount)}{" "}
            {CSV_PREVIEW_COPY.detectedSummaryColumns}{" "}
            {delimiterLabel(preview.delimiter)}{" "}
            {CSV_PREVIEW_COPY.detectedSummaryDelimiterSuffix}
          </p>
        </div>
        <p className="w-fit rounded-full bg-[var(--teal-faint)] px-3 py-1 text-xs font-extrabold text-[var(--teal-strong)]">
          {CSV_PREVIEW_COPY.statusPending}
        </p>
      </div>

      <div className="grid gap-2 rounded-xl border border-[var(--border)] bg-[var(--surface-wash)] p-2.5 text-xs font-semibold text-[var(--muted-strong)] sm:grid-cols-4">
        <PreviewStat
          label={CSV_PREVIEW_COPY.stats.rows}
          value={numberFormatter.format(preview.rowCount)}
        />
        <PreviewStat
          label={CSV_PREVIEW_COPY.stats.columns}
          value={numberFormatter.format(preview.columnCount)}
        />
        <PreviewStat
          label={CSV_PREVIEW_COPY.stats.delimiter}
          value={delimiterLabel(preview.delimiter)}
        />
        <PreviewStat
          label={CSV_PREVIEW_COPY.stats.preview}
          value={visibleRowsValue}
        />
      </div>

      <p className="rounded-lg bg-[var(--panel-muted)] px-3 py-2 text-xs font-semibold text-[var(--muted)]">
        {CSV_PREVIEW_COPY.allFieldsNotice}.
      </p>

      <div
        className="rounded-xl border border-[var(--border)] bg-[var(--panel)]"
        data-testid="csv-preview-sample"
      >
        {preview.rows.length > 0 ? (
          <div
            className={CSV_PREVIEW_TABLE_LAYOUT.scrollContainerClassName}
            data-testid="csv-preview-scroll"
            ref={virtualRows.setScrollElement}
            onScroll={virtualRows.handleScroll}
          >
            <table
              aria-label={CSV_PREVIEW_COPY.tableAriaLabel}
              className="w-max min-w-full border-separate border-spacing-0 text-left text-xs"
            >
              <thead className="sticky top-0 z-10 bg-[var(--panel-muted)]">
                <tr>
                  <th
                    scope="col"
                    className={`${CSV_PREVIEW_TABLE_LAYOUT.rowNumberColumnClassName} border-b border-[var(--border)] px-2 py-2 font-[var(--font-mono)] text-[10px] font-semibold uppercase text-[var(--muted)]`}
                  >
                    #
                  </th>
                  {preview.columns.map((column, columnIndex) => (
                    <th
                      key={`${column}-${columnIndex}`}
                      scope="col"
                      className="min-w-[140px] break-words border-b border-l border-[var(--border)] px-2 py-2 font-[var(--font-mono)] text-[9px] font-semibold leading-tight text-[var(--muted)]"
                    >
                      {column}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {virtualRows.paddingTop > 0 ? (
                  <tr aria-hidden="true">
                    <td
                      colSpan={preview.columns.length + 1}
                      className="border-0 p-0"
                      style={{ height: virtualRows.paddingTop }}
                    />
                  </tr>
                ) : null}
                {virtualRows.items.map(({ index }) => {
                  const row = preview.rows[index];
                  if (!row) {
                    return null;
                  }

                  return (
                    <tr
                      key={`preview-row-${index}`}
                      className="odd:bg-[var(--panel)] even:bg-[var(--surface-wash)]"
                    >
                      <td className="border-b border-[var(--border-soft)] px-2 py-1.5 font-[var(--font-mono)] text-[10px] font-semibold text-[var(--teal-strong)]">
                        {index + 1}
                      </td>
                      {preview.columns.map((column, columnIndex) => (
                        <td
                          key={`${index}-${column}-${columnIndex}`}
                          className="min-w-[140px] border-b border-l border-[var(--border-soft)] px-2 py-1.5 font-medium text-[var(--muted-strong)]"
                        >
                          <span className="block truncate">
                            {getCellValue(row, column)}
                          </span>
                        </td>
                      ))}
                    </tr>
                  );
                })}
                {virtualRows.paddingBottom > 0 ? (
                  <tr aria-hidden="true">
                    <td
                      colSpan={preview.columns.length + 1}
                      className="border-0 p-0"
                      style={{ height: virtualRows.paddingBottom }}
                    />
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-5 text-center text-sm font-semibold text-[var(--muted)]">
            {CSV_PREVIEW_COPY.noRows}
          </div>
        )}
      </div>

      <div className="flex flex-col gap-2 rounded-xl border border-[var(--border-soft)] bg-[var(--surface-wash)] px-3 py-2 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs font-semibold text-[var(--muted)]">
          {CSV_PREVIEW_COPY.rowRangePrefix}{" "}
          {numberFormatter.format(firstVisibleRow)}-
          {numberFormatter.format(lastVisibleRow)}{" "}
          {CSV_PREVIEW_COPY.rowRangeJoiner}{" "}
          {numberFormatter.format(preview.rowCount)}
        </p>
      </div>

      {preview.errors.length ? (
        <p className="rounded-xl border border-[var(--danger-soft)] bg-[var(--danger-soft)] p-3 text-xs font-semibold text-[var(--danger)]">
          {preview.errors[0]}
        </p>
      ) : null}
    </div>
  );
}

function PreviewStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-[var(--panel)] px-2.5 py-2">
      <p className="font-[var(--font-mono)] text-[9px] font-semibold uppercase text-[var(--muted)]">
        {label}
      </p>
      <p className="mt-0.5 truncate text-sm font-bold text-[var(--foreground)]">
        {value}
      </p>
    </div>
  );
}

function getCellValue(row: Record<string, string>, column: string) {
  const value = row[column]?.trim() ?? "";

  if (CSV_PREVIEW_FORMULA_ESCAPE_PATTERN.test(value)) {
    return value.slice(1) || CSV_PREVIEW_EMPTY_CELL_VALUE;
  }

  return value || CSV_PREVIEW_EMPTY_CELL_VALUE;
}

function delimiterLabel(delimiter: CsvPreview["delimiter"]) {
  return CSV_PREVIEW_DELIMITER_LABELS[delimiter];
}

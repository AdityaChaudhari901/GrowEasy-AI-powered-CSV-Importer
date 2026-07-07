"use client";

import { useMemo, useState } from "react";
import type { CsvPreview } from "../types";
import {
  CSV_PREVIEW_COPY,
  CSV_PREVIEW_DELIMITER_LABELS,
  CSV_PREVIEW_EMPTY_CELL_VALUE,
  CSV_PREVIEW_FORMULA_ESCAPE_PATTERN,
  CSV_PREVIEW_MAX_VISIBLE_PAGE_BUTTONS,
  CSV_PREVIEW_NUMBER_FORMAT_LOCALE,
  CSV_PREVIEW_REQUIRED_COLUMN_KEYS,
  CSV_PREVIEW_ROWS_PER_PAGE,
  CSV_PREVIEW_TABLE_LAYOUT
} from "../utils/csv-preview-table-config";

type CsvPreviewTableProps = {
  preview: CsvPreview;
};

type PreviewColumn = {
  key: string;
  sourceColumn: string;
};

const numberFormatter = new Intl.NumberFormat(CSV_PREVIEW_NUMBER_FORMAT_LOCALE);

export function CsvPreviewTable({ preview }: CsvPreviewTableProps) {
  const [pageIndex, setPageIndex] = useState(0);
  const pageCount = Math.max(
    Math.ceil(preview.rows.length / CSV_PREVIEW_ROWS_PER_PAGE),
    1
  );
  const safePageIndex = Math.min(pageIndex, pageCount - 1);
  const pageStartIndex = safePageIndex * CSV_PREVIEW_ROWS_PER_PAGE;
  const pageRows = preview.rows.slice(
    pageStartIndex,
    pageStartIndex + CSV_PREVIEW_ROWS_PER_PAGE
  );
  const tableColumns = useMemo(
    () => selectPreviewColumns(preview.columns),
    [preview.columns]
  );
  const displayedColumnNames = new Set(
    tableColumns.map(({ sourceColumn }) => sourceColumn)
  );
  const hiddenColumnCount = preview.columns.filter(
    (column) => !displayedColumnNames.has(column)
  ).length;
  const missingLeadColumnCount = Math.max(
    CSV_PREVIEW_REQUIRED_COLUMN_KEYS.length - tableColumns.length,
    0
  );
  const firstVisibleRow = pageRows.length ? pageStartIndex + 1 : 0;
  const lastVisibleRow = pageStartIndex + pageRows.length;
  const pageNumbers = getVisiblePageNumbers(safePageIndex, pageCount);

  const goToPage = (nextPageIndex: number) => {
    setPageIndex(Math.max(0, Math.min(nextPageIndex, pageCount - 1)));
  };

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
          value={`${numberFormatter.format(CSV_PREVIEW_ROWS_PER_PAGE)} ${CSV_PREVIEW_COPY.previewPerPageSuffix}`}
        />
      </div>

      {missingLeadColumnCount > 0 || hiddenColumnCount > 0 ? (
        <p className="rounded-lg bg-[var(--panel-muted)] px-3 py-2 text-xs font-semibold text-[var(--muted)]">
          {CSV_PREVIEW_COPY.leadFieldsNotice}
          {hiddenColumnCount > 0
            ? `; ${numberFormatter.format(hiddenColumnCount)} ${CSV_PREVIEW_COPY.hiddenHeadersNotice}`
            : ""}
          {missingLeadColumnCount > 0
            ? `; ${numberFormatter.format(missingLeadColumnCount)} ${CSV_PREVIEW_COPY.missingLeadFieldsNotice}`
            : ""}
          .
        </p>
      ) : null}

      <div
        className="rounded-xl border border-[var(--border)] bg-[var(--panel)]"
        data-testid="csv-preview-sample"
      >
        {pageRows.length > 0 ? (
          <div
            className={CSV_PREVIEW_TABLE_LAYOUT.scrollContainerClassName}
            data-testid="csv-preview-scroll"
          >
            <table
              aria-label={CSV_PREVIEW_COPY.tableAriaLabel}
              className="w-full table-fixed border-separate border-spacing-0 text-left text-xs"
            >
              <thead className="sticky top-0 z-10 bg-[var(--panel-muted)]">
                <tr>
                  <th
                    scope="col"
                    className={`${CSV_PREVIEW_TABLE_LAYOUT.rowNumberColumnClassName} border-b border-[var(--border)] px-2 py-2 font-[var(--font-mono)] text-[10px] font-semibold uppercase text-[var(--muted)]`}
                  >
                    #
                  </th>
                  {tableColumns.map((column) => (
                    <th
                      key={column.key}
                      scope="col"
                      className="break-words border-b border-l border-[var(--border)] px-2 py-2 font-[var(--font-mono)] text-[9px] font-semibold leading-tight text-[var(--muted)]"
                    >
                      {column.key}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {pageRows.map((row, index) => (
                  <tr
                    key={`preview-row-${pageStartIndex + index}`}
                    className="odd:bg-[var(--panel)] even:bg-[var(--surface-wash)]"
                  >
                    <td className="border-b border-[var(--border-soft)] px-2 py-1.5 font-[var(--font-mono)] text-[10px] font-semibold text-[var(--teal-strong)]">
                      {pageStartIndex + index + 1}
                    </td>
                    {tableColumns.map((column) => (
                      <td
                        key={`${pageStartIndex + index}-${column.key}`}
                        className="border-b border-l border-[var(--border-soft)] px-2 py-1.5 font-medium text-[var(--muted-strong)]"
                      >
                        <span className="block truncate">
                          {getCellValue(row, column.sourceColumn)}
                        </span>
                      </td>
                    ))}
                  </tr>
                ))}
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

        <nav
          aria-label={CSV_PREVIEW_COPY.paginationAriaLabel}
          className="flex flex-wrap items-center gap-1.5"
        >
          <button
            type="button"
            className="h-8 rounded-lg border border-[var(--border)] bg-[var(--panel)] px-2.5 text-xs font-bold text-[var(--muted-strong)] disabled:cursor-not-allowed disabled:opacity-45"
            disabled={safePageIndex === 0}
            onClick={() => goToPage(safePageIndex - 1)}
          >
            {CSV_PREVIEW_COPY.previousPage}
          </button>
          {pageNumbers.map((pageNumber) => {
            const isCurrent = pageNumber - 1 === safePageIndex;

            return (
              <button
                type="button"
                key={pageNumber}
                aria-current={isCurrent ? "page" : undefined}
                className={[
                  "h-8 min-w-8 rounded-lg border px-2 text-xs font-extrabold",
                  isCurrent
                    ? "border-[var(--teal)] bg-[var(--teal)] text-white"
                    : "border-[var(--border)] bg-[var(--panel)] text-[var(--muted-strong)]"
                ].join(" ")}
                onClick={() => goToPage(pageNumber - 1)}
              >
                {pageNumber}
              </button>
            );
          })}
          <button
            type="button"
            className="h-8 rounded-lg border border-[var(--border)] bg-[var(--panel)] px-2.5 text-xs font-bold text-[var(--muted-strong)] disabled:cursor-not-allowed disabled:opacity-45"
            disabled={safePageIndex >= pageCount - 1}
            onClick={() => goToPage(safePageIndex + 1)}
          >
            {CSV_PREVIEW_COPY.nextPage}
          </button>
          <span className="ml-1 text-xs font-bold text-[var(--muted)]">
            {CSV_PREVIEW_COPY.pagePrefix}{" "}
            {numberFormatter.format(safePageIndex + 1)}{" "}
            {CSV_PREVIEW_COPY.rowRangeJoiner}{" "}
            {numberFormatter.format(pageCount)}
          </span>
        </nav>
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

function selectPreviewColumns(columns: string[]): PreviewColumn[] {
  const sourceByNormalizedColumn = new Map(
    columns.map((column) => [normalizeColumnName(column), column])
  );

  const selected = CSV_PREVIEW_REQUIRED_COLUMN_KEYS.flatMap((key) => {
    const sourceColumn = sourceByNormalizedColumn.get(normalizeColumnName(key));
    return sourceColumn ? [{ key, sourceColumn }] : [];
  });

  if (selected.length > 0) {
    return selected;
  }

  return columns
    .slice(0, CSV_PREVIEW_REQUIRED_COLUMN_KEYS.length)
    .map((column) => ({
      key: column,
      sourceColumn: column
    }));
}

function getVisiblePageNumbers(currentPageIndex: number, pageCount: number) {
  const maxButtonCount = Math.min(
    CSV_PREVIEW_MAX_VISIBLE_PAGE_BUTTONS,
    pageCount
  );
  const preferredStart = currentPageIndex - Math.floor(maxButtonCount / 2);
  const start = Math.max(
    0,
    Math.min(preferredStart, pageCount - maxButtonCount)
  );

  return Array.from({ length: maxButtonCount }, (_, index) => start + index + 1);
}

function normalizeColumnName(column: string) {
  return column.toLowerCase().replace(/[^a-z0-9]/g, "");
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

import type { CsvPreview } from "../types";

export const CSV_PREVIEW_NUMBER_FORMAT_LOCALE = "en-IN";
export const CSV_PREVIEW_EMPTY_CELL_VALUE = "-";
export const CSV_PREVIEW_FORMULA_ESCAPE_PATTERN = /^'[=+\-@]/;

export const CSV_PREVIEW_TABLE_LAYOUT = {
  rowNumberColumnClassName: "w-10",
  scrollContainerClassName: "no-visible-scrollbar max-h-[320px] overflow-auto"
} as const;

export const CSV_PREVIEW_COPY = {
  title: "CSV Preview",
  statusPending: "No data has been sent anywhere yet",
  noRows: "No rows found in this CSV.",
  detectedSummaryRows: "rows",
  detectedSummaryColumns: "columns detected with",
  detectedSummaryDelimiterSuffix: "delimiter",
  stats: {
    rows: "Rows",
    columns: "Columns",
    delimiter: "Delimiter",
    preview: "Rows shown"
  },
  allFieldsNotice: "Showing every parsed CSV column and row",
  rowRangePrefix: "Rows",
  rowRangeJoiner: "of",
  tableAriaLabel: "CSV lead preview"
} as const;

export const CSV_PREVIEW_DELIMITER_LABELS = {
  ",": "comma",
  ";": "semicolon",
  "\t": "tab"
} satisfies Record<CsvPreview["delimiter"], string>;

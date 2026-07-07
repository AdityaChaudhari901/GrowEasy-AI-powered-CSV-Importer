import type { CsvPreview } from "../types";

export const CSV_PREVIEW_ROWS_PER_PAGE = 50;
export const CSV_PREVIEW_MAX_VISIBLE_PAGE_BUTTONS = 5;
export const CSV_PREVIEW_NUMBER_FORMAT_LOCALE = "en-IN";
export const CSV_PREVIEW_EMPTY_CELL_VALUE = "-";
export const CSV_PREVIEW_FORMULA_ESCAPE_PATTERN = /^'[=+\-@]/;

export const CSV_PREVIEW_REQUIRED_COLUMN_KEYS = [
  "created_at",
  "name",
  "email",
  "country_code",
  "mobile_without_country_code",
  "company",
  "city",
  "state",
  "country",
  "lead_owner"
] as const;

export const CSV_PREVIEW_TABLE_LAYOUT = {
  rowNumberColumnClassName: "w-10",
  scrollContainerClassName: "max-h-[320px] overflow-auto"
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
    preview: "Preview"
  },
  previewPerPageSuffix: "/ page",
  leadFieldsNotice: "Showing the lead-review fields first",
  hiddenHeadersNotice: "extra CSV headers are hidden in this preview",
  missingLeadFieldsNotice: "expected lead fields are not present in the CSV",
  rowRangePrefix: "Rows",
  rowRangeJoiner: "of",
  previousPage: "Previous",
  nextPage: "Next",
  pagePrefix: "Page",
  tableAriaLabel: "CSV lead preview",
  paginationAriaLabel: "CSV preview pages"
} as const;

export const CSV_PREVIEW_DELIMITER_LABELS = {
  ",": "comma",
  ";": "semicolon",
  "\t": "tab"
} satisfies Record<CsvPreview["delimiter"], string>;

import type { ImportResponse } from "@groweasy/shared";

export type CsvPreview = {
  columns: string[];
  rows: Record<string, string>[];
  rowCount: number;
  columnCount: number;
  delimiter: "," | ";" | "\t";
  errors: string[];
};

export type CsvPreviewProgress = {
  rowsParsed: number;
};

export type ImportResult = ImportResponse;

export type ImportSuccessPayload = {
  result: ImportResult;
  fileName: string;
  importedAt: string;
  rowCount: number;
  columnCount: number;
};

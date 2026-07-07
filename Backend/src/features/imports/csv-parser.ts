import { parse } from "csv-parse/sync";
import { TextDecoder } from "node:util";
import { env } from "../../config/env";
import { HttpError } from "../../shared/http-error";

export type SourceRow = {
  rowNumber: number;
  data: Record<string, string>;
};

const cleanCell = (value: unknown) =>
  String(value ?? "")
    .split("\0")
    .join("")
    .replace(/\r?\n/g, "\\n")
    .trim();

const csvDelimiters = [",", ";", "\t"] as const;

export type CsvDelimiter = (typeof csvDelimiters)[number];

const firstNonEmptyLine = (value: string) =>
  value.split(/\r\n|\n|\r/).find((line) => line.trim().length > 0) ?? "";

const countDelimiterOutsideQuotes = (line: string, delimiter: CsvDelimiter) => {
  let count = 0;
  let inQuotes = false;

  for (let index = 0; index < line.length; index += 1) {
    const character = line[index];
    const next = line[index + 1];

    if (character === '"' && next === '"') {
      index += 1;
      continue;
    }

    if (character === '"') {
      inQuotes = !inQuotes;
      continue;
    }

    if (!inQuotes && character === delimiter) {
      count += 1;
    }
  }

  return count;
};

const decodeCsvBuffer = (buffer: Buffer) => {
  try {
    return new TextDecoder("utf-8", { fatal: true }).decode(buffer);
  } catch {
    return new TextDecoder("latin1").decode(buffer);
  }
};

export const detectCsvDelimiter = (input: string): CsvDelimiter => {
  const headerLine = firstNonEmptyLine(input.replace(/^\uFEFF/, ""));

  if (!headerLine) {
    return ",";
  }

  return csvDelimiters.reduce<CsvDelimiter>((bestDelimiter, delimiter) => {
    const bestCount = countDelimiterOutsideQuotes(headerLine, bestDelimiter);
    const nextCount = countDelimiterOutsideQuotes(headerLine, delimiter);
    return nextCount > bestCount ? delimiter : bestDelimiter;
  }, ",");
};

export const normalizeCsvHeaders = (headers: unknown[]) => {
  const cleaned = headers.map(cleanCell);
  const nonEmptyHeaders = cleaned.filter(Boolean);

  if (cleaned.length === 0 || nonEmptyHeaders.length === 0) {
    throw new HttpError(
      400,
      "CSV must include a non-empty header row",
      "CSV_EMPTY_HEADER"
    );
  }

  if (nonEmptyHeaders.length !== cleaned.length) {
    throw new HttpError(
      400,
      "CSV header row contains an empty column name",
      "CSV_EMPTY_HEADER"
    );
  }

  const seenHeaders = new Set<string>();
  for (const header of cleaned) {
    const fingerprint = header.toLowerCase();
    if (seenHeaders.has(fingerprint)) {
      throw new HttpError(
        400,
        `CSV contains duplicate header "${header}"`,
        "CSV_DUPLICATE_HEADER"
      );
    }
    seenHeaders.add(fingerprint);
  }

  return cleaned;
};

export const parseCsvBuffer = (buffer: Buffer): SourceRow[] => {
  const csvText = decodeCsvBuffer(buffer);
  const delimiter = detectCsvDelimiter(csvText);
  let records: Record<string, unknown>[];

  try {
    records = parse(csvText, {
      bom: true,
      columns: normalizeCsvHeaders,
      delimiter,
      skip_empty_lines: true,
      relax_quotes: true,
      trim: true,
      max_record_size: 256 * 1024
    }) as Record<string, unknown>[];
  } catch (error) {
    if (error instanceof HttpError) {
      throw error;
    }

    const message =
      error instanceof Error ? error.message : "The CSV could not be parsed";
    throw new HttpError(400, message, "CSV_PARSE_ERROR");
  }

  if (records.length === 0) {
    throw new HttpError(400, "CSV must include at least one data row", "EMPTY_CSV");
  }

  if (records.length > env.maxCsvRows) {
    throw new HttpError(
      413,
      `CSV has ${records.length} rows. The configured limit is ${env.maxCsvRows}.`,
      "CSV_ROW_LIMIT"
    );
  }

  return records.map((record, index) => {
    const data = Object.entries(record).reduce<Record<string, string>>(
      (accumulator, [key, value]) => {
        const safeKey = cleanCell(key);
        if (safeKey) {
          accumulator[safeKey] = cleanCell(value);
        }
        return accumulator;
      },
      {}
    );

    return {
      rowNumber: index + 2,
      data
    };
  });
};

"use client";

import Papa from "papaparse";
import type { CsvPreview, CsvPreviewProgress } from "../types";

const csvDelimiters = [",", ";", "\t"] as const;
const clientMaxRows = 5000;

const cleanCell = (value: unknown) =>
  String(value ?? "")
    .split("\0")
    .join("")
    .replace(/\r?\n/g, "\\n")
    .trim();

type CsvDelimiter = (typeof csvDelimiters)[number];

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

const validateHeaders = (headers: unknown[]) => {
  const cleaned = headers.map(cleanCell);
  const nonEmptyHeaders = cleaned.filter(Boolean);

  if (cleaned.length === 0 || nonEmptyHeaders.length === 0) {
    throw new Error("CSV must include a non-empty header row.");
  }

  if (nonEmptyHeaders.length !== cleaned.length) {
    throw new Error("CSV header row contains an empty column name.");
  }

  const seenHeaders = new Set<string>();
  for (const header of cleaned) {
    const fingerprint = header.toLowerCase();
    if (seenHeaders.has(fingerprint)) {
      throw new Error(`CSV contains duplicate header "${header}".`);
    }
    seenHeaders.add(fingerprint);
  }

  return cleaned;
};

const readFileArrayBuffer = (file: File) => {
  const readableFile = file as File & {
    arrayBuffer?: () => Promise<ArrayBuffer>;
  };

  if (typeof readableFile.arrayBuffer === "function") {
    return readableFile.arrayBuffer();
  }

  return new Promise<ArrayBuffer>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (reader.result instanceof ArrayBuffer) {
        resolve(reader.result);
        return;
      }

      reject(new Error("Unable to read CSV file as binary data."));
    };
    reader.onerror = () => {
      reject(new Error("Unable to read CSV file."));
    };
    reader.readAsArrayBuffer(file);
  });
};

const decodeCsvFile = async (file: File) => {
  const buffer = await readFileArrayBuffer(file);

  try {
    return new TextDecoder("utf-8", { fatal: true }).decode(buffer);
  } catch {
    return new TextDecoder("iso-8859-1").decode(buffer);
  }
};

type ParseCsvPreviewOptions = {
  onProgress?: (progress: CsvPreviewProgress) => void;
};

const normalizeParsedRow = (row: Record<string, unknown>) =>
  Object.entries(row).reduce<Record<string, string>>(
    (accumulator, [key, value]) => {
      const cleanKey = cleanCell(key);
      if (cleanKey && cleanKey !== "__parsed_extra") {
        accumulator[cleanKey] = cleanCell(value);
      }
      return accumulator;
    },
    {}
  );

export const parseCsvPreview = async (
  file: File,
  options: ParseCsvPreviewOptions = {}
): Promise<CsvPreview> => {
  const csvText = await decodeCsvFile(file);

  if (!csvText.trim()) {
    throw new Error("CSV file is empty.");
  }

  const delimiter = detectCsvDelimiter(csvText);
  const headerResult = Papa.parse<string[]>(csvText, {
    delimiter,
    preview: 1,
    skipEmptyLines: true
  });
  const columns = validateHeaders(headerResult.data[0] ?? []);

  const rows: Record<string, string>[] = [];
  const parseErrors: string[] = [];
  let exceededRowLimit = false;

  const results = Papa.parse<Record<string, unknown>>(csvText, {
    delimiter,
    header: true,
    skipEmptyLines: true,
    transformHeader: cleanCell,
    step(result, parser) {
      parseErrors.push(...result.errors.map((error) => error.message));
      rows.push(normalizeParsedRow(result.data));

      if (rows.length % 100 === 0) {
        options.onProgress?.({ rowsParsed: rows.length });
      }

      if (rows.length > clientMaxRows) {
        exceededRowLimit = true;
        parser.abort();
      }
    }
  });
  options.onProgress?.({ rowsParsed: rows.length });

  if (rows.length === 0) {
    throw new Error("CSV must include at least one data row.");
  }

  if (exceededRowLimit || rows.length > clientMaxRows) {
    throw new Error(
      `CSV has ${rows.length} rows. The browser preview limit is ${clientMaxRows}.`
    );
  }

  return {
    columns,
    rows,
    rowCount: rows.length,
    columnCount: columns.length,
    delimiter,
    errors: [
      ...parseErrors,
      ...results.errors.map((error) => error.message)
    ]
  };
};

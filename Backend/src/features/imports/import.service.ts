import type {
  ErroredRecord,
  ImportResponse,
  SkippedRecord
} from "@groweasy/shared";
import { importResponseSchema } from "@groweasy/shared";
import { parseCsvBuffer } from "./csv-parser";
import { extractRows } from "./ai-extractor";
import { normalizeLeadRecord } from "./normalizers";

type ExtractImportInput = {
  buffer: Buffer;
  originalName: string;
};

export const extractImportFromBuffer = async ({
  buffer
}: ExtractImportInput): Promise<ImportResponse> => {
  const startedAt = Date.now();
  const rows = parseCsvBuffer(buffer);
  const rowByNumber = new Map(rows.map((row) => [row.rowNumber, row]));
  const extraction = await extractRows(rows);
  const records: ImportResponse["records"] = [];
  const skipped: SkippedRecord[] = [];
  const errored: ErroredRecord[] = [];
  const handledRows = new Set<number>();

  for (const batch of extraction.batches) {
    for (const aiRecord of batch.records) {
      handledRows.add(aiRecord.rowNumber);
      const normalized = normalizeLeadRecord(aiRecord);
      if (normalized.ok) {
        records.push(normalized.record);
      } else {
        skipped.push({
          rowNumber: aiRecord.rowNumber,
          reason: normalized.reason,
          raw: rowByNumber.get(aiRecord.rowNumber)?.data
        });
      }
    }

    for (const skippedRecord of batch.skipped) {
      handledRows.add(skippedRecord.rowNumber);
      skipped.push({
        ...skippedRecord,
        raw: rowByNumber.get(skippedRecord.rowNumber)?.data
      });
    }

    for (const erroredRecord of batch.errored) {
      handledRows.add(erroredRecord.rowNumber);
      errored.push({
        ...erroredRecord,
        raw: rowByNumber.get(erroredRecord.rowNumber)?.data
      });
    }
  }

  for (const row of rows) {
    if (!handledRows.has(row.rowNumber)) {
      errored.push({
        rowNumber: row.rowNumber,
        reason: "The extractor did not return an imported, skipped, or errored outcome for this row",
        raw: row.data
      });
    }
  }

  const response: ImportResponse = {
    records,
    skipped,
    errored,
    summary: {
      totalRows: rows.length,
      imported: records.length,
      skipped: skipped.length,
      errored: errored.length,
      batches: extraction.batches.length,
      durationMs: Date.now() - startedAt,
      aiProvider: extraction.provider
    },
    diagnostics: extraction.diagnostics
  };

  return importResponseSchema.parse(response);
};

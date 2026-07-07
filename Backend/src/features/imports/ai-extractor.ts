import type { AiBatchResponse, BatchDiagnostic } from "@groweasy/shared";
import pLimit from "p-limit";
import { env } from "../../config/env";
import type { SourceRow } from "./csv-parser";
import { createFallbackExtractor } from "./ai/fallback-provider";
import { createVertexExtractor } from "./ai/vertex-provider";
import type { BatchExtractor, LlmProviderName } from "./ai/types";

type ExtractionOutput = {
  provider: LlmProviderName;
  batches: AiBatchResponse[];
  diagnostics: BatchDiagnostic[];
};

const chunkRows = (rows: SourceRow[], size: number) => {
  const chunks: SourceRow[][] = [];
  const maxEstimatedTokens = 3000;
  let currentChunk: SourceRow[] = [];
  let currentEstimatedTokens = 0;

  const flushChunk = () => {
    if (currentChunk.length > 0) {
      chunks.push(currentChunk);
      currentChunk = [];
      currentEstimatedTokens = 0;
    }
  };

  for (let index = 0; index < rows.length; index += 1) {
    const row = rows[index];
    if (!row) {
      continue;
    }

    const estimatedTokens = Math.ceil(JSON.stringify(row.data).length / 4) + 12;
    const wouldExceedTokenBudget =
      currentEstimatedTokens > 0 &&
      currentEstimatedTokens + estimatedTokens > maxEstimatedTokens;
    const wouldExceedRowBudget = currentChunk.length >= size;

    if (wouldExceedTokenBudget || wouldExceedRowBudget) {
      flushChunk();
    }

    currentChunk.push(row);
    currentEstimatedTokens += estimatedTokens;
  }

  flushChunk();

  return chunks;
};

const createBatchDiagnostic = ({
  batch,
  batchIndex,
  status,
  attempts,
  message
}: {
  batch: SourceRow[];
  batchIndex: number;
  status: BatchDiagnostic["status"];
  attempts: number;
  message?: string;
}): BatchDiagnostic => {
  const rowStart = batch[0]?.rowNumber ?? 1;
  const rowEnd = batch.at(-1)?.rowNumber ?? rowStart;

  return {
    batchId: `rows-${rowStart}-${rowEnd}`,
    batchIndex,
    rowStart,
    rowEnd,
    status,
    attempts,
    message
  };
};

const logBatchDiagnostic = (diagnostic: BatchDiagnostic, durationMs: number) => {
  if (env.nodeEnv === "test") {
    return;
  }

  const logPayload = {
    event: "csv_import_batch",
    batchId: diagnostic.batchId,
    batchIndex: diagnostic.batchIndex,
    rowStart: diagnostic.rowStart,
    rowEnd: diagnostic.rowEnd,
    status: diagnostic.status,
    attempts: diagnostic.attempts,
    durationMs,
    message: diagnostic.message
  };

  if (diagnostic.status === "failed") {
    console.error(logPayload);
    return;
  }

  console.info(logPayload);
};

const delay = (ms: number) =>
  new Promise((resolve) => {
    setTimeout(resolve, ms);
  });

const withRetry = async <T>(
  operation: () => Promise<T>,
  maxRetries: number
): Promise<{ value: T; attempts: number }> => {
  let attempts = 0;
  let lastError: unknown;

  while (attempts <= maxRetries) {
    attempts += 1;
    try {
      return {
        value: await operation(),
        attempts
      };
    } catch (error) {
      lastError = error;
      if (attempts > maxRetries) {
        break;
      }
      await delay(250 * attempts + Math.floor(Math.random() * 150));
    }
  }

  throw lastError instanceof Error ? lastError : new Error("AI extraction failed");
};

const resolveExtractor = (): {
  provider: LlmProviderName;
  extractor: BatchExtractor;
} => {
  if (env.llmProvider === "vertex") {
    return {
      provider: "vertex",
      extractor: createVertexExtractor()
    };
  }

  return {
    provider: "local-fallback",
    extractor: createFallbackExtractor()
  };
};

export const extractRows = async (rows: SourceRow[]): Promise<ExtractionOutput> => {
  const batches = chunkRows(rows, env.aiBatchSize);
  const { provider, extractor } = resolveExtractor();

  if (provider === "local-fallback") {
    return {
      provider: "local-fallback",
      batches: await Promise.all(batches.map(extractor)),
      diagnostics: batches.map((batch, batchIndex) =>
        createBatchDiagnostic({
          batch,
          batchIndex,
          status: "fallback",
          attempts: 1,
          message: "LLM_PROVIDER is local-fallback; used deterministic extractor"
        })
      )
    };
  }

  const limit = pLimit(env.aiBatchConcurrency);

  const results = await Promise.all(
    batches.map((batch, batchIndex) =>
      limit(async () => {
        const batchStartedAt = Date.now();
        try {
          const { value, attempts } = await withRetry(
            () => extractor(batch),
            env.aiMaxRetries
          );
          const diagnostic = createBatchDiagnostic({
            batch,
            batchIndex,
            status: "success",
            attempts
          });

          logBatchDiagnostic(diagnostic, Date.now() - batchStartedAt);

          return {
            batchIndex,
            value,
            diagnostic
          };
        } catch (error) {
          const message =
            error instanceof Error ? error.message : "AI extraction failed";
          const diagnostic = createBatchDiagnostic({
            batch,
            batchIndex,
            status: "failed",
            attempts: env.aiMaxRetries + 1,
            message
          });

          logBatchDiagnostic(diagnostic, Date.now() - batchStartedAt);

          return {
            batchIndex,
            value: {
              records: [],
              skipped: [],
              errored: batch.map((row) => ({
                rowNumber: row.rowNumber,
                reason: `AI extraction failed for this batch: ${message}`
              }))
            } satisfies AiBatchResponse,
            diagnostic
          };
        }
      })
    )
  );

  const ordered = results.sort((left, right) => left.batchIndex - right.batchIndex);

  return {
    provider,
    batches: ordered.map((result) => result.value),
    diagnostics: ordered.map((result) => result.diagnostic)
  };
};

import type { AiBatchResponse } from "@groweasy/shared";
import type { SourceRow } from "../csv-parser";

export type LlmProviderName = "vertex" | "local-fallback";

export type BatchExtractor = (batch: SourceRow[]) => Promise<AiBatchResponse>;

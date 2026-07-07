import type { BatchExtractor } from "./types";
import { extractWithFallback } from "../fallback-extractor";

export const createFallbackExtractor = (): BatchExtractor => async (batch) =>
  extractWithFallback(batch);

import dotenv from "dotenv";
import { MAX_DEFAULT_UPLOAD_MB } from "@groweasy/shared";

dotenv.config();

const integerFromEnv = (
  key: string,
  fallback: number,
  options: { min?: number; max?: number } = {}
) => {
  const value = process.env[key];
  if (!value) {
    return fallback;
  }

  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed)) {
    return fallback;
  }

  const min = options.min ?? Number.NEGATIVE_INFINITY;
  const max = options.max ?? Number.POSITIVE_INFINITY;
  return Math.min(Math.max(parsed, min), max);
};

const defaultCorsOrigins = ["http://localhost:3000", "http://127.0.0.1:3000"];

const corsOrigins = (process.env.CORS_ORIGIN ?? defaultCorsOrigins.join(","))
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

export const env = {
  nodeEnv: process.env.NODE_ENV ?? "development",
  port: integerFromEnv("PORT", 4000, { min: 1, max: 65535 }),
  corsOrigins,
  maxUploadMb: integerFromEnv("MAX_UPLOAD_MB", MAX_DEFAULT_UPLOAD_MB, {
    min: 1,
    max: 25
  }),
  maxCsvRows: integerFromEnv("MAX_CSV_ROWS", 5000, {
    min: 1,
    max: 50000
  }),
  aiBatchSize: integerFromEnv("AI_BATCH_SIZE", 25, {
    min: 1,
    max: 100
  }),
  aiBatchConcurrency: integerFromEnv("AI_BATCH_CONCURRENCY", 2, {
    min: 1,
    max: 5
  }),
  aiMaxRetries: integerFromEnv("AI_MAX_RETRIES", 2, {
    min: 0,
    max: 5
  }),
  llmProvider:
    process.env.LLM_PROVIDER?.trim() === "vertex" ? "vertex" : "local-fallback",
  vertexProjectId: process.env.VERTEX_PROJECT_ID?.trim() || "",
  vertexLocation: process.env.VERTEX_LOCATION?.trim() || "global",
  vertexModel: process.env.VERTEX_MODEL?.trim() || "gemini-2.5-flash"
};

export const maxUploadBytes = env.maxUploadMb * 1024 * 1024;

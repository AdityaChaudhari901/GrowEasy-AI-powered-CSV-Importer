import { aiBatchResponseSchema } from "@groweasy/shared";
import { GoogleGenAI } from "@google/genai";
import { env } from "../../../config/env";
import { AI_SYSTEM_PROMPT } from "../prompt";
import { vertexBatchResponseSchema } from "./schema";
import type { BatchExtractor } from "./types";

const requireVertexProjectId = () => {
  if (!env.vertexProjectId) {
    throw new Error("VERTEX_PROJECT_ID is required when LLM_PROVIDER=vertex");
  }
};

export const createVertexExtractor = (): BatchExtractor => {
  requireVertexProjectId();

  const client = new GoogleGenAI({
    vertexai: true,
    project: env.vertexProjectId,
    location: env.vertexLocation
  });

  return async (batch) => {
    const headers = Array.from(
      new Set(batch.flatMap((row) => Object.keys(row.data)))
    );

    const response = await client.models.generateContent({
      model: env.vertexModel,
      contents: JSON.stringify({
        task: "Extract GrowEasy CRM lead records from CSV rows.",
        headers,
        rows: batch.map((row) => ({
          rowNumber: row.rowNumber,
          data: row.data
        }))
      }),
      config: {
        systemInstruction: AI_SYSTEM_PROMPT,
        temperature: 0,
        responseMimeType: "application/json",
        responseSchema: vertexBatchResponseSchema
      }
    });

    if (!response.text) {
      throw new Error("Vertex response did not include text output");
    }

    return aiBatchResponseSchema.parse(JSON.parse(response.text));
  };
};

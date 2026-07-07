import { CRM_FIELD_KEYS } from "@groweasy/shared";
import { Type } from "@google/genai";

const stringFieldSchema = { type: Type.STRING };

export const vertexBatchResponseSchema = {
  type: Type.OBJECT,
  properties: {
    records: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          rowNumber: { type: Type.INTEGER },
          ...Object.fromEntries(
            CRM_FIELD_KEYS.map((field) => [field, stringFieldSchema])
          )
        },
        required: ["rowNumber", ...CRM_FIELD_KEYS]
      }
    },
    skipped: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          rowNumber: { type: Type.INTEGER },
          reason: { type: Type.STRING }
        },
        required: ["rowNumber", "reason"]
      }
    }
  },
  required: ["records", "skipped"]
};

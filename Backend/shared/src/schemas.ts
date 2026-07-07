import { z } from "zod";
import { CRM_STATUS_VALUES, DATA_SOURCE_VALUES } from "./constants";

const blankableString = z.string().trim().max(2000).default("");

const parseableDateString = blankableString.refine(
  (value) => value.length === 0 || !Number.isNaN(new Date(value).getTime()),
  "created_at must be blank or convertible by JavaScript Date"
);

export const crmStatusSchema = z.enum(CRM_STATUS_VALUES);

export const dataSourceSchema = z.union([
  z.enum(DATA_SOURCE_VALUES),
  z.literal("")
]);

export const crmLeadRecordBaseSchema = z.object({
  created_at: parseableDateString,
  name: blankableString,
  email: blankableString,
  country_code: blankableString,
  mobile_without_country_code: blankableString,
  company: blankableString,
  city: blankableString,
  state: blankableString,
  country: blankableString,
  lead_owner: blankableString,
  crm_status: crmStatusSchema.default("GOOD_LEAD_FOLLOW_UP"),
  crm_note: blankableString,
  data_source: dataSourceSchema.default(""),
  possession_time: blankableString,
  description: blankableString
});

export const crmLeadRecordSchema = crmLeadRecordBaseSchema.superRefine(
  (record, context) => {
    if (!record.email && !record.mobile_without_country_code) {
      context.addIssue({
        code: "custom",
        message: "A CRM lead requires at least one email or mobile number",
        path: ["email"]
      });
    }
  }
);

export const aiLeadRecordSchema = crmLeadRecordBaseSchema.extend({
  rowNumber: z.number().int().min(1)
});

export const aiSkippedRecordSchema = z.object({
  rowNumber: z.number().int().min(1),
  reason: z.string().trim().min(1).max(500)
});

export const aiErroredRecordSchema = z.object({
  rowNumber: z.number().int().min(1),
  reason: z.string().trim().min(1).max(500)
});

export const aiBatchResponseSchema = z.object({
  records: z.array(aiLeadRecordSchema),
  skipped: z.array(aiSkippedRecordSchema),
  errored: z.array(aiErroredRecordSchema).default([])
});

export const skippedRecordSchema = aiSkippedRecordSchema.extend({
  raw: z.record(z.string(), z.string()).optional()
});

export const erroredRecordSchema = aiErroredRecordSchema.extend({
  raw: z.record(z.string(), z.string()).optional()
});

export const batchDiagnosticSchema = z.object({
  batchId: z.string().trim().min(1).max(100),
  batchIndex: z.number().int().min(0),
  rowStart: z.number().int().min(1),
  rowEnd: z.number().int().min(1),
  status: z.enum(["success", "failed", "fallback"]),
  attempts: z.number().int().min(1),
  message: z.string().trim().max(500).optional()
});

export const importSummarySchema = z.object({
  totalRows: z.number().int().min(0),
  imported: z.number().int().min(0),
  skipped: z.number().int().min(0),
  errored: z.number().int().min(0),
  batches: z.number().int().min(0),
  durationMs: z.number().int().min(0),
  aiProvider: z.enum(["vertex", "local-fallback"])
});

export const importResponseSchema = z.object({
  records: z.array(crmLeadRecordSchema),
  skipped: z.array(skippedRecordSchema),
  errored: z.array(erroredRecordSchema),
  summary: importSummarySchema,
  diagnostics: z.array(batchDiagnosticSchema)
});

export type CrmStatus = z.infer<typeof crmStatusSchema>;
export type DataSource = z.infer<typeof dataSourceSchema>;
export type CrmLeadRecord = z.infer<typeof crmLeadRecordSchema>;
export type AiLeadRecord = z.infer<typeof aiLeadRecordSchema>;
export type AiBatchResponse = z.infer<typeof aiBatchResponseSchema>;
export type SkippedRecord = z.infer<typeof skippedRecordSchema>;
export type ErroredRecord = z.infer<typeof erroredRecordSchema>;
export type BatchDiagnostic = z.infer<typeof batchDiagnosticSchema>;
export type ImportSummary = z.infer<typeof importSummarySchema>;
export type ImportResponse = z.infer<typeof importResponseSchema>;

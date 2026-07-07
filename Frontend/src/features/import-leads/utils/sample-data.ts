const sampleCsvHeaders = [
  "created_at",
  "name",
  "email",
  "country_code",
  "mobile_without_country_code",
  "company",
  "city",
  "state",
  "country",
  "lead_owner",
  "crm_status",
  "crm_note",
  "data_source",
  "possession_time",
  "description"
] as const;

export const templateCsvFilename = "groweasy_sample_template.csv";
export const templateCsv = `${sampleCsvHeaders.join(",")}\n`;

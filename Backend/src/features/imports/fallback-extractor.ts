import type { AiBatchResponse, AiLeadRecord } from "@groweasy/shared";
import {
  compactText,
  extractEmails,
  extractPhoneCandidates,
  normalizeDataSource,
  normalizeDate,
  normalizeStatus
} from "./normalizers";
import type { SourceRow } from "./csv-parser";

const keyFingerprint = (value: string) =>
  value.toLowerCase().replace(/[^a-z0-9]/g, "");

const aliases = {
  created_at: [
    "createdat",
    "createddate",
    "submittedat",
    "leadcreated",
    "date",
    "timestamp",
    "time"
  ],
  name: ["name", "fullname", "leadname", "customername", "clientname", "contactname"],
  email: ["email", "emailaddress", "mail"],
  phone: ["mobile", "phone", "phoneno", "phonenumber", "whatsapp", "contactnumber"],
  country_code: ["countrycode", "dialcode"],
  company: ["company", "companyname", "organization", "business"],
  city: ["city", "locationcity"],
  state: ["state", "province", "region"],
  country: ["country", "nation"],
  lead_owner: ["leadowner", "owner", "assignedto", "agent", "salesperson"],
  crm_status: ["status", "leadstatus", "stage", "disposition"],
  crm_note: ["note", "notes", "remarks", "comment", "comments", "message"],
  data_source: ["source", "datasource", "campaign", "project", "adset", "formname"],
  possession_time: ["possession", "possessiontime", "handover"],
  description: ["description", "requirement", "details", "query"]
} as const;

const valueFor = (row: Record<string, string>, candidates: readonly string[]) => {
  const entries = Object.entries(row);
  const exact = entries.find(([key]) =>
    candidates.includes(keyFingerprint(key) as (typeof candidates)[number])
  );
  if (exact) {
    return exact[1];
  }

  const fuzzy = entries.find(([key]) => {
    const fingerprint = keyFingerprint(key);
    return candidates.some((candidate) => fingerprint.includes(candidate));
  });

  return fuzzy?.[1] ?? "";
};

const inferCountryCode = (explicit: string, phones: string[]) => {
  const digits = explicit.replace(/\D/g, "");
  if (digits) {
    return `+${digits}`;
  }

  const first = phones[0] ?? "";
  if (first.startsWith("+91") || first.replace(/\D/g, "").startsWith("91")) {
    return "+91";
  }

  return "";
};

const toLeadRecord = (row: SourceRow): AiLeadRecord | null => {
  const allText = Object.values(row.data).join(" ");
  const emailField = valueFor(row.data, aliases.email);
  const phoneField = valueFor(row.data, aliases.phone);
  const emails = [...extractEmails(emailField), ...extractEmails(allText)];
  const phones = [
    ...extractPhoneCandidates(phoneField),
    ...extractPhoneCandidates(allText)
  ];

  if (!emails[0] && !phones[0]) {
    return null;
  }

  const countryCode = inferCountryCode(valueFor(row.data, aliases.country_code), phones);

  return {
    rowNumber: row.rowNumber,
    created_at: normalizeDate(valueFor(row.data, aliases.created_at)),
    name: compactText(valueFor(row.data, aliases.name)),
    email: emails[0] ?? "",
    country_code: countryCode,
    mobile_without_country_code: phones[0] ?? "",
    company: compactText(valueFor(row.data, aliases.company)),
    city: compactText(valueFor(row.data, aliases.city)),
    state: compactText(valueFor(row.data, aliases.state)),
    country: compactText(valueFor(row.data, aliases.country)),
    lead_owner: compactText(valueFor(row.data, aliases.lead_owner)),
    crm_status: normalizeStatus(valueFor(row.data, aliases.crm_status)),
    crm_note: compactText(valueFor(row.data, aliases.crm_note)),
    data_source: normalizeDataSource(valueFor(row.data, aliases.data_source)),
    possession_time: compactText(valueFor(row.data, aliases.possession_time)),
    description: compactText(valueFor(row.data, aliases.description))
  };
};

export const extractWithFallback = (rows: SourceRow[]): AiBatchResponse => {
  const records: AiLeadRecord[] = [];
  const skipped: AiBatchResponse["skipped"] = [];

  for (const row of rows) {
    const record = toLeadRecord(row);
    if (!record) {
      skipped.push({
        rowNumber: row.rowNumber,
        reason: "Skipped because neither email nor mobile number was found"
      });
      continue;
    }

    records.push(record);
  }

  return {
    records,
    skipped,
    errored: []
  };
};

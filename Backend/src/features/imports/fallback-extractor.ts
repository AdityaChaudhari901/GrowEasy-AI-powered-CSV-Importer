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
    "createdtime",
    "createddate",
    "datecreated",
    "submittedat",
    "submissiontime",
    "leadformsubmissiontime",
    "leadcreated",
    "enquirydate",
    "inquirydate",
    "date",
    "timestamp",
    "time"
  ],
  name: [
    "name",
    "fullname",
    "leadname",
    "customername",
    "clientname",
    "contactname",
    "contactperson",
    "buyername",
    "prospectname"
  ],
  first_name: ["firstname", "first", "givenname"],
  last_name: ["lastname", "last", "surname", "familyname"],
  email: [
    "email",
    "emailaddress",
    "emailid",
    "mail",
    "leademail",
    "customeremail",
    "clientemail",
    "contactemail"
  ],
  phone: [
    "mobile",
    "mobileno",
    "mobilenumber",
    "mobilephone",
    "phone",
    "phoneno",
    "phonenumber",
    "telephone",
    "whatsapp",
    "whatsappnumber",
    "contactnumber",
    "contactno",
    "contactphone",
    "customerphone",
    "clientphone",
    "leadphone",
    "primaryphone"
  ],
  country_code: ["countrycode", "dialcode", "isdcode", "phonecountrycode"],
  company: [
    "company",
    "companyname",
    "organization",
    "organizationname",
    "business",
    "businessname",
    "accountname",
    "clientcompany",
    "employer"
  ],
  city: [
    "city",
    "cityname",
    "locationcity",
    "preferredcity",
    "preferredlocation",
    "projectcity"
  ],
  state: ["state", "statename", "province", "region"],
  country: ["country", "nation"],
  lead_owner: [
    "leadowner",
    "owner",
    "assignedto",
    "assignedagent",
    "agent",
    "salesperson",
    "salesrep",
    "salesrepresentative",
    "relationshipmanager",
    "rm"
  ],
  crm_status: [
    "status",
    "leadstatus",
    "stage",
    "leadstage",
    "dealstage",
    "salesstage",
    "disposition",
    "leadquality",
    "quality",
    "outcome"
  ],
  crm_note: [
    "note",
    "notes",
    "remarks",
    "comment",
    "comments",
    "message",
    "leadmessage",
    "customerquery",
    "clientrequirement",
    "followupnotes",
    "nextfollowup",
    "enquirynote",
    "enquirymessage"
  ],
  data_source: [
    "source",
    "leadsource",
    "datasource",
    "campaign",
    "campaignname",
    "campaignsource",
    "adcampaign",
    "adname",
    "adset",
    "adsetname",
    "formname",
    "leadform",
    "platform",
    "channel",
    "utm",
    "utmsource",
    "utmmedium",
    "project",
    "projectname"
  ],
  possession_time: [
    "possession",
    "possessiontime",
    "possessiondate",
    "handover",
    "handoverdate",
    "moveintimeline"
  ],
  description: [
    "description",
    "requirement",
    "requirements",
    "details",
    "query",
    "propertytype",
    "budget",
    "interest",
    "interestedin",
    "product",
    "service",
    "dealvalue"
  ]
} as const;

const valueFor = (row: Record<string, string>, candidates: readonly string[]) => {
  const entries = Object.entries(row);
  const exact = entries.find(([key]) =>
    candidates.includes(keyFingerprint(key))
  );
  if (exact) {
    return exact[1];
  }

  const fuzzy = entries.find(([key]) => {
    const fingerprint = keyFingerprint(key);
    return candidates.some(
      (candidate) => candidate.length > 4 && fingerprint.includes(candidate)
    );
  });

  return fuzzy?.[1] ?? "";
};

const valuesFor = (row: Record<string, string>, candidates: readonly string[]) =>
  Object.entries(row)
    .filter(([key]) => {
      const fingerprint = keyFingerprint(key);
      return candidates.some(
        (candidate) => candidate.length > 4 && fingerprint.includes(candidate)
      );
    })
    .map(([, value]) => compactText(value))
    .filter(Boolean);

const unique = (values: string[]) => Array.from(new Set(values.filter(Boolean)));

const joinedText = (values: string[]) =>
  unique(values.map(compactText)).join(" | ");

const nameFor = (row: Record<string, string>) => {
  const fullName = valueFor(row, aliases.name);
  if (fullName) {
    return compactText(fullName);
  }

  return joinedText([
    valueFor(row, aliases.first_name),
    valueFor(row, aliases.last_name)
  ]).replace(" | ", " ");
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
  const sourceText = valueFor(row.data, aliases.data_source);
  const description = valueFor(row.data, aliases.description);
  const sourceContext =
    sourceText && !normalizeDataSource(sourceText) ? `Source: ${sourceText}` : "";
  const crmNote = joinedText([
    valueFor(row.data, aliases.crm_note),
    sourceContext
  ]);
  const emailFieldCandidates = extractEmails(emailField);
  const phoneFieldCandidates = extractPhoneCandidates(phoneField);
  const emails = emailFieldCandidates.length
    ? emailFieldCandidates
    : extractEmails(allText);
  const phones = phoneFieldCandidates.length
    ? phoneFieldCandidates
    : extractPhoneCandidates(allText);

  if (!emails[0] && !phones[0]) {
    return null;
  }

  const countryCode = inferCountryCode(
    valueFor(row.data, aliases.country_code),
    phones
  );

  return {
    rowNumber: row.rowNumber,
    created_at: normalizeDate(valueFor(row.data, aliases.created_at)),
    name: nameFor(row.data),
    email: emails[0] ?? "",
    country_code: countryCode,
    mobile_without_country_code: phones[0] ?? "",
    company: compactText(valueFor(row.data, aliases.company)),
    city: compactText(valueFor(row.data, aliases.city)),
    state: compactText(valueFor(row.data, aliases.state)),
    country: compactText(valueFor(row.data, aliases.country)),
    lead_owner: compactText(valueFor(row.data, aliases.lead_owner)),
    crm_status: normalizeStatus(valueFor(row.data, aliases.crm_status)),
    crm_note: crmNote,
    data_source: normalizeDataSource(sourceText),
    possession_time: compactText(valueFor(row.data, aliases.possession_time)),
    description: compactText(
      description || valuesFor(row.data, aliases.description)[0]
    )
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

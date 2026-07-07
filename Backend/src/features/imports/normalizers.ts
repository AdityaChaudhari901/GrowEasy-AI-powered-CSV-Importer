import {
  CRM_STATUS_VALUES,
  DATA_SOURCE_VALUES,
  type AiLeadRecord,
  type CrmLeadRecord,
  type CrmStatus,
  type DataSource
} from "@groweasy/shared";

const emailPattern = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi;
const phonePattern = /(?:\+?\d[\d\s().-]{7,}\d)/g;

export const compactText = (value: unknown) =>
  String(value ?? "")
    .split("\0")
    .join("")
    .replace(/\r?\n/g, "\\n")
    .replace(/\s+/g, " ")
    .trim();

export const extractEmails = (value: string) =>
  Array.from(value.matchAll(emailPattern), (match) => match[0].toLowerCase());

export const extractPhoneCandidates = (value: string) =>
  Array.from(value.matchAll(phonePattern), (match) => match[0])
    .filter((phone) => {
      const trimmed = phone.trim();
      return (
        !/^\d{1,2}[-/]\d{1,2}[-/]\d{2,4}/.test(trimmed) &&
        !/^\d{4}[-/]\d{1,2}[-/]\d{1,2}/.test(trimmed)
      );
    })
    .map((phone) => phone.replace(/[^\d+]/g, ""))
    .filter((phone) => phone.replace(/\D/g, "").length >= 8);

export const normalizeCountryCode = (value: string) => {
  const digits = value.replace(/\D/g, "");
  if (!digits) {
    return "";
  }

  return `+${digits.slice(0, 4)}`;
};

export const normalizeMobile = (value: string, countryCode: string) => {
  const digits = value.replace(/\D/g, "");
  if (!digits) {
    return "";
  }

  const countryDigits = countryCode.replace(/\D/g, "");
  if (
    countryDigits &&
    digits.startsWith(countryDigits) &&
    digits.length > countryDigits.length + 6
  ) {
    return digits.slice(countryDigits.length);
  }

  if (digits.length > 10 && digits.startsWith("91")) {
    return digits.slice(2);
  }

  return digits;
};

export const normalizeDate = (value: string) => {
  const cleaned = compactText(value);
  if (!cleaned) {
    return "";
  }

  const direct = new Date(cleaned);
  if (!Number.isNaN(direct.getTime())) {
    return direct.toISOString();
  }

  const dateMatch = cleaned.match(
    /^(\d{1,2})[-/](\d{1,2})[-/](\d{2,4})(?:\s+(\d{1,2}):(\d{2}))?/
  );

  if (!dateMatch) {
    return "";
  }

  const day = dateMatch[1];
  const month = dateMatch[2];
  const yearValue = dateMatch[3];
  const hour = dateMatch[4] ?? "0";
  const minute = dateMatch[5] ?? "0";

  if (!day || !month || !yearValue) {
    return "";
  }

  const year =
    yearValue.length === 2 ? `20${yearValue.padStart(2, "0")}` : yearValue;
  const isoCandidate = `${year}-${month.padStart(2, "0")}-${day.padStart(
    2,
    "0"
  )}T${hour.padStart(2, "0")}:${minute.padStart(2, "0")}:00.000Z`;
  const parsed = new Date(isoCandidate);

  return Number.isNaN(parsed.getTime()) ? "" : parsed.toISOString();
};

export const normalizeStatus = (value: string): CrmStatus => {
  const cleaned = compactText(value).toLowerCase();

  if (/sale|sold|closed|won|converted|deal done/.test(cleaned)) {
    return "SALE_DONE";
  }

  if (/bad|junk|invalid|not interested|spam|duplicate/.test(cleaned)) {
    return "BAD_LEAD";
  }

  if (/not dialed|did not|no answer|busy|unreachable|disconnect/.test(cleaned)) {
    return "DID_NOT_CONNECT";
  }

  if (CRM_STATUS_VALUES.includes(value as CrmStatus)) {
    return value as CrmStatus;
  }

  return "GOOD_LEAD_FOLLOW_UP";
};

export const normalizeDataSource = (value: string): DataSource => {
  const cleaned = compactText(value).toLowerCase().replace(/[\s-]+/g, "_");

  for (const source of DATA_SOURCE_VALUES) {
    if (cleaned.includes(source)) {
      return source;
    }
  }

  if (cleaned.includes("lead") && cleaned.includes("demand")) {
    return "leads_on_demand";
  }

  if (cleaned.includes("meridian")) {
    return "meridian_tower";
  }

  if (cleaned.includes("eden")) {
    return "eden_park";
  }

  if (cleaned.includes("varah") || cleaned.includes("swamy")) {
    return "varah_swamy";
  }

  if (cleaned.includes("sarjapur")) {
    return "sarjapur_plots";
  }

  return "";
};

const unique = (values: string[]) => Array.from(new Set(values.filter(Boolean)));

const appendNote = (baseNote: string, additions: string[]) => {
  const chunks = [compactText(baseNote), ...additions.map(compactText)].filter(Boolean);
  return unique(chunks).join(" | ");
};

export const normalizeLeadRecord = (
  input: AiLeadRecord | CrmLeadRecord
):
  | { ok: true; record: CrmLeadRecord }
  | { ok: false; reason: string } => {
  const emails = unique(
    [input.email, input.crm_note, input.description]
      .map(compactText)
      .flatMap(extractEmails)
  );
  const phoneCandidates = unique(
    [input.mobile_without_country_code, input.crm_note, input.description]
      .map(compactText)
      .flatMap(extractPhoneCandidates)
  );

  const countryCode =
    normalizeCountryCode(input.country_code) ||
    (phoneCandidates[0]?.startsWith("+91") ? "+91" : "");
  const mobile = normalizeMobile(phoneCandidates[0] ?? "", countryCode);
  const email = emails[0] ?? "";

  if (!email && !mobile) {
    return {
      ok: false,
      reason: "Skipped because neither email nor mobile number was found"
    };
  }

  const extraEmails = emails
    .slice(1)
    .filter((item) => item !== email)
    .map((item) => `Extra email: ${item}`);
  const extraPhones = unique(
    phoneCandidates
      .map((item) => normalizeMobile(item, countryCode))
      .filter((item) => item && item !== mobile)
  ).map((item) => `Extra mobile: ${item}`);

  return {
    ok: true,
    record: {
      created_at: normalizeDate(input.created_at),
      name: compactText(input.name),
      email,
      country_code: countryCode,
      mobile_without_country_code: mobile,
      company: compactText(input.company),
      city: compactText(input.city),
      state: compactText(input.state),
      country: compactText(input.country),
      lead_owner: compactText(input.lead_owner),
      crm_status: normalizeStatus(input.crm_status),
      crm_note: appendNote(input.crm_note, [...extraEmails, ...extraPhones]),
      data_source: normalizeDataSource(input.data_source),
      possession_time: compactText(input.possession_time),
      description: compactText(input.description)
    }
  };
};

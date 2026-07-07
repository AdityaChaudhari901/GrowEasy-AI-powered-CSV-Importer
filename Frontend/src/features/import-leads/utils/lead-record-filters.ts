import { CRM_STATUS_VALUES, type CrmLeadRecord } from "@groweasy/shared";

export type LeadRecordFilters = {
  date: string;
  city: string;
  state: string;
  country: string;
  crmStatus: string;
};

export type LeadRecordFilterKey = keyof LeadRecordFilters;

export type LeadRecordFilterOptions = {
  city: string[];
  state: string[];
  country: string[];
  crmStatus: string[];
};

export const DEFAULT_LEAD_RECORD_FILTERS: LeadRecordFilters = {
  date: "",
  city: "",
  state: "",
  country: "",
  crmStatus: ""
};

export function filterLeadRecords(
  records: CrmLeadRecord[],
  searchQuery: string,
  filters: LeadRecordFilters
) {
  const normalizedQuery = normalizeFilterValue(searchQuery);
  const normalizedDate = normalizeFilterValue(filters.date);

  return records.filter((record) => {
    if (normalizedQuery && !recordMatchesSearch(record, normalizedQuery)) {
      return false;
    }

    if (
      normalizedDate &&
      !normalizeFilterValue(record.created_at).startsWith(normalizedDate)
    ) {
      return false;
    }

    if (filters.city && record.city !== filters.city) {
      return false;
    }

    if (filters.state && record.state !== filters.state) {
      return false;
    }

    if (filters.country && record.country !== filters.country) {
      return false;
    }

    return !(filters.crmStatus && record.crm_status !== filters.crmStatus);
  });
}

export function getLeadRecordFilterOptions(
  records: CrmLeadRecord[]
): LeadRecordFilterOptions {
  return {
    city: getSortedUniqueValues(records, "city"),
    state: getSortedUniqueValues(records, "state"),
    country: getSortedUniqueValues(records, "country"),
    crmStatus: [...CRM_STATUS_VALUES]
  };
}

export function countActiveLeadFilters(
  searchQuery: string,
  filters: LeadRecordFilters
) {
  return [
    searchQuery,
    filters.date,
    filters.city,
    filters.state,
    filters.country,
    filters.crmStatus
  ].filter((value) => value.trim().length > 0).length;
}

function recordMatchesSearch(record: CrmLeadRecord, normalizedQuery: string) {
  return Object.values(record)
    .map((value) => normalizeFilterValue(value))
    .some((value) => value.includes(normalizedQuery));
}

function getSortedUniqueValues(
  records: CrmLeadRecord[],
  key: keyof Pick<CrmLeadRecord, "city" | "state" | "country">
) {
  return Array.from(
    new Set(records.map((record) => record[key].trim()).filter(Boolean))
  ).sort((left, right) => left.localeCompare(right));
}

function normalizeFilterValue(value: string) {
  return value.trim().toLowerCase();
}

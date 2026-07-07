import { describe, expect, it } from "vitest";
import type { CrmLeadRecord } from "@groweasy/shared";
import {
  DEFAULT_LEAD_RECORD_FILTERS,
  countActiveLeadFilters,
  filterLeadRecords,
  getLeadRecordFilterOptions
} from "./lead-record-filters";

const records: CrmLeadRecord[] = [
  {
    created_at: "2026-05-13T08:50:48.000Z",
    name: "John Doe",
    email: "john.doe@example.com",
    country_code: "+91",
    mobile_without_country_code: "9876543210",
    company: "GrowEasy",
    city: "Mumbai",
    state: "Maharashtra",
    country: "India",
    lead_owner: "test@groweasy.ai",
    crm_status: "GOOD_LEAD_FOLLOW_UP",
    crm_note: "Client is asking to reschedule demo",
    data_source: "leads_on_demand",
    possession_time: "Q4 2026",
    description: "Interested in a corner unit"
  },
  {
    created_at: "2026-05-14T09:10:00.000Z",
    name: "Sarah Johnson",
    email: "sarah.johnson@example.com",
    country_code: "+91",
    mobile_without_country_code: "9876543211",
    company: "Tech Solutions",
    city: "Bangalore",
    state: "Karnataka",
    country: "India",
    lead_owner: "test@groweasy.ai",
    crm_status: "SALE_DONE",
    crm_note: "Ready for CRM review",
    data_source: "eden_park",
    possession_time: "Q1 2027",
    description: "Asked for pricing"
  }
];

describe("lead record filters", () => {
  it("filters by search query across CRM record values", () => {
    expect(
      filterLeadRecords(records, "tech solutions", DEFAULT_LEAD_RECORD_FILTERS)
    ).toEqual([records[1]]);
  });

  it("filters by date, location, and CRM status", () => {
    expect(
      filterLeadRecords(records, "", {
        ...DEFAULT_LEAD_RECORD_FILTERS,
        date: "2026-05-13",
        city: "Mumbai",
        state: "Maharashtra",
        country: "India",
        crmStatus: "GOOD_LEAD_FOLLOW_UP"
      })
    ).toEqual([records[0]]);
  });

  it("builds filter options and active filter counts", () => {
    expect(getLeadRecordFilterOptions(records)).toMatchObject({
      city: ["Bangalore", "Mumbai"],
      state: ["Karnataka", "Maharashtra"],
      country: ["India"]
    });
    expect(
      countActiveLeadFilters("john", {
        ...DEFAULT_LEAD_RECORD_FILTERS,
        city: "Mumbai",
        crmStatus: "GOOD_LEAD_FOLLOW_UP"
      })
    ).toBe(3);
  });
});

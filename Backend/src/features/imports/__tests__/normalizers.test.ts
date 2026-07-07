import { describe, expect, it } from "vitest";
import {
  extractEmails,
  extractPhoneCandidates,
  normalizeDataSource,
  normalizeDate,
  normalizeLeadRecord,
  normalizeStatus
} from "../normalizers";

describe("normalizers", () => {
  it("extracts emails from noisy text", () => {
    expect(extractEmails("Primary A@TEST.com and second@example.in")).toEqual([
      "a@test.com",
      "second@example.in"
    ]);
  });

  it("does not treat date strings as phone candidates", () => {
    expect(extractPhoneCandidates("2026-06-29T10:00:00.000Z")).toEqual([]);
    expect(extractPhoneCandidates("29-06-2026 10:00")).toEqual([]);
  });

  it("normalizes date formats into JavaScript parseable ISO strings", () => {
    expect(new Date(normalizeDate("29-06-2026 10:00")).getFullYear()).toBe(2026);
  });

  it("maps loose CRM status and data source labels", () => {
    expect(normalizeStatus("Deal closed")).toBe("SALE_DONE");
    expect(normalizeStatus("No answer")).toBe("DID_NOT_CONNECT");
    expect(normalizeDataSource("Sarjapur plots campaign")).toBe("sarjapur_plots");
  });

  it("keeps first contact values and appends extras to notes", () => {
    const normalized = normalizeLeadRecord({
      rowNumber: 2,
      created_at: "2026-05-13 14:20:48",
      name: "John Doe",
      email: "john@example.com alt@example.com",
      country_code: "+91",
      mobile_without_country_code: "+91 9876543210 / +91 9876543211",
      company: "GrowEasy",
      city: "Mumbai",
      state: "Maharashtra",
      country: "India",
      lead_owner: "owner@groweasy.ai",
      crm_status: "GOOD_LEAD_FOLLOW_UP",
      crm_note: "Asked to reschedule",
      data_source: "",
      possession_time: "",
      description: ""
    });

    expect(normalized.ok).toBe(true);
    if (normalized.ok) {
      expect(normalized.record.email).toBe("john@example.com");
      expect(normalized.record.mobile_without_country_code).toBe("9876543210");
      expect(normalized.record.crm_note).toContain("alt@example.com");
      expect(normalized.record.crm_note).toContain("9876543211");
    }
  });

  it("does not duplicate the canonical phone in crm_note", () => {
    const normalized = normalizeLeadRecord({
      rowNumber: 2,
      created_at: "",
      name: "Rahil",
      email: "rahil@test.com",
      country_code: "+91",
      mobile_without_country_code: "9579290000",
      company: "",
      city: "",
      state: "",
      country: "",
      lead_owner: "",
      crm_status: "SALE_DONE",
      crm_note: "",
      data_source: "sarjapur_plots",
      possession_time: "",
      description: ""
    });

    expect(normalized.ok).toBe(true);
    if (normalized.ok) {
      expect(normalized.record.mobile_without_country_code).toBe("9579290000");
      expect(normalized.record.crm_note).not.toContain("9579290000");
    }
  });

  it("does not append the lead owner email to crm_note", () => {
    const normalized = normalizeLeadRecord({
      rowNumber: 2,
      created_at: "2026-05-13 14:20:48",
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
      possession_time: "",
      description: ""
    });

    expect(normalized.ok).toBe(true);
    if (normalized.ok) {
      expect(normalized.record.lead_owner).toBe("test@groweasy.ai");
      expect(normalized.record.crm_note).toBe(
        "Client is asking to reschedule demo"
      );
      expect(normalized.record.crm_note).not.toContain("test@groweasy.ai");
    }
  });
});

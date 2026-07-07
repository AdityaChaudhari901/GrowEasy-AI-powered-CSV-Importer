import { describe, expect, it } from "vitest";
import {
  companySampleCsv,
  companySampleCsvFilename,
  demoCsv,
  demoCsvFilename,
  demoCsvRowCount
} from "./sample-data";

describe("sample-data", () => {
  it("ships the company sample leads CSV with data rows", () => {
    const lines = companySampleCsv.trimEnd().split("\n");

    expect(companySampleCsvFilename).toBe("groweasy_sample_leads.csv");
    expect(lines).toHaveLength(3);
    expect(lines[0]).toBe(
      "created_at,name,email,country_code,mobile_without_country_code,company,city,state,country,lead_owner,crm_status,crm_note,data_source,possession_time,description"
    );
    expect(lines[1]).toContain("John Doe");
    expect(lines[2]).toContain("Sarah Johnson");
  });

  it("ships a deterministic 100-row demo CSV", () => {
    const lines = demoCsv.trimEnd().split("\n");

    expect(demoCsvFilename).toBe("groweasy_demo_100_rows.csv");
    expect(demoCsvRowCount).toBe(100);
    expect(lines).toHaveLength(101);
    expect(lines[0]).toBe(companySampleCsv.trimEnd().split("\n")[0]);
    expect(lines[1]).toContain("Aarav Mehta");
    expect(lines[100]).toContain("Ananya Sen");
  });
});

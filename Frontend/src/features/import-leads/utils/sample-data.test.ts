import { describe, expect, it } from "vitest";
import {
  demoCsv,
  demoCsvFilename,
  demoCsvRowCount,
  templateCsv,
  templateCsvFilename
} from "./sample-data";

describe("sample-data", () => {
  it("ships a header-only CSV template", () => {
    const lines = templateCsv.trimEnd().split("\n");

    expect(templateCsvFilename).toBe("groweasy_sample_template.csv");
    expect(lines).toEqual([
      "created_at,name,email,country_code,mobile_without_country_code,company,city,state,country,lead_owner,crm_status,crm_note,data_source,possession_time,description"
    ]);
  });

  it("ships a deterministic 100-row demo CSV", () => {
    const lines = demoCsv.trimEnd().split("\n");

    expect(demoCsvFilename).toBe("groweasy_demo_100_rows.csv");
    expect(demoCsvRowCount).toBe(100);
    expect(lines).toHaveLength(101);
    expect(lines[0]).toBe(templateCsv.trimEnd());
    expect(lines[1]).toContain("Aarav Mehta");
    expect(lines[100]).toContain("Ananya Sen");
  });
});

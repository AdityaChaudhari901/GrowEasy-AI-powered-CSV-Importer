import { describe, expect, it } from "vitest";
import {
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
});

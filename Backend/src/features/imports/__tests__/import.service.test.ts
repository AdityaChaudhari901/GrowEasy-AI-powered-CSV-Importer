import { describe, expect, it } from "vitest";
import { extractImportFromBuffer } from "../import.service";

describe("extractImportFromBuffer", () => {
  it("parses messy CSV data and skips rows without contact details", async () => {
    const csv = [
      "Created Date,Full Name,Email Address,Phone Number,Campaign,Remarks",
      "29-06-2026 10:00,Rahil Mohammad,rahil@test.com,+91 9579290000,Sarjapur Plots,Interested in visit",
      "29-06-2026 11:00,No Contact,,,,Missing contact"
    ].join("\n");

    const result = await extractImportFromBuffer({
      buffer: Buffer.from(csv),
      originalName: "messy.csv"
    });

    expect(result.summary.totalRows).toBe(2);
    expect(result.summary.imported).toBe(1);
    expect(result.summary.skipped).toBe(1);
    expect(result.summary.errored).toBe(0);
    expect(result.errored).toEqual([]);
    expect(result.records[0]?.data_source).toBe("sarjapur_plots");
    expect(result.records[0]?.company).toBe("");
    expect(result.skipped[0]?.rowNumber).toBe(3);
  });
});

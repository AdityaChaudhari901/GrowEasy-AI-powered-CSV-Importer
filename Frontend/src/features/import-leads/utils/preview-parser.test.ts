import { describe, expect, it } from "vitest";
import {
  detectCsvDelimiter,
  parseCsvPreview
} from "./preview-parser";

describe("parseCsvPreview", () => {
  it("detects semicolon-delimited files before any API call", async () => {
    const file = new File(
      ["Name;Email;Phone\nRahil;rahil@test.com;+91 9579290000"],
      "leads.csv",
      { type: "text/csv" }
    );

    const preview = await parseCsvPreview(file);

    expect(preview.delimiter).toBe(";");
    expect(preview.rowCount).toBe(1);
    expect(preview.columnCount).toBe(3);
    expect(preview.rows[0]).toEqual({
      Name: "Rahil",
      Email: "rahil@test.com",
      Phone: "+91 9579290000"
    });
  });

  it("blocks duplicate headers", async () => {
    const file = new File(
      ["Name,Email,email\nRahil,one@test.com,two@test.com"],
      "duplicate.csv",
      { type: "text/csv" }
    );

    await expect(parseCsvPreview(file)).rejects.toThrow(/duplicate header/i);
  });
});

describe("detectCsvDelimiter", () => {
  it("ignores delimiters inside quoted header cells", () => {
    expect(detectCsvDelimiter('"Name, full";Email;Phone\nRahil;a@test.com;1')).toBe(
      ";"
    );
  });
});

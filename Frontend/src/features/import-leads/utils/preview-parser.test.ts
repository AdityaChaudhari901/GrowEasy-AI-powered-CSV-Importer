import { describe, expect, it, vi } from "vitest";
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

  it("reports incremental parsing progress", async () => {
    const onProgress = vi.fn();
    const rows = Array.from(
      { length: 205 },
      (_, index) => `Lead ${index + 1},lead.${index + 1}@example.com`
    );
    const file = new File([["Name,Email", ...rows].join("\n")], "leads.csv", {
      type: "text/csv"
    });

    const preview = await parseCsvPreview(file, { onProgress });

    expect(preview.rowCount).toBe(205);
    expect(onProgress).toHaveBeenCalledWith({ rowsParsed: 100 });
    expect(onProgress).toHaveBeenCalledWith({ rowsParsed: 200 });
    expect(onProgress).toHaveBeenLastCalledWith({ rowsParsed: 205 });
  });
});

describe("detectCsvDelimiter", () => {
  it("ignores delimiters inside quoted header cells", () => {
    expect(detectCsvDelimiter('"Name, full";Email;Phone\nRahil;a@test.com;1')).toBe(
      ";"
    );
  });
});

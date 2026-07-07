import { describe, expect, it } from "vitest";
import {
  detectCsvDelimiter,
  parseCsvBuffer
} from "../csv-parser";

describe("csv-parser", () => {
  it("detects semicolon-delimited CSV exports", () => {
    expect(detectCsvDelimiter("Name;Email;Phone\nRahil;rahil@test.com;123")).toBe(
      ";"
    );
  });

  it("parses UTF-8 BOM headers and semicolon-delimited rows", () => {
    const csv = "\uFEFFName;Email;Phone\nRahil;rahil@test.com;+91 9579290000";

    const rows = parseCsvBuffer(Buffer.from(csv, "utf8"));

    expect(rows).toHaveLength(1);
    expect(rows[0]?.data).toEqual({
      Name: "Rahil",
      Email: "rahil@test.com",
      Phone: "+91 9579290000"
    });
  });

  it("blocks duplicate headers before extraction", () => {
    const csv = "Name,Email,email\nRahil,one@test.com,two@test.com";

    expect(() => parseCsvBuffer(Buffer.from(csv, "utf8"))).toThrow(
      /duplicate header/i
    );
  });

  it("blocks empty header cells before extraction", () => {
    const csv = "Name,,Phone\nRahil,,+91 9579290000";

    expect(() => parseCsvBuffer(Buffer.from(csv, "utf8"))).toThrow(
      /empty column name/i
    );
  });
});

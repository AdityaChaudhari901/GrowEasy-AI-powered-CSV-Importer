import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { CRM_FIELD_KEYS } from "@groweasy/shared";
import type { CsvPreview } from "../types";
import { CSV_PREVIEW_COPY } from "../utils/csv-preview-table-config";
import { CsvPreviewTable } from "./csv-preview-table";

const extraPreviewColumns = [
  "custom_budget",
  "utm_campaign"
];

const previewColumns = [
  ...CRM_FIELD_KEYS,
  ...extraPreviewColumns
];
const secondPageRowCount = 10;
const totalPreviewRows = 50 + secondPageRowCount;
const secondPageFirstRow = 51;

const makePreview = (rowCount: number): CsvPreview => {
  const rows = Array.from({ length: rowCount }, (_, index) => {
    const rowNumber = index + 1;

    return {
      created_at: `2026-07-${String(rowNumber).padStart(2, "0")} 10:00:00`,
      name: `Lead ${rowNumber}`,
      email: `lead.${rowNumber}@example.com`,
      country_code: "'+91",
      mobile_without_country_code: `9811100${String(rowNumber).padStart(3, "0")}`,
      company: "GrowEasy",
      city: "Mumbai",
      state: "Maharashtra",
      country: "India",
      lead_owner: "owner@groweasy.ai",
      crm_status: "GOOD_LEAD_FOLLOW_UP",
      crm_note: `Note ${rowNumber}`,
      data_source: "leads_on_demand",
      possession_time: "-",
      description: `Description ${rowNumber}`,
      custom_budget: `Budget ${rowNumber}`,
      utm_campaign: `Campaign ${rowNumber}`
    };
  });

  return {
    columns: previewColumns,
    rows,
    rowCount,
    columnCount: previewColumns.length,
    delimiter: ",",
    errors: []
  };
};

describe("CsvPreviewTable", () => {
  it("renders every parsed CSV column and row in one scrollable table", () => {
    render(<CsvPreviewTable preview={makePreview(totalPreviewRows)} />);

    const table = screen.getByRole("table", {
      name: CSV_PREVIEW_COPY.tableAriaLabel
    });

    for (const column of previewColumns) {
      expect(
        within(table).getByRole("columnheader", { name: column })
      ).toBeInTheDocument();
    }

    expect(screen.getByText(`${CSV_PREVIEW_COPY.allFieldsNotice}.`)).toBeInTheDocument();
    expect(screen.getByTestId("csv-preview-scroll")).toHaveClass("overflow-auto");
    expect(screen.getByTestId("csv-preview-scroll")).toHaveClass(
      "no-visible-scrollbar"
    );
    expect(screen.getByText("60 of 60")).toBeInTheDocument();
    expect(
      screen.getByText(`Rows 1-${totalPreviewRows} of ${totalPreviewRows}`)
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("navigation")
    ).not.toBeInTheDocument();
    expect(screen.getByText("Lead 1")).toBeInTheDocument();
    expect(screen.getByText("Lead 37")).toBeInTheDocument();
    expect(screen.queryByText("Lead 50")).not.toBeInTheDocument();
    expect(screen.queryByText(`Lead ${secondPageFirstRow}`)).not.toBeInTheDocument();
    expect(screen.queryByText(`Lead ${totalPreviewRows}`)).not.toBeInTheDocument();
    expect(screen.getByText("Budget 1")).toBeInTheDocument();
    expect(screen.queryByText(`Campaign ${totalPreviewRows}`)).not.toBeInTheDocument();
    expect(screen.getAllByText("+91").length).toBeLessThan(totalPreviewRows);
  });

  it("shows the actual visible row count for small files", () => {
    render(<CsvPreviewTable preview={makePreview(2)} />);

    expect(screen.getByText("2 of 2")).toBeInTheDocument();
    expect(screen.getByText("Rows 1-2 of 2")).toBeInTheDocument();
  });
});

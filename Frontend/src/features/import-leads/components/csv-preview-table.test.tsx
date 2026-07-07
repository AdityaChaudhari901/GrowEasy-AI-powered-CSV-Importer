import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { CsvPreview } from "../types";
import {
  CSV_PREVIEW_COPY,
  CSV_PREVIEW_REQUIRED_COLUMN_KEYS,
  CSV_PREVIEW_ROWS_PER_PAGE
} from "../utils/csv-preview-table-config";
import { CsvPreviewTable } from "./csv-preview-table";

const extraPreviewColumns = [
  "crm_status",
  "crm_note",
  "data_source",
  "possession_time",
  "description"
];

const previewColumns = [
  ...CSV_PREVIEW_REQUIRED_COLUMN_KEYS,
  ...extraPreviewColumns
];
const secondPageRowCount = 10;
const totalPreviewRows = CSV_PREVIEW_ROWS_PER_PAGE + secondPageRowCount;
const secondPageFirstRow = CSV_PREVIEW_ROWS_PER_PAGE + 1;

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
      description: `Description ${rowNumber}`
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
  it("renders configured scrollable lead rows with required columns and page controls", () => {
    render(<CsvPreviewTable preview={makePreview(totalPreviewRows)} />);

    const table = screen.getByRole("table", {
      name: CSV_PREVIEW_COPY.tableAriaLabel
    });
    const pageNav = screen.getByRole("navigation", {
      name: CSV_PREVIEW_COPY.paginationAriaLabel
    });

    for (const column of CSV_PREVIEW_REQUIRED_COLUMN_KEYS) {
      expect(
        within(table).getByRole("columnheader", { name: column })
      ).toBeInTheDocument();
    }

    expect(
      screen.getByText(
        new RegExp(
          `${extraPreviewColumns.length} ${CSV_PREVIEW_COPY.hiddenHeadersNotice}`
        )
      )
    ).toBeInTheDocument();
    expect(screen.getByTestId("csv-preview-scroll")).toHaveClass("overflow-auto");
    expect(
      screen.getByText(`Rows 1-${CSV_PREVIEW_ROWS_PER_PAGE} of ${totalPreviewRows}`)
    ).toBeInTheDocument();
    expect(screen.getByText("Page 1 of 2")).toBeInTheDocument();
    expect(screen.getByText("Lead 1")).toBeInTheDocument();
    expect(screen.getByText(`Lead ${CSV_PREVIEW_ROWS_PER_PAGE}`)).toBeInTheDocument();
    expect(screen.queryByText(`Lead ${secondPageFirstRow}`)).not.toBeInTheDocument();
    expect(screen.getAllByText("+91")).toHaveLength(CSV_PREVIEW_ROWS_PER_PAGE);

    fireEvent.click(
      within(pageNav).getByRole("button", {
        name: CSV_PREVIEW_COPY.nextPage
      })
    );

    expect(
      screen.getByText(
        `Rows ${secondPageFirstRow}-${totalPreviewRows} of ${totalPreviewRows}`
      )
    ).toBeInTheDocument();
    expect(screen.getByText("Page 2 of 2")).toBeInTheDocument();
    expect(screen.getByText(`Lead ${secondPageFirstRow}`)).toBeInTheDocument();
    expect(screen.queryByText(`Lead ${CSV_PREVIEW_ROWS_PER_PAGE}`)).not.toBeInTheDocument();
  });
});

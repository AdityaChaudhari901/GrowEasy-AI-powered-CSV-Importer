import { fireEvent, render, screen, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { CRM_FIELD_KEYS, type CrmLeadRecord } from "@groweasy/shared";
import { Sidebar } from "@/components/layout/sidebar";
import { Providers } from "@/components/providers";
import { LeadDetailPanel } from "./lead-detail-panel";
import { ImportWorkspace } from "./import-workspace";
import { ParsedRecordsTable } from "./result-tables";

const mockedImportModal = vi.hoisted(() => ({
  payload: {
    result: {
      records: [
        {
          created_at: "2026-05-13T08:50:48.000Z",
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
          possession_time: "Q4 2026",
          description: "Interested in a corner unit"
        },
        {
          created_at: "2026-05-13T08:55:48.000Z",
          name: "Sarah Johnson",
          email: "sarah.johnson@example.com",
          country_code: "+91",
          mobile_without_country_code: "9876543211",
          company: "Tech Solutions",
          city: "Bangalore",
          state: "Karnataka",
          country: "India",
          lead_owner: "test@groweasy.ai",
          crm_status: "SALE_DONE",
          crm_note: "Ready for CRM review",
          data_source: "eden_park",
          possession_time: "Q1 2027",
          description: "Asked for pricing"
        }
      ],
      skipped: [],
      errored: [],
      summary: {
        totalRows: 2,
        imported: 2,
        skipped: 0,
        errored: 0,
        batches: 1,
        durationMs: 1200,
        aiProvider: "local-fallback"
      },
      diagnostics: []
    },
    fileName: "leads.csv",
    importedAt: "2026-05-13T08:50:48.000Z",
    rowCount: 2,
    columnCount: 15
  }
}));

type MockImportModalProps = {
  open: boolean;
  onClose: () => void;
  onSuccess: (payload: typeof mockedImportModal.payload) => void;
};

vi.mock("./import-modal", () => ({
  ImportModal: ({ open, onClose, onSuccess }: MockImportModalProps) =>
    open ? (
      <button
        type="button"
        onClick={() => {
          onSuccess(mockedImportModal.payload);
          onClose();
        }}
      >
        Complete mocked import
      </button>
    ) : null
}));

const leadRecord: CrmLeadRecord = {
  created_at: "2026-05-13T08:50:48.000Z",
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
  possession_time: "Q4 2026",
  description: "Interested in a corner unit"
};

describe("ImportWorkspace", () => {
  beforeEach(() => {
    window.location.hash = "";
  });

  it("renders the lead source workspace and import entry point", () => {
    render(
      <Providers>
        <ImportWorkspace />
      </Providers>
    );

    expect(
      screen.getByRole("heading", { name: "Lead Sources" })
    ).toBeInTheDocument();
    expect(screen.getByText("Import leads via CSV")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Upload CSV" })).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Download demo CSV" })
    ).not.toBeInTheDocument();
    expect(screen.queryByText("Demo CSV with 100 rows")).not.toBeInTheDocument();
    expect(screen.queryByText("demo rows")).not.toBeInTheDocument();
    expect(screen.queryByText("CRM fields")).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Import Leads via CSV" })
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("heading", { name: "Manage Leads" })
    ).not.toBeInTheDocument();
    expect(screen.queryByText("Waiting for CSV")).not.toBeInTheDocument();
    expect(screen.queryByText("Ready to extract")).not.toBeInTheDocument();
    expect(screen.queryByText("Demo data")).not.toBeInTheDocument();
    expect(screen.queryByText("Header intelligence")).not.toBeInTheDocument();
    expect(
      screen.queryByText("Columns become normalized records")
    ).not.toBeInTheDocument();
    expect(screen.queryByText("GrowEasy CRM output")).not.toBeInTheDocument();
    expect(screen.queryByText("source layouts")).not.toBeInTheDocument();
    expect(
      screen.queryByText("Flexible import coverage")
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText("Works with messy lead exports")
    ).not.toBeInTheDocument();
    expect(screen.queryByText("Facebook Lead Export")).not.toBeInTheDocument();
    expect(screen.queryByText("Google Ads Export")).not.toBeInTheDocument();
    expect(screen.queryByText("Excel sheets")).not.toBeInTheDocument();
    expect(
      screen.queryByText("Real estate CRM exports")
    ).not.toBeInTheDocument();
    expect(screen.queryByText("Sales reports")).not.toBeInTheDocument();
    expect(screen.queryByText("Marketing agency CSVs")).not.toBeInTheDocument();
    expect(
      screen.queryByText("Manually created spreadsheets")
    ).not.toBeInTheDocument();
  });

  it("renders Manage Leads as a separate sidebar page", () => {
    window.location.hash = "#manage-leads";

    const { container } = render(
      <Providers>
        <ImportWorkspace />
      </Providers>
    );

    const manageLeadsSection = container.querySelector("#manage-leads");

    expect(manageLeadsSection).not.toBeNull();
    if (!manageLeadsSection) {
      throw new Error("Manage Leads section was not rendered.");
    }

    expect(manageLeadsSection).not.toHaveClass("rounded-[18px]");
    expect(manageLeadsSection).not.toHaveClass("border");
    expect(manageLeadsSection).not.toHaveClass("shadow-[var(--shadow-soft)]");
    expect(
      screen.getByRole("heading", { name: "Manage Leads" })
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("heading", { name: "Lead Sources" })
    ).not.toBeInTheDocument();
    expect(screen.getByText("No leads imported yet")).toBeInTheDocument();
    expect(
      screen.getByText("Upload a CSV in Lead Sources to populate the CRM review table.")
    ).toBeInTheDocument();
  });

  it("renders Manage Leads as a real sidebar destination", () => {
    render(
      <Providers>
        <Sidebar />
      </Providers>
    );

    expect(screen.getByRole("link", { name: "Manage Leads" })).toHaveAttribute(
      "href",
      "#manage-leads"
    );
    expect(
      screen.getByRole("button", { name: "Switch to dark mode" })
    ).toBeInTheDocument();
  });

  it("shows one completion toast and keeps result filters quiet", async () => {
    render(
      <Providers>
        <ImportWorkspace />
      </Providers>
    );

    fireEvent.click(screen.getByRole("button", { name: "Upload CSV" }));
    fireEvent.click(screen.getByRole("button", { name: "Complete mocked import" }));

    expect(await screen.findByText("Extraction complete")).toBeInTheDocument();
    expect(
      screen.getByText("2 imported, 0 skipped, 0 errored from 2 source rows.")
    ).toBeInTheDocument();
    expect(screen.getAllByRole("status")).toHaveLength(1);
    expect(screen.queryByText("Imported rows")).not.toBeInTheDocument();
    expect(screen.queryByText("Nothing skipped")).not.toBeInTheDocument();
    expect(screen.queryByText("Nothing errored")).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("tab", { name: "Imported2" }));
    fireEvent.click(screen.getByRole("tab", { name: "Errored0" }));
    fireEvent.click(screen.getByRole("tab", { name: "Skipped0" }));

    expect(screen.getAllByRole("status")).toHaveLength(1);
    expect(screen.getAllByText("Extraction complete")).toHaveLength(1);
    expect(screen.queryByText("Imported rows")).not.toBeInTheDocument();
    expect(screen.queryByText("Nothing skipped")).not.toBeInTheDocument();
    expect(screen.queryByText("Nothing errored")).not.toBeInTheDocument();
  });

  it("filters imported leads by search, location, date, and CRM status", async () => {
    render(
      <Providers>
        <ImportWorkspace />
      </Providers>
    );

    fireEvent.click(screen.getByRole("button", { name: "Upload CSV" }));
    fireEvent.click(screen.getByRole("button", { name: "Complete mocked import" }));

    expect(await screen.findByLabelText("Search imported leads")).toBeInTheDocument();
    expect(screen.getByText("2 of 2")).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText("Search imported leads"), {
      target: { value: "Sarah" }
    });

    expect(screen.getByText("1 of 2")).toBeInTheDocument();
    expect(screen.queryByText("John Doe")).not.toBeInTheDocument();
    expect(screen.getByText("Sarah Johnson")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Clear" }));
    expect(screen.getByText("2 of 2")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "City filter" }));
    fireEvent.click(screen.getByRole("option", { name: "Mumbai" }));

    expect(screen.getByText("1 of 2")).toBeInTheDocument();
    expect(screen.getByText("John Doe")).toBeInTheDocument();
    expect(screen.queryByText("Sarah Johnson")).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Clear" }));
    fireEvent.change(screen.getByLabelText("Filter by created date"), {
      target: { value: "2026-05-13T08:55" }
    });

    expect(screen.getByText("1 of 2")).toBeInTheDocument();
    expect(screen.queryByText("John Doe")).not.toBeInTheDocument();
    expect(screen.getByText("Sarah Johnson")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Clear" }));
    fireEvent.click(screen.getByRole("button", { name: "CRM Status filter" }));
    fireEvent.click(screen.getByRole("option", { name: "Sale done" }));

    expect(screen.getByText("1 of 2")).toBeInTheDocument();
    expect(screen.queryByText("John Doe")).not.toBeInTheDocument();
    expect(screen.getByText("Sarah Johnson")).toBeInTheDocument();
  });

  it("selects a lead from the lead name button", () => {
    const handleSelectRecord = vi.fn();

    render(
      <ParsedRecordsTable
        records={[leadRecord]}
        selectedRecordKey={undefined}
        onSelectRecord={handleSelectRecord}
      />
    );

    const table = screen.getByRole("table");

    for (const column of CRM_FIELD_KEYS) {
      expect(
        within(table).getByRole("columnheader", { name: column })
      ).toBeInTheDocument();
    }
    expect(
      within(table).queryByRole("columnheader", { name: "Lead Name" })
    ).not.toBeInTheDocument();
    expect(
      within(table).queryByRole("columnheader", { name: "Contact" })
    ).not.toBeInTheDocument();
    expect(
      within(table).queryByRole("columnheader", { name: "Status" })
    ).not.toBeInTheDocument();
    expect(
      within(table).queryByRole("columnheader", { name: "Source" })
    ).not.toBeInTheDocument();
    expect(
      within(table).queryByRole("columnheader", { name: "CRM Note" })
    ).not.toBeInTheDocument();
    expect(screen.getByText("2026-05-13T08:50:48.000Z")).toBeInTheDocument();
    expect(screen.getByText("+91")).toBeInTheDocument();
    expect(screen.getByText("9876543210")).toBeInTheDocument();
    expect(screen.getByText("Mumbai")).toBeInTheDocument();
    expect(screen.getByText("test@groweasy.ai")).toBeInTheDocument();
    expect(screen.getByText("GOOD_LEAD_FOLLOW_UP")).toBeInTheDocument();
    expect(screen.getByText("Client is asking to reschedule demo")).toBeInTheDocument();
    expect(screen.getByText("leads_on_demand")).toBeInTheDocument();
    expect(screen.getByText("Q4 2026")).toBeInTheDocument();
    expect(screen.getByText("Interested in a corner unit")).toBeInTheDocument();

    fireEvent.click(
      screen.getByRole("button", { name: "Open John Doe details" })
    );

    expect(handleSelectRecord).toHaveBeenCalledWith(leadRecord);
  });

  it("switches lead detail tabs", () => {
    render(<LeadDetailPanel lead={leadRecord} onClose={() => undefined} />);

    expect(screen.getByRole("tab", { name: "Overview" })).toHaveAttribute(
      "aria-selected",
      "true"
    );

    fireEvent.click(screen.getByRole("tab", { name: "CRM" }));

    expect(screen.getByRole("tab", { name: "CRM" })).toHaveAttribute(
      "aria-selected",
      "true"
    );
    expect(screen.getByRole("tabpanel")).toHaveTextContent(
      "Client is asking to reschedule demo"
    );
  });
});

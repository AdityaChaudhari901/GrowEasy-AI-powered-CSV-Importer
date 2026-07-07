import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { Sidebar } from "@/components/layout/sidebar";
import { Providers } from "@/components/providers";
import type { CrmLeadRecord } from "@groweasy/shared";
import { LeadDetailPanel } from "./lead-detail-panel";
import { ImportWorkspace } from "./import-workspace";
import { ParsedRecordsTable } from "./result-tables";

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
  possession_time: "",
  description: ""
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
    expect(screen.queryByText("Vertex pipeline")).not.toBeInTheDocument();
    expect(screen.queryByText("Waiting for CSV")).not.toBeInTheDocument();
    expect(screen.queryByText("Ready to extract")).not.toBeInTheDocument();
    expect(screen.queryByText("Vertex ready")).not.toBeInTheDocument();
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

    render(
      <Providers>
        <ImportWorkspace />
      </Providers>
    );

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
    render(<Sidebar />);

    expect(screen.getByRole("link", { name: "Manage Leads" })).toHaveAttribute(
      "href",
      "#manage-leads"
    );
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

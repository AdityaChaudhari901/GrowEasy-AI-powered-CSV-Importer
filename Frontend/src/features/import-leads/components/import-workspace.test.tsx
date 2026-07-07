import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
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
  it("renders the lead source workspace and import entry point", () => {
    render(
      <Providers>
        <ImportWorkspace />
      </Providers>
    );

    expect(screen.getByRole("heading", { name: "Lead Sources" })).toBeInTheDocument();
    expect(screen.getByText("Import leads via CSV")).toBeInTheDocument();
    expect(screen.getAllByRole("button", { name: "Browse files" })).toHaveLength(1);
    expect(
      screen.queryByRole("button", { name: "Import Leads via CSV" })
    ).not.toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Manage Leads" })).toBeInTheDocument();
    expect(
      screen.getByText("Upload a CSV in Lead Sources to populate the CRM review table.")
    ).toBeInTheDocument();
    expect(screen.queryByText("Vertex pipeline")).not.toBeInTheDocument();
    expect(screen.queryByText("Waiting for CSV")).not.toBeInTheDocument();
    expect(screen.queryByText("Ready to extract")).not.toBeInTheDocument();
    expect(screen.queryByText("Vertex ready")).not.toBeInTheDocument();
    expect(screen.queryByText("Demo data")).not.toBeInTheDocument();
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

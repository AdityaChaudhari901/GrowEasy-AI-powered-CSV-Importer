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

  it.each([
    {
      label: "Facebook Lead Export",
      csv: [
        "created_time,full_name,email,phone_number,city,form_name,campaign_name,adset_name",
        "2026-07-01T09:15:00Z,Aarav Mehta,aarav.mehta@example.com,+91 9811100001,Bengaluru,Sarjapur Enquiry,Sarjapur Plots Campaign,Weekend Buyers"
      ].join("\n"),
      expected: {
        name: "Aarav Mehta",
        email: "aarav.mehta@example.com",
        mobile_without_country_code: "9811100001",
        city: "Bengaluru",
        data_source: "sarjapur_plots"
      }
    },
    {
      label: "Google Ads Export",
      csv: [
        "Lead Form Submission Time,Customer Email,Customer Phone,Campaign,Ad Group,Lead Status",
        "2026-07-01 10:00,nisha.rao@example.com,+91 9811100002,Leads on Demand PPC,Search Leads,Qualified"
      ].join("\n"),
      expected: {
        email: "nisha.rao@example.com",
        mobile_without_country_code: "9811100002",
        data_source: "leads_on_demand",
        crm_status: "GOOD_LEAD_FOLLOW_UP"
      }
    },
    {
      label: "Excel sheets",
      csv: [
        "First Name,Last Name,Email ID,Mobile No,Notes",
        "Kabir,Shah,kabir.shah@example.com,9811100003,Asked for price sheet"
      ].join("\n"),
      expected: {
        name: "Kabir Shah",
        email: "kabir.shah@example.com",
        mobile_without_country_code: "9811100003",
        crm_note: "Asked for price sheet"
      }
    },
    {
      label: "Real Estate CRM exports",
      csv: [
        "Enquiry Date,Client Name,Client Phone,Project Name,Preferred Location,Property Type,Assigned Agent,Possession Date",
        "01-07-2026 11:30,Ishita Menon,+91 9811100004,Meridian Tower,Whitefield,3 BHK,Riya Agent,Dec 2026"
      ].join("\n"),
      expected: {
        name: "Ishita Menon",
        mobile_without_country_code: "9811100004",
        city: "Whitefield",
        lead_owner: "Riya Agent",
        data_source: "meridian_tower",
        description: "3 BHK"
      }
    },
    {
      label: "Sales reports",
      csv: [
        "Date Created,Contact Person,Contact No,Company Name,Deal Stage,Sales Rep,Deal Value",
        "2026-07-01,Rohan Iyer,+91 9811100005,Acme Realty,Closed Won,Meera Sales,12500000"
      ].join("\n"),
      expected: {
        name: "Rohan Iyer",
        company: "Acme Realty",
        crm_status: "SALE_DONE",
        lead_owner: "Meera Sales",
        mobile_without_country_code: "9811100005"
      }
    },
    {
      label: "Marketing agency CSVs",
      csv: [
        "Campaign Source,Client Name,Client Email,WhatsApp Number,Lead Quality,UTM Source,Message",
        "Meta Agency Push,Tara Singh,tara.singh@example.com,+91 9811100006,Not Interested,facebook,Looking next quarter"
      ].join("\n"),
      expected: {
        name: "Tara Singh",
        email: "tara.singh@example.com",
        mobile_without_country_code: "9811100006",
        crm_status: "BAD_LEAD",
        crm_note: "Looking next quarter | Source: Meta Agency Push"
      }
    },
    {
      label: "Manually created spreadsheets",
      csv: [
        "Name,Phone,Email,Status,Remarks",
        "Dev Patel,9811100007,dev.patel@example.com,No answer,Call again tomorrow"
      ].join("\n"),
      expected: {
        name: "Dev Patel",
        email: "dev.patel@example.com",
        mobile_without_country_code: "9811100007",
        crm_status: "DID_NOT_CONNECT",
        crm_note: "Call again tomorrow"
      }
    }
  ])("normalizes $label into GrowEasy CRM fields", async ({ csv, expected }) => {
    const result = await extractImportFromBuffer({
      buffer: Buffer.from(csv),
      originalName: "supported-export.csv"
    });

    expect(result.summary.totalRows).toBe(1);
    expect(result.summary.imported).toBe(1);
    expect(result.summary.skipped).toBe(0);
    expect(result.summary.errored).toBe(0);
    expect(result.records[0]).toMatchObject(expected);
  });
});

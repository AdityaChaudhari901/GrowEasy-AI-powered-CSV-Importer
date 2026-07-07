const sampleCsvHeaders = [
  "created_at",
  "name",
  "email",
  "country_code",
  "mobile_without_country_code",
  "company",
  "city",
  "state",
  "country",
  "lead_owner",
  "crm_status",
  "crm_note",
  "data_source",
  "possession_time",
  "description"
] as const;

const demoNames = [
  "Aarav Mehta",
  "Nisha Iyer",
  "Kabir Rao",
  "Ishita Shah",
  "Rohan Nair",
  "Tara Kapoor",
  "Dev Menon",
  "Meera Joshi",
  "Vihaan Reddy",
  "Ananya Sen"
] as const;

const demoCompanies = [
  "GrowEasy",
  "Tech Solutions",
  "Acme Realty",
  "Urban Nest",
  "Prime Estates"
] as const;

const demoCities = [
  ["Mumbai", "Maharashtra"],
  ["Bengaluru", "Karnataka"],
  ["Pune", "Maharashtra"],
  ["Hyderabad", "Telangana"],
  ["Chennai", "Tamil Nadu"]
] as const;

const demoStatuses = [
  "GOOD_LEAD_FOLLOW_UP",
  "DID_NOT_CONNECT",
  "BAD_LEAD",
  "SALE_DONE"
] as const;

const demoOwners = [
  "test@groweasy.ai",
  "sales@groweasy.ai",
  "crm@groweasy.ai",
  "owner@groweasy.ai"
] as const;

const demoNotes = [
  "Client asked for a callback",
  "Interested in weekend site visit",
  "Shared pricing details",
  "Asked to reschedule demo",
  "Requested WhatsApp follow-up"
] as const;

const demoSources = [
  "Facebook Lead Export",
  "Google Ads Export",
  "Excel sheet",
  "Real estate CRM export",
  "Manual spreadsheet"
] as const;

const csvEscape = (value: string) =>
  /[",\n]/.test(value) ? `"${value.replaceAll('"', '""')}"` : value;

const cycleItem = <T>(items: readonly T[], index: number): T => {
  const item = items[index % items.length];
  if (item === undefined) {
    throw new Error("Demo CSV source list cannot be empty.");
  }
  return item;
};

const buildDemoCsv = (rowCount: number) => {
  const rows = Array.from({ length: rowCount }, (_, index) => {
    const rowNumber = index + 1;
    const name = cycleItem(demoNames, index);
    const company = cycleItem(demoCompanies, index);
    const [city, state] = cycleItem(demoCities, index);
    const source = cycleItem(demoSources, index);
    const day = String((index % 28) + 1).padStart(2, "0");
    const hour = String(9 + (index % 9)).padStart(2, "0");
    const emailName = name.toLowerCase().replaceAll(" ", ".");

    return [
      `2026-07-${day} ${hour}:00:00`,
      name,
      `${emailName}.${rowNumber}@example.com`,
      "+91",
      `9811100${String(rowNumber).padStart(3, "0")}`,
      company,
      city,
      state,
      "India",
      cycleItem(demoOwners, index),
      cycleItem(demoStatuses, index),
      cycleItem(demoNotes, index),
      source.toLowerCase().replaceAll(" ", "_"),
      index % 3 === 0 ? "Within 6 months" : "",
      `${source} row ${rowNumber}`
    ].map(csvEscape);
  });

  return `${sampleCsvHeaders.join(",")}\n${rows
    .map((row) => row.join(","))
    .join("\n")}\n`;
};

export const templateCsvFilename = "groweasy_sample_template.csv";
export const templateCsv = `${sampleCsvHeaders.join(",")}\n`;
export const demoCsvRowCount = 100;
export const demoCsvFilename = `groweasy_demo_${demoCsvRowCount}_rows.csv`;
export const demoCsv = buildDemoCsv(demoCsvRowCount);

"use client";

import { type CrmLeadRecord, type ImportSummary } from "@groweasy/shared";
import {
  CheckCircle2,
  Database,
  Download,
  FileSpreadsheet,
  Upload
} from "lucide-react";
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { ImportResult, ImportSuccessPayload } from "../types";
import { ImportModal } from "./import-modal";
import { LeadDetailPanel } from "./lead-detail-panel";
import {
  downloadIssueRowsCsv,
  ErroredRecordsTable,
  getLeadRecordKey,
  ParsedRecordsTable,
  SkippedRecordsTable
} from "./result-tables";

type ResultView = "all" | "imported" | "skipped" | "errored";
type ImportContext = Omit<ImportSuccessPayload, "result">;
type WorkspacePage = "lead-sources" | "manage-leads";

const numberFormatter = new Intl.NumberFormat("en-IN");

export function ImportWorkspace() {
  const [activePage, setActivePage] = useState<WorkspacePage>(() =>
    getPageFromHash()
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [importContext, setImportContext] = useState<ImportContext | null>(null);
  const [selectedRecord, setSelectedRecord] = useState<CrmLeadRecord | null>(
    null
  );
  const [activeResultView, setActiveResultView] = useState<ResultView>("all");
  const records = result?.records ?? [];
  const selectedRecordKey = selectedRecord
    ? getLeadRecordKey(selectedRecord)
    : undefined;
  const shouldShowImported =
    !result || activeResultView === "all" || activeResultView === "imported";
  const shouldShowSkipped =
    Boolean(result) &&
    (activeResultView === "all" || activeResultView === "skipped");
  const shouldShowErrored =
    Boolean(result) &&
    (activeResultView === "all" || activeResultView === "errored");
  const summaryMetrics = getSummaryMetrics(result?.summary);

  useEffect(() => {
    const updatePage = () => setActivePage(getPageFromHash());

    updatePage();
    window.addEventListener("hashchange", updatePage);
    return () => window.removeEventListener("hashchange", updatePage);
  }, []);

  const handleImportSuccess = ({
    result: nextResult,
    ...nextImportContext
  }: ImportSuccessPayload) => {
    setResult(nextResult);
    setImportContext(nextImportContext);
    setSelectedRecord(null);
    setActiveResultView("all");
    setActivePage("manage-leads");

    if (window.location.hash !== "#manage-leads") {
      window.location.hash = "manage-leads";
    }
  };

  return (
    <div className="px-4 py-5 sm:px-6 lg:px-8 lg:py-7">
      <div className="mx-auto w-full max-w-[1080px] space-y-5">
        {activePage === "lead-sources" ? (
          <section
            className="w-full scroll-mt-28 overflow-hidden rounded-[18px] border border-[var(--border)] bg-[var(--background)] shadow-[var(--shadow-soft)]"
            id="lead-sources"
          >
            <div className="px-5 py-6 sm:px-7">
              <div>
                <div className="max-w-[660px]">
                  <p className="font-[var(--font-mono)] text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--teal-strong)]">
                    CSV intake
                  </p>
                  <h1 className="mt-1 text-[1.65rem] font-bold tracking-normal text-[var(--foreground)]">
                    Lead Sources
                  </h1>
                  <p className="mt-2 max-w-xl text-sm font-medium leading-6 text-[var(--muted)]">
                    Upload any lead CSV, preview it locally, then let Vertex map
                    messy source columns into GrowEasy records after approval.
                  </p>
                </div>
              </div>

              <section className="mt-6 rounded-2xl border border-[var(--border)] bg-[var(--panel)] p-5 sm:p-6">
                <div className="flex flex-col items-center text-center">
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[var(--teal-soft)] text-[var(--teal-strong)]">
                    <FileSpreadsheet className="h-6 w-6" aria-hidden="true" />
                  </span>
                  <div className="mt-4 max-w-2xl">
                    <h2 className="text-xl font-bold text-[var(--foreground)]">
                      Import leads via CSV
                    </h2>
                    <p className="mt-1 text-sm font-medium leading-6 text-[var(--muted)]">
                      Preview locally, confirm once, then normalize the file
                      into GrowEasy CRM records.
                    </p>
                  </div>
                  <Button
                    className="mt-5 h-12 w-full max-w-[340px] justify-center"
                    onClick={() => setIsModalOpen(true)}
                  >
                    <Upload className="h-5 w-5" aria-hidden="true" />
                    Upload CSV
                  </Button>
                </div>

                <div className="mt-5 grid gap-3 border-t border-[var(--border-soft)] pt-5 md:grid-cols-3">
                  <ProcessNote
                    label="1. Local preview"
                    copy="The browser reads rows and headers before upload."
                  />
                  <ProcessNote
                    label="2. Explicit confirm"
                    copy="No backend or AI call runs until approval."
                  />
                  <ProcessNote
                    label="3. CRM output"
                    copy="Imported records redirect to Manage Leads."
                  />
                </div>
              </section>
            </div>
          </section>
        ) : null}

        {activePage === "manage-leads" ? (
          <section
            className="scroll-mt-28 rounded-[18px] border border-[var(--border)] bg-[var(--background)] p-5 shadow-[var(--shadow-soft)] sm:p-7"
            id="manage-leads"
          >
            <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <p className="font-[var(--font-mono)] text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--teal-strong)]">
                  CRM review
                </p>
                <h2 className="mt-1 text-[1.65rem] font-bold text-[var(--foreground)]">
                  Manage Leads
                </h2>
                {result ? (
                  <p className="mt-2 text-sm font-medium leading-6 text-[var(--muted)]">
                    {getImportSourceLine(importContext, result.summary)}
                  </p>
                ) : (
                  <p className="mt-2 text-sm font-medium leading-6 text-[var(--muted)]">
                    Imported records appear here after confirmation.
                  </p>
                )}
              </div>
              {result ? (
                <Badge
                  tone={
                    result.summary.aiProvider === "vertex" ? "info" : "warning"
                  }
                >
                  {result.summary.aiProvider === "vertex"
                    ? "Vertex AI extraction"
                    : "Local fallback"}
                </Badge>
              ) : null}
            </div>

            <div className="mb-5 grid grid-cols-2 gap-3 xl:grid-cols-4">
              {summaryMetrics.map((metric) => (
                <SummaryTile key={metric.label} {...metric} />
              ))}
            </div>

            <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <ResultViewTabs
                activeView={activeResultView}
                onChange={(view) => {
                  setActiveResultView(view);
                  if (view !== "all" && view !== "imported") {
                    setSelectedRecord(null);
                  }
                }}
                counts={{
                  all: result?.summary.totalRows ?? 0,
                  imported: result?.summary.imported ?? 0,
                  skipped: result?.summary.skipped ?? 0,
                  errored: result?.summary.errored ?? 0
                }}
              />
              {result && result.skipped.length > 0 ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    downloadIssueRowsCsv({
                      filename: "groweasy_skipped_rows.csv",
                      rows: result.skipped
                    })
                  }
                >
                  <Download className="h-4 w-4" aria-hidden="true" />
                  Export skipped
                </Button>
              ) : null}
            </div>

            {shouldShowImported && records.length > 0 ? (
              <section>
                <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_390px]">
                  <ParsedRecordsTable
                    records={records}
                    selectedRecordKey={selectedRecordKey}
                    onSelectRecord={setSelectedRecord}
                  />
                  {selectedRecord ? (
                    <LeadDetailPanel
                      lead={selectedRecord}
                      onClose={() => setSelectedRecord(null)}
                    />
                  ) : null}
                </div>
              </section>
            ) : !result ? (
              <EmptyRecordsPanel hasResult={Boolean(result)} />
            ) : activeResultView === "imported" ? (
              <EmptyRecordsPanel hasResult />
            ) : null}

            {result ? (
              <div className="mt-7 grid gap-5">
                {shouldShowSkipped && result.skipped.length > 0 ? (
                  <section>
                    <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <h3 className="text-lg font-extrabold text-[var(--foreground)]">
                        Skipped Records
                      </h3>
                    </div>
                    <SkippedRecordsTable skipped={result.skipped} />
                  </section>
                ) : shouldShowSkipped ? (
                  <OutcomeNotice
                    title="Nothing skipped"
                    copy={
                      result.errored.length > 0
                        ? "Rows that could not be processed are listed under errored records."
                        : "Every source row imported cleanly."
                    }
                  />
                ) : null}

                {shouldShowErrored && result.errored.length > 0 ? (
                  <section>
                    <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <h3 className="text-lg font-extrabold text-[var(--foreground)]">
                        Errored Records
                      </h3>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          downloadIssueRowsCsv({
                            filename: "groweasy_errored_rows.csv",
                            rows: result.errored
                          })
                        }
                      >
                        <Download className="h-4 w-4" aria-hidden="true" />
                        Download CSV
                      </Button>
                    </div>
                    <ErroredRecordsTable errored={result.errored} />
                  </section>
                ) : shouldShowErrored && activeResultView === "errored" ? (
                  <OutcomeNotice
                    title="Nothing errored"
                    copy="No AI or pipeline failures were reported for this import."
                  />
                ) : null}
              </div>
            ) : null}
          </section>
        ) : null}
      </div>

      <ImportModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleImportSuccess}
      />
    </div>
  );
}

function ProcessNote({ label, copy }: { label: string; copy: string }) {
  return (
    <div className="rounded-xl bg-[var(--surface-wash)] px-4 py-3">
      <p className="font-[var(--font-mono)] text-[10px] font-semibold uppercase tracking-[0.08em] text-[var(--teal-strong)]">
        {label}
      </p>
      <p className="mt-1 text-sm font-medium leading-5 text-[var(--muted)]">
        {copy}
      </p>
    </div>
  );
}

function ResultViewTabs({
  activeView,
  counts,
  onChange
}: {
  activeView: ResultView;
  counts: Record<ResultView, number>;
  onChange: (view: ResultView) => void;
}) {
  const views: Array<{ value: ResultView; label: string }> = [
    { value: "all", label: "All" },
    { value: "imported", label: "Imported" },
    { value: "skipped", label: "Skipped" },
    { value: "errored", label: "Errored" }
  ];

  return (
    <div
      aria-label="Filter import results"
      className="flex w-full gap-1 overflow-x-auto rounded-[10px] border border-[var(--border)] bg-[var(--surface-wash)] p-1 lg:w-auto"
      role="tablist"
    >
      {views.map((view) => {
        const isActive = activeView === view.value;

        return (
          <button
            key={view.value}
            aria-selected={isActive}
            className={[
              "min-h-9 shrink-0 rounded-lg px-3 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus)] focus-visible:ring-offset-2",
              isActive
                ? "bg-[var(--foreground)] text-white shadow-sm"
                : "text-[var(--muted)] hover:bg-[var(--panel)] hover:text-[var(--foreground)]"
            ].join(" ")}
            onClick={() => onChange(view.value)}
            role="tab"
            type="button"
          >
            {view.label}
            <span className="ml-1.5 tabular-nums">
              {numberFormatter.format(counts[view.value])}
            </span>
          </button>
        );
      })}
    </div>
  );
}

function SummaryTile({
  label,
  value,
  tone = "neutral"
}: {
  label: string;
  value: number;
  tone?: "neutral" | "success" | "warning" | "danger";
}) {
  const toneClass =
    tone === "success"
      ? "text-[var(--teal-strong)]"
      : tone === "warning"
        ? "text-[var(--orange-strong)]"
        : tone === "danger"
          ? "text-[var(--danger)]"
          : "text-[var(--foreground)]";

  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--panel)] p-4 shadow-sm">
      <p
        className={`font-[var(--font-mono)] text-[10px] font-semibold uppercase tracking-[0.08em] ${toneClass}`}
      >
        {label}
      </p>
      <p
        className={`mt-1 font-[var(--font-heading)] text-2xl font-bold tabular-nums ${toneClass}`}
      >
        {numberFormatter.format(value)}
      </p>
    </div>
  );
}

function EmptyRecordsPanel({ hasResult }: { hasResult: boolean }) {
  return (
    <div className="flex items-center gap-4 rounded-xl border border-dashed border-[var(--border-strong)] bg-[var(--panel-inset)] p-5">
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[var(--teal-soft)] text-[var(--teal-strong)]">
        <Database className="h-6 w-6" aria-hidden="true" />
      </div>
      <div>
        <h3 className="text-sm font-bold text-[var(--foreground)]">
          {hasResult ? "No CRM records imported" : "No leads imported yet"}
        </h3>
        <p className="mt-1 text-sm font-medium leading-6 text-[var(--muted)]">
          {hasResult
            ? "Review skipped and errored rows below, then fix the source CSV and import again."
            : "Upload a CSV in Lead Sources to populate the CRM review table."}
        </p>
      </div>
    </div>
  );
}

function OutcomeNotice({ title, copy }: { title: string; copy: string }) {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-[var(--border)] bg-[var(--green-soft)] p-4 text-[var(--teal-strong)]">
      <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
      <div>
        <p className="text-sm font-extrabold">{title}</p>
        <p className="mt-1 text-sm font-semibold leading-6 text-[var(--muted-strong)]">
          {copy}
        </p>
      </div>
    </div>
  );
}

function getSummaryMetrics(summary: ImportSummary | undefined) {
  return [
    { label: "total", value: summary?.totalRows ?? 0 },
    {
      label: "imported",
      value: summary?.imported ?? 0,
      tone: "success" as const
    },
    { label: "skipped", value: summary?.skipped ?? 0, tone: "warning" as const },
    { label: "errored", value: summary?.errored ?? 0, tone: "danger" as const }
  ];
}

function getImportSourceLine(
  importContext: ImportContext | null,
  summary: ImportSummary
) {
  const provider = summary.aiProvider.replace("-", " ");
  const duration = numberFormatter.format(summary.durationMs);

  if (!importContext) {
    return `Extracted with ${provider} in ${duration}ms.`;
  }

  return `From ${importContext.fileName}, imported ${formatRelativeTime(
    importContext.importedAt
  )}. ${numberFormatter.format(importContext.rowCount)} source rows x ${numberFormatter.format(
    importContext.columnCount
  )} columns processed with ${provider} in ${duration}ms.`;
}

function formatRelativeTime(value: string) {
  const importedAt = new Date(value).getTime();
  if (Number.isNaN(importedAt)) {
    return "after confirmation";
  }

  const elapsedSeconds = Math.max(0, Math.round((Date.now() - importedAt) / 1000));
  if (elapsedSeconds < 60) {
    return "just now";
  }

  const elapsedMinutes = Math.round(elapsedSeconds / 60);
  if (elapsedMinutes < 60) {
    return `${numberFormatter.format(elapsedMinutes)}m ago`;
  }

  const elapsedHours = Math.round(elapsedMinutes / 60);
  return `${numberFormatter.format(elapsedHours)}h ago`;
}

function getPageFromHash(): WorkspacePage {
  if (typeof window === "undefined") {
    return "lead-sources";
  }

  return window.location.hash === "#manage-leads"
    ? "manage-leads"
    : "lead-sources";
}

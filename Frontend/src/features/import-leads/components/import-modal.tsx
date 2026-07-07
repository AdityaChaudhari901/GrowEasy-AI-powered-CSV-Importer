"use client";

import { FileSpreadsheet, Loader2, X } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/components/feedback/toast-provider";
import { Button } from "@/components/ui/button";
import { formatBytes } from "@/lib/utils";
import { useCsvImport } from "../hooks/use-csv-import";
import type { CsvPreview, ImportSuccessPayload } from "../types";
import { parseCsvPreview } from "../utils/preview-parser";
import {
  demoCsv,
  demoCsvFilename,
  templateCsv,
  templateCsvFilename
} from "../utils/sample-data";
import { CsvPreviewTable } from "./csv-preview-table";
import { DropZone } from "./drop-zone";

type ImportModalProps = {
  open: boolean;
  onClose: () => void;
  onSuccess: (payload: ImportSuccessPayload) => void;
};

const maxFileBytes = 10 * 1024 * 1024;
const allowedMimeTypes = new Set([
  "",
  "text/csv",
  "application/csv",
  "application/vnd.ms-excel"
]);

const importSteps = ["Upload", "Preview", "Confirm", "Extract"] as const;
type ImportStep = (typeof importSteps)[number];

export function ImportModal({ open, onClose, onSuccess }: ImportModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<CsvPreview | null>(null);
  const [parseError, setParseError] = useState("");
  const [isParsing, setIsParsing] = useState(false);
  const [parsedRows, setParsedRows] = useState(0);
  const importMutation = useCsvImport();
  const { toast } = useToast();

  if (!open) {
    return null;
  }

  const reset = () => {
    setFile(null);
    setPreview(null);
    setParseError("");
    setIsParsing(false);
    setParsedRows(0);
    importMutation.reset();
  };

  const close = () => {
    if (importMutation.isPending) {
      return;
    }
    reset();
    onClose();
  };

  const handleFileSelected = async (selectedFile: File) => {
    setParseError("");
    importMutation.reset();

    const rejectFile = (message: string) => {
      setParseError(message);
      toast({
        title: "CSV upload blocked",
        description: message,
        tone: "danger"
      });
    };

    if (!selectedFile.name.toLowerCase().endsWith(".csv")) {
      rejectFile("Upload a valid .csv file.");
      return;
    }

    if (!allowedMimeTypes.has(selectedFile.type)) {
      rejectFile("Upload a CSV file exported as text/csv.");
      return;
    }

    if (selectedFile.size === 0) {
      rejectFile("CSV file is empty.");
      return;
    }

    if (selectedFile.size > maxFileBytes) {
      rejectFile("CSV file exceeds the 10MB limit.");
      return;
    }

    setFile(selectedFile);
    setPreview(null);
    setParsedRows(0);
    setIsParsing(true);

    try {
      setPreview(
        await parseCsvPreview(selectedFile, {
          onProgress({ rowsParsed }) {
            setParsedRows(rowsParsed);
          }
        })
      );
    } catch (error) {
      rejectFile(
        error instanceof Error ? error.message : "Unable to parse this CSV."
      );
    } finally {
      setIsParsing(false);
    }
  };

  const handleDownloadTemplate = () => {
    downloadCsvFile({
      filename: templateCsvFilename,
      contents: templateCsv
    });
  };

  const handleDownloadDemoCsv = () => {
    downloadCsvFile({
      filename: demoCsvFilename,
      contents: demoCsv
    });
  };

  const downloadCsvFile = ({
    filename,
    contents
  }: {
    filename: string;
    contents: string;
  }) => {
    const blob = new Blob([contents], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = filename;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  const submit = () => {
    if (!file || !preview || importMutation.isPending) {
      return;
    }

    importMutation.mutate(file, {
      onSuccess(result) {
        onSuccess({
          result,
          fileName: file.name,
          importedAt: new Date().toISOString(),
          rowCount: preview.rowCount,
          columnCount: preview.columnCount
        });
        reset();
        onClose();
      },
      onError(error) {
        toast({
          title: "Import failed",
          description: error.message,
          tone: "danger"
        });
      }
    });
  };

  const canSubmit = Boolean(
    file &&
      preview &&
      preview.errors.length === 0 &&
      !isParsing &&
      !importMutation.isPending
  );
  const activeStep: ImportStep = importMutation.isPending
    ? "Extract"
    : preview
      ? "Confirm"
      : file || isParsing
        ? "Preview"
        : "Upload";
  const activeStepIndex = importSteps.indexOf(activeStep);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden bg-[var(--teal-deep)]/70 px-3 py-3 backdrop-blur-sm sm:px-4 sm:py-4">
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="import-modal-title"
        className="flex max-h-[calc(100vh-56px)] w-full max-w-[1080px] flex-col overflow-hidden rounded-[14px] border border-[var(--border)] bg-[var(--panel)] shadow-[var(--shadow)] sm:max-h-[calc(100vh-64px)]"
      >
        <div className="shrink-0 border-b border-[var(--border-soft)] p-3 sm:p-4">
          <div className="mb-3 flex items-start justify-between gap-4">
            <div>
              <h2
                id="import-modal-title"
                className="text-xl font-bold text-[var(--foreground)]"
              >
                Import Leads via CSV
              </h2>
              <p className="mt-0.5 text-sm font-medium leading-5 text-[var(--muted)]">
                Preview first. AI extraction starts only after confirmation.
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              aria-label="Close import modal"
              onClick={close}
              disabled={importMutation.isPending}
            >
              <X className="h-6 w-6" aria-hidden="true" />
            </Button>
          </div>

          <div className="sm:hidden">
            <p className="font-[var(--font-mono)] text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--teal-strong)]">
              Step {activeStepIndex + 1} of {importSteps.length}
            </p>
            <p className="mt-1 text-sm font-semibold text-[var(--muted-strong)]">
              {activeStep}
            </p>
          </div>

          <ol className="hidden grid-cols-4 gap-2 sm:grid">
            {importSteps.map((step, index) => {
              const isComplete = index < activeStepIndex;
              const isActive = step === activeStep;

              return (
                <li key={step} className="min-w-0">
                  <div
                    className={[
                      "h-1.5 rounded-full",
                      isComplete || isActive
                        ? "bg-[var(--orange)]"
                        : "bg-[var(--panel-muted)]"
                    ].join(" ")}
                  />
                  <p
                    className={[
                      "mt-1 truncate font-[var(--font-mono)] text-[10px] font-semibold uppercase tracking-[0.08em]",
                      isActive
                        ? "text-[var(--teal)]"
                        : "text-[var(--muted-soft)]"
                    ].join(" ")}
                  >
                    {step}
                  </p>
                </li>
              );
            })}
          </ol>
        </div>

        <div className="no-visible-scrollbar min-h-0 flex-1 overflow-y-auto p-3 sm:p-4">
          {file ? (
            <div className="mb-3 flex items-center gap-2.5 rounded-xl border border-[var(--border)] bg-[var(--surface-wash)] p-2.5">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[var(--teal-faint)] text-[var(--teal)]">
                <FileSpreadsheet className="h-5 w-5" aria-hidden="true" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-extrabold text-[var(--foreground)]">
                  {file.name}
                </p>
                <p className="mt-0.5 text-xs font-semibold text-[var(--muted)]">
                  {formatBytes(file.size)}
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                aria-label="Remove selected file"
                disabled={importMutation.isPending}
                onClick={() => {
                  setFile(null);
                  setPreview(null);
                  setParseError("");
                  setParsedRows(0);
                  importMutation.reset();
                }}
              >
                <X className="h-5 w-5" aria-hidden="true" />
              </Button>
            </div>
          ) : null}

          {!file ? (
            <DropZone
              file={file}
              isParsing={isParsing}
              error={parseError}
              onFileSelected={handleFileSelected}
              onReject={(message) => {
                setParseError(message);
                toast({
                  title: "CSV upload blocked",
                  description: message,
                  tone: "danger"
                });
              }}
              onDownloadTemplate={handleDownloadTemplate}
              onDownloadDemoCsv={handleDownloadDemoCsv}
            />
          ) : null}

          {isParsing ? (
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-wash)] p-6">
              <div className="flex items-center gap-3 text-sm font-extrabold text-[var(--teal)]">
                <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
                {parsedRows > 0
                  ? `Reading CSV preview: ${parsedRows.toLocaleString("en-IN")} rows parsed`
                  : "Reading CSV preview"}
              </div>
              <div className="mt-5 h-2 overflow-hidden rounded-full bg-[var(--panel)]">
                <div className="h-full w-2/3 animate-pulse rounded-full bg-[var(--teal)]" />
              </div>
            </div>
          ) : null}

          {preview ? <CsvPreviewTable preview={preview} /> : null}

          {importMutation.isPending ? (
            <div className="mt-4 rounded-xl border border-[var(--orange-soft)] bg-[var(--orange-soft)] p-4">
              <div className="flex items-center gap-3 text-sm font-extrabold text-[var(--orange-strong)]">
                <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
                Processing confirmed CSV with AI extraction
              </div>
              <div className="mt-4 grid gap-2 text-xs font-bold text-[var(--muted)] sm:grid-cols-3">
                <span>1. Upload accepted</span>
                <span>2. Rows batched</span>
                <span>3. CRM records validated</span>
              </div>
            </div>
          ) : null}

          {importMutation.error ? (
            <p className="mt-4 rounded-xl border border-[var(--danger-soft)] bg-[var(--danger-soft)] p-4 text-sm font-bold text-[var(--danger)]">
              {importMutation.error.message}
            </p>
          ) : null}
        </div>

        <div className="grid shrink-0 gap-2 border-t border-[var(--border-soft)] bg-[var(--panel)] p-3 shadow-[0_-12px_28px_rgb(20_59_53_/_8%)] sm:grid-cols-[1fr_1.25fr] sm:p-4">
          <Button
            variant="outline"
            size="lg"
            onClick={close}
            disabled={importMutation.isPending}
          >
            Cancel
          </Button>
          <Button
            variant="orange"
            size="lg"
            disabled={!canSubmit}
            onClick={submit}
          >
            {importMutation.isPending
              ? "Processing"
              : "Confirm Import"}
          </Button>
        </div>
      </section>
    </div>
  );
}

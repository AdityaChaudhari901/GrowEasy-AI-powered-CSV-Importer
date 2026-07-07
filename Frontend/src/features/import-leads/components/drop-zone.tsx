"use client";

import { Download, TableProperties } from "lucide-react";
import { type Accept, type FileRejection } from "react-dropzone";
import { Button } from "@/components/ui/button";
import { FileUpload } from "@/components/ui/file-upload";
import { cn } from "@/lib/utils";

type DropZoneProps = {
  file: File | null;
  isParsing: boolean;
  error: string;
  onFileSelected: (file: File) => void;
  onReject: (message: string) => void;
  onDownloadTemplate: () => void;
  onDownloadDemoCsv: () => void;
};

const csvAccept = {
  "text/csv": [".csv"],
  "application/csv": [".csv"],
  "application/vnd.ms-excel": [".csv"]
} satisfies Accept;

const csvInputAccept = ".csv,text/csv,application/csv,application/vnd.ms-excel";

export function DropZone({
  file,
  isParsing,
  error,
  onFileSelected,
  onReject,
  onDownloadTemplate,
  onDownloadDemoCsv
}: DropZoneProps) {
  const handleUploadedFiles = (uploadedFiles: File[]) => {
    if (uploadedFiles.length !== 1) {
      onReject("Drop one CSV file at a time.");
      return;
    }

    const selectedFile = uploadedFiles[0];
    if (selectedFile) {
      onFileSelected(selectedFile);
    }
  };

  const handleRejectedFiles = (rejections: FileRejection[]) => {
    const hasInvalidType = rejections.some((rejection) =>
      rejection.errors.some((error) => error.code === "file-invalid-type")
    );

    onReject(
      hasInvalidType
        ? "Upload a CSV file exported as text/csv."
        : "Drop one CSV file at a time."
    );
  };

  return (
    <div
      className={cn(
        "mx-auto grid max-w-[780px] gap-3 text-center",
        error && "rounded-xl border border-[var(--danger)] bg-[var(--danger-soft)] p-3"
      )}
    >
      <FileUpload
        accept={csvAccept}
        disabled={isParsing}
        files={file ? [file] : []}
        inputAccept={csvInputAccept}
        inputAriaLabel="Choose CSV file"
        maxFiles={1}
        onChange={handleUploadedFiles}
        onDropRejected={handleRejectedFiles}
        title="Upload CSV"
        description="Drop a CSV here or click to browse"
      />

      <div className="grid gap-2 rounded-xl border border-[var(--border-soft)] bg-[var(--panel)] px-4 py-3 text-left sm:grid-cols-[1fr_auto] sm:items-center">
        <p className="text-xs font-semibold leading-5 text-[var(--muted)]">
          Flexible headers are mapped into CRM, WhatsApp, and calling-ready
          fields after confirmation.
        </p>
        <span className="w-fit rounded-lg border border-[var(--border-soft)] bg-[var(--surface-wash)] px-3 py-1.5 font-[var(--font-mono)] text-[11px] font-semibold uppercase tracking-[0.04em] text-[var(--muted-strong)]">
          .csv up to 10MB
        </span>
      </div>
      {error ? (
        <p className="text-sm font-bold text-[var(--danger)]">{error}</p>
      ) : null}
      <div className="mx-auto grid w-full max-w-[560px] gap-2 sm:grid-cols-2">
        <Button
          className="h-11 whitespace-nowrap text-sm"
          onClick={(event) => {
            event.stopPropagation();
            onDownloadDemoCsv();
          }}
          disabled={isParsing}
        >
          <TableProperties className="h-4 w-4" aria-hidden="true" />
          Download 100 Rows CSV
        </Button>
        <Button
          variant="outline"
          className="h-11 whitespace-nowrap text-sm"
          aria-label="Download Sample CSV Template"
          onClick={(event) => {
            event.stopPropagation();
            onDownloadTemplate();
          }}
          disabled={isParsing}
        >
          <Download className="h-4 w-4" aria-hidden="true" />
          Download Template
        </Button>
      </div>
    </div>
  );
}

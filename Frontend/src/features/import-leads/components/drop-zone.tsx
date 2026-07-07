"use client";

import { FileSpreadsheet } from "lucide-react";
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
  onDownloadTemplate
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
        "rounded-xl border border-dashed border-[var(--border-strong)] bg-[var(--surface-wash)] p-3 text-center transition-colors",
        error && "border-[var(--danger)] bg-[var(--danger-soft)]"
      )}
    >
      <FileUpload
        accept={csvAccept}
        className="rounded-lg bg-[var(--panel)]"
        disabled={isParsing}
        files={file ? [file] : []}
        inputAccept={csvInputAccept}
        inputAriaLabel="Choose CSV file"
        maxFiles={1}
        onChange={handleUploadedFiles}
        onDropRejected={handleRejectedFiles}
        title="Upload file"
        description="Drag or drop your CSV file here or click to upload"
      />

      <p className="mx-auto mt-4 max-w-[560px] text-sm font-semibold leading-6 text-[var(--muted)]">
        Required headers are flexible. GrowEasy maps lead exports into CRM,
        WhatsApp, and calling-ready fields after confirmation.
      </p>
      <div className="mx-auto mt-3 w-fit rounded-lg border border-[var(--border)] bg-[var(--panel)] px-3 py-2 font-[var(--font-mono)] text-xs font-semibold text-[var(--muted-strong)] shadow-sm">
        .csv up to 10MB
      </div>
      {error ? (
        <p className="mt-4 text-sm font-bold text-[var(--danger)]">{error}</p>
      ) : null}
      <div className="mx-auto mt-5 grid w-full max-w-[360px] gap-2">
        <Button
          variant="outline"
          onClick={(event) => {
            event.stopPropagation();
            onDownloadTemplate();
          }}
          disabled={isParsing}
        >
          <FileSpreadsheet className="h-4 w-4" aria-hidden="true" />
          Download Sample CSV Template
        </Button>
      </div>
    </div>
  );
}

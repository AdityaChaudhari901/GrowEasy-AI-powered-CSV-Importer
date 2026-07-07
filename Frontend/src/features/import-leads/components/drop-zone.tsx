"use client";

import { FileSpreadsheet, Upload } from "lucide-react";
import { useRef, useState, type DragEvent } from "react";
import { Button } from "@/components/ui/button";
import { cn, formatBytes } from "@/lib/utils";

type DropZoneProps = {
  file: File | null;
  isParsing: boolean;
  error: string;
  onFileSelected: (file: File) => void;
  onReject: (message: string) => void;
  onDownloadTemplate: () => void;
};

export function DropZone({
  file,
  isParsing,
  error,
  onFileSelected,
  onReject,
  onDownloadTemplate
}: DropZoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragState, setDragState] = useState<"idle" | "valid" | "invalid">(
    "idle"
  );

  const dragMessage =
    dragState === "invalid" ? "Drop a single CSV file" : "Release to preview CSV";

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragState("idle");

    if (event.dataTransfer.files.length !== 1) {
      onReject("Drop one CSV file at a time.");
      return;
    }

    const droppedFile = event.dataTransfer.files.item(0);
    if (droppedFile) {
      onFileSelected(droppedFile);
    }
  };

  return (
    <div
      onDragOver={(event) => {
        event.preventDefault();
        const items = Array.from(event.dataTransfer.items);
        const hasMultipleFiles = items.length > 1;
        const fileItem = items.find((item) => item.kind === "file");
        const isClearlyInvalid =
          Boolean(fileItem?.type) &&
          !["text/csv", "application/vnd.ms-excel"].includes(fileItem?.type ?? "");

        setDragState(hasMultipleFiles || isClearlyInvalid ? "invalid" : "valid");
      }}
      onDragLeave={() => setDragState("idle")}
      onDrop={handleDrop}
      className={cn(
        "flex min-h-[260px] flex-col items-center justify-center rounded-xl border-2 border-dashed border-[var(--border-strong)] bg-[var(--surface-wash)] px-6 py-8 text-center transition-colors",
        dragState === "valid" && "border-[var(--teal)] bg-[var(--teal-faint)]",
        dragState === "invalid" && "border-[var(--danger)] bg-[var(--danger-soft)]"
      )}
    >
      <input
        ref={inputRef}
        type="file"
        accept=".csv,text/csv"
        className="sr-only"
        onChange={(event) => {
          const selectedFile = event.target.files?.item(0);
          if (selectedFile) {
            onFileSelected(selectedFile);
          }
        }}
      />

      <div
        role="button"
        tabIndex={0}
        aria-label="Choose CSV file"
        className="flex w-full cursor-pointer flex-col items-center text-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--teal)] focus-visible:ring-offset-2"
        onClick={() => inputRef.current?.click()}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            inputRef.current?.click();
          }
        }}
      >
        <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-xl border border-[var(--border-strong)] bg-[var(--panel)] text-[var(--teal)] shadow-sm">
          {file ? (
            <FileSpreadsheet className="h-7 w-7" aria-hidden="true" />
          ) : (
            <Upload className="h-7 w-7" aria-hidden="true" />
          )}
        </div>

        <p className="text-lg font-extrabold text-[var(--foreground)]">
          {dragState === "idle"
            ? file
              ? file.name
              : "Drop your CSV file here"
            : dragMessage}
        </p>
        <p className="mt-2 text-sm font-semibold text-[var(--muted)]">
          {file ? formatBytes(file.size) : "or click to browse files"}
        </p>

        <div className="mt-5 rounded-lg border border-[var(--border)] bg-[var(--panel)] px-3 py-2 font-[var(--font-mono)] text-xs font-semibold text-[var(--muted-strong)] shadow-sm">
          .csv up to 10MB
        </div>

        <p className="mt-4 max-w-[560px] text-sm font-semibold leading-6 text-[var(--muted)]">
          Required headers are flexible. GrowEasy maps lead exports into CRM,
          WhatsApp, and calling-ready fields after confirmation.
        </p>

        {error ? (
          <p className="mt-4 text-sm font-bold text-[var(--danger)]">{error}</p>
        ) : null}
      </div>

      <div className="mt-5 grid w-full max-w-[360px] gap-2">
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

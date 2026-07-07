"use client";
import { IconUpload } from "@tabler/icons-react";
import { type KeyboardEvent, useRef, useState } from "react";
import {
  type Accept,
  type DropzoneOptions,
  type FileRejection,
  useDropzone
} from "react-dropzone";
import { cn } from "@/lib/utils";

export const FileUpload = ({
  onChange,
  onDropRejected,
  files,
  accept,
  inputAccept,
  disabled = false,
  multiple = false,
  maxFiles = 1,
  title = "Upload file",
  description = "Drag or drop your files here or click to upload",
  inputAriaLabel = "Choose file",
  className,
}: {
  onChange?: (files: File[]) => void;
  onDropRejected?: (fileRejections: FileRejection[]) => void;
  files?: File[];
  accept?: Accept;
  inputAccept?: string;
  disabled?: boolean;
  multiple?: boolean;
  maxFiles?: number;
  title?: string;
  description?: string;
  inputAriaLabel?: string;
  className?: string;
}) => {
  const [localFiles, setLocalFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const displayFiles = files ?? localFiles;

  const handleFileChange = (newFiles: File[]) => {
    if (disabled || newFiles.length === 0) {
      return;
    }

    if (files === undefined) {
      setLocalFiles((prevFiles) => [...prevFiles, ...newFiles]);
    }

    onChange?.(newFiles);
  };

  const handleClick = () => {
    if (disabled) {
      return;
    }

    fileInputRef.current?.click();
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      handleClick();
    }
  };

  const dropzoneOptions: DropzoneOptions = {
    disabled,
    maxFiles,
    multiple,
    noClick: true,
    onDrop: handleFileChange
  };

  if (accept) {
    dropzoneOptions.accept = accept;
  }

  if (onDropRejected) {
    dropzoneOptions.onDropRejected = onDropRejected;
  }

  const { getRootProps, isDragActive } = useDropzone(dropzoneOptions);

  return (
    <div className={cn("w-full", className)} {...getRootProps()}>
      <div
        aria-disabled={disabled}
        role="button"
        tabIndex={disabled ? -1 : 0}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        className={cn(
          "group/file relative block w-full cursor-pointer overflow-hidden rounded-xl border border-dashed border-[var(--border-strong)] bg-[var(--surface-wash)] px-5 py-5 text-center transition-colors hover:border-[var(--teal)] hover:bg-[var(--teal-faint)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus)] focus-visible:ring-offset-2",
          disabled && "cursor-not-allowed opacity-60",
        )}
      >
        <input
          ref={fileInputRef}
          id="file-upload-handle"
          type="file"
          accept={inputAccept}
          aria-label={inputAriaLabel}
          disabled={disabled}
          multiple={multiple}
          onChange={(e) => handleFileChange(Array.from(e.target.files || []))}
          className="hidden"
        />
        <div className="relative z-10 flex flex-col items-center justify-center">
          {!displayFiles.length ? (
            <div
              className={cn(
                "mb-3 flex h-12 w-12 items-center justify-center rounded-xl border border-[var(--border-soft)] bg-[var(--panel)] text-[var(--teal)] shadow-sm transition-colors",
                isDragActive && "border-[var(--teal)] bg-[var(--teal-faint)]"
              )}
            >
              <IconUpload className="h-6 w-6" />
            </div>
          ) : null}
          <p className="font-[var(--font-heading)] text-base font-bold text-[var(--foreground)]">
            {title}
          </p>
          <p className="mt-1 max-w-lg text-sm font-semibold leading-5 text-[var(--muted)]">
            {description}
          </p>
          <div className="relative mx-auto mt-3 w-full max-w-md">
            {displayFiles.length > 0 &&
              displayFiles.map((file, idx) => (
                <div
                  key={`${file.name}-${file.lastModified}-${idx}`}
                  className={cn(
                    "relative z-20 mx-auto flex w-full flex-col items-start justify-start overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--surface-wash)] p-3 text-left shadow-sm",
                  )}
                >
                  <div className="flex w-full items-center justify-between gap-4">
                    <p className="max-w-xs truncate text-sm font-bold text-[var(--foreground)]">
                      {file.name}
                    </p>
                    <p className="w-fit shrink-0 rounded-lg border border-[var(--border-soft)] bg-[var(--panel)] px-2 py-1 text-xs font-semibold text-[var(--muted-strong)]">
                      {(file.size / (1024 * 1024)).toFixed(2)} MB
                    </p>
                  </div>

                  <div className="mt-2 flex w-full flex-col items-start justify-between gap-2 text-xs font-semibold text-[var(--muted)] md:flex-row md:items-center">
                    <p className="rounded-md bg-[var(--panel)] px-2 py-1">
                      {file.type || "text/csv"}
                    </p>

                    <p>
                      modified{" "}
                      {new Date(file.lastModified).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            {!displayFiles.length && (
              <div className="relative z-20 mx-auto flex min-h-5 items-center justify-center text-[var(--teal)]">
                {isDragActive ? (
                  <p className="flex flex-col items-center gap-1 text-xs font-bold text-[var(--teal-strong)]">
                    Drop CSV
                  </p>
                ) : (
                  <p className="font-[var(--font-mono)] text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--teal-strong)]">
                    Click to browse
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

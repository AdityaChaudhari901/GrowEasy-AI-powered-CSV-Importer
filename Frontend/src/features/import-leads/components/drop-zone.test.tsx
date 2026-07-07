import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { DropZone } from "./drop-zone";

describe("DropZone", () => {
  it("passes a selected CSV file through the Aceternity upload component", () => {
    const handleFileSelected = vi.fn();
    const handleReject = vi.fn();

    render(
      <DropZone
        file={null}
        isParsing={false}
        error=""
        onFileSelected={handleFileSelected}
        onReject={handleReject}
        onDownloadCompanySample={() => undefined}
        onDownloadDemoCsv={() => undefined}
      />
    );

    const csvFile = new File(["created_at,name\n"], "leads.csv", {
      type: "text/csv"
    });

    fireEvent.change(screen.getByLabelText("Choose CSV file"), {
      target: { files: [csvFile] }
    });

    expect(handleFileSelected).toHaveBeenCalledWith(csvFile);
    expect(handleReject).not.toHaveBeenCalled();
  });

  it("renders both CSV download actions", () => {
    const handleFileSelected = vi.fn();
    const handleReject = vi.fn();
    const handleDownloadCompanySample = vi.fn();
    const handleDownloadDemoCsv = vi.fn();

    render(
      <DropZone
        file={null}
        isParsing={false}
        error=""
        onFileSelected={handleFileSelected}
        onReject={handleReject}
        onDownloadCompanySample={handleDownloadCompanySample}
        onDownloadDemoCsv={handleDownloadDemoCsv}
      />
    );

    fireEvent.click(
      screen.getByRole("button", { name: "Download 100 Rows CSV" })
    );
    fireEvent.click(
      screen.getByRole("button", { name: "Download company sample leads CSV" })
    );

    expect(handleDownloadDemoCsv).toHaveBeenCalledTimes(1);
    expect(handleDownloadCompanySample).toHaveBeenCalledTimes(1);
    expect(handleFileSelected).not.toHaveBeenCalled();
  });
});

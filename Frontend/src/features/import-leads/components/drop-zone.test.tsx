import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { DropZone } from "./drop-zone";

describe("DropZone", () => {
  it("renders the template download button without demo CSV download", () => {
    const handleFileSelected = vi.fn();
    const handleReject = vi.fn();
    const handleDownloadTemplate = vi.fn();

    render(
      <DropZone
        file={null}
        isParsing={false}
        error=""
        onFileSelected={handleFileSelected}
        onReject={handleReject}
        onDownloadTemplate={handleDownloadTemplate}
      />
    );

    fireEvent.click(
      screen.getByRole("button", { name: "Download Sample CSV Template" })
    );

    expect(handleDownloadTemplate).toHaveBeenCalledTimes(1);
    expect(
      screen.queryByRole("button", { name: /download .* rows csv/i })
    ).not.toBeInTheDocument();
    expect(handleFileSelected).not.toHaveBeenCalled();
  });
});

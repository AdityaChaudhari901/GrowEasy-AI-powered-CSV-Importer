import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ToastProvider, useToast } from "./toast-provider";

function ToastTrigger() {
  const { toast } = useToast();

  return (
    <div>
      <button
        type="button"
        onClick={() =>
          toast({
            title: "Nothing skipped",
            description: "Every source row imported cleanly.",
            tone: "success"
          })
        }
      >
        Show success toast
      </button>
      <button
        type="button"
        onClick={() =>
          toast({
            title: "Import failed",
            description: "Could not reach the API.",
            tone: "danger"
          })
        }
      >
        Show error toast
      </button>
    </div>
  );
}

describe("ToastProvider", () => {
  it("renders and dismisses success toasts", () => {
    render(
      <ToastProvider>
        <ToastTrigger />
      </ToastProvider>
    );

    fireEvent.click(screen.getByRole("button", { name: "Show success toast" }));

    expect(screen.getByText("Nothing skipped")).toBeInTheDocument();
    expect(screen.getByText("Every source row imported cleanly.")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Dismiss Nothing skipped" }));

    expect(screen.queryByText("Nothing skipped")).not.toBeInTheDocument();
  });

  it("announces error toasts as alerts", () => {
    render(
      <ToastProvider>
        <ToastTrigger />
      </ToastProvider>
    );

    fireEvent.click(screen.getByRole("button", { name: "Show error toast" }));

    expect(screen.getByRole("alert")).toHaveTextContent("Import failed");
    expect(screen.getByRole("alert")).toHaveTextContent("Could not reach the API.");
  });
});

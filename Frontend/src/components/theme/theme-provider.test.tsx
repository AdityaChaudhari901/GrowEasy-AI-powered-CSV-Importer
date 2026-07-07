import { render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ThemeProvider, useTheme } from "./theme-provider";

const mockMatchMedia = ({ dark = false, reduce = false } = {}) => {
  Object.defineProperty(window, "matchMedia", {
    configurable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      addEventListener: vi.fn(),
      addListener: vi.fn(),
      dispatchEvent: vi.fn(),
      matches: query.includes("prefers-color-scheme")
        ? dark
        : query.includes("prefers-reduced-motion")
          ? reduce
          : false,
      media: query,
      onchange: null,
      removeEventListener: vi.fn(),
      removeListener: vi.fn()
    })),
    writable: true
  });
};

function ThemeReader() {
  const { theme } = useTheme();
  return <output aria-label="Current theme">{theme}</output>;
}

describe("ThemeProvider", () => {
  beforeEach(() => {
    window.localStorage.clear();
    document.documentElement.removeAttribute("data-theme");
    mockMatchMedia();
  });

  it("applies the saved dark theme without overwriting it on mount", async () => {
    window.localStorage.setItem("groweasy-theme", "dark");

    render(
      <ThemeProvider>
        <ThemeReader />
      </ThemeProvider>
    );

    await waitFor(() => {
      expect(screen.getByLabelText("Current theme")).toHaveTextContent("dark");
      expect(document.documentElement).toHaveAttribute("data-theme", "dark");
    });
    expect(window.localStorage.getItem("groweasy-theme")).toBe("dark");
  });

  it("defaults to light when no saved theme exists", async () => {
    mockMatchMedia({ dark: true });

    render(
      <ThemeProvider>
        <ThemeReader />
      </ThemeProvider>
    );

    await waitFor(() => {
      expect(screen.getByLabelText("Current theme")).toHaveTextContent("light");
      expect(document.documentElement).toHaveAttribute("data-theme", "light");
    });
  });
});

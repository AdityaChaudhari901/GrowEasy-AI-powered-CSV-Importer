import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ThemeProvider } from "@/components/theme/theme-provider";
import { AnimatedThemeToggler } from "./animated-theme-toggler";

type ViewTransitionMock = {
  ready: Promise<void>;
};

const mockMatchMedia = () => {
  Object.defineProperty(window, "matchMedia", {
    configurable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      addEventListener: vi.fn(),
      addListener: vi.fn(),
      dispatchEvent: vi.fn(),
      matches: false,
      media: query,
      onchange: null,
      removeEventListener: vi.fn(),
      removeListener: vi.fn()
    })),
    writable: true
  });
};

describe("AnimatedThemeToggler", () => {
  beforeEach(() => {
    window.localStorage.clear();
    document.documentElement.removeAttribute("data-theme");
    mockMatchMedia();
  });

  it("toggles between light and dark themes", async () => {
    render(
      <ThemeProvider>
        <AnimatedThemeToggler variant="circle" />
      </ThemeProvider>
    );

    const toggle = await screen.findByRole("button", {
      name: "Switch to dark mode"
    });

    fireEvent.click(toggle);

    await waitFor(() => {
      expect(document.documentElement).toHaveAttribute("data-theme", "dark");
      expect(toggle).toHaveAccessibleName("Switch to light mode");
    });
    expect(window.localStorage.getItem("groweasy-theme")).toBe("dark");
  });

  it("uses a circle view transition when the browser supports it", async () => {
    const animate = vi.fn();
    const startViewTransition = vi.fn(
      (callback: () => void): ViewTransitionMock => {
        callback();
        return { ready: Promise.resolve() };
      }
    );

    document.documentElement.animate = animate;
    Object.defineProperty(document, "startViewTransition", {
      configurable: true,
      value: startViewTransition
    });

    render(
      <ThemeProvider>
        <AnimatedThemeToggler variant="circle" />
      </ThemeProvider>
    );

    fireEvent.click(
      await screen.findByRole("button", { name: "Switch to dark mode" })
    );

    await waitFor(() => {
      expect(startViewTransition).toHaveBeenCalledTimes(1);
      expect(animate).toHaveBeenCalledWith(
        { clipPath: expect.arrayContaining([expect.stringContaining("circle(")]) },
        expect.objectContaining({
          pseudoElement: "::view-transition-new(root)"
        })
      );
    });
  });
});

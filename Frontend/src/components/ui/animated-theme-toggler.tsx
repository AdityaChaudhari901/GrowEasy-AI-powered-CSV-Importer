"use client";

import { Moon, Sun } from "lucide-react";
import { flushSync } from "react-dom";
import type { MouseEvent } from "react";
import { useTheme, type ThemeMode } from "@/components/theme/theme-provider";
import { cn } from "@/lib/utils";

type AnimatedThemeTogglerProps = {
  className?: string;
  variant?: "circle";
};

type ViewTransition = {
  ready: Promise<void>;
};

type DocumentWithViewTransition = Document & {
  startViewTransition?: (updateCallback: () => void) => ViewTransition;
};

type ViewTransitionAnimationOptions = KeyframeAnimationOptions & {
  pseudoElement?: string;
};

const VIEW_TRANSITION_DURATION_MS = 560;
const VIEW_TRANSITION_EASING = "cubic-bezier(0.22, 1, 0.36, 1)";

const nextTheme = (theme: ThemeMode): ThemeMode =>
  theme === "dark" ? "light" : "dark";

const prefersReducedMotion = () =>
  typeof window.matchMedia === "function" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const getCircleClipPaths = (x: number, y: number) => {
  const endRadius = Math.hypot(
    Math.max(x, window.innerWidth - x),
    Math.max(y, window.innerHeight - y)
  );

  return [
    `circle(0px at ${x}px ${y}px)`,
    `circle(${endRadius}px at ${x}px ${y}px)`
  ];
};

export function AnimatedThemeToggler({
  className,
  variant = "circle"
}: AnimatedThemeTogglerProps) {
  const { setTheme, theme } = useTheme();
  const isDark = theme === "dark";

  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    const themeToApply = nextTheme(theme);
    const updateTheme = () => setTheme(themeToApply);
    const transitionDocument = document as DocumentWithViewTransition;

    if (
      variant !== "circle" ||
      !transitionDocument.startViewTransition ||
      prefersReducedMotion()
    ) {
      updateTheme();
      return;
    }

    const { left, top, width, height } =
      event.currentTarget.getBoundingClientRect();
    const x = left + width / 2;
    const y = top + height / 2;
    const clipPath = getCircleClipPaths(x, y);

    const transition = transitionDocument.startViewTransition(() => {
      flushSync(updateTheme);
    });

    void transition.ready.then(() => {
      document.documentElement.animate(
        { clipPath },
        {
          duration: VIEW_TRANSITION_DURATION_MS,
          easing: VIEW_TRANSITION_EASING,
          pseudoElement: "::view-transition-new(root)"
        } satisfies ViewTransitionAnimationOptions
      );
    });
  };

  return (
    <button
      type="button"
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      className={cn(
        "group flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-[var(--border-soft)] bg-[var(--panel)] text-[var(--muted-strong)] shadow-sm transition-colors duration-200 hover:border-[var(--teal)] hover:bg-[var(--teal-faint)] hover:text-[var(--teal-strong)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus)] focus-visible:ring-offset-2",
        className
      )}
      onClick={handleClick}
    >
      {isDark ? (
        <Sun className="h-5 w-5" aria-hidden="true" />
      ) : (
        <Moon className="h-5 w-5" aria-hidden="true" />
      )}
    </button>
  );
}

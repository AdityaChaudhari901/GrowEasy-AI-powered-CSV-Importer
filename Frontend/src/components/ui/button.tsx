"use client";

import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type ButtonVariant = "primary" | "secondary" | "ghost" | "orange" | "outline";
type ButtonSize = "sm" | "md" | "lg" | "icon";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
};

const variants: Record<ButtonVariant, string> = {
  primary:
    "bg-[var(--teal)] text-[var(--on-teal)] shadow-sm hover:bg-[var(--teal-strong)] focus-visible:ring-[var(--teal)]",
  secondary:
    "bg-[var(--teal-soft)] text-[var(--teal-strong)] hover:bg-[var(--teal-faint)] focus-visible:ring-[var(--teal)]",
  ghost:
    "bg-transparent text-[var(--muted-strong)] hover:bg-[var(--panel-muted)] focus-visible:ring-[var(--teal)]",
  orange:
    "bg-[var(--orange)] text-[var(--on-orange)] shadow-sm hover:bg-[var(--orange-strong)] focus-visible:ring-[var(--orange)]",
  outline:
    "border border-[var(--border)] bg-[var(--panel)] text-[var(--foreground)] hover:bg-[var(--panel-muted)] focus-visible:ring-[var(--teal)]"
};

const sizes: Record<ButtonSize, string> = {
  sm: "h-9 gap-2 rounded-lg px-3 text-sm",
  md: "h-11 gap-2 rounded-lg px-4 text-sm",
  lg: "h-12 gap-2 rounded-xl px-6 text-base",
  icon: "h-10 w-10 rounded-lg p-0"
};

export function Button({
  className,
  variant = "primary",
  size = "md",
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(
        "inline-flex items-center justify-center font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    />
  );
}

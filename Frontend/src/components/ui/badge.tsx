import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type BadgeTone = "neutral" | "success" | "warning" | "info" | "danger";

type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
  tone?: BadgeTone;
};

const tones: Record<BadgeTone, string> = {
  neutral: "bg-[var(--panel-muted)] text-[var(--muted-strong)]",
  success: "bg-[var(--green-soft)] text-[var(--teal-strong)]",
  warning: "bg-[var(--orange-soft)] text-[var(--orange-strong)]",
  info: "bg-[var(--blue-soft)] text-[var(--blue-strong)]",
  danger: "bg-[var(--danger-soft)] text-[var(--danger)]"
};

export function Badge({ className, tone = "neutral", ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex min-h-6 items-center rounded-md px-2.5 text-[11px] font-semibold",
        tones[tone],
        className
      )}
      {...props}
    />
  );
}

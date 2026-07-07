"use client";

import { Database, Megaphone } from "lucide-react";
import Image from "next/image";
import { useEffect, useState, type ReactNode } from "react";
import growEasyLogo from "@/assets/groweasy-logo.webp";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import {
  Sidebar as AceternitySidebar,
  SidebarBody,
  SidebarLink
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";

const navItems = [
  {
    label: "Lead Sources",
    href: "#lead-sources",
    target: "lead-sources",
    icon: <Megaphone className="h-5 w-5 shrink-0" aria-hidden="true" />
  },
  {
    label: "Manage Leads",
    href: "#manage-leads",
    target: "manage-leads",
    icon: <Database className="h-5 w-5 shrink-0" aria-hidden="true" />
  }
] as const;

export function Sidebar() {
  const [open, setOpen] = useState(false);
  const activeTarget = useActiveTarget();

  return (
    <AceternitySidebar open={open} setOpen={setOpen}>
      <SidebarBody>
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
          <Logo open={open} />

          <p
            className={cn(
              "mt-5 px-2 font-[var(--font-mono)] text-[10px] font-semibold uppercase tracking-normal text-[var(--muted-soft)] transition-[max-height,opacity] duration-300",
              open ? "max-h-5 opacity-100" : "max-h-0 overflow-hidden opacity-0"
            )}
          >
            Workspace
          </p>

          <nav className="mt-2 flex flex-col gap-1" aria-label="Primary">
            {navItems.map(({ target, ...link }) => (
              <SidebarLink
                key={target}
                link={link}
                aria-current={activeTarget === target ? "page" : undefined}
                className={cn(
                  activeTarget === target
                    ? "bg-[var(--teal)] text-[var(--on-teal)] shadow-[0_10px_24px_rgb(39_97_89_/_18%)]"
                    : "text-[var(--muted-strong)] hover:bg-[var(--panel)] hover:text-[var(--teal-strong)]"
                )}
              />
            ))}
          </nav>

          <div
            className={cn(
              "mt-auto flex border-t border-[var(--border-soft)] pt-4",
              open ? "justify-start px-1.5" : "justify-center"
            )}
          >
            <ThemeToggle />
          </div>
        </div>
      </SidebarBody>
    </AceternitySidebar>
  );
}

export function MobileNavigation() {
  const activeTarget = useActiveTarget();

  return (
    <header className="sticky top-0 z-40 border-b border-[var(--border)] bg-[var(--panel)]/96 px-4 py-3 backdrop-blur lg:hidden">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <LogoIcon />
          <span className="truncate font-[var(--font-heading)] text-2xl font-bold tracking-normal text-[var(--foreground)]">
            GrowEasy
          </span>
        </div>
        <ThemeToggle />
      </div>

      <nav
        className="flex gap-2 overflow-x-auto no-visible-scrollbar"
        aria-label="Primary"
      >
        {navItems.map((item) => (
          <MobileNavItem
            key={item.target}
            href={item.href}
            label={item.label}
            icon={item.icon}
            active={activeTarget === item.target}
          />
        ))}
      </nav>
    </header>
  );
}

export function Logo({ open = true }: { open?: boolean }) {
  return (
    <a
      href="#lead-sources"
      aria-label="GrowEasy home"
      className={cn(
        "relative z-20 flex h-12 items-center rounded-2xl border border-transparent text-sm font-normal text-[var(--foreground)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus)] focus-visible:ring-offset-2",
        open
          ? "gap-2 border-[var(--border-soft)] bg-[var(--panel)] px-1.5 shadow-sm"
          : "justify-center"
      )}
    >
      <Image
        src={growEasyLogo}
        alt=""
        width={36}
        height={36}
        className="h-9 w-9 shrink-0 rounded-xl object-cover shadow-sm"
        priority
      />
      <span
        className={cn(
          "min-w-0 whitespace-pre font-[var(--font-heading)] text-lg font-bold text-[var(--foreground)] transition-[max-width,opacity,transform] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]",
          open
            ? "max-w-36 translate-x-0 opacity-100"
            : "max-w-0 -translate-x-1 overflow-hidden opacity-0"
        )}
      >
        GrowEasy
      </span>
    </a>
  );
}

export function LogoIcon() {
  return (
    <a
      href="#lead-sources"
      aria-label="GrowEasy home"
      className="relative z-20 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus)] focus-visible:ring-offset-2"
    >
      <Image
        src={growEasyLogo}
        alt=""
        width={40}
        height={40}
        className="h-10 w-10 rounded-xl object-cover shadow-sm"
        priority
      />
    </a>
  );
}

function MobileNavItem({
  label,
  href,
  icon,
  active
}: {
  label: string;
  href: string;
  icon: ReactNode;
  active: boolean;
}) {
  return (
    <a
      href={href}
      aria-current={active ? "page" : undefined}
      className={cn(
        "flex h-10 shrink-0 items-center gap-2 rounded-lg border px-3 text-sm font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus)] focus-visible:ring-offset-2",
        active
          ? "border-[var(--teal)] bg-[var(--teal)] text-[var(--on-teal)]"
          : "border-[var(--border-soft)] bg-[var(--panel)] text-[var(--muted-strong)]"
      )}
    >
      {icon}
      {label}
    </a>
  );
}

function useActiveTarget() {
  const [activeTarget, setActiveTarget] = useState<string>(
    navItems[0]?.target ?? ""
  );

  useEffect(() => {
    const updateFromHash = () => {
      const hash = window.location.hash.replace("#", "");
      if (navItems.some((item) => item.target === hash)) {
        setActiveTarget(hash);
      }
    };

    updateFromHash();
    window.addEventListener("hashchange", updateFromHash);
    return () => window.removeEventListener("hashchange", updateFromHash);
  }, []);

  return activeTarget;
}

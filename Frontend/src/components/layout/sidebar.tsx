"use client";

import { Database, Megaphone } from "lucide-react";
import Image from "next/image";
import { useEffect, useState, type ReactNode } from "react";
import growEasyLogo from "@/assets/groweasy-logo.webp";
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
      <SidebarBody className="gap-8">
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
          <Logo open={open} />

          <nav className="mt-8 flex flex-col gap-2" aria-label="Primary">
            {navItems.map(({ target, ...link }) => (
              <SidebarLink
                key={target}
                link={link}
                aria-current={activeTarget === target ? "page" : undefined}
                className={cn(
                  activeTarget === target
                    ? "bg-[var(--teal)] text-white shadow-sm"
                    : "text-[var(--muted-strong)] hover:bg-[var(--teal-faint)] hover:text-[var(--teal-strong)]"
                )}
              />
            ))}
          </nav>
        </div>
      </SidebarBody>
    </AceternitySidebar>
  );
}

export function MobileNavigation() {
  const activeTarget = useActiveTarget();

  return (
    <header className="sticky top-0 z-40 border-b border-[var(--border)] bg-[var(--panel)]/96 px-4 py-3 backdrop-blur lg:hidden">
      <div className="mb-3 flex items-center gap-3">
        <LogoIcon />
        <span className="font-[var(--font-heading)] text-2xl font-bold tracking-normal text-[var(--foreground)]">
          GrowEasy
        </span>
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
      className="relative z-20 flex items-center gap-3 rounded-xl py-1 text-sm font-normal text-[var(--foreground)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus)] focus-visible:ring-offset-2"
    >
      <Image
        src={growEasyLogo}
        alt=""
        width={40}
        height={40}
        className="h-10 w-10 shrink-0 rounded-xl object-cover shadow-sm"
        priority
      />
      <span
        className={cn(
          "min-w-0 whitespace-pre font-[var(--font-heading)] text-xl font-bold text-[var(--foreground)] transition-[max-width,opacity,transform] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]",
          open
            ? "max-w-40 translate-x-0 opacity-100"
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
          ? "border-[var(--teal)] bg-[var(--teal)] text-white"
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

"use client";

import {
  Database,
  Megaphone,
  type LucideIcon
} from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import growEasyLogo from "@/assets/groweasy-logo.webp";
import { cn } from "@/lib/utils";

const navItems = [
  { label: "Lead Sources", icon: Megaphone, target: "lead-sources" },
  { label: "Manage Leads", icon: Database, target: "manage-leads" }
];

export function Sidebar() {
  const activeTarget = useActiveTarget();

  return (
    <aside className="hidden min-h-full w-[68px] shrink-0 bg-[var(--rail)] px-3 py-5 lg:flex lg:flex-col lg:items-center">
      <a
        href="#lead-sources"
        aria-label="GrowEasy home"
        className="mb-7 flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--teal-soft)] shadow-sm transition-transform hover:scale-[1.03] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--rail)]"
      >
        <Image
          src={growEasyLogo}
          alt=""
          width={40}
          height={40}
          className="h-10 w-10 rounded-lg object-cover"
          priority
        />
      </a>

      <nav className="flex flex-1 flex-col items-center gap-2" aria-label="Primary">
        {navItems.map((item) => (
          <SidebarItem
            key={item.target}
            {...item}
            active={activeTarget === item.target}
          />
        ))}
      </nav>
    </aside>
  );
}

export function MobileNavigation() {
  const activeTarget = useActiveTarget();

  return (
    <header className="sticky top-0 z-40 border-b border-[var(--border)] bg-[var(--panel)]/96 px-4 py-3 backdrop-blur lg:hidden">
      <div className="mb-3 flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--foreground)]">
          <Image
            src={growEasyLogo}
            alt=""
            width={36}
            height={36}
            className="h-9 w-9 rounded-xl object-cover"
            priority
          />
        </div>
        <span className="font-[var(--font-heading)] text-2xl font-bold tracking-normal text-[var(--foreground)]">
          GrowEasy
        </span>
      </div>

      <nav className="flex gap-2 overflow-x-auto no-visible-scrollbar" aria-label="Primary">
        {navItems.map((item) => (
          <MobileNavItem
            key={item.target}
            {...item}
            active={activeTarget === item.target}
          />
        ))}
      </nav>
    </header>
  );
}

type NavItem = {
  label: string;
  icon: LucideIcon;
  target: string;
};

type NavItemProps = NavItem & {
  active: boolean;
};

function SidebarItem({ label, icon: Icon, target, active }: NavItemProps) {
  return (
    <a
      href={`#${target}`}
      aria-label={label}
      aria-current={active ? "page" : undefined}
      title={label}
      className={cn(
        "group relative flex h-11 w-11 items-center justify-center rounded-lg text-sm font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus)] focus-visible:ring-offset-2",
        active
          ? "bg-white/10 text-white shadow-sm"
          : "text-[var(--rail-ink)] hover:bg-white/10 hover:text-white"
      )}
    >
      <Icon className="h-5 w-5 shrink-0" aria-hidden="true" />
      <span className="pointer-events-none absolute left-[3.25rem] z-20 hidden whitespace-nowrap rounded-lg border border-[var(--border)] bg-[var(--panel)] px-3 py-2 text-xs font-bold text-[var(--foreground)] shadow-[var(--shadow-soft)] group-hover:block">
        {label}
      </span>
    </a>
  );
}

function MobileNavItem({ label, icon: Icon, target, active }: NavItemProps) {
  return (
    <a
      href={`#${target}`}
      aria-current={active ? "page" : undefined}
      className={cn(
        "flex h-10 shrink-0 items-center gap-2 rounded-lg border px-3 text-sm font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus)] focus-visible:ring-offset-2",
        active
          ? "border-[var(--teal)] bg-[var(--teal)] text-white"
          : "border-[var(--border-soft)] bg-[var(--panel)] text-[var(--muted-strong)]"
      )}
    >
      <Icon className="h-4 w-4" aria-hidden="true" />
      {label}
    </a>
  );
}

function useActiveTarget() {
  const [activeTarget, setActiveTarget] = useState(navItems[0]?.target ?? "");

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

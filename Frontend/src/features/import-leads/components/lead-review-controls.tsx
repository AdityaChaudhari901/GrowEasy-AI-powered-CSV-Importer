"use client";

import {
  CalendarDays,
  Check,
  ChevronDown,
  Filter,
  MapPin,
  Search,
  SlidersHorizontal,
  X
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type {
  LeadRecordFilterKey,
  LeadRecordFilterOptions,
  LeadRecordFilters
} from "../utils/lead-record-filters";

type LeadReviewControlsProps = {
  searchQuery: string;
  filters: LeadRecordFilters;
  filterOptions: LeadRecordFilterOptions;
  totalCount: number;
  filteredCount: number;
  activeFilterCount: number;
  onSearchChange: (value: string) => void;
  onFilterChange: (key: LeadRecordFilterKey, value: string) => void;
  onClearFilters: () => void;
};

type SelectFilterKey = Extract<
  LeadRecordFilterKey,
  "city" | "state" | "country" | "crmStatus"
>;

const selectFilters: Array<{
  key: SelectFilterKey;
  label: string;
  defaultLabel: string;
}> = [
  { key: "city", label: "City", defaultLabel: "Any city" },
  { key: "state", label: "State", defaultLabel: "Any state" },
  { key: "country", label: "Country", defaultLabel: "Any country" },
  { key: "crmStatus", label: "CRM Status", defaultLabel: "Any status" }
];

const crmStatusLabels: Record<string, string> = {
  GOOD_LEAD_FOLLOW_UP: "Good lead follow up",
  DID_NOT_CONNECT: "Did not connect",
  BAD_LEAD: "Bad lead",
  SALE_DONE: "Sale done"
};

const numberFormatter = new Intl.NumberFormat("en-IN");

export function LeadReviewControls({
  searchQuery,
  filters,
  filterOptions,
  totalCount,
  filteredCount,
  activeFilterCount,
  onSearchChange,
  onFilterChange,
  onClearFilters
}: LeadReviewControlsProps) {
  const [openFilter, setOpenFilter] = useState<SelectFilterKey | null>(null);
  const isFiltered = activeFilterCount > 0;

  return (
    <section
      aria-label="Search and filter imported leads"
      className="mb-5 rounded-2xl border border-[var(--border)] bg-[var(--panel)] p-3 shadow-sm sm:p-4"
    >
      <div className="flex flex-col gap-3 xl:flex-row xl:items-start xl:justify-between">
        <div className="min-w-0 flex-1">
          <div className="relative">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--teal-strong)]"
              aria-hidden="true"
            />
            <input
              aria-label="Search imported leads"
              className="h-11 w-full rounded-xl border border-[var(--border)] bg-[var(--panel-inset)] pl-10 pr-10 text-sm font-semibold text-[var(--foreground)] outline-none transition-colors placeholder:text-[var(--muted-soft)] focus:border-[var(--teal)] focus:ring-2 focus:ring-[var(--teal-soft)]"
              onChange={(event) => onSearchChange(event.target.value)}
              placeholder="Search name, email, phone, company, owner, note..."
              value={searchQuery}
            />
            {searchQuery ? (
              <button
                type="button"
                aria-label="Clear lead search"
                className="absolute right-2 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-lg text-[var(--muted)] transition-colors hover:bg-[var(--panel-muted)] hover:text-[var(--foreground)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus)]"
                onClick={() => onSearchChange("")}
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            ) : null}
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <div className="flex h-11 items-center gap-2 rounded-xl border border-[var(--border-soft)] bg-[var(--surface-wash)] px-3 text-xs font-bold text-[var(--muted-strong)]">
            <Filter className="h-4 w-4 text-[var(--teal-strong)]" aria-hidden="true" />
            <span>
              {numberFormatter.format(filteredCount)} of{" "}
              {numberFormatter.format(totalCount)}
            </span>
          </div>
          {isFiltered ? (
            <Button
              variant="outline"
              size="sm"
              className="h-11 rounded-xl"
              onClick={() => {
                setOpenFilter(null);
                onClearFilters();
              }}
            >
              <X className="h-4 w-4" aria-hidden="true" />
              Clear
            </Button>
          ) : null}
        </div>
      </div>

      <div className="mt-3 grid gap-2 md:grid-cols-2 xl:grid-cols-[1.05fr_1fr_1fr_1fr_1.15fr]">
        <DateFilterField
          value={filters.date}
          onChange={(value) => onFilterChange("date", value)}
        />
        {selectFilters.map((filter) => (
          <FilterMenu
            key={filter.key}
            filterKey={filter.key}
            label={filter.label}
            defaultLabel={filter.defaultLabel}
            options={filterOptions[filter.key]}
            value={filters[filter.key]}
            isOpen={openFilter === filter.key}
            onOpenChange={(nextOpen) =>
              setOpenFilter(nextOpen ? filter.key : null)
            }
            onChange={(value) => onFilterChange(filter.key, value)}
          />
        ))}
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2 text-xs font-semibold text-[var(--muted)]">
        <SlidersHorizontal className="h-4 w-4 text-[var(--teal-strong)]" aria-hidden="true" />
        <span>
          {isFiltered
            ? `${activeFilterCount} active filter${activeFilterCount === 1 ? "" : "s"} applied`
            : "Search and filters apply to imported CRM records only"}
        </span>
      </div>
    </section>
  );
}

function DateFilterField({
  value,
  onChange
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="group block">
      <span className="mb-1.5 flex items-center gap-1.5 font-[var(--font-mono)] text-[10px] font-semibold uppercase tracking-[0.08em] text-[var(--muted)]">
        <CalendarDays className="h-3.5 w-3.5" aria-hidden="true" />
        Date
      </span>
      <input
        aria-label="Filter by created date"
        className="h-11 w-full rounded-xl border border-[var(--border)] bg-[var(--panel-inset)] px-3 text-sm font-semibold text-[var(--foreground)] outline-none transition-colors placeholder:text-[var(--muted-soft)] focus:border-[var(--teal)] focus:ring-2 focus:ring-[var(--teal-soft)]"
        inputMode="numeric"
        onChange={(event) => onChange(event.target.value)}
        placeholder="YYYY-MM-DD"
        value={value}
      />
    </label>
  );
}

function FilterMenu({
  filterKey,
  label,
  defaultLabel,
  options,
  value,
  isOpen,
  onOpenChange,
  onChange
}: {
  filterKey: SelectFilterKey;
  label: string;
  defaultLabel: string;
  options: string[];
  value: string;
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onChange: (value: string) => void;
}) {
  const displayValue = value ? formatFilterValue(filterKey, value) : defaultLabel;

  return (
    <div className="relative">
      <p className="mb-1.5 flex items-center gap-1.5 font-[var(--font-mono)] text-[10px] font-semibold uppercase tracking-[0.08em] text-[var(--muted)]">
        <MapPin className="h-3.5 w-3.5" aria-hidden="true" />
        {label}
      </p>
      <button
        type="button"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-label={`${label} filter`}
        className={cn(
          "flex h-11 w-full items-center justify-between gap-2 rounded-xl border px-3 text-left text-sm font-semibold outline-none transition-colors focus-visible:ring-2 focus-visible:ring-[var(--focus)]",
          value
            ? "border-[var(--teal)] bg-[var(--teal-faint)] text-[var(--teal-strong)]"
            : "border-[var(--border)] bg-[var(--panel-inset)] text-[var(--foreground)] hover:border-[var(--border-strong)]"
        )}
        onClick={() => onOpenChange(!isOpen)}
      >
        <span className="truncate">{displayValue}</span>
        <ChevronDown
          className={cn(
            "h-4 w-4 shrink-0 text-[var(--muted)] transition-transform",
            isOpen ? "rotate-180" : ""
          )}
          aria-hidden="true"
        />
      </button>
      {isOpen ? (
        <div
          role="listbox"
          aria-label={`${label} filter options`}
          className="no-visible-scrollbar absolute left-0 right-0 top-[calc(100%+6px)] z-20 max-h-60 overflow-y-auto rounded-xl border border-[var(--border)] bg-[var(--panel)] p-1.5 shadow-[var(--shadow-soft)]"
        >
          <FilterOption
            isSelected={!value}
            label={defaultLabel}
            onSelect={() => {
              onChange("");
              onOpenChange(false);
            }}
          />
          {options.map((option) => (
            <FilterOption
              key={option}
              isSelected={value === option}
              label={formatFilterValue(filterKey, option)}
              onSelect={() => {
                onChange(option);
                onOpenChange(false);
              }}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}

function FilterOption({
  isSelected,
  label,
  onSelect
}: {
  isSelected: boolean;
  label: string;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      role="option"
      aria-selected={isSelected}
      className={cn(
        "flex min-h-9 w-full items-center justify-between gap-2 rounded-lg px-2.5 text-left text-sm font-semibold transition-colors",
        isSelected
          ? "bg-[var(--teal-faint)] text-[var(--teal-strong)]"
          : "text-[var(--muted-strong)] hover:bg-[var(--panel-muted)] hover:text-[var(--foreground)]"
      )}
      onClick={onSelect}
    >
      <span className="truncate">{label}</span>
      {isSelected ? <Check className="h-4 w-4 shrink-0" aria-hidden="true" /> : null}
    </button>
  );
}

function formatFilterValue(filterKey: SelectFilterKey, value: string) {
  if (filterKey === "crmStatus") {
    return crmStatusLabels[value] ?? value.split("_").join(" ").toLowerCase();
  }

  return value;
}

"use client";

import type { CrmLeadRecord } from "@groweasy/shared";
import {
  Building2,
  CalendarDays,
  Database,
  FileText,
  Mail,
  MapPin,
  Phone,
  StickyNote,
  UserRound,
  X,
  type LucideIcon
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type LeadDetailPanelProps = {
  lead: CrmLeadRecord;
  onClose: () => void;
};

type DetailTab = "overview" | "contact" | "crm";

const detailTabs: Array<{ id: DetailTab; label: string }> = [
  { id: "overview", label: "Overview" },
  { id: "contact", label: "Contact" },
  { id: "crm", label: "CRM" }
];

const statusTone = (status: CrmLeadRecord["crm_status"]) => {
  if (status === "SALE_DONE") {
    return "info";
  }
  if (status === "GOOD_LEAD_FOLLOW_UP") {
    return "success";
  }
  if (status === "BAD_LEAD") {
    return "danger";
  }
  return "neutral";
};

const formatLabel = (value: string) => value.replaceAll("_", " ");

const formatDate = (value: string) => {
  if (!value) {
    return "-";
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(parsed);
};

const getInitials = (name: string) => {
  const parts = name
    .split(" ")
    .map((part) => part.trim())
    .filter(Boolean);

  if (parts.length === 0) {
    return "GE";
  }

  return parts
    .slice(0, 2)
    .map((part) => part[0] ?? "")
    .join("")
    .toUpperCase();
};

export function LeadDetailPanel({ lead, onClose }: LeadDetailPanelProps) {
  const [activeTab, setActiveTab] = useState<DetailTab>("overview");
  const tabPanelId = `lead-detail-${activeTab}`;
  const contactNumber = [lead.country_code, lead.mobile_without_country_code]
    .filter(Boolean)
    .join(" ");

  const location = useMemo(
    () =>
      [lead.city, lead.state, lead.country]
        .map((item) => item.trim())
        .filter(Boolean)
        .join(", "),
    [lead.city, lead.country, lead.state]
  );

  useEffect(() => {
    setActiveTab("overview");
  }, [lead.email, lead.mobile_without_country_code, lead.name]);

  return (
    <aside className="rounded-[1.75rem] border border-[var(--border)] bg-[var(--panel)] p-4 xl:sticky xl:top-6">
      <div className="flex items-start justify-between gap-4">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-[var(--border)] bg-[var(--teal-faint)] text-sm font-extrabold text-[var(--teal-strong)]">
            {getInitials(lead.name)}
          </div>
          <div className="min-w-0">
            <h3 className="truncate text-lg font-extrabold text-[var(--foreground)]">
              {lead.name || "Unnamed lead"}
            </h3>
            <p className="truncate text-sm font-semibold text-[var(--muted)]">
              {lead.company || "No company"}
            </p>
          </div>
        </div>
        <Button
          aria-label="Close lead details"
          size="icon"
          variant="ghost"
          onClick={onClose}
          className="shrink-0"
        >
          <X className="h-5 w-5" aria-hidden="true" />
        </Button>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <Badge tone={statusTone(lead.crm_status)}>
          {formatLabel(lead.crm_status)}
        </Badge>
        {lead.data_source ? (
          <Badge tone="neutral">{formatLabel(lead.data_source)}</Badge>
        ) : null}
      </div>

      <div className="mt-5 rounded-2xl border border-[var(--border-soft)] bg-[var(--panel-inset)] p-1">
        <div
          aria-label="Lead detail sections"
          className="flex gap-1 overflow-x-auto no-visible-scrollbar"
          role="tablist"
        >
          {detailTabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                aria-controls={`lead-detail-${tab.id}`}
                aria-selected={isActive}
                className={cn(
                  "h-10 flex-1 rounded-xl px-3 text-sm font-extrabold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus)] focus-visible:ring-offset-2",
                  isActive
                    ? "border border-[var(--border)] bg-[var(--panel)] text-[var(--foreground)]"
                    : "text-[var(--muted)] hover:text-[var(--foreground)]"
                )}
                id={`lead-detail-tab-${tab.id}`}
                onClick={() => setActiveTab(tab.id)}
                role="tab"
                type="button"
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      <div
        aria-labelledby={`lead-detail-tab-${activeTab}`}
        className="mt-5"
        id={tabPanelId}
        role="tabpanel"
      >
        {activeTab === "overview" ? (
          <div className="space-y-3">
            <DetailRow icon={CalendarDays} label="Created" value={formatDate(lead.created_at)} />
            <DetailRow icon={UserRound} label="Owner" value={lead.lead_owner || "-"} />
            <DetailRow icon={MapPin} label="Location" value={location || "-"} />
            <DetailRow
              icon={Database}
              label="Source"
              value={lead.data_source ? formatLabel(lead.data_source) : "-"}
            />
          </div>
        ) : null}

        {activeTab === "contact" ? (
          <div className="space-y-3">
            <DetailRow icon={Mail} label="Email" value={lead.email || "-"} />
            <DetailRow icon={Phone} label="Phone" value={contactNumber || "-"} />
            <DetailRow icon={Building2} label="Company" value={lead.company || "-"} />
            <DetailRow
              icon={MapPin}
              label="Country"
              value={lead.country || "-"}
            />
          </div>
        ) : null}

        {activeTab === "crm" ? (
          <div className="space-y-3">
            <DetailRow
              icon={StickyNote}
              label="CRM note"
              value={lead.crm_note || "-"}
              multiline
            />
            <DetailRow
              icon={FileText}
              label="Description"
              value={lead.description || "-"}
              multiline
            />
            <DetailRow
              icon={CalendarDays}
              label="Possession"
              value={lead.possession_time || "-"}
            />
          </div>
        ) : null}
      </div>
    </aside>
  );
}

type DetailRowProps = {
  icon: LucideIcon;
  label: string;
  value: string;
  multiline?: boolean;
};

function DetailRow({ icon: Icon, label, value, multiline = false }: DetailRowProps) {
  return (
    <div className="rounded-2xl border border-[var(--border-soft)] bg-[var(--panel)] p-3">
      <div className="flex items-start gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[var(--panel-muted)] text-[var(--teal-strong)]">
          <Icon className="h-4 w-4" aria-hidden="true" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-extrabold uppercase text-[var(--muted-soft)]">
            {label}
          </p>
          <p
            className={cn(
              "mt-1 text-sm font-semibold leading-6 text-[var(--foreground)]",
              multiline ? "whitespace-pre-wrap" : "truncate"
            )}
          >
            {value}
          </p>
        </div>
      </div>
    </div>
  );
}

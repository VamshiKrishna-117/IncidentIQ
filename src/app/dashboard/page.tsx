"use client";

import { useState, useMemo } from "react";
import { useIncidents } from "@/hooks/use-incidents";
import { useRealtimeIncidents } from "@/hooks/use-supabase-realtime";
import { LoadingPage } from "@/components/shared/loading-state";
import { ErrorState } from "@/components/shared/error-state";
import { EmptyState } from "@/components/shared/empty-state";
import { StatusBadge } from "@/components/incidents/status-badge";
import { PriorityBadge } from "@/components/incidents/priority-badge";
import { formatTimestamp } from "@/lib/utils";
import { AlertTriangle, Plus, Search, X, Filter } from "lucide-react";
import Link from "next/link";
import { useUIStore } from "@/stores/ui-store";
import { Button } from "@/components/ui/button";
import type { Priority, Status } from "@/types";
import { cn } from "@/lib/utils";

const PRIORITIES: Priority[] = ["P0", "P1", "P2", "P3"];
const STATUSES: Status[] = ["OPEN", "INVESTIGATING", "IDENTIFIED", "MONITORING", "RESOLVED"];

function FilterBtn({ active, label, onClick }: { active: boolean; label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "cursor-pointer whitespace-nowrap rounded-md px-2.5 py-1 text-xs font-medium transition-colors",
        active
          ? "bg-primary text-on-primary shadow-sm"
          : "border border-border text-on-surface-variant hover:bg-white/5 hover:text-on-surface"
      )}
    >
      {label}
    </button>
  );
}

export default function IncidentsPage() {
  const { data: incidents, isLoading, error, refetch } = useIncidents();
  const { setCreateIncidentOpen } = useUIStore();
  useRealtimeIncidents();

  const [search, setSearch] = useState("");
  const [filterPriority, setFilterPriority] = useState<Priority | "ALL">("ALL");
  const [filterStatus, setFilterStatus] = useState<Status | "ALL">("ALL");

  const filtered = useMemo(() => {
    if (!incidents) return [];
    const q = search.toLowerCase().trim();
    return incidents.filter((i) => {
      const matchesSearch = !q
        || i.display_id.toLowerCase().includes(q)
        || i.title.toLowerCase().includes(q)
        || (i.service_affected?.toLowerCase() ?? "").includes(q)
        || i.reporter_name.toLowerCase().includes(q);
      const matchesPriority = filterPriority === "ALL" || i.priority === filterPriority;
      const matchesStatus = filterStatus === "ALL" || i.status === filterStatus;
      return matchesSearch && matchesPriority && matchesStatus;
    });
  }, [incidents, search, filterPriority, filterStatus]);

  if (isLoading) return <LoadingPage />;
  if (error) {
    return (
      <div className="p-4 md:p-6">
        <ErrorState type="error" title="Failed to load incidents" description="Unable to connect to the backend." action={{ label: "Retry", onClick: () => refetch() }} />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-lg font-semibold text-on-surface">Active Incidents</h1>
          <p className="text-sm text-on-surface-variant">All reported incidents across the infrastructure.</p>
        </div>
        <Button variant="primary" size="sm" onClick={() => setCreateIncidentOpen(true)}>
          <Plus className="h-4 w-4" />
          Create Incident
        </Button>
      </div>

      <div className="mb-4 space-y-3">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-on-surface-variant" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by ID, title, service, or reporter..."
            className="w-full rounded-lg border border-border bg-[#050505] py-2 pl-9 pr-8 text-sm text-on-surface placeholder:text-on-surface-variant/50 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/30"
            aria-label="Search incidents"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface cursor-pointer"
              aria-label="Clear search"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Filter className="h-4 w-4 text-on-surface-variant shrink-0" />

          <div className="flex items-center gap-1 overflow-x-auto pb-0.5">
            <span className="mr-0.5 text-xs font-medium text-on-surface-variant shrink-0">Priority:</span>
            <FilterBtn active={filterPriority === "ALL"} label="All" onClick={() => setFilterPriority("ALL")} />
            {PRIORITIES.map((p) => (
              <FilterBtn key={p} active={filterPriority === p} label={p} onClick={() => setFilterPriority(p)} />
            ))}
          </div>

          <span className="hidden sm:inline text-on-surface-variant">|</span>

          <div className="flex items-center gap-1 overflow-x-auto pb-0.5">
            <span className="mr-0.5 text-xs font-medium text-on-surface-variant shrink-0">Status:</span>
            <FilterBtn active={filterStatus === "ALL"} label="All" onClick={() => setFilterStatus("ALL")} />
            {STATUSES.map((s) => (
              <FilterBtn
                key={s}
                active={filterStatus === s}
                label={s === "INVESTIGATING" ? "Invest." : s.charAt(0) + s.slice(1).toLowerCase()}
                onClick={() => setFilterStatus(s)}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="-mx-4 md:mx-0 overflow-x-auto rounded-none md:rounded-xl border-0 md:border border-border">
        <table className="w-full min-w-[640px]">
          <thead>
            <tr className="border-b border-border bg-surface-container-low text-xs text-on-surface-variant">
              <th className="px-4 py-3 text-left font-medium">Incident</th>
              <th className="px-4 py-3 text-left font-medium">Status</th>
              <th className="px-4 py-3 text-left font-medium">Priority</th>
              <th className="px-4 py-3 text-left font-medium">Service</th>
              <th className="px-4 py-3 text-left font-medium">Reporter</th>
              <th className="px-4 py-3 text-left font-medium">Assignee</th>
              <th className="px-4 py-3 text-left font-medium">Created</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length > 0 ? filtered.map((incident) => (
              <tr key={incident.id} className="border-b border-border transition-colors hover:bg-white/[0.02]">
                <td className="px-4 py-3">
                  <Link href={`/incidents/${incident.id}`} className="text-sm font-medium text-on-surface hover:text-primary transition-colors">
                    {incident.display_id}: {incident.title}
                  </Link>
                </td>
                <td className="px-4 py-3"><StatusBadge status={incident.status} /></td>
                <td className="px-4 py-3"><PriorityBadge priority={incident.priority} /></td>
                <td className="px-4 py-3 text-sm text-on-surface-variant max-w-[120px] truncate">{incident.service_affected ?? "—"}</td>
                <td className="px-4 py-3 text-sm text-on-surface-variant whitespace-nowrap">{incident.reporter_name}</td>
                <td className="px-4 py-3 text-sm text-on-surface-variant">{incident.assignee ?? "—"}</td>
                <td className="px-4 py-3 text-xs text-on-surface-variant whitespace-nowrap">{formatTimestamp(incident.created_at)}</td>
              </tr>
            )) : (
              <tr>
                <td colSpan={7} className="px-4 py-16 text-center">
                  <div className="flex flex-col items-center">
                    <AlertTriangle className="mb-2 h-6 w-6 text-on-surface-variant" />
                    <p className="text-sm text-on-surface">No Matching Incidents</p>
                    <p className="text-xs text-on-surface-variant mt-1">
                      {search || filterPriority !== "ALL" || filterStatus !== "ALL"
                        ? "Try adjusting your search or filters."
                        : "No incidents have been reported. Systems are healthy."}
                    </p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <p className="mt-2 text-xs text-on-surface-variant">
        Showing {filtered.length} of {incidents?.length ?? 0} incident{(incidents?.length ?? 0) !== 1 ? "s" : ""}
      </p>
    </div>
  );
}

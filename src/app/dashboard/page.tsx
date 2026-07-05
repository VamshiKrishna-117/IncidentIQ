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
import { AlertTriangle, Plus, Search, X } from "lucide-react";
import Link from "next/link";
import { useUIStore } from "@/stores/ui-store";
import { Button } from "@/components/ui/button";
import type { Priority, Status } from "@/types";

const PRIORITIES: Priority[] = ["P0", "P1", "P2", "P3"];
const STATUSES: Status[] = ["OPEN", "INVESTIGATING", "IDENTIFIED", "MONITORING", "RESOLVED"];

export default function IncidentsPage() {
  const { data: incidents, isLoading, error, refetch } = useIncidents();
  const { setCreateIncidentOpen } = useUIStore();
  useRealtimeIncidents();

  const [search, setSearch] = useState("");
  const [filterPriority, setFilterPriority] = useState<Priority | "ALL">("ALL");
  const [filterStatus, setFilterStatus] = useState<Status | "ALL">("ALL");

  const filtered = useMemo(() => {
    if (!incidents) return [];
    const q = search.toLowerCase();
    return incidents.filter((i) => {
      const matchesSearch = !q || i.display_id.toLowerCase().includes(q) || i.title.toLowerCase().includes(q) || (i.service_affected?.toLowerCase() ?? "").includes(q) || i.reporter_name.toLowerCase().includes(q);
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

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-xs">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-on-surface-variant" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search incidents..."
            className="w-full rounded-lg border border-border bg-[#050505] py-1.5 pl-9 pr-8 text-sm text-on-surface placeholder:text-on-surface-variant/50 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/30"
            aria-label="Search incidents"
          />
          {search && (
            <button onClick={() => setSearch("")} className="absolute right-2 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface">
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-xs text-on-surface-variant">Priority:</span>
          {["ALL", ...PRIORITIES].map((p) => (
            <button
              key={p}
              onClick={() => setFilterPriority(p as Priority | "ALL")}
              className={`rounded-md px-2 py-1 text-xs font-medium transition-colors ${
                filterPriority === p ? "bg-primary text-on-primary" : "border border-border text-on-surface-variant hover:bg-white/5"
              }`}
            >
              {p === "ALL" ? "All" : p}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-xs text-on-surface-variant">Status:</span>
          {["ALL", ...STATUSES].map((s) => (
            <button
              key={s}
              onClick={() => setFilterStatus(s as Status | "ALL")}
              className={`rounded-md px-2 py-1 text-xs font-medium transition-colors ${
                filterStatus === s ? "bg-primary text-on-primary" : "border border-border text-on-surface-variant hover:bg-white/5"
              }`}
            >
              {s === "ALL" ? "All" : s === "INVESTIGATING" ? "Invest." : s.charAt(0) + s.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border border-border">
        <table className="w-full">
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
                <td className="px-4 py-3 text-sm text-on-surface-variant">{incident.service_affected ?? "—"}</td>
                <td className="px-4 py-3 text-sm text-on-surface-variant">{incident.reporter_name}</td>
                <td className="px-4 py-3 text-sm text-on-surface-variant">{incident.assignee ?? "Unassigned"}</td>
                <td className="px-4 py-3 text-xs text-on-surface-variant whitespace-nowrap">{formatTimestamp(incident.created_at)}</td>
              </tr>
            )) : (
              <tr>
                <td colSpan={7} className="px-4 py-12">
                  <EmptyState icon={AlertTriangle} title="No Matching Incidents" description={search || filterPriority !== "ALL" || filterStatus !== "ALL" ? "Try adjusting your search or filters." : "No incidents have been reported."} />
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <p className="mt-2 text-xs text-on-surface-variant">
        Showing {filtered.length} of {incidents?.length ?? 0} incidents
      </p>
    </div>
  );
}

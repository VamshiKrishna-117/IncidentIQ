"use client";

import { useState } from "react";
import { useIncidents } from "@/hooks/use-incidents";
import { useRealtimeIncidents } from "@/hooks/use-supabase-realtime";
import { StatusBadge } from "./status-badge";
import { PriorityBadge } from "./priority-badge";
import { formatTimestamp } from "@/lib/utils";
import { Search, Filter, AlertTriangle } from "lucide-react";
import Link from "next/link";
import { EmptyState } from "@/components/shared/empty-state";
import { LoadingTable } from "@/components/shared/loading-state";
import type { Incident } from "@/types";

export function IncidentTable() {
  const { data: incidents, isLoading, error } = useIncidents();
  useRealtimeIncidents();
  const [search, setSearch] = useState("");

  const filtered = incidents?.filter(
    (i) =>
      i.title.toLowerCase().includes(search.toLowerCase()) ||
      i.display_id.toLowerCase().includes(search.toLowerCase()) ||
      i.reporter_name.toLowerCase().includes(search.toLowerCase())
  );

  if (isLoading) return <LoadingTable rows={5} />;

  if (error) {
    return (
      <EmptyState
        icon={AlertTriangle}
        title="Failed to load incidents"
        description="Unable to connect to the backend. Please try again."
      />
    );
  }

  if (!incidents || incidents.length === 0) {
    return (
      <EmptyState
        icon={AlertTriangle}
        title="No Active Incidents"
        description="Systems are healthy. AI monitoring is active and analyzing telemetry data across all infrastructure nodes."
        action={
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-lg border border-border bg-transparent px-4 py-2 text-sm font-medium text-on-surface hover:bg-white/5 transition-colors"
          >
            Run Diagnostics
          </Link>
        }
      />
    );
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-on-surface-variant" />
          <input
            className="w-full rounded-lg border border-border bg-[#050505] py-1.5 pl-9 pr-3 text-sm text-on-surface placeholder:text-on-surface-variant/50 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/30"
            placeholder="Search incidents..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <button className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs text-on-surface-variant hover:bg-white/5 transition-colors">
          <Filter className="h-3.5 w-3.5" />
          Filter
        </button>
      </div>

      <div className="overflow-x-auto rounded-xl border border-border">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-surface-container-low">
              <th className="px-4 py-3 text-left text-xs font-medium text-on-surface-variant">Incident</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-on-surface-variant">Status</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-on-surface-variant">Priority</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-on-surface-variant">Reporter</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-on-surface-variant">Created</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-on-surface-variant">Latest Update</th>
            </tr>
          </thead>
          <tbody>
            {(filtered ?? incidents).map((incident) => (
              <tr
                key={incident.id}
                className="border-b border-border transition-colors hover:bg-white/[0.02]"
              >
                <td className="px-4 py-3">
                  <Link
                    href={`/incidents/${incident.id}`}
                    className="text-sm font-medium text-on-surface hover:text-primary transition-colors"
                  >
                    {incident.display_id}: {incident.title}
                  </Link>
                  {incident.service_affected && (
                    <p className="text-xs text-on-surface-variant mt-0.5">
                      {incident.service_affected}
                    </p>
                  )}
                </td>
                <td className="px-4 py-3">
                  <StatusBadge status={incident.status} />
                </td>
                <td className="px-4 py-3">
                  <PriorityBadge priority={incident.priority} />
                </td>
                <td className="px-4 py-3 text-sm text-on-surface-variant">
                  @{incident.reporter_name.toLowerCase().replace(/\s+/g, "")}
                </td>
                <td className="px-4 py-3 text-xs text-on-surface-variant whitespace-nowrap">
                  {formatTimestamp(incident.created_at)}
                </td>
                <td className="px-4 py-3 text-xs text-on-surface-variant max-w-[200px] truncate">
                  {incident.latest_update ?? "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

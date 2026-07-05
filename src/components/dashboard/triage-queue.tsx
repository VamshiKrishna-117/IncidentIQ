"use client";

import type { Incident } from "@/types";
import { StatusBadge } from "@/components/incidents/status-badge";
import { PriorityBadge } from "@/components/incidents/priority-badge";
import { formatTimestamp } from "@/lib/utils";
import { AlertTriangle, Filter } from "lucide-react";
import Link from "next/link";
import { EmptyState } from "@/components/shared/empty-state";
import { LoadingTable } from "@/components/shared/loading-state";

interface TriageQueueProps {
  incidents: Incident[] | undefined;
  loading: boolean;
}

export function TriageQueue({ incidents, loading }: TriageQueueProps) {
  if (loading) return <LoadingTable rows={4} />;

  if (!incidents || incidents.length === 0) {
    return (
      <EmptyState
        icon={AlertTriangle}
        title="No Active Incidents"
        description="Systems are healthy. AI monitoring is active and analyzing telemetry data across all infrastructure nodes."
      />
    );
  }

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-on-surface">Live Triage Queue</h2>
        <button className="flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs text-on-surface-variant hover:bg-white/5 transition-colors">
          <Filter className="h-3.5 w-3.5" />
          Filter
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border text-xs text-on-surface-variant">
              <th className="px-3 py-2 text-left font-medium">Incident</th>
              <th className="px-3 py-2 text-left font-medium">Status</th>
              <th className="px-3 py-2 text-left font-medium">Priority</th>
              <th className="px-3 py-2 text-left font-medium">Reporter</th>
              <th className="px-3 py-2 text-left font-medium">Time</th>
            </tr>
          </thead>
          <tbody>
            {incidents.map((incident) => (
              <tr
                key={incident.id}
                className="border-b border-border transition-colors hover:bg-white/[0.02]"
              >
                <td className="px-3 py-2.5">
                  <Link
                    href={`/incidents/${incident.id}`}
                    className="text-sm font-medium text-on-surface hover:text-primary transition-colors"
                  >
                    {incident.display_id}: {incident.title}
                  </Link>
                  {incident.service_affected && (
                    <p className="text-xs text-on-surface-variant">
                      {incident.service_affected}
                    </p>
                  )}
                </td>
                <td className="px-3 py-2.5">
                  <StatusBadge status={incident.status} />
                </td>
                <td className="px-3 py-2.5">
                  <PriorityBadge priority={incident.priority} />
                </td>
                <td className="px-3 py-2.5 text-sm text-on-surface-variant">
                  @{incident.reporter_name.toLowerCase().replace(/\s+/g, "")}
                </td>
                <td className="px-3 py-2.5 text-xs text-on-surface-variant whitespace-nowrap">
                  {formatTimestamp(incident.created_at)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

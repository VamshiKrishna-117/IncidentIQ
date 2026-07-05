"use client";

import { useIncidents } from "@/hooks/use-incidents";
import { useRealtimeIncidents } from "@/hooks/use-supabase-realtime";
import { LoadingPage } from "@/components/shared/loading-state";
import { ErrorState } from "@/components/shared/error-state";
import { EmptyState } from "@/components/shared/empty-state";
import { StatusBadge } from "@/components/incidents/status-badge";
import { PriorityBadge } from "@/components/incidents/priority-badge";
import { formatTimestamp } from "@/lib/utils";
import { AlertTriangle, Filter, Plus } from "lucide-react";
import Link from "next/link";
import { useUIStore } from "@/stores/ui-store";
import { Button } from "@/components/ui/button";

export default function IncidentsPage() {
  const { data: incidents, isLoading, error, refetch } = useIncidents();
  const { setCreateIncidentOpen } = useUIStore();
  useRealtimeIncidents();

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
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-on-surface">Active Incidents</h1>
          <p className="text-sm text-on-surface-variant">All reported incidents across the infrastructure.</p>
        </div>
        <Button variant="primary" size="sm" onClick={() => setCreateIncidentOpen(true)}>
          <Plus className="h-4 w-4" />
          Create Incident
        </Button>
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
            {incidents && incidents.length > 0 ? incidents.map((incident) => (
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
                  <EmptyState icon={AlertTriangle} title="No Incidents" description="No incidents have been reported. Systems are healthy." />
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

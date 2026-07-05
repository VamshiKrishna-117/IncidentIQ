"use client";

import { useIncidents } from "@/hooks/use-incidents";
import { useRealtimeIncidents } from "@/hooks/use-supabase-realtime";
import { KPICard } from "@/components/dashboard/kpi-card";
import { TriageQueue } from "@/components/dashboard/triage-queue";
import { LiveFeed } from "@/components/dashboard/live-feed";
import { LoadingPage } from "@/components/shared/loading-state";
import { ErrorState } from "@/components/shared/error-state";
import {
  AlertTriangle,
  Activity,
  CheckCircle,
  Database,
} from "lucide-react";
import { useState } from "react";

export default function DashboardPage() {
  const { data: incidents, isLoading, error, refetch } = useIncidents();
  useRealtimeIncidents();

  if (isLoading) return <LoadingPage />;
  if (error) {
    return (
      <ErrorState
        type="error"
        title="Failed to load incidents"
        description="Unable to connect to the backend. Please try again."
        action={{ label: "Retry", onClick: () => refetch() }}
      />
    );
  }

  const activeIncidents = incidents?.filter((i) => i.status !== "RESOLVED") ?? [];
  const investigating = incidents?.filter((i) => i.status === "INVESTIGATING") ?? [];
  const resolvedToday = incidents?.filter((i) => i.status === "RESOLVED") ?? [];
  const critical = incidents?.filter((i) => i.priority === "P0") ?? [];

  return (
    <div className="p-4 md:p-6">
      <div className="mb-4 flex items-center gap-2 text-xs text-on-surface-variant">
        <span className="font-medium text-green-400">Prod Cluster Active</span>
        <span>|</span>
        <span>Last updated: Just now</span>
      </div>

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KPICard
          icon={AlertTriangle}
          label="Active Incidents"
          value={String(activeIncidents.length)}
          trend={{ value: "3", direction: "up" }}
        />
        <KPICard
          icon={Activity}
          label="Investigating"
          value={String(investigating.length)}
        />
        <KPICard
          icon={CheckCircle}
          label="Resolved (24h)"
          value={String(resolvedToday.length)}
        />
        <KPICard
          icon={Database}
          label="Critical Today"
          value={String(critical.length)}
          trend={{ value: "1", direction: "up" }}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <TriageQueue incidents={incidents} loading={isLoading} />
        </div>
        <div className="space-y-6">
          <LiveFeed />
        </div>
      </div>
    </div>
  );
}

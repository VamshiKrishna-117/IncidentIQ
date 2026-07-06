"use client";

import { useIncidents } from "@/hooks/use-incidents";
import { useRealtimeIncidents } from "@/hooks/use-supabase-realtime";
import { KPICard } from "@/components/dashboard/kpi-card";
import { TriageQueue } from "@/components/dashboard/triage-queue";
import { LiveFeed } from "@/components/dashboard/live-feed";

import { Button } from "@/components/ui/button";
import { LoadingPage } from "@/components/shared/loading-state";
import { ErrorState } from "@/components/shared/error-state";
import { Download } from "lucide-react";
import { exportDashboardCSV } from "@/lib/export-csv";

export default function DashboardPage() {
  const { data: incidents, isLoading, error, refetch } = useIncidents();
  useRealtimeIncidents();

  if (isLoading) return <LoadingPage />;
  if (error) {
    return (
      <div className="p-4 md:p-6">
        <ErrorState
          type="error"
          title="Failed to load dashboard"
          description="Unable to connect to the backend."
          action={{ label: "Retry", onClick: () => refetch() }}
        />
      </div>
    );
  }

  const activeCount = incidents?.filter((i) => i.status !== "RESOLVED").length ?? 0;

  return (
    <div className="p-4">
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold tracking-tight text-on-surface">Operations Overview</h2>
          <p className="mt-0.5 text-xs text-on-surface-variant">Real-time system telemetry and incident triaging.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-[10px] text-on-surface-variant">
            <span className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-error animate-pulse" />
              Prod Cluster Active
            </span>
            <span className="mx-2 opacity-30">|</span>
            <span>Last updated: Just now</span>
          </div>
          <Button variant="secondary" size="sm" onClick={() =>
            exportDashboardCSV(
              incidents ?? [],
              [
                { label: "Active Incidents", value: String(activeCount) },
                { label: "Avg Latency (Global)", value: "42ms" },
                { label: "System Uptime", value: "99.99%" },
                { label: "Log Ingestion Rate", value: "1.2M/min" },
              ]
            )
          }>
            <Download className="h-4 w-4" />
            Export Report
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-3">
        <div className="col-span-12 grid grid-cols-4 gap-3">
          <KPICard
            icon="CircleAlert"
            label="Active Incidents"
            value={String(activeCount)}
            trend={{ value: `+${Math.max(0, activeCount - 2)}`, direction: "up" }}
            trendColor="error"
            glow
          />
          <KPICard
            icon="Gauge"
            label="Avg Latency (Global)"
            value="42"
            unit="ms"
            trend={{ value: "2ms", direction: "down" }}
            trendColor="success"
          />
          <KPICard
            icon="CheckCircle"
            label="System Uptime"
            value="99.99"
            unit="%"
          />
          <KPICard
            icon="Activity"
            label="Log Ingestion Rate"
            value="1.2M"
            sublabel="/ min"
            progress={65}
          />
        </div>

        <div className="col-span-12 grid grid-cols-12 gap-3">
          <div className="col-span-8">
            <TriageQueue incidents={incidents} loading={isLoading} />
          </div>
          <div className="col-span-4">
            <LiveFeed />
          </div>
        </div>
      </div>
    </div>
  );
}

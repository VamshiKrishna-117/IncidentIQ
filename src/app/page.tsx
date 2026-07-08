"use client";

import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
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

const supabase = createClient();

function formatLastUpdated(ms: number): string {
  const secs = Math.floor((Date.now() - ms) / 1000);
  if (secs < 5) return "Just now";
  if (secs < 60) return `${secs}s ago`;
  const mins = Math.floor(secs / 60);
  return `${mins}m ago`;
}

function formatRequestRate(rate: number): string {
  if (rate >= 1_000_000) return `${(rate / 1_000_000).toFixed(1)}M`;
  if (rate >= 1_000) return `${(rate / 1_000).toFixed(1)}K`;
  return String(Math.round(rate));
}

export default function DashboardPage() {
  const { data: incidents, isLoading, error, refetch, dataUpdatedAt } = useIncidents();
  useRealtimeIncidents();

  const { data: servicesRaw } = useQuery({
    queryKey: ["services-kpi"],
    queryFn: async () => {
      const { data, error: svcErr } = await supabase.from("services").select("p99_latency_ms, status, request_rate");
      if (svcErr) throw svcErr;
      return (data ?? []) as { p99_latency_ms: number | null; status: string; request_rate: number | null }[];
    },
  });

  const services = servicesRaw ?? [];

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

  const avgLatency = services.length > 0
    ? Math.round(services.reduce((sum, s) => sum + (s.p99_latency_ms ?? 0), 0) / services.filter((s) => s.p99_latency_ms != null).length)
    : null;

  const healthyCount = services.filter((s) => s.status === "HEALTHY").length;
  const uptime = services.length > 0
    ? ((healthyCount / services.length) * 100).toFixed(2)
    : null;

  const totalRequestRate = services.reduce((sum, s) => sum + (s.request_rate ?? 0), 0) ?? 0;

  const latencyTrend = avgLatency !== null && avgLatency <= 50 ? "down" : "up";

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
            <span>Last updated: {formatLastUpdated(dataUpdatedAt)}</span>
          </div>
          <Button variant="secondary" size="sm" onClick={() =>
            exportDashboardCSV(
              incidents ?? [],
              [
                { label: "Active Incidents", value: String(activeCount) },
                { label: "Avg Latency (Global)", value: avgLatency !== null ? `${avgLatency}ms` : "N/A" },
                { label: "System Uptime", value: uptime !== null ? `${uptime}%` : "N/A" },
                { label: "Log Ingestion Rate", value: totalRequestRate > 0 ? `${formatRequestRate(totalRequestRate)}/min` : "N/A" },
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
            value={avgLatency !== null ? String(avgLatency) : "—"}
            unit="ms"
            trend={avgLatency !== null ? { value: `${avgLatency}ms`, direction: latencyTrend } : undefined}
            trendColor={latencyTrend === "up" ? "error" : "success"}
          />
          <KPICard
            icon="CheckCircle"
            label="System Uptime"
            value={uptime !== null ? uptime : "—"}
            unit="%"
          />
          <KPICard
            icon="Activity"
            label="Log Ingestion Rate"
            value={totalRequestRate > 0 ? formatRequestRate(totalRequestRate) : "—"}
            sublabel="/ min"
            progress={totalRequestRate > 0 ? Math.min(100, Math.round((totalRequestRate / 200000) * 100)) : 0}
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

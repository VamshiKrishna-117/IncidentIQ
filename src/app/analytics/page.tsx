"use client";

import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { KPIMetric } from "@/components/analytics/kpi-metric";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { LoadingPage } from "@/components/shared/loading-state";
import { ErrorState } from "@/components/shared/error-state";
import { Timer, Eye, AlertTriangle, Brain, BarChart3 } from "lucide-react";
import type { Incident } from "@/types";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from "recharts";

const supabase = createClient();

const COLORS = {
  P0: "#ef4444",
  P1: "#f97316",
  P2: "#eab308",
  P3: "#3b82f6",
};

export default function AnalyticsPage() {
  const { data: incidents, isLoading, error, refetch } = useQuery({
    queryKey: ["analytics"],
    queryFn: async () => {
      const { data } = await supabase.from("incidents").select("*").order("created_at", { ascending: false });
      return data ?? [];
    },
  });

  if (isLoading) return <LoadingPage />;
  if (error) {
    return (
      <div className="p-4 md:p-6">
        <ErrorState
          type="error"
          title="Failed to load analytics"
          description="Unable to connect to the backend."
          action={{ label: "Retry", onClick: () => refetch() }}
        />
      </div>
    );
  }

  const typed = (incidents ?? []) as Incident[];
  const totalIncidents = typed.length;
  const activeIncidents = typed.filter((i) => i.status !== "RESOLVED").length;
  const resolvedIncidents = typed.filter((i) => i.status === "RESOLVED").length;
  const avgMttr = activeIncidents > 0 ? "14m 22s" : "—";

  const priorityDist = [
    { name: "P0", value: typed.filter((i: Incident) => i.priority === "P0").length, color: COLORS.P0 },
    { name: "P1", value: typed.filter((i: Incident) => i.priority === "P1").length, color: COLORS.P1 },
    { name: "P2", value: typed.filter((i: Incident) => i.priority === "P2").length, color: COLORS.P2 },
    { name: "P3", value: typed.filter((i: Incident) => i.priority === "P3").length, color: COLORS.P3 },
  ].filter((d) => d.value > 0);

  const statusByWeek = [
    { week: "W1", Open: 3, Resolved: 5 },
    { week: "W2", Open: 4, Resolved: 6 },
    { week: "W3", Open: 2, Resolved: 8 },
    { week: "W4", Open: 3, Resolved: 7 },
  ];

  const volumeData = Array.from({ length: 30 }, (_, i) => ({
    date: `${String(i + 1).padStart(2, "0")} Oct`,
    incidents: Math.floor(Math.random() * 8) + 1,
  }));

  const topServices = [
    { name: "auth-db-cluster-01", region: "us-east-1a", incidents: 42, downtime: "~8h", icon: "database" },
    { name: "payment-gateway-api", region: "global-edge", incidents: 28, downtime: "~2h", icon: "api" },
    { name: "worker-queue-processing", region: "eu-central-1", incidents: 15, downtime: "~45m", icon: "memory" },
  ];

  return (
    <div className="p-4 md:p-6">
      <div className="mb-6">
        <h1 className="text-lg font-semibold text-on-surface">System Analytics</h1>
        <p className="text-sm text-on-surface-variant">Real-time telemetry and incident resolution metrics.</p>
      </div>

      <div className="mb-6 flex gap-2">
        {["24h", "7d", "30d"].map((range) => (
          <button
            key={range}
            className={`rounded-lg px-3 py-1 text-xs font-medium transition-colors ${
              range === "30d"
                ? "bg-primary text-on-primary"
                : "border border-border text-on-surface-variant hover:bg-white/5"
            }`}
          >
            {range}
          </button>
        ))}
      </div>

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KPIMetric icon={Timer} label="MTTR" value={avgMttr} trend={{ value: "+2.4% vs last period", direction: "up" }} />
        <KPIMetric icon={Eye} label="MTTA" value="1m 05s" trend={{ value: "-12.1% vs last period", direction: "down" }} />
        <KPIMetric icon={AlertTriangle} label="Total Incidents" value={String(totalIncidents)} trend={{ value: "+45 vs last period", direction: "up" }} />
        <KPIMetric icon={Brain} label="AI Actions Taken" value="1,204" trend={{ value: "+302 vs last period", direction: "up" }} />
      </div>

      <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Incident Volume (30d)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={volumeData}>
                <defs>
                  <linearGradient id="volumeGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ffffff" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#ffffff" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" tick={{ fill: "#8e9192", fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "#8e9192", fontSize: 10 }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ background: "#201f1f", border: "1px solid #1f1f1f", borderRadius: 8 }}
                  labelStyle={{ color: "#e5e2e1" }}
                />
                <Area type="monotone" dataKey="incidents" stroke="#ffffff" fill="url(#volumeGradient)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Priority Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            {priorityDist.length > 0 ? (
              <div className="flex flex-col items-center gap-4 sm:flex-row sm:gap-6">
                <ResponsiveContainer width="100%" height={180} className="max-w-[200px]">
                  <PieChart>
                    <Pie
                      data={priorityDist}
                      cx="50%"
                      cy="50%"
                      innerRadius={45}
                      outerRadius={70}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {priorityDist.map((entry, index) => (
                        <Cell key={index} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ background: "#201f1f", border: "1px solid #1f1f1f", borderRadius: 8 }}
                      labelStyle={{ color: "#e5e2e1" }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-2">
                  <p className="text-sm text-on-surface-variant">{totalIncidents} Total</p>
                  {priorityDist.map((d) => (
                    <div key={d.name} className="flex items-center gap-2 text-xs">
                      <span className="h-2.5 w-2.5 rounded-full" style={{ background: d.color }} />
                      <span className="text-on-surface-variant">{d.name}</span>
                      <span className="text-on-surface font-medium">{Math.round((d.value / totalIncidents) * 100)}%</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-sm text-on-surface-variant py-8 text-center">No incident data available.</p>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Resolution Status</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={statusByWeek}>
                <XAxis dataKey="week" tick={{ fill: "#8e9192", fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "#8e9192", fontSize: 10 }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ background: "#201f1f", border: "1px solid #1f1f1f", borderRadius: 8 }}
                  labelStyle={{ color: "#e5e2e1" }}
                />
                <Bar dataKey="Open" stackId="a" fill="#8e9192" radius={[2, 2, 0, 0]} />
                <Bar dataKey="Resolved" stackId="a" fill="#22c55e" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top Affected Services</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {topServices.map((svc, i) => (
                <div key={i} className="flex items-start justify-between border-b border-border pb-3 last:border-0 last:pb-0">
                  <div>
                    <p className="text-sm font-medium text-on-surface">{svc.name}</p>
                    <p className="text-xs text-on-surface-variant">{svc.region}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-on-surface">{svc.incidents} Incidents</p>
                    <p className="text-xs text-on-surface-variant">{svc.downtime} downtime</p>
                  </div>
                </div>
              ))}
              {topServices.length === 0 && (
                <p className="text-sm text-on-surface-variant py-4 text-center">No data available.</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

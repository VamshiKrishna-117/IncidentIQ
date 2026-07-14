"use client";

import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { KPIMetric } from "@/components/analytics/kpi-metric";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { LoadingPage } from "@/components/shared/loading-state";
import { ErrorState } from "@/components/shared/error-state";
import { Timer, Eye, AlertTriangle, Brain } from "lucide-react";
import type { Incident } from "@/types";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell,
} from "recharts";

const supabase = createClient();

const COLORS = {
  P0: "#ef4444",
  P1: "#f97316",
  P2: "#eab308",
  P3: "#3b82f6",
};

const ONE_DAY = 86400000;

function getRangeMs(range: string): number {
  switch (range) {
    case "24h": return ONE_DAY;
    case "7d": return 7 * ONE_DAY;
    case "30d": return 30 * ONE_DAY;
    default: return 30 * ONE_DAY;
  }
}

function formatDuration(ms: number): string {
  if (ms < 60000) return `${Math.round(ms / 1000)}s`;
  if (ms < 3600000) return `${Math.floor(ms / 60000)}m ${Math.round((ms % 60000) / 1000)}s`;
  const h = Math.floor(ms / 3600000);
  const m = Math.floor((ms % 3600000) / 60000);
  return `${h}h ${m}m`;
}

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState("30d");

  const { data: allIncidents, isLoading, error, refetch } = useQuery({
    queryKey: ["analytics"],
    queryFn: async () => {
      const { data } = await supabase.from("incidents").select("*").order("created_at", { ascending: false });
      return (data ?? []) as Incident[];
    },
  });

  const { data: aiActionsCount = 0 } = useQuery({
    queryKey: ["analytics-ai-count"],
    queryFn: async () => {
      const { count } = await supabase.from("ai_results").select("*", { count: "exact", head: true });
      return count ?? 0;
    },
  });

  const now = useMemo(() => Date.now(), []);
  const rangeMs = getRangeMs(timeRange);
  const since = now - rangeMs;

  const incidents = useMemo(() =>
    (allIncidents ?? []).filter((i) => new Date(i.created_at).getTime() >= since),
    [allIncidents, since],
  );

  const prevIncidents = useMemo(() => {
    const prevSince = since - rangeMs;
    return (allIncidents ?? []).filter((i) => {
      const t = new Date(i.created_at).getTime();
      return t >= prevSince && t < since;
    });
  }, [allIncidents, since, rangeMs]);

  const totalIncidents = incidents.length;
  const prevTotal = prevIncidents.length;

  const mttrMs = useMemo(() => {
    const resolved = incidents.filter((i) => i.status === "RESOLVED");
    if (resolved.length === 0) return null;
    const totalMs = resolved.reduce((sum, i) => {
      return sum + (new Date(i.updated_at).getTime() - new Date(i.created_at).getTime());
    }, 0);
    return totalMs / resolved.length;
  }, [incidents]);

  const prevMttrMs = useMemo(() => {
    const resolved = prevIncidents.filter((i) => i.status === "RESOLVED");
    if (resolved.length === 0) return null;
    const totalMs = resolved.reduce((sum, i) => {
      return sum + (new Date(i.updated_at).getTime() - new Date(i.created_at).getTime());
    }, 0);
    return totalMs / resolved.length;
  }, [prevIncidents]);

  const avgMttr = mttrMs ? formatDuration(mttrMs) : "—";

  const mttrTrend = useMemo(() => {
    if (!mttrMs || !prevMttrMs) return undefined;
    const pct = ((mttrMs - prevMttrMs) / prevMttrMs) * 100;
    return { value: `${pct >= 0 ? "+" : ""}${pct.toFixed(1)}% vs prev ${timeRange}`, direction: (pct >= 0 ? "up" : "down") as "up" | "down" };
  }, [mttrMs, prevMttrMs, timeRange]);

  const totalTrend = useMemo(() => {
    if (prevTotal === 0) return { value: "No previous data", direction: "up" as const };
    const diff = totalIncidents - prevTotal;
    const pct = (diff / prevTotal) * 100;
    return { value: `${diff >= 0 ? "+" : ""}${diff} (${pct >= 0 ? "+" : ""}${pct.toFixed(1)}%) vs prev ${timeRange}`, direction: (diff >= 0 ? "up" : "down") as "up" | "down" };
  }, [totalIncidents, prevTotal, timeRange]);

  const aiTrend = useMemo(() => {
    if (aiActionsCount === 0) return undefined;
    return { value: `${aiActionsCount.toLocaleString()} total`, direction: "up" as const };
  }, [aiActionsCount]);

  const priorityDist = useMemo(() =>
    (["P0", "P1", "P2", "P3"] as const)
      .map((p) => ({
        name: p,
        value: incidents.filter((i) => i.priority === p).length,
        color: COLORS[p],
      }))
      .filter((d) => d.value > 0),
    [incidents],
  );

  const volumeData = useMemo(() => {
    const days = Math.ceil(rangeMs / ONE_DAY);
    const dayCounts: Record<string, number> = {};
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(now - i * ONE_DAY);
      const key = `${String(d.getDate()).padStart(2, "0")} ${d.toLocaleString("en", { month: "short" })}`;
      dayCounts[key] = 0;
    }
    incidents.forEach((i) => {
      const d = new Date(i.created_at);
      const key = `${String(d.getDate()).padStart(2, "0")} ${d.toLocaleString("en", { month: "short" })}`;
      if (key in dayCounts) dayCounts[key]++;
    });
    return Object.entries(dayCounts).map(([date, count]) => ({ date, incidents: count }));
  }, [incidents, now, rangeMs]);

  const statusByWeek = useMemo(() => {
    const weeks: Record<string, { Open: number; Resolved: number }> = {};
    incidents.forEach((i) => {
      const d = new Date(i.created_at);
      const weekStart = new Date(d);
      weekStart.setDate(d.getDate() - d.getDay());
      const key = weekStart.toISOString().slice(0, 10);
      if (!weeks[key]) weeks[key] = { Open: 0, Resolved: 0 };
      if (i.status === "RESOLVED") weeks[key].Resolved++;
      else weeks[key].Open++;
    });
    return Object.entries(weeks)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-8)
      .map(([week, data]) => ({
        week: week.slice(5),
        Open: data.Open,
        Resolved: data.Resolved,
      }));
  }, [incidents]);

  const topServices = useMemo(() => {
    const counts: Record<string, number> = {};
    incidents.forEach((i) => {
      if (!i.service_affected) return;
      counts[i.service_affected] = (counts[i.service_affected] || 0) + 1;
    });
    return Object.entries(counts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([name, count]) => ({
        name,
        region: "—",
        incidents: count,
        downtime: "—",
      }));
  }, [incidents]);

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
            onClick={() => setTimeRange(range)}
            className={`rounded-lg px-3 py-1 text-xs font-medium transition-colors cursor-pointer max-sm:min-h-[44px] ${
              timeRange === range
                ? "bg-primary text-on-primary"
                : "border border-border text-on-surface-variant hover:bg-white/5"
            }`}
          >
            {range}
          </button>
        ))}
      </div>

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KPIMetric icon={Timer} label="MTTR" value={avgMttr} trend={mttrTrend} />
        <KPIMetric icon={Eye} label="MTTA" value="—" />
        <KPIMetric icon={AlertTriangle} label="Total Incidents" value={String(totalIncidents)} trend={totalTrend} />
        <KPIMetric icon={Brain} label="AI Actions Taken" value={aiActionsCount.toLocaleString()} trend={aiTrend} />
      </div>

      <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Incident Volume ({timeRange})</CardTitle>
          </CardHeader>
          <CardContent>
            {volumeData.some((d) => d.incidents > 0) ? (
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={volumeData}>
                  <defs>
                    <linearGradient id="volumeGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ffffff" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#ffffff" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="date" tick={{ fill: "#8e9192", fontSize: 10 }} axisLine={false} tickLine={false} interval="preserveStartEnd" />
                  <YAxis tick={{ fill: "#8e9192", fontSize: 10 }} axisLine={false} tickLine={false} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{ background: "#201f1f", border: "1px solid #1f1f1f", borderRadius: 8 }}
                    labelStyle={{ color: "#e5e2e1" }}
                  />
                  <Area type="monotone" dataKey="incidents" stroke="#ffffff" fill="url(#volumeGradient)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-sm text-on-surface-variant py-8 text-center">No incident data for this period.</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Priority Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            {priorityDist.length > 0 ? (
                <div className="flex flex-col items-center gap-3 sm:flex-row sm:gap-6">
                <ResponsiveContainer width="100%" height={160} className="max-w-[160px] sm:max-w-[200px]">
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
                    <div key={d.name} className="flex items-center gap-2 text-xs leading-none">
                      <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ background: d.color }} />
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
            {statusByWeek.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={statusByWeek}>
                  <XAxis dataKey="week" tick={{ fill: "#8e9192", fontSize: 10 }} axisLine={false} tickLine={false} interval="preserveStartEnd" />
                  <YAxis tick={{ fill: "#8e9192", fontSize: 10 }} axisLine={false} tickLine={false} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{ background: "#201f1f", border: "1px solid #1f1f1f", borderRadius: 8 }}
                    labelStyle={{ color: "#e5e2e1" }}
                  />
                  <Bar dataKey="Open" stackId="a" fill="#8e9192" radius={[2, 2, 0, 0]} />
                  <Bar dataKey="Resolved" stackId="a" fill="#22c55e" radius={[2, 2, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-sm text-on-surface-variant py-8 text-center">No incident data available.</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top Affected Services</CardTitle>
          </CardHeader>
          <CardContent>
            {topServices.length > 0 ? (
              <div className="space-y-3">
                {topServices.map((svc, i) => (
                  <div key={i} className="flex items-start justify-between border-b border-border pb-3 last:border-0 last:pb-0">
                    <div>
                      <p className="break-words text-sm font-medium text-on-surface">{svc.name}</p>
                      <p className="text-xs text-on-surface-variant">{svc.region}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-sm text-on-surface">{svc.incidents} Incidents</p>
                      <p className="text-xs text-on-surface-variant">{svc.downtime}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-on-surface-variant py-4 text-center">No data available.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import Link from "next/link";
import type { Incident, Priority } from "@/types";
import { CircleAlert, AlertTriangle, Info, Filter, ArrowRight } from "lucide-react";
import { EmptyState } from "@/components/shared/empty-state";
import { LoadingTable } from "@/components/shared/loading-state";

interface TriageQueueProps {
  incidents: Incident[] | undefined;
  loading: boolean;
}

const ALL_PRIORITIES: Priority[] = ["P0", "P1", "P2", "P3"];

const sevIcons: Record<string, { icon: typeof CircleAlert; color: string; bg: string; border: string }> = {
  P0: { icon: CircleAlert, color: "text-error", bg: "bg-error/10", border: "border-l-error" },
  P1: { icon: AlertTriangle, color: "text-[#FACC15]", bg: "bg-[#FACC15]/10", border: "border-l-[#FACC15]" },
  P2: { icon: Info, color: "text-[#60A5FA]", bg: "bg-[#60A5FA]/10", border: "border-l-[#60A5FA]" },
  P3: { icon: Info, color: "text-[#60A5FA]", bg: "bg-[#60A5FA]/10", border: "border-l-[#60A5FA]" },
};

const sevLabel: Record<string, string> = {
  P0: "SEV-1", P1: "SEV-2", P2: "SEV-3", P3: "SEV-4",
};

function formatTimeAgo(date: string): string {
  const diff = Date.now() - new Date(date).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  return `${hrs}h ago`;
}

export function TriageQueue({ incidents, loading }: TriageQueueProps) {
  const [selectedPriorities, setSelectedPriorities] = useState<Set<Priority>>(new Set());

  if (loading) return <LoadingTable rows={4} />;
  if (!incidents || incidents.length === 0) {
    return (
      <EmptyState
        icon={CircleAlert}
        title="No Active Incidents"
        description="Systems are healthy. AI monitoring is active across all infrastructure nodes."
      />
    );
  }

  const togglePriority = (p: Priority) => {
    setSelectedPriorities((prev) => {
      const next = new Set(prev);
      if (next.has(p)) next.delete(p);
      else next.add(p);
      return next;
    });
  };

  const filtered = selectedPriorities.size > 0
    ? incidents.filter((i) => selectedPriorities.has(i.priority))
    : incidents;

  const visible = filtered.slice(0, 4);

  return (
    <div className="flex flex-col gap-2">
      <div className="flex justify-between items-center bg-surface-container-highest/30 px-3 py-1.5 rounded-lg border border-[#1F1F1F]">
        <h3 className="text-sm font-semibold text-on-surface">Live Triage Queue</h3>
        <div className="flex items-center gap-1">
          <Filter className="h-3.5 w-3.5 text-on-surface-variant" />
          {ALL_PRIORITIES.map((p) => {
            const active = selectedPriorities.has(p);
            return (
              <button
                key={p}
                onClick={() => togglePriority(p)}
                className={`text-[10px] font-medium px-1.5 py-0.5 rounded transition-colors cursor-pointer ${
                  active ? "bg-primary text-on-primary" : "text-on-surface-variant hover:text-on-surface"
                }`}
              >
                {p}
              </button>
            );
          })}
        </div>
      </div>
      <div className="flex flex-col gap-px">
        {visible.map((incident) => {
          const sev = sevIcons[incident.priority] || sevIcons.P3;
          const SevIcon = sev.icon;
          return (
            <Link
              key={incident.id}
              href={`/incidents/${incident.id}`}
              className={`flex gap-2.5 items-start bg-black/70 backdrop-blur-xl border border-[#1F1F1F] rounded-lg p-2.5 ${sev.border} border-l-4 hover:bg-surface-container-high/50 transition-colors group`}
            >
              <div className={`${sev.bg} p-1.5 rounded shrink-0`}>
                <SevIcon className={`h-4 w-4 ${sev.color}`} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start gap-2">
                  <h4 className="text-sm text-on-surface font-medium group-hover:underline truncate">{incident.title}</h4>
                  <span className="text-[10px] text-on-surface-variant shrink-0">{formatTimeAgo(incident.created_at)}</span>
                </div>
                <p className="text-xs text-on-surface-variant mt-0.5 line-clamp-1">{incident.description}</p>
                <div className="flex gap-1.5 mt-1.5 flex-wrap">
                  <span className="text-[10px] font-medium bg-error/10 text-error px-1.5 py-0.5 rounded border border-error/20">{sevLabel[incident.priority]}</span>
                  {incident.service_affected && (
                    <span className="text-[10px] font-medium bg-surface-variant text-on-surface px-1.5 py-0.5 rounded border border-outline-variant">{incident.service_affected}</span>
                  )}
                </div>
              </div>
            </Link>
          );
        })}
      </div>
      <Link
        href="/dashboard"
        className="flex items-center justify-center gap-1 mt-1 text-xs text-on-surface-variant hover:text-primary transition-colors"
      >
        View All Incidents
        <ArrowRight className="h-3 w-3" />
      </Link>
    </div>
  );
}

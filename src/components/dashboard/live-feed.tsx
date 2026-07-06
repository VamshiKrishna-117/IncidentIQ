"use client";

import { useEffect, useState } from "react";
import { Terminal, AlertTriangle, User } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { RealtimePostgresChangesPayload } from "@supabase/supabase-js";

function getClient() {
  return createClient();
}

interface FeedEvent {
  id: string;
  type: "deploy" | "alert" | "user";
  title: string;
  message: string;
  timestamp: string;
}

const iconMap = {
  deploy: Terminal,
  alert: AlertTriangle,
  user: User,
};

const iconStyles: Record<string, string> = {
  deploy: "bg-surface border border-[#353434]",
  alert: "bg-error/10 border border-error/20",
  user: "bg-surface border border-[#353434]",
};

const iconColors: Record<string, string> = {
  deploy: "text-on-surface-variant",
  alert: "text-error",
  user: "text-on-surface-variant",
};

const titleColors: Record<string, string> = {
  deploy: "text-primary",
  alert: "text-error",
  user: "text-primary",
};

function formatTime(date: string): string {
  return new Date(date).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
}

export function LiveFeed() {
  const [events, setEvents] = useState<FeedEvent[]>([
    {
      id: "1",
      type: "deploy",
      title: "Deploy #892 completed",
      message: "service-auth updated to v1.4.2",
      timestamp: new Date(Date.now() - 120000).toISOString(),
    },
    {
      id: "2",
      type: "alert",
      title: "Alert Triggered",
      message: "CPU utilization > 90% on redis-cluster-node-03.",
      timestamp: new Date(Date.now() - 300000).toISOString(),
    },
    {
      id: "3",
      type: "user",
      title: "J. Doe acknowledged alert",
      message: "INC-2049 assigned.",
      timestamp: new Date(Date.now() - 600000).toISOString(),
    },
  ]);

  useEffect(() => {
    const supabase = getClient();
    const channel = supabase
      .channel("live-feed")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "incident_updates" },
        (payload: RealtimePostgresChangesPayload<Record<string, unknown>>) => {
          const update = payload.new as { message: string; author_name: string; created_at: string };
          setEvents((prev) => [
            {
              id: `update-${Date.now()}`,
              type: "user",
              title: `${update.author_name} acknowledged alert`,
              message: update.message,
              timestamp: update.created_at,
            },
            ...prev.slice(0, 19),
          ]);
        }
      )
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "incidents" },
        (payload: RealtimePostgresChangesPayload<Record<string, unknown>>) => {
          const incident = payload.new as { display_id: string; title: string; created_at: string };
          setEvents((prev) => [
            {
              id: `incident-${Date.now()}`,
              type: "alert",
              title: `New incident ${incident.display_id}`,
              message: incident.title,
              timestamp: incident.created_at,
            },
            ...prev.slice(0, 19),
          ]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <div className="rounded-xl bg-black/70 backdrop-blur-xl border border-[#1F1F1F] p-3 flex flex-col">
      <h3 className="text-sm font-semibold text-on-surface mb-2 flex items-center gap-1.5">
        <span className="w-1.5 h-1.5 rounded-full bg-[#4ADE80] animate-pulse" />
        Live Feed
      </h3>
      <div className="relative">
        <div className="absolute left-[11px] top-2 bottom-0 w-px bg-[#2A2A2A]" />
        <div className="flex flex-col gap-2 relative z-10 pl-8 pt-1 overflow-y-auto max-h-[200px] pr-1">
          {events.map((event) => {
            const Icon = iconMap[event.type];
            return (
              <div key={event.id} className="relative">
                <div className={`absolute -left-[37px] top-0.5 w-5 h-5 rounded-full flex items-center justify-center ${iconStyles[event.type]}`}>
                  <Icon className={`h-2.5 w-2.5 ${iconColors[event.type]}`} />
                </div>
                <div className="flex justify-between items-baseline mb-0.5">
                  <span className={`text-xs ${titleColors[event.type]}`}>{event.title}</span>
                  <span className="text-[10px] text-on-surface-variant opacity-50">{formatTime(event.timestamp)}</span>
                </div>
                <p className="text-[10px] text-on-surface-variant line-clamp-1">{event.message}</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

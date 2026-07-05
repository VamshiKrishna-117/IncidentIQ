"use client";

import { useEffect, useState } from "react";
import { Terminal, AlertTriangle, UserCheck, Cpu } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { formatTimestamp } from "@/lib/utils";
import { cn } from "@/lib/utils";

function getClient() {
  return createClient();
}

interface FeedEvent {
  id: string;
  type: "deploy" | "alert" | "user" | "system";
  message: string;
  timestamp: string;
}

const iconMap = {
  deploy: Terminal,
  alert: AlertTriangle,
  user: UserCheck,
  system: Cpu,
};

const colorMap = {
  deploy: "text-blue-400",
  alert: "text-yellow-400",
  user: "text-green-400",
  system: "text-purple-400",
};

export function LiveFeed() {
  const [events, setEvents] = useState<FeedEvent[]>([
    {
      id: "1",
      type: "deploy",
      message: "Deploy #892 completed — service-auth updated to v1.4.2",
      timestamp: new Date(Date.now() - 120000).toISOString(),
    },
    {
      id: "2",
      type: "alert",
      message: "Alert Triggered — CPU utilization > 90% on redis-cluster-node-03",
      timestamp: new Date(Date.now() - 300000).toISOString(),
    },
    {
      id: "3",
      type: "user",
      message: "J. Doe acknowledged alert — INC-2049 assigned",
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
        (payload) => {
          const update = payload.new as { message: string; author_name: string; created_at: string };
          setEvents((prev) => [
            {
              id: `update-${Date.now()}`,
              type: "user",
              message: `${update.author_name}: ${update.message}`,
              timestamp: update.created_at,
            },
            ...prev.slice(0, 19),
          ]);
        }
      )
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "incidents" },
        (payload) => {
          const incident = payload.new as { display_id: string; title: string; created_at: string };
          setEvents((prev) => [
            {
              id: `incident-${Date.now()}`,
              type: "alert",
              message: `New incident ${incident.display_id}: ${incident.title}`,
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
    <div>
      <h2 className="mb-3 text-sm font-semibold text-on-surface">Live Feed</h2>
      <div className="space-y-2">
        {events.map((event) => {
          const Icon = iconMap[event.type];
          return (
            <div
              key={event.id}
              className="flex items-start gap-3 rounded-lg border border-border bg-surface-container-low px-3 py-2"
            >
              <Icon className={cn("mt-0.5 h-4 w-4 shrink-0", colorMap[event.type])} />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm text-on-surface">{event.message}</p>
                <p className="text-xs text-on-surface-variant">{formatTimestamp(event.timestamp)}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

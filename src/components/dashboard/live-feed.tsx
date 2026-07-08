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
  const [events, setEvents] = useState<FeedEvent[]>([]);

  useEffect(() => {
    const supabase = getClient();

    supabase
      .from("incident_updates")
      .select("id, message, author_name, created_at, update_type")
      .order("created_at", { ascending: false })
      .limit(10)
      .then(({ data }: { data: { id: string; message: string; author_name: string; created_at: string; update_type: string }[] | null }) => {
        if (data && data.length > 0) {
          setEvents(
            data.map((u) => ({
              id: u.id,
              type: (u.update_type === "SYSTEM" ? "deploy" : u.update_type === "AI" ? "alert" : "user") as FeedEvent["type"],
              title: u.update_type === "SYSTEM" ? "System Event" : u.update_type === "AI" ? "AI Analysis" : `${u.author_name} posted update`,
              message: u.message,
              timestamp: u.created_at,
            }))
          );
        }
      });

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
              title: `${update.author_name} posted update`,
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
        <div className="absolute left-[34px] top-2 bottom-0 w-px bg-[#2A2A2A]" />
        <div className="flex flex-col gap-2 relative z-10 pl-6 pt-1 overflow-y-auto overflow-x-visible max-h-[200px] pr-1">
          {events.map((event) => {
            const Icon = iconMap[event.type];
            return (
              <div key={event.id} className="relative flex gap-2.5">
                <div className={`mt-0.5 w-5 h-5 shrink-0 rounded-full flex items-center justify-center ${iconStyles[event.type]}`}>
                  <Icon className={`h-2.5 w-2.5 ${iconColors[event.type]}`} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex justify-between items-baseline mb-0.5">
                    <span className={`text-xs ${titleColors[event.type]}`}>{event.title}</span>
                    <span className="text-[10px] text-on-surface-variant opacity-50 shrink-0 ml-1">{formatTime(event.timestamp)}</span>
                  </div>
                  <p className="text-[10px] text-on-surface-variant line-clamp-1">{event.message}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

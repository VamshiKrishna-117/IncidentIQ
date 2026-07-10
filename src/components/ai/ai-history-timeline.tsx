"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { formatTimestamp } from "@/lib/utils";
import { Brain, CheckCircle, XCircle } from "lucide-react";
import type { AIResult } from "@/types";

const supabase = createClient();

interface HistoryEvent {
  id: string;
  text: string;
  timestamp: string;
  type: "summary" | "system";
  status: "completed" | "failed" | "running";
}

const DEMO_EVENTS: HistoryEvent[] = [
  { id: "1", text: "System health check routine initialized. Analyzing telemetry streams...", timestamp: new Date(Date.now() - 3600000).toISOString(), type: "system", status: "completed" },
  { id: "2", text: "Routine log analysis. No anomalies detected.", timestamp: new Date(Date.now() - 7200000).toISOString(), type: "summary", status: "completed" },
];

export function AIHistoryTimeline({ incidentId }: { incidentId?: string }) {
  const [events, setEvents] = useState<HistoryEvent[]>(DEMO_EVENTS);

  useEffect(() => {
    supabase
      .from("ai_results")
      .select("id, type, result_text, created_at")
      .order("created_at", { ascending: false })
      .limit(20)
      .then((result: { data: { id: string; type: string; result_text: string; created_at: string }[] | null }) => {
        const data = result.data;
        if (data && data.length > 0) {
          const history: HistoryEvent[] = data.map((r) => ({
            id: r.id,
            text: r.type === "SUMMARY"
              ? `AI analysis completed for incident. ${r.result_text.substring(0, 80)}...`
              : `AI ${r.type.toLowerCase().replace(/_/g, " ")} generated.`,
            timestamp: r.created_at,
            type: "summary" as const,
            status: "completed" as const,
          }));
          setEvents(history);
        }
      });
  }, []);

  useEffect(() => {
    const channel = supabase
      .channel("ai-history")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "ai_results" },
        (payload: { new: Record<string, unknown> }) => {
          const result = payload.new as unknown as AIResult;
          const text = result.type === "SUMMARY"
            ? `AI analysis completed for incident. ${result.result_text.substring(0, 80)}...`
            : `AI ${result.type.toLowerCase().replace(/_/g, " ")} generated.`;
          setEvents((prev) => [
            { id: result.id, text, timestamp: result.created_at, type: "summary", status: "completed" },
            ...prev.slice(0, 19),
          ]);
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  return (
    <div>
      <h3 className="mb-3 text-sm font-semibold text-on-surface">Analysis History</h3>
      <div className="space-y-3">
        {events.map((event, i) => (
          <div key={event.id} className="flex gap-3">
            <div className="flex flex-col items-center">
              <div className={`flex h-6 w-6 items-center justify-center rounded-full ${
                event.status === "completed" ? "bg-green-500/10" : event.status === "running" ? "bg-blue-500/10" : "bg-red-500/10"
              }`}>
                {event.status === "completed" && <CheckCircle className="h-3 w-3 text-green-400" />}
                {event.status === "running" && <Brain className="h-3 w-3 text-blue-400" />}
                {event.status === "failed" && <XCircle className="h-3 w-3 text-red-400" />}
              </div>
              {i < events.length - 1 && <div className="mt-1 w-px flex-1 bg-border" />}
            </div>
            <div className="min-w-0 flex-1 pb-3">
              <p className="text-sm text-on-surface">{event.text}</p>
              <p className="text-xs text-on-surface-variant">{formatTimestamp(event.timestamp)}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

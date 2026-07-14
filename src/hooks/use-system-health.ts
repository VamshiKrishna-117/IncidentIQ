"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

export function useSystemHealth() {
  const [dbStatus, setDbStatus] = useState<"checking" | "connected" | "disconnected">("checking");
  const [realtimeStatus, setRealtimeStatus] = useState<"checking" | "active" | "inactive">("checking");

  useEffect(() => {
    const supabase = createClient();
    let cancelled = false;

    const check = () => {
      supabase
        .from("incidents")
        .select("id")
        .limit(1)
        .maybeSingle()
        .then(({ error }: { error: Error | null }) => {
          if (!cancelled) setDbStatus(error ? "disconnected" : "connected");
        })
        .catch(() => {
          if (!cancelled) setDbStatus("disconnected");
        });
    };

    check();
    const interval = setInterval(check, 30000);

    const channel = supabase.channel("health-check");
    const timer = setTimeout(() => {
      if (!cancelled) {
        setRealtimeStatus((s) => (s === "checking" ? "inactive" : s));
        supabase.removeChannel(channel);
      }
    }, 8000);

    channel.subscribe((status: string) => {
      if (!cancelled) {
        if (status === "SUBSCRIBED") {
          setRealtimeStatus("active");
          clearTimeout(timer);
          supabase.removeChannel(channel);
        } else if (status === "CHANNEL_ERROR" || status === "TIMED_OUT") {
          setRealtimeStatus("inactive");
          clearTimeout(timer);
          supabase.removeChannel(channel);
        }
      }
    });

    return () => {
      cancelled = true;
      clearInterval(interval);
      clearTimeout(timer);
      supabase.removeChannel(channel);
    };
  }, []);

  return { dbStatus, realtimeStatus };
}

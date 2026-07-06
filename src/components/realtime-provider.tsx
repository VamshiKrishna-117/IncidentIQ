"use client";

import { createContext, useContext, useEffect, useState, useRef } from "react";
import { createClient } from "@/lib/supabase/client";

type RealtimeStatus = "connected" | "connecting" | "disconnected";

interface RealtimeContextValue {
  status: RealtimeStatus;
}

const RealtimeContext = createContext<RealtimeContextValue>({ status: "connected" });

export function useRealtimeStatus() {
  return useContext(RealtimeContext);
}

export function RealtimeProvider({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<RealtimeStatus>("connecting");
  const channelRef = useRef<ReturnType<ReturnType<typeof createClient>["channel"]> | null>(null);

  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel("realtime-health")
      .subscribe((newStatus: string) => {
        if (newStatus === "SUBSCRIBED") setStatus("connected");
        else if (newStatus === "CLOSED" || newStatus === "CHANNEL_ERROR") setStatus("disconnected");
        else setStatus("connecting");
      });

    channelRef.current = channel;

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <RealtimeContext.Provider value={{ status }}>
      {children}
    </RealtimeContext.Provider>
  );
}

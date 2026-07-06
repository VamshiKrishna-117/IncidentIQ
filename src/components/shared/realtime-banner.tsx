"use client";

import { useRealtimeStatus } from "@/components/realtime-provider";
import { Wifi, WifiOff } from "lucide-react";

export function RealtimeBanner() {
  const { status } = useRealtimeStatus();

  if (status === "connected") return null;

  return (
    <div className="flex items-center justify-center gap-2 bg-error px-3 py-1.5 text-xs font-medium text-on-error animate-in slide-in-from-top">
      {status === "disconnected" ? (
        <>
          <WifiOff className="h-3.5 w-3.5" />
          <span>Connection lost. Reconnecting...</span>
        </>
      ) : (
        <>
          <Wifi className="h-3.5 w-3.5 animate-pulse" />
          <span>Connecting to live updates...</span>
        </>
      )}
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { WifiOff, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

interface TelemetryLostProps {
  expectedSources?: number;
  onRetry?: () => void;
}

export function TelemetryLost({ expectedSources = 4, onRetry }: TelemetryLostProps) {
  const [visible, setVisible] = useState(false);
  const [lostSources, setLostSources] = useState(2);

  useEffect(() => {
    const t1 = setTimeout(() => setVisible(true), 3000);
    const t2 = setInterval(() => {
      setLostSources((prev) => Math.min(prev + 1, expectedSources));
    }, 8000);
    return () => { clearTimeout(t1); clearInterval(t2); };
  }, [expectedSources]);

  if (!visible) return null;

  return (
    <div
      className={cn(
        "fixed bottom-20 left-1/2 z-50 -translate-x-1/2 transition-all duration-500",
        "rounded-lg border border-yellow-500/30 bg-yellow-500/5 px-4 py-3 shadow-lg backdrop-blur-sm",
        lostSources >= expectedSources ? "border-red-500/30 bg-red-500/5" : ""
      )}
    >
      <div className="flex items-center gap-3">
        <div className="relative">
          <WifiOff className="h-5 w-5 text-yellow-400" />
          {lostSources >= expectedSources && (
            <span className="absolute -right-1 -top-1 h-2 w-2 rounded-full bg-red-400 animate-pulse" />
          )}
        </div>
        <div>
          <p className="text-sm font-medium text-on-surface">
            {lostSources >= expectedSources ? "Connection Lost" : "Telemetry Degraded"}
          </p>
          <p className="text-xs text-on-surface-variant">
            {lostSources >= expectedSources
              ? "All data sources disconnected. Check network."
              : `${lostSources}/${expectedSources} data sources unreachable`}
          </p>
        </div>
        {onRetry && (
          <button
            onClick={onRetry}
            className="flex items-center gap-1 rounded-md bg-white/5 px-2.5 py-1.5 text-xs font-medium text-on-surface hover:bg-white/10 transition-colors"
          >
            <RefreshCw className="h-3 w-3" />
            Retry
          </button>
        )}
      </div>
    </div>
  );
}

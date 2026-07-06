import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Activity, Cpu, Database, Terminal, RefreshCw } from "lucide-react";

interface ServiceCardProps {
  name: string;
  cluster: string;
  status: "HEALTHY" | "DEGRADED" | "DOWN";
  p99LatencyMs: number | null;
  errorRate: number | null;
  cpuUsage: number | null;
  memoryUsage: number | null;
  requestRate: number | null;
  heartbeatAt: string;
}

const statusConfig = {
  HEALTHY: { label: "Healthy", color: "text-green-400", bg: "bg-green-500/10" },
  DEGRADED: { label: "Degraded", color: "text-yellow-400", bg: "bg-yellow-500/10" },
  DOWN: { label: "Down", color: "text-red-400", bg: "bg-red-500/10" },
};

export function ServiceCard({
  name, cluster, status, p99LatencyMs, errorRate,
  cpuUsage, memoryUsage, requestRate, heartbeatAt,
}: ServiceCardProps) {
  const cfg = statusConfig[status];

  return (
    <Card>
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="text-sm font-semibold text-on-surface">{name}</h3>
          <p className="text-xs text-on-surface-variant font-mono">{cluster}</p>
        </div>
        <Badge variant={status === "HEALTHY" ? "RESOLVED" : status === "DEGRADED" ? "INVESTIGATING" : "P0"}>
          {cfg.label}
        </Badge>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-3">
        {p99LatencyMs !== null && (
          <div>
            <p className="text-[10px] uppercase tracking-wider text-on-surface-variant">Response Time (p99)</p>
            <p className="text-sm font-mono text-on-surface">{p99LatencyMs}ms</p>
          </div>
        )}
        {errorRate !== null && (
          <div>
            <p className="text-[10px] uppercase tracking-wider text-on-surface-variant">Error Rate</p>
            <p className={cn("text-sm font-mono", errorRate > 2 ? "text-error" : "text-on-surface")}>
              {errorRate}%
            </p>
          </div>
        )}
        {cpuUsage !== null && (
          <div>
            <p className="text-[10px] uppercase tracking-wider text-on-surface-variant">CPU Usage</p>
            <div className="flex items-center gap-2">
              <div className="h-1.5 flex-1 rounded-full bg-surface-container-higher">
                <div
                  className={cn("h-full rounded-full", cpuUsage > 80 ? "bg-error" : "bg-green-400")}
                  style={{ width: `${cpuUsage}%` }}
                />
              </div>
              <span className="text-xs font-mono text-on-surface">{cpuUsage}%</span>
            </div>
          </div>
        )}
        {memoryUsage !== null && (
          <div>
            <p className="text-[10px] uppercase tracking-wider text-on-surface-variant">Memory</p>
            <div className="flex items-center gap-2">
              <div className="h-1.5 flex-1 rounded-full bg-surface-container-higher">
                <div
                  className={cn("h-full rounded-full", memoryUsage > 80 ? "bg-error" : "bg-green-400")}
                  style={{ width: `${memoryUsage}%` }}
                />
              </div>
              <span className="text-xs font-mono text-on-surface">{memoryUsage}%</span>
            </div>
          </div>
        )}
      </div>

      {requestRate !== null && (
        <p className="text-xs text-on-surface-variant mb-2">
          Requests/sec: <span className="font-mono text-on-surface">{requestRate.toLocaleString()}</span>
        </p>
      )}

      <div className="flex items-center justify-between pt-2 border-t border-border">
        <div className="flex items-center gap-1 text-[10px] text-on-surface-variant">
          <RefreshCw className="h-3 w-3" />
          HEARTBEAT: {heartbeatAt}
        </div>
        <button onClick={() => {}} className="rounded p-1 text-on-surface-variant hover:bg-white/5 hover:text-on-surface transition-colors cursor-pointer" aria-label="Open terminal">
          <Terminal className="h-3.5 w-3.5" />
        </button>
      </div>
    </Card>
  );
}

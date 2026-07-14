"use client";

import { Badge } from "@/components/ui/badge";
import { Shield, Database, Server } from "lucide-react";
import { APP_VERSION } from "@/lib/version";
import { useSystemHealth } from "@/hooks/use-system-health";

export function SystemTab() {
  const { dbStatus, realtimeStatus } = useSystemHealth();
  const gitHash = process.env.NEXT_PUBLIC_GIT_HASH;

  const dbBadge = dbStatus === "checking"
    ? { variant: "P3" as const, label: "Checking..." }
    : dbStatus === "connected"
    ? { variant: "RESOLVED" as const, label: "Connected" }
    : { variant: "P0" as const, label: "Disconnected" };

  const rtBadge = realtimeStatus === "checking"
    ? { variant: "P3" as const, label: "Checking..." }
    : realtimeStatus === "active"
    ? { variant: "RESOLVED" as const, label: "Active" }
    : { variant: "P0" as const, label: "Inactive" };

  return (
    <div className="space-y-5">
      <div>
        <p className="mb-1 text-sm font-medium text-on-surface">System Information</p>
        <div className="space-y-2">
          <div className="flex items-center justify-between gap-3 rounded-lg border border-border px-3 py-2">
            <div className="flex items-center gap-2 min-w-0">
              <Shield className="h-4 w-4 text-on-surface-variant shrink-0" />
              <span className="text-sm text-on-surface-variant">Version</span>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-sm text-on-surface font-mono">{APP_VERSION}</span>
              {gitHash && (
                <span className="text-[10px] text-on-surface-variant font-mono truncate max-w-[80px]">{gitHash}</span>
              )}
            </div>
          </div>
          <div className="flex items-center justify-between gap-3 rounded-lg border border-border px-3 py-2">
            <div className="flex items-center gap-2 min-w-0">
              <Database className="h-4 w-4 text-on-surface-variant shrink-0" />
              <span className="text-sm text-on-surface-variant">Database</span>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-sm text-on-surface font-mono">PostgreSQL</span>
              <Badge variant={dbBadge.variant}>{dbBadge.label}</Badge>
            </div>
          </div>
          <div className="flex items-center justify-between gap-3 rounded-lg border border-border px-3 py-2">
            <div className="flex items-center gap-2 min-w-0">
              <Server className="h-4 w-4 text-on-surface-variant shrink-0" />
              <span className="text-sm text-on-surface-variant">Realtime Service</span>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-sm text-on-surface font-mono">Supabase</span>
              <Badge variant={rtBadge.variant}>{rtBadge.label}</Badge>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

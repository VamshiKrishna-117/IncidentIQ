"use client";

import { Badge } from "@/components/ui/badge";
import { Shield, Database, Server } from "lucide-react";

export function SystemTab() {
  return (
    <div className="space-y-5">
      <div>
        <p className="mb-1 text-sm font-medium text-on-surface">System Information</p>
        <div className="space-y-2">
          <div className="flex items-center justify-between rounded-lg border border-border px-3 py-2">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-on-surface-variant" />
              <span className="text-sm text-on-surface-variant">Version</span>
            </div>
            <span className="text-sm text-on-surface font-mono">v2.4.0-prod</span>
          </div>
          <div className="flex items-center justify-between rounded-lg border border-border px-3 py-2">
            <div className="flex items-center gap-2">
              <Database className="h-4 w-4 text-on-surface-variant" />
              <span className="text-sm text-on-surface-variant">Database</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-on-surface font-mono">PostgreSQL</span>
              <Badge variant="RESOLVED">Connected</Badge>
            </div>
          </div>
          <div className="flex items-center justify-between rounded-lg border border-border px-3 py-2">
            <div className="flex items-center gap-2">
              <Server className="h-4 w-4 text-on-surface-variant" />
              <span className="text-sm text-on-surface-variant">Realtime Service</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-on-surface font-mono">Supabase</span>
              <Badge variant="RESOLVED">Active</Badge>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

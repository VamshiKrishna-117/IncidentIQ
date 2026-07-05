"use client";

import { Input } from "@/components/ui/input";
import { Select, SelectItem } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import type { SettingsMap } from "@/hooks/use-settings";

interface RealtimeTabProps {
  settings: SettingsMap;
  onChange: (key: string, value: string | number | boolean) => void;
}

export function RealtimeTab({ settings, onChange }: RealtimeTabProps) {
  return (
    <div className="space-y-5">
      <div>
        <p className="mb-1 text-sm font-medium text-on-surface">WebSocket Endpoint</p>
        <p className="mb-2 text-xs text-on-surface-variant">Primary telemetry streaming connection.</p>
        <div className="flex items-center gap-2">
          <div className="flex-1">
            <Input value={settings.websocket_endpoint as string} onChange={(e) => onChange("websocket_endpoint", e.target.value)} />
          </div>
          <Badge variant="RESOLVED">Connected</Badge>
        </div>
      </div>

      <div>
        <p className="mb-1 text-sm font-medium text-on-surface">Max Reconnection Retries</p>
        <p className="mb-2 text-xs text-on-surface-variant">Number of attempts before falling back to polling.</p>
        <Select value={String(settings.max_reconnection_retries)} onValueChange={(v) => onChange("max_reconnection_retries", parseInt(v))}>
          <SelectItem value="3">3 retries</SelectItem>
          <SelectItem value="5">5 retries</SelectItem>
          <SelectItem value="10">10 retries</SelectItem>
          <SelectItem value="-1">Infinite</SelectItem>
        </Select>
      </div>
    </div>
  );
}

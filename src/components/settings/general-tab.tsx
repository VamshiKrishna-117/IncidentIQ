"use client";

import { Select, SelectItem } from "@/components/ui/select";
import { useTheme } from "@/components/theme-provider";
import { useToast } from "@/hooks/use-toast";
import type { SettingsMap } from "@/hooks/use-settings";

interface GeneralTabProps {
  settings: SettingsMap;
  onChange: (key: string, value: string | number | boolean) => void;
}

export function GeneralTab({ settings, onChange }: GeneralTabProps) {
  const { theme, setTheme } = useTheme();
  const toast = useToast();

  const handleThemeChange = (v: string) => {
    if (v !== "dark") {
      toast.info("Light and System themes are coming soon. For now, dark theme will remain active.");
      return;
    }
    setTheme("dark");
    onChange("theme", v);
  };

  return (
    <div className="space-y-5">
      <div>
        <p className="mb-1 text-sm font-medium text-on-surface">Theme Mode</p>
        <p className="mb-2 text-xs text-on-surface-variant">Select interface appearance.</p>
        <Select value="dark" onValueChange={handleThemeChange}>
          <SelectItem value="dark">Dark (Professional)</SelectItem>
          <SelectItem value="system">System Default</SelectItem>
          <SelectItem value="light">Light</SelectItem>
        </Select>
      </div>

      <div>
        <p className="mb-1 text-sm font-medium text-on-surface">Global Notifications</p>
        <p className="mb-2 text-xs text-on-surface-variant">Enable push alerts for high-severity incidents.</p>
        <label className="flex cursor-pointer items-center gap-3">
          <div className={`relative h-6 w-10 rounded-full transition-colors ${settings.notifications_enabled ? "bg-primary" : "bg-surface-container-higher"}`}>
            <div className={`absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-on-primary transition-transform ${settings.notifications_enabled ? "translate-x-4" : "translate-x-0"}`} />
            <input type="checkbox" className="sr-only" checked={!!settings.notifications_enabled} onChange={() => onChange("notifications_enabled", !settings.notifications_enabled)} />
          </div>
          <span className="text-sm text-on-surface-variant">{settings.notifications_enabled ? "Enabled" : "Disabled"}</span>
        </label>
      </div>

      <div>
        <p className="mb-1 text-sm font-medium text-on-surface">Dashboard Auto-refresh</p>
        <p className="mb-2 text-xs text-on-surface-variant">Interval for fetching non-websocket metrics.</p>
        <Select value={settings.auto_refresh_interval as string} onValueChange={(v) => onChange("auto_refresh_interval", v)}>
          <SelectItem value="15s">15 seconds</SelectItem>
          <SelectItem value="30s">30 seconds</SelectItem>
          <SelectItem value="60s">1 minute</SelectItem>
          <SelectItem value="manual">Manual</SelectItem>
        </Select>
      </div>
    </div>
  );
}

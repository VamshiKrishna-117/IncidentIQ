"use client";

import { Select, SelectItem } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Brain, Sparkles } from "lucide-react";
import type { SettingsMap } from "@/hooks/use-settings";

interface AIConfigTabProps {
  settings: SettingsMap;
  onChange: (key: string, value: string | number | boolean) => void;
}

export function AIConfigTab({ settings, onChange }: AIConfigTabProps) {
  return (
    <div className="space-y-5">
      <div>
        <p className="mb-1 text-sm font-medium text-on-surface">Primary AI Provider</p>
        <p className="mb-2 text-xs text-on-surface-variant">Model used for automated log analysis and incident summarization.</p>
        <Select value={settings.ai_provider as string} onValueChange={(v) => onChange("ai_provider", v)}>
          <SelectItem value="groq">
            <div className="flex items-center gap-2">
              <Brain className="h-4 w-4" />
              <span>Groq Llama 3</span>
              <Badge variant="RESOLVED">Fast</Badge>
            </div>
          </SelectItem>
          <SelectItem value="gemini">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4" />
              <span>Gemini Flash</span>
              <Badge variant="INVESTIGATING">Balanced</Badge>
            </div>
          </SelectItem>
          <SelectItem value="fallback">
            <div className="flex items-center gap-2">
              <span>Rule-Based Engine</span>
              <Badge variant="P3">Offline</Badge>
            </div>
          </SelectItem>
        </Select>
      </div>

      <div>
        <p className="mb-1 text-sm font-medium text-on-surface">Auto-Analyze Critical Incidents</p>
        <p className="mb-2 text-xs text-on-surface-variant">Automatically trigger AI summary generation for P0 and P1 incidents.</p>
        <label className="flex cursor-pointer items-center gap-3">
          <div className={`relative h-6 w-10 rounded-full transition-colors ${settings.auto_analyze_critical ? "bg-primary" : "bg-surface-container-higher"}`}>
            <div className={`absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-on-primary transition-transform ${settings.auto_analyze_critical ? "translate-x-4" : "translate-x-0"}`} />
            <input type="checkbox" className="sr-only" checked={!!settings.auto_analyze_critical} onChange={() => onChange("auto_analyze_critical", !settings.auto_analyze_critical)} />
          </div>
          <span className="text-sm text-on-surface-variant">{settings.auto_analyze_critical ? "Enabled" : "Disabled"}</span>
        </label>
      </div>
    </div>
  );
}

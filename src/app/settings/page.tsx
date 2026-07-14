"use client";

import { useState } from "react";
import { Settings, Wifi, Brain, Server } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LoadingPage } from "@/components/shared/loading-state";
import { useSettings } from "@/hooks/use-settings";
import { GeneralTab } from "@/components/settings/general-tab";
import { RealtimeTab } from "@/components/settings/realtime-tab";
import { AIConfigTab } from "@/components/settings/ai-config-tab";
import { SystemTab } from "@/components/settings/system-tab";

const TABS = [
  { id: "general", label: "General", icon: Settings },
  { id: "realtime", label: "Realtime", icon: Wifi },
  { id: "ai-config", label: "AI Config", icon: Brain },
  { id: "system", label: "System", icon: Server },
];

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("general");
  const { settings, isLoading, save, isSaving } = useSettings();
  const [dirty, setDirty] = useState(false);
  const [local, setLocal] = useState<Record<string, string | number | boolean>>({});

  if (isLoading) return <LoadingPage />;

  const onChange = (key: string, value: string | number | boolean) => {
    setLocal((prev) => ({ ...prev, [key]: value }));
    setDirty(true);
  };

  const handleSave = () => {
    const merged = { ...settings };
    for (const [k, v] of Object.entries(local)) {
      (merged as Record<string, string | number | boolean>)[k] = v;
    }
    save(merged);
    setDirty(false);
    setLocal({});
  };

  const currentSettings = { ...settings, ...local };

  return (
    <div className="p-4 md:p-6">
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-semibold text-on-surface">System Settings</h1>
            <p className="text-sm text-on-surface-variant">
              Configure Aegis Sentinel operational parameters and AI preferences.
            </p>
          </div>
          {dirty && (
            <Button variant="primary" size="sm" onClick={handleSave} disabled={isSaving}>
              {isSaving ? "Saving..." : "Save Changes"}
            </Button>
          )}
        </div>
      </div>

      <div className="flex gap-1 rounded-lg bg-surface-container-high p-1 mb-6 overflow-x-auto">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium whitespace-nowrap transition-colors ${
                activeTab === tab.id
                  ? "bg-primary text-on-primary shadow-sm"
                  : "text-on-surface-variant hover:text-on-surface"
              }`}
            >
              <Icon className="h-4 w-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      <Card>
        <CardContent className="p-5">
          {activeTab === "general" && <GeneralTab settings={currentSettings} onChange={onChange} />}
          {activeTab === "realtime" && <RealtimeTab />}
          {activeTab === "ai-config" && <AIConfigTab settings={currentSettings} onChange={onChange} />}
          {activeTab === "system" && <SystemTab />}
        </CardContent>
      </Card>
    </div>
  );
}

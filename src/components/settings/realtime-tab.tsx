"use client";

import { Wifi, Server, Activity, ArrowRight } from "lucide-react";

export function RealtimeTab() {
  const features = [
    {
      icon: Server,
      title: "Custom WebSocket Server",
      desc: "Connect your own WebSocket endpoint for telemetry streaming instead of relying on Supabase's internal realtime layer.",
    },
    {
      icon: Activity,
      title: "Reconnection Controls",
      desc: "Configurable retry limits, backoff strategies, and fallback-to-polling when persistent connections drop.",
    },
    {
      icon: Wifi,
      title: "Cross-Service Webhooks",
      desc: "Register external webhook URLs to receive incident events (PagerDuty, Slack, email) without polling.",
    },
  ];

  return (
    <div className="space-y-5">
      <div className="rounded-lg border border-border bg-surface-container-high px-4 py-3">
        <p className="text-sm text-on-surface-variant leading-relaxed">
          Currently, realtime updates use Supabase's built-in channel subscriptions
          (<span className="font-mono text-on-surface">supabase.channel()</span>). The
          settings below are placeholders for when a custom realtime infrastructure
          replaces the Supabase default.
        </p>
      </div>

      {features.map((f) => {
        const Icon = f.icon;
        return (
          <div key={f.title} className="flex items-start gap-3 rounded-lg border border-border/50 px-4 py-3 opacity-70">
            <div className="mt-0.5 rounded-lg bg-primary/10 p-2">
              <Icon className="h-4 w-4 text-primary" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-on-surface">{f.title}</p>
              <p className="text-xs text-on-surface-variant mt-0.5">{f.desc}</p>
            </div>
            <ArrowRight className="mt-1 h-4 w-4 text-on-surface-variant shrink-0" />
          </div>
        );
      })}
    </div>
  );
}

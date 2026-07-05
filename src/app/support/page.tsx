"use client";

import { useState } from "react";
import { LifeBuoy, ChevronDown, MessageSquare, FileText, ExternalLink, Mail } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const FAQS = [
  { q: "How do I create a new incident?", a: "Click the \"Create Incident\" button in the top bar or use the keyboard shortcut Ctrl+N. Fill in the title, severity, service, and description fields, then submit." },
  { q: "What do priority levels mean?", a: "P0 (Critical): Complete service outage. P1 (High): Major feature unavailable. P2 (Medium): Partial degradation. P3 (Low): Minor issue with workaround. P4 (Info): Informational or cosmetic." },
  { q: "How does AI analysis work?", a: "AI analysis uses the configured provider (Groq Llama 3 or GPT-4o) to parse incident logs and context, then generates a root cause summary, blast radius estimate, and recommended mitigation steps." },
  { q: "Can I integrate with external tools?", a: "Yes. IncidentIQ supports webhook integrations via the Settings > Integrations panel. Custom webhooks can be configured for Slack, PagerDuty, or any HTTP endpoint." },
  { q: "How is real-time data streamed?", a: "The dashboard uses Supabase Realtime (WebSocket-based CDC) to push live incident updates. On disconnect, it automatically falls back to polling every 15 seconds." },
  { q: "How do I export analytics data?", a: "From the Analytics page, use the \"Export CSV\" button in the top-right corner. The export includes all incident data within the selected time range." },
];

const SUPPORT_CARDS = [
  { icon: FileText, title: "Documentation", description: "Comprehensive API reference, deployment guide, and operational runbooks.", action: "Read Docs", link: "#" },
  { icon: MessageSquare, title: "Community Forum", description: "Discuss best practices, share configurations, and get help from peers.", action: "Join Forum", link: "#" },
  { icon: Mail, title: "Contact Support", description: "Reach the engineering team directly for mission-critical issues.", action: "Email Us", link: "mailto:support@incidentiq.dev" },
];

export default function SupportPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  return (
    <div className="p-4 md:p-6">
      <div className="mb-6">
        <div className="mb-1 flex items-center gap-2">
          <LifeBuoy className="h-5 w-5 text-primary" />
          <h1 className="text-lg font-semibold text-on-surface">Help & Support</h1>
        </div>
        <p className="text-sm text-on-surface-variant">
          Documentation, FAQs, and support resources for IncidentIQ.
        </p>
      </div>

      <div className="mb-8">
        <h2 className="mb-3 text-sm font-semibold text-on-surface">Frequently Asked Questions</h2>
        <div className="space-y-1">
          {FAQS.map((faq, i) => (
            <div key={i} className="rounded-lg border border-border overflow-hidden">
              <button
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                className="flex w-full items-center justify-between px-4 py-3 text-sm font-medium text-on-surface hover:bg-white/[0.02] transition-colors"
              >
                {faq.q}
                <ChevronDown className={cn("h-4 w-4 text-on-surface-variant transition-transform", openFaq === i && "rotate-180")} />
              </button>
              {openFaq === i && (
                <div className="border-t border-border px-4 py-3 text-sm text-on-surface-variant leading-relaxed">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <h2 className="mb-3 text-sm font-semibold text-on-surface">Support Resources</h2>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {SUPPORT_CARDS.map((card) => {
          const Icon = card.icon;
          return (
            <Card key={card.title}>
              <CardContent className="p-4">
                <Icon className="mb-2 h-5 w-5 text-primary" />
                <h3 className="mb-1 text-sm font-semibold text-on-surface">{card.title}</h3>
                <p className="mb-3 text-xs text-on-surface-variant leading-relaxed">{card.description}</p>
                <a href={card.link} target="_blank" rel="noopener noreferrer">
                  <Button variant="secondary" size="sm">
                    {card.action === "Email Us" ? <Mail className="h-3.5 w-3.5" /> : <ExternalLink className="h-3.5 w-3.5" />}
                    {card.action}
                  </Button>
                </a>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import { LifeBuoy, ChevronDown, MessageSquare, FileText, ExternalLink, Mail } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const FAQS = [
  { q: "How do I create a new incident?", a: "Click the \"Create Incident\" button in the top bar (or the header of the Incidents table). Fill in the title, description, and priority (P0–P3), then submit. The system auto-generates a display ID like INC-0001." },
  { q: "What do the priority levels mean?", a: "P0 (Critical Outage) — complete service down. P1 (Severe Degradation) — major feature broken. P2 (Partial Impact) — degraded but workable. P3 (Minor Issue) — cosmetic or low-impact." },
  { q: "How does the AI summary work?", a: "Click \"Generate\" on any incident detail page. The app reads your configured provider in Settings > AI Config (Groq or Gemini), sends the incident context and timeline, and returns a root cause analysis, blast radius, and recommended actions." },
  { q: "How do I include code or images in an update?", a: "Use the toolbar above the composer. The Terminal button opens a code panel — paste your code, click Insert, then Post. The Image button supports pasting a URL or uploading from your system. Files are uploaded to Supabase Storage and linked automatically." },
  { q: "How do I search, filter, or bulk-resolve incidents?", a: "Use the header search bar (works across all pages). On the Incidents page, click service chips to filter, priority chips in the Triage Queue, or check the box next to incidents to select multiple and click \"Resolve Selected\"." },
  { q: "How do I delete or edit a timeline update?", a: "Hover over any timeline entry on the incident detail page. A trash icon appears — click it, then Confirm to delete. To edit the assignee name or linked PR, click the text in the incident header." },
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

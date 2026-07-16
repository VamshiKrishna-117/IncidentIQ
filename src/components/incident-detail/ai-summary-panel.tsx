"use client";

import { useState } from "react";
import { Brain, Sparkles, Shield, ChevronRight, AlertTriangle, Clock } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuthStore } from "@/stores/auth-store";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { stripImageMarkdown } from "@/lib/utils";
import type { Incident, IncidentUpdate, AIResult } from "@/types";

const supabase = createClient();

interface AISummaryPanelProps {
  incident: Incident;
  existingResults: AIResult[];
  updates: IncidentUpdate[];
}

interface SummaryData {
  root_cause: string;
  confidence: number;
  blast_radius: string;
  recommended_action: string;
  affected_services: string[];
  actions: { title: string; description: string; impact: string }[];
  priority_review: { recommendation: string; reason: string };
}

export function AISummaryPanel({ incident, existingResults, updates }: AISummaryPanelProps) {
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState<SummaryData | null>(() => {
    const existing = existingResults.find((r) => r.type === "SUMMARY");
    if (existing?.metadata) return existing.metadata as unknown as SummaryData;
    return null;
  });
  const { openAuthModal } = useAuthStore();
  const toast = useToast();

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/incidents/${incident.id}/ai`, { method: "POST" });
      if (res.status === 401) {
        openAuthModal();
        return;
      }
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      setSummary(json.data);
      toast.success("AI analysis complete");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to generate AI analysis");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Brain className="h-4 w-4 text-green-400 shrink-0" />
              <CardTitle>AI Summary</CardTitle>
            </div>
            <Button variant="secondary" size="sm" onClick={handleGenerate} loading={loading}>
              <Sparkles className="h-4 w-4" />
              {summary ? "Regenerate" : "Generate"}
            </Button>
          </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-3">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-20 w-full" />
          </div>
        ) : summary ? (
          <div className="space-y-4">
            <div>
              <p className="mb-1 text-xs font-medium text-on-surface-variant">Root Cause Analysis</p>
              <p className="break-words text-sm text-on-surface">{stripImageMarkdown(summary.root_cause)}</p>
            </div>

            {summary.confidence && (
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-green-400" />
                <span className="text-xs text-on-surface-variant">Confidence Score</span>
                <span className="text-sm font-semibold text-green-400">{summary.confidence}%</span>
              </div>
            )}

            {summary.blast_radius && (
              <div className="flex items-start gap-2">
                <AlertTriangle className="mt-0.5 h-4 w-4 text-yellow-400 shrink-0" />
                <div className="min-w-0">
                  <p className="text-xs font-medium text-on-surface-variant">Blast Radius</p>
                  <p className="break-words text-sm text-on-surface">{stripImageMarkdown(summary.blast_radius)}</p>
                </div>
              </div>
            )}

            {summary.recommended_action && (
              <div className="rounded-lg border border-green-500/20 bg-green-500/5 p-3">
                <div className="flex items-center gap-2">
                  <TerminalIcon className="h-4 w-4 text-green-400 shrink-0" />
                  <span className="break-words text-xs font-medium text-green-400">Recommended Action</span>
                </div>
                <p className="mt-1 break-words text-sm text-green-300">{stripImageMarkdown(summary.recommended_action)}</p>
              </div>
            )}

            {summary.actions && summary.actions.length > 0 && (
              <div>
                <p className="mb-2 text-xs font-medium text-on-surface-variant">Suggested Next Actions</p>
                <div className="space-y-2">
                  {summary.actions.map((action, i) => (
                    <div key={i} className="flex items-start gap-2 rounded-lg bg-surface-container-higher p-2.5">
                      <ChevronRight className="mt-0.5 h-4 w-4 shrink-0 text-on-surface-variant" />
                      <div className="min-w-0 flex-1">
                        <p className="break-words text-sm font-medium text-on-surface">{stripImageMarkdown(action.title)}</p>
                        <p className="break-words text-xs text-on-surface-variant">{stripImageMarkdown(action.description)}</p>
                      </div>
                      <Badge variant={action.impact === "HIGH" ? "P0" : action.impact === "MEDIUM" ? "P2" : "P3"}>
                        {action.impact}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {summary.priority_review && (
              <div className="flex items-start gap-2 rounded-lg border border-border p-3">
                {summary.priority_review.recommendation === "HIGH_PRIORITY" ? (
                  <AlertTriangle className="mt-0.5 h-4 w-4 text-error shrink-0" />
                ) : (
                  <Clock className="mt-0.5 h-4 w-4 text-yellow-400 shrink-0" />
                )}
                <div className="min-w-0">
                  <p className="text-xs font-medium text-on-surface-variant">Priority Recommendation</p>
                  <p className="break-words text-sm font-semibold text-on-surface">
                    {stripImageMarkdown(summary.priority_review.recommendation.replace(/_/g, " "))}
                  </p>
                  <p className="break-words text-xs text-on-surface-variant">{stripImageMarkdown(summary.priority_review.reason)}</p>
                </div>
              </div>
            )}

            {summary.affected_services && summary.affected_services.length > 0 && (
              <div>
                <p className="mb-1 text-xs font-medium text-on-surface-variant">Affected Services</p>
                <div className="flex flex-wrap gap-2">
                  {summary.affected_services.map((svc) => (
                    <Badge key={svc} variant="INVESTIGATING">{svc}</Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="py-4 text-center">
            <Brain className="mx-auto mb-2 h-6 w-6 text-on-surface-variant" />
            <p className="text-sm text-on-surface-variant">
              Click "Generate" to analyze this incident with AI.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function TerminalIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="4 17 10 11 4 5" />
      <line x1="12" y1="19" x2="20" y2="19" />
    </svg>
  );
}

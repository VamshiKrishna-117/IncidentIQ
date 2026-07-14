"use client";

import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { AIAnalysisCard } from "@/components/ai/ai-analysis-card";
import { AIHistoryTimeline } from "@/components/ai/ai-history-timeline";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LoadingPage } from "@/components/shared/loading-state";
import { ErrorState } from "@/components/shared/error-state";
import { EmptyState } from "@/components/shared/empty-state";
import { useToast } from "@/hooks/use-toast";
import { Brain, Sparkles } from "lucide-react";
import { useState } from "react";
import type { Incident, AIResult } from "@/types";

const supabase = createClient();

export default function AIAssistantPage() {
  const [generatingId, setGeneratingId] = useState<string | null>(null);
  const toast = useToast();

  const { data: incidents, isLoading, error, refetch } = useQuery({
    queryKey: ["ai-incidents"],
    queryFn: async () => {
      const { data } = await supabase.from("incidents").select("*").order("created_at", { ascending: false });
      return (data ?? []) as Incident[];
    },
  });

  const { data: aiResults, refetch: refetchAI } = useQuery({
    queryKey: ["ai-all-results"],
    queryFn: async () => {
      const { data } = await supabase.from("ai_results").select("*").order("created_at", { ascending: false });
      return (data ?? []) as AIResult[];
    },
  });

  const handleGenerate = async (incidentId: string) => {
    setGeneratingId(incidentId);
    try {
      const res = await fetch(`/api/incidents/${incidentId}/ai`, { method: "POST" });
      if (!res.ok) {
        const body = await res.json().catch(() => ({ error: "AI analysis failed" }));
        toast.error(body.error || "AI analysis failed");
        return;
      }
      toast.success("Analysis complete");
      refetchAI();
    } catch {
      toast.error("Network error — unable to reach the AI service");
    } finally {
      setGeneratingId(null);
    }
  };

  const getResult = (incidentId: string) => aiResults?.find((r) => r.incident_id === incidentId && r.type === "SUMMARY");

  if (isLoading) return <LoadingPage />;
  if (error) {
    return (
      <div className="p-4 md:p-6">
        <ErrorState type="error" title="Failed to load" description="Unable to connect to the backend." action={{ label: "Retry", onClick: () => refetch() }} />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6">
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="mb-1 flex items-center gap-2">
              <Brain className="h-5 w-5 text-green-400" />
              <h1 className="text-lg font-semibold text-on-surface">AI Analysis</h1>
            </div>
            <p className="text-sm text-on-surface-variant">
              Real-time incident intelligence and mitigation strategy generation.
            </p>
          </div>
          <Button variant="secondary" size="sm" onClick={() => refetchAI()}>
            <Sparkles className="h-4 w-4" />
            <span className="hidden sm:inline">Refresh Results</span>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          {incidents && incidents.length > 0 ? (
            incidents.map((incident) => (
              <AIAnalysisCard
                key={incident.id}
                incident={incident}
                result={getResult(incident.id)}
                onGenerate={() => handleGenerate(incident.id)}
                generating={generatingId === incident.id}
              />
            ))
          ) : (
          <EmptyState
            icon={Brain}
            title="No Incidents Yet"
            description="Create an incident to see AI-powered analysis and recommendations."
          />
          )}
        </div>

        <div>
          <AIHistoryTimeline />
        </div>
      </div>
    </div>
  );
}

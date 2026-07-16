"use client";

import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import {
  useIncident,
  useIncidentUpdates,
  useDeleteUpdate,
} from "@/hooks/use-incidents";
import { useRealtimeIncidentUpdates } from "@/hooks/use-supabase-realtime";
import { IncidentHeader } from "@/components/incident-detail/incident-header";
import { Timeline } from "@/components/incident-detail/timeline";
import { UpdateComposer } from "@/components/incident-detail/update-composer";
import { AISummaryPanel } from "@/components/incident-detail/ai-summary-panel";
import { LoadingDetail } from "@/components/shared/loading-state";
import { ErrorState } from "@/components/shared/error-state";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Terminal, Shield, Activity } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { AIResult } from "@/types";

const supabase = createClient();

function serviceStatusVariant(status: string) {
  if (status === "HEALTHY") return "RESOLVED" as const;
  if (status === "DEGRADED") return "INVESTIGATING" as const;
  return "P0" as const;
}

function serviceStatusLabel(status: string) {
  if (status === "HEALTHY") return "Healthy";
  if (status === "DEGRADED") return "Degraded";
  return "Down";
}

export default function IncidentDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const { data: incident, isLoading, error, refetch } = useIncident(id);
  const { data: updates, isLoading: updatesLoading } = useIncidentUpdates(id);
  useRealtimeIncidentUpdates(id);
  const deleteUpdate = useDeleteUpdate(id);

  const { data: aiResults = [] } = useQuery({
    queryKey: ["ai-results", id],
    queryFn: async () => {
      const { data } = await supabase
        .from("ai_results")
        .select("*")
        .eq("incident_id", id)
        .order("created_at", { ascending: false });
      return (data ?? []) as AIResult[];
    },
    enabled: !!id,
  });

  const { data: serviceStatus } = useQuery({
    queryKey: ["service-status", incident?.service_affected],
    queryFn: async () => {
      if (!incident?.service_affected) return null;
      const { data } = await supabase
        .from("services")
        .select("status")
        .ilike("name", `%${incident.service_affected}%`)
        .maybeSingle();
      return data?.status ?? null;
    },
    enabled: !!incident?.service_affected,
  });

  if (isLoading) return <LoadingDetail />;
  if (error) {
    return (
      <ErrorState
        type="not_found"
        title="Incident Not Found"
        description="This incident could not be found or may have been deleted."
        action={{ label: "Return to Dashboard", onClick: () => window.history.back() }}
      />
    );
  }
  if (!incident) return null;

  const svcStatus = serviceStatus || (incident.status === "RESOLVED" ? "HEALTHY" : "DEGRADED");

  return (
    <div className="p-4 md:p-6">
      <IncidentHeader incident={incident} />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          {incident.description && (
            <Card>
              <CardHeader>
                <CardTitle>Description</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-on-surface-variant">{incident.description}</p>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Activity className="h-4 w-4 text-on-surface-variant" />
                <CardTitle>Live Timeline</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <Timeline updates={updates} loading={updatesLoading} onDeleteUpdate={(id) => deleteUpdate.mutate(id)} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Post Update</CardTitle>
            </CardHeader>
            <CardContent>
              <UpdateComposer incidentId={id} isDemo={incident.is_demo} />
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <AISummaryPanel
            incident={incident}
            existingResults={aiResults}
            updates={updates ?? []}
          />

          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Terminal className="h-4 w-4 text-on-surface-variant" />
                <CardTitle>Affected Services</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              {incident.service_affected ? (
                <div className="flex items-center justify-between rounded-lg border border-border bg-surface-container-higher px-3 py-2">
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-yellow-400" />
                    <span className="text-sm text-on-surface">{incident.service_affected}</span>
                  </div>
                  <Badge variant={serviceStatusVariant(svcStatus)}>
                    {serviceStatusLabel(svcStatus)}
                  </Badge>
                </div>
              ) : (
                <p className="text-sm text-on-surface-variant">No service specified.</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

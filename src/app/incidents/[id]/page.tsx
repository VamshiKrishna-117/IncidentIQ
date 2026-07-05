"use client";

import { useParams } from "next/navigation";
import {
  useIncident,
  useIncidentUpdates,
} from "@/hooks/use-incidents";
import { useRealtimeIncidentUpdates } from "@/hooks/use-supabase-realtime";
import { IncidentHeader } from "@/components/incident-detail/incident-header";
import { Timeline } from "@/components/incident-detail/timeline";
import { UpdateComposer } from "@/components/incident-detail/update-composer";
import { LoadingPage } from "@/components/shared/loading-state";
import { ErrorState } from "@/components/shared/error-state";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Brain, Terminal, Shield, Activity } from "lucide-react";

export default function IncidentDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const { data: incident, isLoading, error, refetch } = useIncident(id);
  const { data: updates, isLoading: updatesLoading } = useIncidentUpdates(id);
  useRealtimeIncidentUpdates(id);

  if (isLoading) return <LoadingPage />;
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
              <Timeline updates={updates} loading={updatesLoading} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Post Update</CardTitle>
            </CardHeader>
            <CardContent>
              <UpdateComposer incidentId={id} />
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Brain className="h-4 w-4 text-green-400" />
                <CardTitle>AI Summary</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <p className="text-xs font-medium text-on-surface-variant">Root Cause Analysis</p>
                <p className="text-sm text-on-surface">
                  AI analysis will appear here once generated. Click "Generate AI Summary" to analyze this incident.
                </p>
                <div className="flex items-center gap-3 rounded-lg bg-surface-container-higher p-3">
                  <Shield className="h-4 w-4 text-green-400" />
                  <div>
                    <p className="text-xs font-medium text-on-surface">Recommended Action</p>
                    <p className="font-mono text-xs text-green-400">Awaiting analysis...</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

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
                  <Badge variant={incident.status === "RESOLVED" ? "RESOLVED" : "INVESTIGATING"}>
                    {incident.status === "RESOLVED" ? "Resolved" : "Degraded"}
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

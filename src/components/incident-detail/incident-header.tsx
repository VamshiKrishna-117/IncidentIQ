"use client";

import { useState } from "react";
import { UserPlus, Link2, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/incidents/status-badge";
import { PriorityBadge } from "@/components/incidents/priority-badge";
import { ConfirmModal } from "@/components/shared/confirm-modal";
import type { Incident, Status } from "@/types";
import { STATUS_LABELS } from "@/types";
import { useUpdateIncident } from "@/hooks/use-incidents";
import { useToast } from "@/hooks/use-toast";

interface IncidentHeaderProps {
  incident: Incident;
}

export function IncidentHeader({ incident }: IncidentHeaderProps) {
  const [showResolve, setShowResolve] = useState(false);
  const updateIncident = useUpdateIncident();
  const toast = useToast();

  const statusFlow: Status[] = ["OPEN", "INVESTIGATING", "IDENTIFIED", "MONITORING", "RESOLVED"];
  const currentIdx = statusFlow.indexOf(incident.status);
  const nextStatus = currentIdx < statusFlow.length - 1 ? statusFlow[currentIdx + 1] : null;

  const handleAdvanceStatus = () => {
    if (!nextStatus) return;
    updateIncident.mutate(
      { id: incident.id, status: nextStatus },
      {
        onSuccess: () => {
          if (nextStatus === "RESOLVED") {
            setShowResolve(false);
            toast.success("Incident resolved");
          }
        },
      }
    );
  };

  return (
    <>
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="mb-1 flex items-center gap-2">
            <span className="font-mono text-xs text-on-surface-variant">{incident.display_id}</span>
            <StatusBadge status={incident.status} />
            <PriorityBadge priority={incident.priority} />
          </div>
          <h2 className="text-heading-md font-semibold text-on-surface">{incident.title}</h2>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" size="sm">
            <UserPlus className="h-4 w-4" />
            Assign
          </Button>
          <Button variant="secondary" size="sm">
            <Link2 className="h-4 w-4" />
            Link PR
          </Button>
          {nextStatus && nextStatus !== "RESOLVED" && (
            <Button variant="primary" size="sm" onClick={handleAdvanceStatus} loading={updateIncident.isPending}>
              <CheckCircle className="h-4 w-4" />
              Mark {STATUS_LABELS[nextStatus]}
            </Button>
          )}
          {incident.status !== "RESOLVED" && (
            <Button variant="secondary" size="sm" onClick={() => setShowResolve(true)}>
              <CheckCircle className="h-4 w-4 text-green-400" />
              Resolve
            </Button>
          )}
        </div>
      </div>

      <ConfirmModal
        open={showResolve}
        onOpenChange={setShowResolve}
        title={`Resolve ${incident.display_id}`}
        description="Are you sure you want to resolve this incident? This will notify all stakeholders."
        confirmLabel="Confirm Resolution"
        onConfirm={() => {
          updateIncident.mutate(
            { id: incident.id, status: "RESOLVED" },
            { onSuccess: () => { setShowResolve(false); toast.success("Incident resolved"); } }
          );
        }}
        loading={updateIncident.isPending}
      />
    </>
  );
}

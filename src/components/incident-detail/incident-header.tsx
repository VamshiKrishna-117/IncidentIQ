"use client";

import { useState, useRef, useEffect } from "react";
import { UserPlus, Link2, CheckCircle, User, ExternalLink, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/incidents/status-badge";
import { PriorityBadge } from "@/components/incidents/priority-badge";
import { ConfirmModal } from "@/components/shared/confirm-modal";
import type { Incident, Status } from "@/types";
import { STATUS_LABELS } from "@/types";
import { useUpdateIncident, useCreateUpdate } from "@/hooks/use-incidents";
import { useToast } from "@/hooks/use-toast";

interface IncidentHeaderProps {
  incident: Incident;
}

export function IncidentHeader({ incident }: IncidentHeaderProps) {
  const [showResolve, setShowResolve] = useState(false);
  const [editingAssignee, setEditingAssignee] = useState(false);
  const [assigneeInput, setAssigneeInput] = useState(incident.assignee ?? "");
  const [showLinkPR, setShowLinkPR] = useState(false);
  const [prUrl, setPrUrl] = useState("");
  const assigneeRef = useRef<HTMLInputElement>(null);
  const updateIncident = useUpdateIncident();
  const createUpdate = useCreateUpdate(incident.id);
  const toast = useToast();

  useEffect(() => {
    if (editingAssignee && assigneeRef.current) {
      assigneeRef.current.focus();
    }
  }, [editingAssignee]);

  const statusFlow: Status[] = ["OPEN", "INVESTIGATING", "IDENTIFIED", "MONITORING", "RESOLVED"];
  const currentIdx = statusFlow.indexOf(incident.status);
  const nextStatus = currentIdx < statusFlow.length - 1 ? statusFlow[currentIdx + 1] : null;

  const handleAdvanceStatus = () => {
    if (!nextStatus) return;
    updateIncident.mutate(
      { id: incident.id, status: nextStatus },
      { onSuccess: () => { if (nextStatus === "RESOLVED") setShowResolve(false); } }
    );
  };

  const handleSaveAssignee = () => {
    const val = assigneeInput.trim();
    updateIncident.mutate(
      { id: incident.id, assignee: val || null },
      { onSuccess: () => setEditingAssignee(false) }
    );
  };

  const handleLinkPR = () => {
    const url = prUrl.trim();
    if (!url) return;
    createUpdate.mutate(
      { message: `Linked PR: ${url}`, author_name: "System" },
      { onSuccess: () => { setShowLinkPR(false); setPrUrl(""); toast.success("PR linked to timeline"); } }
    );
  };

  return (
    <>
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="mb-1 flex items-center gap-2">
            <span className="font-mono text-xs text-on-surface-variant">{incident.display_id}</span>
            <StatusBadge status={incident.status} />
            <PriorityBadge priority={incident.priority} />
          </div>
          <h2 className="text-heading-md font-semibold text-on-surface">{incident.title}</h2>
          <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-on-surface-variant">
            <span>Reported by <span className="text-on-surface font-medium">{incident.reporter_name}</span></span>
            {editingAssignee ? (
              <span className="flex items-center gap-1">
                <User className="h-3 w-3" />
                <input
                  ref={assigneeRef}
                  value={assigneeInput}
                  onChange={(e) => setAssigneeInput(e.target.value)}
                  onBlur={handleSaveAssignee}
                  onKeyDown={(e) => { if (e.key === "Enter") handleSaveAssignee(); if (e.key === "Escape") { setEditingAssignee(false); setAssigneeInput(incident.assignee ?? ""); } }}
                  className="w-20 sm:w-28 rounded border border-border bg-[#050505] px-1.5 py-0.5 text-xs text-on-surface focus:outline-none focus:border-primary"
                  placeholder="Unassigned"
                />
              </span>
            ) : (
              <button onClick={() => setEditingAssignee(true)} className="flex items-center gap-1 hover:text-on-surface transition-colors cursor-pointer">
                <User className="h-3 w-3" />
                {incident.assignee || "Unassigned"}
              </button>
            )}
          </div>
        </div>

        <div className="flex flex-wrap gap-1.5 sm:gap-2">
          <Button variant="secondary" size="sm" onClick={() => setEditingAssignee(true)}>
            <UserPlus className="h-4 w-4" />
            <span className="hidden sm:inline">Assign</span>
          </Button>
          <Button variant="secondary" size="sm" onClick={() => setShowLinkPR(true)}>
            <Link2 className="h-4 w-4" />
            <span className="hidden sm:inline">Link PR</span>
          </Button>
          {nextStatus && nextStatus !== "RESOLVED" && (
            <Button variant="primary" size="sm" onClick={handleAdvanceStatus} loading={updateIncident.isPending}>
              <CheckCircle className="h-4 w-4" />
              <span className="hidden sm:inline">Mark </span>
              {STATUS_LABELS[nextStatus]}
            </Button>
          )}
          {incident.status !== "RESOLVED" && (
            <Button variant="secondary" size="sm" onClick={() => setShowResolve(true)}>
              <CheckCircle className="h-4 w-4 text-green-400" />
              <span className="hidden sm:inline">Resolve</span>
            </Button>
          )}
        </div>
      </div>

      {showLinkPR && (
        <div className="mb-4 flex flex-wrap items-center gap-2 rounded-lg border border-border bg-surface-container-low p-2.5 sm:p-3">
          <Link2 className="h-4 w-4 text-on-surface-variant shrink-0" />
          <input
            value={prUrl}
            onChange={(e) => setPrUrl(e.target.value)}
            placeholder="Paste PR URL..."
            className="min-w-0 flex-1 basis-[120px] bg-transparent text-sm text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none"
            onKeyDown={(e) => { if (e.key === "Enter") handleLinkPR(); if (e.key === "Escape") { setShowLinkPR(false); setPrUrl(""); } }}
          />
          <div className="flex items-center gap-1.5">
            <Button size="sm" onClick={handleLinkPR} loading={createUpdate.isPending} disabled={!prUrl.trim()}>
              <ExternalLink className="h-3.5 w-3.5" />
              Link
            </Button>
            <button onClick={() => { setShowLinkPR(false); setPrUrl(""); }} className="text-on-surface-variant hover:text-on-surface cursor-pointer">
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

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

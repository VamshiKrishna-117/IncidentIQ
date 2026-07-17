"use client";

import type { IncidentUpdate } from "@/types";
import { TimelineItem } from "./timeline-item";
import { LoadingTable } from "@/components/shared/loading-state";

interface TimelineProps {
  updates: IncidentUpdate[] | undefined;
  loading: boolean;
  canDelete?: boolean;
  onDeleteUpdate?: (updateId: string) => void;
}

export function Timeline({ updates, loading, canDelete, onDeleteUpdate }: TimelineProps) {
  if (loading) return <LoadingTable rows={3} />;

  if (!updates || updates.length === 0) {
    return (
      <div className="rounded-lg border border-border bg-surface-container-low p-6 text-center">
        <p className="text-sm text-on-surface-variant">No updates yet. Post the first update below.</p>
      </div>
    );
  }

  return (
    <div className="relative pl-0">
      {updates.map((update, idx) => (
        <TimelineItem
          key={update.id}
          message={update.message}
          authorName={update.author_name}
          timestamp={update.created_at}
          type={update.update_type as "USER" | "SYSTEM" | "AI"}
          isFirst={idx === 0}
          isLast={idx === updates.length - 1}
          canDelete={canDelete}
          onDelete={onDeleteUpdate ? () => onDeleteUpdate(update.id) : undefined}
        />
      ))}
    </div>
  );
}

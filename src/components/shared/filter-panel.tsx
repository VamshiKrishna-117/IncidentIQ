"use client";

import { useState } from "react";
import { X, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Priority, Status } from "@/types";
import { PRIORITY_LABELS, STATUS_LABELS } from "@/types";

interface FilterPanelProps {
  open: boolean;
  onClose: () => void;
  onApply: (filters: FilterState) => void;
}

export interface FilterState {
  severities: Priority[];
  statuses: Status[];
}

const priorityList: Priority[] = ["P0", "P1", "P2", "P3"];
const statusList: Status[] = ["OPEN", "INVESTIGATING", "IDENTIFIED", "MONITORING", "RESOLVED"];

export function FilterPanel({ open, onClose, onApply }: FilterPanelProps) {
  const [severities, setSeverities] = useState<Priority[]>([]);
  const [statuses, setStatuses] = useState<Status[]>([]);

  if (!open) return null;

  const toggleSeverity = (p: Priority) => {
    setSeverities((prev) => prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p]);
  };

  const toggleStatus = (s: Status) => {
    setStatuses((prev) => prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]);
  };

  const handleApply = () => {
    onApply({ severities, statuses });
    onClose();
  };

  const handleClear = () => {
    setSeverities([]);
    setStatuses([]);
    onApply({ severities: [], statuses: [] });
    onClose();
  };

  return (
    <div className="rounded-xl border border-border bg-surface-container-high p-4 shadow-lg">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-on-surface">Filter Panel</h3>
        <button onClick={onClose} className="rounded p-0.5 text-on-surface-variant hover:text-on-surface">
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="mb-4">
        <p className="mb-2 text-xs font-medium text-on-surface-variant uppercase tracking-wider">Severity</p>
        <div className="space-y-1.5">
          {priorityList.map((p) => (
            <label key={p} className="flex cursor-pointer items-center gap-2 rounded px-2 py-1 hover:bg-white/5">
              <div
                className={cn(
                  "flex h-4 w-4 items-center justify-center rounded border transition-colors",
                  severities.includes(p) ? "border-primary bg-primary" : "border-border"
                )}
              >
                {severities.includes(p) && <Check className="h-3 w-3 text-on-primary" />}
              </div>
              <span className="text-sm text-on-surface">{PRIORITY_LABELS[p]}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="mb-4">
        <p className="mb-2 text-xs font-medium text-on-surface-variant uppercase tracking-wider">Status</p>
        <div className="space-y-1.5">
          {statusList.map((s) => (
            <label key={s} className="flex cursor-pointer items-center gap-2 rounded px-2 py-1 hover:bg-white/5">
              <div
                className={cn(
                  "flex h-4 w-4 items-center justify-center rounded border transition-colors",
                  statuses.includes(s) ? "border-primary bg-primary" : "border-border"
                )}
              >
                {statuses.includes(s) && <Check className="h-3 w-3 text-on-primary" />}
              </div>
              <span className="text-sm text-on-surface">{STATUS_LABELS[s]}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="flex gap-2">
        <button
          onClick={handleClear}
          className="flex-1 rounded-lg border border-border px-3 py-1.5 text-xs text-on-surface-variant hover:bg-white/5 transition-colors"
        >
          Clear All
        </button>
        <button
          onClick={handleApply}
          className="flex-1 rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-on-primary hover:bg-primary/90 transition-colors"
        >
          Apply Filters
        </button>
      </div>
    </div>
  );
}

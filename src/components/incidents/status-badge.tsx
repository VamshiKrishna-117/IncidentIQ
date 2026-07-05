import { Badge } from "@/components/ui/badge";
import type { Status } from "@/types";

interface StatusBadgeProps {
  status: Status;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const labels: Record<Status, string> = {
    OPEN: "Open",
    INVESTIGATING: "Investigating",
    IDENTIFIED: "Identified",
    MONITORING: "Monitoring",
    RESOLVED: "Resolved",
  };

  return <Badge variant={status}>{labels[status]}</Badge>;
}

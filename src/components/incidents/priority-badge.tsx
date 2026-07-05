import { Badge } from "@/components/ui/badge";
import type { Priority } from "@/types";

interface PriorityBadgeProps {
  priority: Priority;
}

const labels: Record<Priority, string> = {
  P0: "Critical",
  P1: "High",
  P2: "Medium",
  P3: "Low",
};

export function PriorityBadge({ priority }: PriorityBadgeProps) {
  return <Badge variant={priority}>{labels[priority]}</Badge>;
}

export type Priority = "P0" | "P1" | "P2" | "P3";
export type Status = "OPEN" | "INVESTIGATING" | "IDENTIFIED" | "MONITORING" | "RESOLVED";
export type UpdateType = "USER" | "SYSTEM" | "AI";
export type AIResultType = "SUMMARY" | "NEXT_ACTION" | "PRIORITY_REVIEW";

export interface Incident {
  id: string;
  display_id: string;
  title: string;
  description: string;
  priority: Priority;
  status: Status;
  reporter_name: string;
  assignee: string | null;
  service_affected: string | null;
  latest_update: string | null;
  user_id: string | null;
  is_demo: boolean;
  created_at: string;
  updated_at: string;
}

export interface IncidentUpdate {
  id: string;
  incident_id: string;
  message: string;
  author_name: string;
  update_type: UpdateType;
  created_at: string;
}

export interface AIResult {
  id: string;
  incident_id: string;
  type: AIResultType;
  result_text: string;
  confidence: number | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
}

export const PRIORITY_LABELS: Record<Priority, string> = {
  P0: "Critical Outage",
  P1: "Severe Degradation",
  P2: "Partial Impact",
  P3: "Minor Issue",
};

export const PRIORITY_ORDER: Record<Priority, number> = {
  P0: 0,
  P1: 1,
  P2: 2,
  P3: 3,
};

export const STATUS_LABELS: Record<Status, string> = {
  OPEN: "Open",
  INVESTIGATING: "Investigating",
  IDENTIFIED: "Identified",
  MONITORING: "Monitoring",
  RESOLVED: "Resolved",
};

export const NEXT_STATUS: Record<Status, Status | null> = {
  OPEN: "INVESTIGATING",
  INVESTIGATING: "IDENTIFIED",
  IDENTIFIED: "MONITORING",
  MONITORING: "RESOLVED",
  RESOLVED: null,
};

export type NotificationType = "incident_created" | "update_posted" | "status_changed" | "ai_analysis";

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  incident_id: string | null;
  read: boolean;
  created_at: string;
}

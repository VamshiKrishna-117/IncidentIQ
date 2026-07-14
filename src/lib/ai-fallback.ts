import type { Incident, IncidentUpdate, Priority } from "@/types";
import type { AISummary, AIAction, AIPriorityReview } from "./ai";

const criticalKeywords = ["down", "outage", "crash", "503", "502", "500", "latency", "timeout", "data loss", "security"];
const highKeywords = ["degraded", "slow", "error rate", "partial", "warning"];
const mediumKeywords = ["minor", "cosmetic", "some users", "intermittent"];

function getSeverityLevel(incident: Incident): number {
  const text = `${incident.title} ${incident.description}`.toLowerCase();
  if (criticalKeywords.some((k) => text.includes(k))) return 3;
  if (highKeywords.some((k) => text.includes(k))) return 2;
  if (mediumKeywords.some((k) => text.includes(k))) return 1;
  return 0;
}

function stripImageMarkdown(text: string): string {
  return text.replace(/!\[.*?\]\((.*?)\)/g, "[image]");
}

export function generateFallbackSummary(incident: Incident, updates: IncidentUpdate[]): AISummary {
  const severity = getSeverityLevel(incident);
  const lastUpdate = updates.length > 0 ? stripImageMarkdown(updates[updates.length - 1].message) : null;

  const rootCauseMap: Record<string, string> = {
    latency: "High latency detected, possibly due to resource exhaustion or upstream dependency failure.",
    timeout: "Request timeouts indicate potential network congestion or service capacity issues.",
    down: "Service appears to be unreachable. Possible deployment failure or infrastructure outage.",
    error: "Elevated error rates detected. Investigating recent changes and dependency health.",
  };

  const matchedKeyword = Object.entries(rootCauseMap).find(([key]) =>
    `${incident.title} ${incident.description}`.toLowerCase().includes(key)
  );

  const rootCause = matchedKeyword
    ? matchedKeyword[1]
    : `Unexpected behavior reported in ${incident.service_affected ?? "unknown service"}. Manual investigation required.`;

  const confidence = Math.min(50 + severity * 15, 85);

  const service = incident.service_affected ?? "unknown-service";

  return {
    root_cause: rootCause,
    confidence,
    blast_radius: severity >= 2
      ? `Impact likely affecting multiple users of ${service}.`
      : `Limited impact isolated to ${service}.`,
    recommended_action: lastUpdate
      ? `Review latest update: "${lastUpdate}". Consider rollback if recent deployment occurred.`
      : `Begin investigation of ${service}. Check recent deployments and monitoring dashboards.`,
    affected_services: [service],
  };
}

export function generateFallbackActions(incident: Incident): AIAction[] {
  const severity = getSeverityLevel(incident);
  const actions: AIAction[] = [];

  if (severity >= 2) {
    actions.push({
      title: "Consider rollback",
      description: `Recent changes to ${incident.service_affected ?? "affected service"} may have introduced the issue. Evaluate rollback.`,
      impact: "HIGH",
    });
  }

  actions.push({
    title: "Check monitoring dashboards",
    description: "Review Grafana/Datadog for correlated metrics around the incident timestamp.",
    impact: severity >= 2 ? "HIGH" : "MEDIUM",
  });

  actions.push({
    title: severity >= 2 ? "Notify stakeholders" : "Document findings",
    description: severity >= 2
      ? "Send status update to incident channel and affected teams."
      : "Add notes to the incident timeline for post-mortem analysis.",
    impact: "MEDIUM",
  });

  return actions;
}

export function generateFallbackPriority(incident: Incident): AIPriorityReview {
  const severity = getSeverityLevel(incident);

  if (severity >= 3) {
    return {
      recommendation: "HIGH_PRIORITY",
      reason: `Critical keywords detected in "${incident.title}". Immediate investigation required.`,
    };
  }

  if (severity >= 2) {
    return {
      recommendation: "HIGH_PRIORITY",
      reason: `Multiple indicators suggest significant user impact. Prioritize investigation.`,
    };
  }

  if (severity >= 1) {
    return {
      recommendation: "MONITOR",
      reason: "Low-severity indicators. Monitor and address during normal business hours.",
    };
  }

  return {
    recommendation: "ROUTINE",
    reason: "No critical indicators detected. Handle through standard triage process.",
  };
}

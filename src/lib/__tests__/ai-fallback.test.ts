import { describe, it, expect } from "vitest";
import {
  generateFallbackSummary,
  generateFallbackActions,
  generateFallbackPriority,
} from "../ai-fallback";
import type { Incident, IncidentUpdate } from "@/types";

const baseIncident: Incident = {
  id: "test-1",
  display_id: "INC-001",
  title: "API latency spike",
  description: "P99 latency increased to 5s on /checkout endpoint",
  priority: "P1",
  status: "INVESTIGATING",
  reporter_name: "Alice",
  assignee: null,
  service_affected: "payment-gateway",
  latest_update: null,
  created_at: "2026-07-05T10:00:00Z",
  updated_at: "2026-07-05T10:05:00Z",
};

const updates: IncidentUpdate[] = [
  { id: "u1", incident_id: "test-1", message: "Initial report received", author_name: "Alice", update_type: "USER", created_at: "2026-07-05T10:01:00Z" },
];

describe("generateFallbackSummary", () => {
  it("returns summary with confidence for critical keywords", () => {
    const critical: Incident = { ...baseIncident, title: "Database is down", description: "503 errors on all endpoints" };
    const result = generateFallbackSummary(critical, updates);
    expect(result.confidence).toBeGreaterThanOrEqual(50);
    expect(result.root_cause).toContain("unreachable");
    expect(result.blast_radius).toContain("multiple users");
    expect(result.recommended_action).toContain("Review latest update");
  });

  it("returns limited impact for low-severity keywords", () => {
    const minor: Incident = { ...baseIncident, title: "Cosmetic UI bug", description: "Minor alignment issue on dashboard" };
    const result = generateFallbackSummary(minor, []);
    expect(result.blast_radius).toContain("Limited impact");
    expect(result.recommended_action).toContain("Begin investigation");
  });

  it("returns unknown service when service_affected is null", () => {
    const noSvc: Incident = { ...baseIncident, service_affected: null };
    const result = generateFallbackSummary(noSvc, []);
    expect(result.affected_services).toContain("unknown-service");
  });
});

describe("generateFallbackActions", () => {
  it("returns 3 actions for high severity", () => {
    const high: Incident = { ...baseIncident, title: "Outage detected", priority: "P0" };
    const actions = generateFallbackActions(high);
    expect(actions.length).toBe(3);
    expect(actions.some((a) => a.title.includes("rollback"))).toBe(true);
    expect(actions.some((a) => a.impact === "HIGH")).toBe(true);
  });

  it("returns lower-impact actions for minor incidents", () => {
    const minor: Incident = { ...baseIncident, title: "Cosmetic UI issue", description: "Button misalignment on dashboard", priority: "P3" };
    const actions = generateFallbackActions(minor);
    expect(actions.length).toBe(2);
    expect(actions.every((a) => a.impact === "MEDIUM")).toBe(true);
  });

  it("includes rollback and high-impact actions for critical", () => {
    const critical: Incident = { ...baseIncident, title: "Service down", description: "503 errors from all endpoints", priority: "P0" };
    const actions = generateFallbackActions(critical);
    expect(actions.length).toBe(3);
    expect(actions.filter((a) => a.impact === "HIGH").length).toBe(2);
  });
});

describe("generateFallbackPriority", () => {
  it("recommends HIGH_PRIORITY for critical keywords", () => {
    const critical: Incident = { ...baseIncident, title: "Security breach detected" };
    const result = generateFallbackPriority(critical);
    expect(result.recommendation).toBe("HIGH_PRIORITY");
  });

  it("recommends ROUTINE for no keywords", () => {
    const routine: Incident = { ...baseIncident, title: "General inquiry", description: "User has a question" };
    const result = generateFallbackPriority(routine);
    expect(result.recommendation).toBe("ROUTINE");
  });
});

import { describe, it, expect, vi, beforeEach } from "vitest";
import { generateSummary, generateNextActions, reviewPriority } from "../ai";
import type { Incident, IncidentUpdate } from "@/types";

vi.mock("groq-sdk", () => {
  return {
    default: vi.fn().mockImplementation(() => ({
      chat: {
        completions: {
          create: vi.fn().mockResolvedValue({
            choices: [{ message: { content: null } }],
          }),
        },
      },
    })),
  };
});

vi.mock("@google/generative-ai", () => {
  return {
    GoogleGenerativeAI: vi.fn().mockImplementation(() => ({
      getGenerativeModel: vi.fn().mockReturnValue({
        generateContent: vi.fn().mockResolvedValue({ response: { text: () => null } }),
      }),
    })),
  };
});

const incident: Incident = {
  id: "test-1",
  display_id: "INC-001",
  title: "Database connection pool exhausted",
  description: "Too many connections open, clients timing out",
  priority: "P0",
  status: "OPEN",
  reporter_name: "Bob",
  assignee: null,
  service_affected: "auth-db-cluster-01",
  latest_update: null,
  created_at: "2026-07-05T10:00:00Z",
  updated_at: "2026-07-05T10:00:00Z",
};

describe("generateSummary", () => {
  it("falls back to rule-based engine when LLM returns null", async () => {
    const result = await generateSummary(incident, []);
    expect(result.root_cause).toBeTruthy();
    expect(result.confidence).toBeGreaterThanOrEqual(0);
    expect(result.affected_services).toContain("auth-db-cluster-01");
  });

  it("includes context from existing updates", async () => {
    const updates: IncidentUpdate[] = [
      { id: "u1", incident_id: "test-1", message: "Rolled back latest deploy", author_name: "Carol", update_type: "USER", created_at: "2026-07-05T10:10:00Z" },
    ];
    const result = await generateSummary(incident, updates);
    expect(result.recommended_action).toBeTruthy();
    expect(result.blast_radius).toBeTruthy();
  });
});

describe("generateNextActions", () => {
  it("returns array of actions from fallback", async () => {
    const actions = await generateNextActions(incident, []);
    expect(Array.isArray(actions)).toBe(true);
    expect(actions.length).toBeGreaterThan(0);
    actions.forEach((a) => {
      expect(a).toHaveProperty("title");
      expect(a).toHaveProperty("description");
      expect(a).toHaveProperty("impact");
    });
  });
});

describe("reviewPriority", () => {
  it("returns recommendation from fallback", async () => {
    const result = await reviewPriority(incident);
    expect(result.recommendation).toMatch(/HIGH_PRIORITY|MONITOR|ROUTINE/);
    expect(result.reason).toBeTruthy();
  });
});

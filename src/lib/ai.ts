import Groq from "groq-sdk";
import { generateFallbackSummary, generateFallbackActions, generateFallbackPriority } from "./ai-fallback";
import type { Incident, IncidentUpdate } from "@/types";

const groqApiKey = process.env.GROQ_API_KEY;
const groq = groqApiKey ? new Groq({ apiKey: groqApiKey }) : null;

function buildPrompt(incident: Incident, updates: IncidentUpdate[], type: string): string {
  const updateLog = updates
    .map((u) => `[${u.update_type}] ${u.author_name}: ${u.message}`)
    .join("\n");

  return `You are an AI incident response analyst for a production operations team.

Incident: ${incident.display_id}
Title: ${incident.title}
Description: ${incident.description}
Priority: ${incident.priority}
Status: ${incident.status}
Reporter: ${incident.reporter_name}
Service: ${incident.service_affected ?? "Unknown"}

Timeline of updates:
${updateLog || "No updates yet."}

${type === "summary"
  ? `Provide a concise incident summary in JSON format:
{
  "root_cause": "brief root cause analysis",
  "confidence": <number 0-100>,
  "blast_radius": "impact description",
  "recommended_action": "next best step",
  "affected_services": ["service1", "service2"]
}`
  : type === "actions"
  ? `Suggest 2-3 next actions in JSON format:
{
  "actions": [
    { "title": "action title", "description": "action detail", "impact": "HIGH|MEDIUM|LOW" }
  ]
}`
  : `Review priority in JSON format:
{
  "recommendation": "HIGH_PRIORITY|MONITOR|ROUTINE",
  "reason": "brief explanation"
}`
}`;
}

async function callGroq(prompt: string): Promise<string | null> {
  if (!groq) return null;
  try {
    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.3,
      max_tokens: 1024,
    });
    return completion.choices[0]?.message?.content ?? null;
  } catch {
    return null;
  }
}

function parseJSON<T>(text: string): T | null {
  try {
    const cleaned = text.replace(/```json\n?/gi, "").replace(/```\n?/g, "").trim();
    return JSON.parse(cleaned) as T;
  } catch {
    return null;
  }
}

export interface AISummary {
  root_cause: string;
  confidence: number;
  blast_radius: string;
  recommended_action: string;
  affected_services: string[];
}

export interface AIAction {
  title: string;
  description: string;
  impact: string;
}

export interface AIPriorityReview {
  recommendation: string;
  reason: string;
}

export async function generateSummary(incident: Incident, updates: IncidentUpdate[]): Promise<AISummary> {
  const prompt = buildPrompt(incident, updates, "summary");
  const response = await callGroq(prompt);

  if (response) {
    const parsed = parseJSON<AISummary>(response);
    if (parsed && parsed.root_cause) return parsed;
  }

  return generateFallbackSummary(incident, updates);
}

export async function generateNextActions(incident: Incident, updates: IncidentUpdate[]): Promise<AIAction[]> {
  const prompt = buildPrompt(incident, updates, "actions");
  const response = await callGroq(prompt);

  if (response) {
    const parsed = parseJSON<{ actions: AIAction[] }>(response);
    if (parsed?.actions) return parsed.actions;
  }

  return generateFallbackActions(incident);
}

export async function reviewPriority(incident: Incident): Promise<AIPriorityReview> {
  const prompt = buildPrompt(incident, [], "priority");
  const response = await callGroq(prompt);

  if (response) {
    const parsed = parseJSON<AIPriorityReview>(response);
    if (parsed?.recommendation) return parsed;
  }

  return generateFallbackPriority(incident);
}

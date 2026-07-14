import Groq from "groq-sdk";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { generateFallbackSummary, generateFallbackActions, generateFallbackPriority } from "./ai-fallback";
import type { Incident, IncidentUpdate } from "@/types";

const groqApiKey = process.env.GROQ_API_KEY;
const groq = groqApiKey ? new Groq({ apiKey: groqApiKey }) : null;

const geminiApiKey = process.env.GEMINI_API_KEY;
const gemini = geminiApiKey ? new GoogleGenerativeAI(geminiApiKey) : null;

function stripImageMarkdown(text: string): string {
  return text.replace(/!\[.*?\]\((.*?)\)/g, "[image]");
}

function buildPrompt(incident: Incident, updates: IncidentUpdate[], type: string): string {
  const updateLog = updates
    .map((u) => `[${u.update_type}] ${u.author_name}: ${stripImageMarkdown(u.message)}`)
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
  } catch (err) {
    console.warn("Groq API call failed:", (err as Error).message);
    return null;
  }
}

async function callGemini(prompt: string): Promise<string | null> {
  if (!gemini) return null;
  try {
    const model = gemini.getGenerativeModel({ model: "gemini-2.0-flash" });
    const result = await model.generateContent(prompt);
    return result.response.text();
  } catch (err) {
    console.warn("Gemini API call failed:", (err as Error).message);
    return null;
  }
}

async function callAI(prompt: string, preferredProvider?: string): Promise<string | null> {
  if (preferredProvider === "groq") {
    const result = await callGroq(prompt);
    if (result) return result;
    const fallback = await callGemini(prompt);
    if (fallback) return fallback;
    return null;
  }

  if (preferredProvider === "gemini") {
    const result = await callGemini(prompt);
    if (result) return result;
    const fallback = await callGroq(prompt);
    if (fallback) return fallback;
    return null;
  }

  const groqResult = await callGroq(prompt);
  if (groqResult) return groqResult;

  const geminiResult = await callGemini(prompt);
  if (geminiResult) return geminiResult;

  return null;
}

function parseJSON<T>(text: string): T | null {
  try {
    const cleaned = text.replace(/```json\n?/gi, "").replace(/```\n?/g, "").trim();
    const jsonStart = cleaned.indexOf("{");
    const jsonEnd = cleaned.lastIndexOf("}");
    if (jsonStart !== -1 && jsonEnd !== -1 && jsonEnd > jsonStart) {
      return JSON.parse(cleaned.slice(jsonStart, jsonEnd + 1)) as T;
    }
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

export async function generateSummary(incident: Incident, updates: IncidentUpdate[], provider?: string): Promise<AISummary> {
  const prompt = buildPrompt(incident, updates, "summary");
  const response = await callAI(prompt, provider);

  if (response) {
    const parsed = parseJSON<AISummary>(response);
    if (parsed && parsed.root_cause) return parsed;
  }

  return generateFallbackSummary(incident, updates);
}

export async function generateNextActions(incident: Incident, updates: IncidentUpdate[], provider?: string): Promise<AIAction[]> {
  const prompt = buildPrompt(incident, updates, "actions");
  const response = await callAI(prompt, provider);

  if (response) {
    const parsed = parseJSON<{ actions: AIAction[] }>(response);
    if (parsed?.actions) return parsed.actions;
  }

  return generateFallbackActions(incident);
}

export async function reviewPriority(incident: Incident, provider?: string): Promise<AIPriorityReview> {
  const prompt = buildPrompt(incident, [], "priority");
  const response = await callAI(prompt, provider);

  if (response) {
    const parsed = parseJSON<AIPriorityReview>(response);
    if (parsed?.recommendation) return parsed;
  }

  return generateFallbackPriority(incident);
}

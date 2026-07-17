import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("ai_results")
      .select("*")
      .eq("incident_id", id)
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json(
        { error: "Authentication required", code: "UNAUTHORIZED" },
        { status: 401 }
      );
    }

    const { id } = await params;

    const { data: incident } = await supabase
      .from("incidents")
      .select("*")
      .eq("id", id)
      .single();

    if (!incident) {
      return NextResponse.json({ error: "Incident not found" }, { status: 404 });
    }

    if (incident.is_demo) {
      const { data: adminUser } = await supabase
        .from("admin_users")
        .select("id")
        .eq("id", user.id)
        .maybeSingle();

      if (!adminUser) {
        return NextResponse.json(
          { error: "Admins only: demo incidents are read-only", code: "FORBIDDEN" },
          { status: 403 }
        );
      }
    }

    const { data: updates } = await supabase
      .from("incident_updates")
      .select("*")
      .eq("incident_id", id)
      .order("created_at", { ascending: true });

    const { data: settings } = await supabase
      .from("settings")
      .select("value")
      .eq("key", "ai_provider")
      .maybeSingle();
    const provider = (settings?.value as string) ?? undefined;

    const { generateSummary, generateNextActions, reviewPriority } = await import("@/lib/ai");

    const [summary, actions, priorityReview] = await Promise.all([
      generateSummary(incident, updates ?? [], provider),
      generateNextActions(incident, updates ?? [], provider),
      reviewPriority(incident, provider),
    ]);

    const results = [];

    const { data: summaryResult, error: summaryErr } = await supabase
      .from("ai_results")
      .insert({
        incident_id: id,
        type: "SUMMARY",
        result_text: summary.root_cause,
        confidence: summary.confidence,
        metadata: {
          root_cause: summary.root_cause,
          blast_radius: summary.blast_radius,
          recommended_action: summary.recommended_action,
          affected_services: summary.affected_services,
          actions,
          priority_review: priorityReview,
        },
      })
      .select()
      .single();

    if (!summaryErr) results.push(summaryResult);

    return NextResponse.json({ data: { summary, actions, priorityReview, result: summaryResult } });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "AI generation failed" },
      { status: 500 }
    );
  }
}

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createIncidentSchema } from "@/lib/validations";

export async function GET() {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("incidents")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data });
  } catch (err) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = createIncidentSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    const { data: seqResult } = await supabase.rpc("generate_display_id");
    const displayId = seqResult ?? "INC-0001";

    const { data, error } = await supabase
      .from("incidents")
      .insert({
        display_id: displayId,
        title: parsed.data.title,
        description: parsed.data.description,
        priority: parsed.data.priority,
        reporter_name: parsed.data.reporter_name,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data }, { status: 201 });
  } catch (err) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

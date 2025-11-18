import { createSupabaseServerClient } from "@/lib/supabase-server";
import { NextResponse } from "next/server";

type GeneratePayload = {
  title?: string;
  description?: string;
  assets?: Record<string, unknown> | null;
  metadata?: Record<string, unknown> | null;
};

export async function POST(request: Request) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession();

  if (sessionError) {
    return NextResponse.json(
      { error: sessionError.message },
      { status: 500 },
    );
  }

  if (!session?.user) {
    return NextResponse.json(
      { error: "Authentification requise." },
      { status: 401 },
    );
  }

  const payload = (await request.json().catch(() => null)) as
    | GeneratePayload
    | null;

  if (!payload?.title) {
    return NextResponse.json(
      { error: "Le champ title est obligatoire." },
      { status: 422 },
    );
  }

  const insertPayload = {
    title: payload.title,
    description: payload.description ?? "",
    assets: payload.assets ?? null,
    metadata: payload.metadata ?? null,
    user_id: session.user.id,
  };

  const { data, error } = await supabase
    .from("projects")
    .insert(insertPayload)
    .select("*")
    .single();

  if (error) {
    return NextResponse.json(
      { error: `Impossible de créer le projet : ${error.message}` },
      { status: 500 },
    );
  }

  return NextResponse.json({ project: data }, { status: 201 });
}

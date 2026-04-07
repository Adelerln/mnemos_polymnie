import { createSupabaseServerClient } from "@/lib/supabase-server";
import { generateProjectSchema, formatZodError } from "@/lib/validations";
import { NextResponse } from "next/server";

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

  const payload = (await request.json().catch(() => null)) as unknown;

  // Validation et normalisation via Zod (title requis, defaults pour les champs optionnels)
  const parsed = generateProjectSchema.safeParse(payload);

  if (!parsed.success) {
    return NextResponse.json(
      { error: formatZodError(parsed.error) },
      { status: 400 },
    );
  }

  const { title, description, assets, metadata } = parsed.data;

  const insertPayload = {
    title,
    description,
    assets,
    metadata,
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

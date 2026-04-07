import { createSupabaseServerClient } from "@/lib/supabase-server";
import { generateProjectSchema, formatZodError } from "@/lib/validations";
import { apiError } from "@/lib/api-error";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession();

  if (sessionError) {
    return apiError("projects/generate/session", sessionError, "Erreur d'authentification. Veuillez vous reconnecter.");
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
    return apiError("projects/generate/insert", error, "Impossible de créer le projet. Veuillez réessayer.");
  }

  return NextResponse.json({ project: data }, { status: 201 });
}

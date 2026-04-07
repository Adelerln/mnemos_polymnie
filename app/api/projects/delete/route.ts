import { createSupabaseServerClient } from "@/lib/supabase-server";
import { deleteProjectSchema, formatZodError } from "@/lib/validations";
import { NextResponse } from "next/server";

export async function DELETE(request: Request) {
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

  // Validation via Zod (projectId requis, assets optionnel avec structure vérifiée)
  const parsed = deleteProjectSchema.safeParse(payload);

  if (!parsed.success) {
    return NextResponse.json(
      { error: formatZodError(parsed.error) },
      { status: 400 },
    );
  }

  const { projectId, assets } = parsed.data;

  const { data, error } = await supabase
    .from("projects")
    .delete()
    .eq("id", projectId)
    .eq("user_id", session.user.id)
    .select("id")
    .single();

  if (error) {
    return NextResponse.json(
      { error: `Impossible de supprimer le projet : ${error.message}` },
      { status: 500 },
    );
  }

  // assets est déjà validé et garanti comme tableau par Zod (default: [])
  const removalResults = [];

  for (const asset of assets) {
    const { error: storageError } = await supabase
      .storage
      .from(asset.bucket)
      .remove([asset.path]);

    if (storageError) {
      removalResults.push({
        bucket: asset.bucket,
        path: asset.path,
        error: storageError.message,
      });
    }
  }

  return NextResponse.json(
    {
      deletedProjectId: data?.id,
      assetsRemoved: assets.length - removalResults.length,
      assetErrors: removalResults,
    },
    { status: removalResults.length ? 207 : 200 },
  );
}

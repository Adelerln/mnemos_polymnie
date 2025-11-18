import { createSupabaseServerClient } from "@/lib/supabase-server";
import { NextResponse } from "next/server";

type DeletePayload = {
  projectId?: number | string;
  assets?: {
    bucket: string;
    path: string;
  }[];
};

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

  const payload = (await request.json().catch(() => null)) as
    | DeletePayload
    | null;

  if (!payload?.projectId) {
    return NextResponse.json(
      { error: "projectId est obligatoire." },
      { status: 422 },
    );
  }

  const { data, error } = await supabase
    .from("projects")
    .delete()
    .eq("id", payload.projectId)
    .eq("user_id", session.user.id)
    .select("id")
    .single();

  if (error) {
    return NextResponse.json(
      { error: `Impossible de supprimer le projet : ${error.message}` },
      { status: 500 },
    );
  }

  const assets = Array.isArray(payload.assets) ? payload.assets : [];
  const removalResults = [];

  for (const asset of assets) {
    if (!asset.bucket || !asset.path) {
      continue;
    }
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

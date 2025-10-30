import { supabaseAdmin } from "@/lib/supabase-admin";
import type { User } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

const PAGE_SIZE = 100;

const findUserByEmail = async (email: string): Promise<User | null> => {
  let page = 1;

  while (true) {
    const { data, error } = await supabaseAdmin.auth.admin.listUsers({
      page,
      perPage: PAGE_SIZE,
    });

    if (error) {
      throw new Error(
        error.message ?? "Impossible de parcourir les utilisateurs Supabase.",
      );
    }

    const users = data.users ?? [];
    const user = users.find(
      (item) => item.email?.toLowerCase() === email.toLowerCase(),
    );

    if (user) {
      return user;
    }

    if (!data.nextPage || data.nextPage === page) {
      break;
    }

    page = data.nextPage;
  }

  return null;
};

export async function POST(request: Request) {
  const payload = (await request.json().catch(() => null)) as
    | { email?: string; newPassword?: string }
    | null;

  const email = payload?.email?.trim().toLowerCase() ?? "";
  const newPassword = payload?.newPassword?.trim() ?? "";

  if (!email || !newPassword) {
    return NextResponse.json(
      { error: "Email et nouveau mot de passe requis." },
      { status: 400 },
    );
  }

  if (newPassword.length < 6) {
    return NextResponse.json(
      { error: "Le mot de passe doit contenir au moins 6 caractères." },
      { status: 422 },
    );
  }

  try {
    const user = await findUserByEmail(email);

    if (!user) {
      return NextResponse.json(
        {
          error:
            "Aucun compte trouvé avec cette adresse email. Vérifiez l'orthographe ou créez un compte.",
        },
        { status: 404 },
      );
    }

    const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
      user.id,
      {
        email_confirm: true,
        password: newPassword,
      },
    );

    if (updateError) {
      return NextResponse.json(
        {
          error: `Impossible de mettre à jour le mot de passe : ${updateError.message}`,
        },
        { status: 500 },
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Impossible de mettre à jour le mot de passe pour le moment.",
      },
      { status: 500 },
    );
  }
}

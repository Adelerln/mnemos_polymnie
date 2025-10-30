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
      throw new Error(error.message ?? "Impossible de parcourir les utilisateurs Supabase.");
    }

    const users = data.users ?? [];
    const existingUser = users.find(
      (user) => user.email?.toLowerCase() === email.toLowerCase(),
    );

    if (existingUser) {
      return existingUser;
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
    | { email?: string; password?: string }
    | null;

  const rawEmail = payload?.email ?? "";
  const rawPassword = payload?.password ?? "";
  const email = rawEmail.trim().toLowerCase();
  const password = rawPassword.trim();

  if (!email || !password) {
    return NextResponse.json(
      { error: "Adresse email et mot de passe requis." },
      { status: 400 },
    );
  }

  if (password.length < 6) {
    return NextResponse.json(
      { error: "Le mot de passe doit contenir au moins 6 caractères." },
      { status: 422 },
    );
  }

  const { data, error } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });

  if (error) {
    if (error.message.toLowerCase().includes("already registered")) {
      try {
        const existingUser = await findUserByEmail(email);

        if (!existingUser) {
          return NextResponse.json(
            {
              error:
                "Cette adresse email est déjà utilisée. Essayez de vous connecter ou contactez un administrateur.",
            },
            { status: 409 },
          );
        }

        const { error: updateExistingError } =
          await supabaseAdmin.auth.admin.updateUserById(existingUser.id, {
            password,
            email_confirm: true,
          });

        if (updateExistingError) {
          return NextResponse.json(
            {
              error:
                "Impossible de mettre à jour le mot de passe de ce compte. Contactez un administrateur.",
            },
            { status: 500 },
          );
        }

        return NextResponse.json({ user: existingUser }, { status: 200 });
      } catch (lookupError) {
        return NextResponse.json(
          {
            error:
              lookupError instanceof Error
                ? lookupError.message
                : "Impossible de vérifier l'utilisateur existant.",
          },
          { status: 500 },
        );
      }
    }

    return NextResponse.json(
      { error: `Impossible de créer le compte : ${error.message}` },
      { status: 500 },
    );
  }

  if (data.user) {
    const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
      data.user.id,
      {
        email_confirm: true,
      },
    );

    if (updateError) {
      return NextResponse.json(
        {
          error: `Compte créé mais impossible de valider l'email automatiquement : ${updateError.message}`,
        },
        { status: 500 },
      );
    }
  }

  return NextResponse.json({ user: data.user }, { status: 201 });
}

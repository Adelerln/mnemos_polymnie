import { supabaseAdmin } from "@/lib/supabase-admin";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { signupSchema, formatZodError } from "@/lib/validations";
import { apiError } from "@/lib/api-error";
import type { User } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

// Limite d'inscription : 5 tentatives par IP par fenêtre de 15 minutes.
// Protège contre les créations massives de comptes par un robot.
const SIGNUP_RATE_LIMIT = { maxRequests: 5, windowMs: 15 * 60 * 1000 };

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
  // Vérification du rate limit avant tout traitement
  const clientIp = getClientIp(request);
  const rateLimitResult = checkRateLimit(`signup:${clientIp}`, SIGNUP_RATE_LIMIT);

  if (!rateLimitResult.allowed) {
    return NextResponse.json(
      { error: "Trop de tentatives. Veuillez réessayer dans quelques minutes." },
      {
        status: 429,
        headers: { "Retry-After": String(Math.ceil(rateLimitResult.retryAfterMs / 1000)) },
      },
    );
  }

  const payload = (await request.json().catch(() => null)) as unknown;

  // Validation des données via Zod (email normalisé + password min 6 chars)
  const parsed = signupSchema.safeParse(payload);

  if (!parsed.success) {
    return NextResponse.json(
      { error: formatZodError(parsed.error) },
      { status: 400 },
    );
  }

  const { email, password } = parsed.data;

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
        return apiError("signup/lookup", lookupError, "Une erreur est survenue lors de la création du compte. Veuillez réessayer.");
      }
    }

    return apiError("signup/create", error, "Impossible de créer le compte. Veuillez réessayer ou contacter un administrateur.");
  }

  if (data.user) {
    const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
      data.user.id,
      {
        email_confirm: true,
      },
    );

    if (updateError) {
      return apiError("signup/confirm", updateError, "Compte créé, mais une erreur est survenue. Contactez un administrateur.");
    }
  }

  return NextResponse.json({ user: data.user }, { status: 201 });
}

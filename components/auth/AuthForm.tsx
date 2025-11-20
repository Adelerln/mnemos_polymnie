"use client";

import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabase-client";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useEffect, useMemo, useState } from "react";

type AuthMode = "login" | "signup";

type AuthFormProps = {
  defaultMode?: AuthMode;
};

export const AuthForm = ({ defaultMode = "login" }: AuthFormProps) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const [mode, setMode] = useState<AuthMode>(defaultMode);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const redirectTarget = useMemo(() => {
    return searchParams?.get("redirectedFrom") ?? "/homepage";
  }, [searchParams]);

  useEffect(() => {
    if (user) {
      router.replace("/homepage");
    }
  }, [router, user]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setMessage(null);

    const normalizedEmail = email.trim().toLowerCase();
    const sanitizedPassword = password.trim();

    if (!normalizedEmail || !sanitizedPassword) {
      setError("Email et mot de passe sont requis.");
      return;
    }

    if (mode === "signup" && sanitizedPassword.length < 6) {
      setError("Le mot de passe doit contenir au moins 6 caractères.");
      return;
    }

    if (mode === "signup" && sanitizedPassword !== confirmPassword.trim()) {
      setError("Les mots de passe ne correspondent pas.");
      return;
    }

    setIsSubmitting(true);

    try {
      if (mode === "login") {
        const {
          data: signInData,
          error: signInError,
        } = await supabase.auth.signInWithPassword({
          email: normalizedEmail,
          password: sanitizedPassword,
        });

        if (signInError) {
          setError(
            signInError.message === "Invalid login credentials"
              ? "Identifiants incorrects. Vérifiez vos informations."
              : signInError.message || "Impossible de se connecter pour le moment.",
          );
          return;
        }

        if (!signInData.session) {
          setError(
            "Connexion impossible : la session n'a pas été initialisée. Vérifiez votre email (confirmé) et réessayez.",
          );
          return;
        }

        const {
          data: { user },
          error: getUserError,
        } = await supabase.auth.getUser();

        if (getUserError) {
          console.warn("Impossible de récupérer l'utilisateur Supabase", getUserError.message);
        }

        if (user) {
          const { error: identError } = await supabase
            .from("identifications")
            .insert(
              {
                user_id: user.id,
                email: user.email ?? normalizedEmail,
                status: "active",
              },
              { returning: "minimal" },
            );

          if (identError) {
            // si l’email n’est pas dans allowed_emails -> erreur RLS ici
            console.warn(
              "Insertion identifications refusée (probable règle RLS allowed_emails)",
              identError.message ?? identError,
            );
          }
        }

        router.replace(redirectTarget);
        router.refresh();
        return;
      }

      const origin =
        typeof window !== "undefined" ? window.location.origin : undefined;

      const { error: signUpError } = await supabase.auth.signUp({
        email: normalizedEmail,
        password: sanitizedPassword,
        options: {
          emailRedirectTo: origin ? `${origin}/login` : undefined,
        },
      });

      if (signUpError) {
        setError(signUpError.message);
        return;
      }

      setMessage(
        "Compte créé ! Consultez votre boîte mail pour confirmer votre adresse avant de vous connecter.",
      );
      setMode("login");
      setPassword("");
      setConfirmPassword("");
    } catch (caughtError) {
      const errMessage =
        caughtError instanceof Error
          ? caughtError.message
          : "Une erreur inattendue est survenue.";
      setError(errMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isSignup = mode === "signup";

  return (
    <div className="w-full max-w-md rounded-2xl border border-neutral-200 bg-white/90 p-8 shadow-xl backdrop-blur">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => setMode("login")}
          className={`text-sm font-semibold uppercase tracking-[0.2em] ${
            !isSignup ? "text-neutral-900" : "text-neutral-400"
          }`}
        >
          Connexion
        </button>
        <span className="text-neutral-400">/</span>
        <button
          type="button"
          onClick={() => setMode("signup")}
          className={`text-sm font-semibold uppercase tracking-[0.2em] ${
            isSignup ? "text-neutral-900" : "text-neutral-400"
          }`}
        >
          Inscription
        </button>
      </div>

      <form className="mt-6 flex flex-col gap-4" onSubmit={handleSubmit}>
        <div className="space-y-1">
          <label className="text-xs font-semibold uppercase tracking-[0.2em] text-neutral-600">
            Email
          </label>
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            autoComplete="email"
            required
            className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm text-neutral-900 shadow-sm focus:border-neutral-900 focus:outline-none"
            placeholder="vous@example.com"
          />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-semibold uppercase tracking-[0.2em] text-neutral-600">
            Mot de passe
          </label>
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            autoComplete={isSignup ? "new-password" : "current-password"}
            required
            minLength={6}
            className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm text-neutral-900 shadow-sm focus:border-neutral-900 focus:outline-none"
            placeholder="••••••••"
          />
        </div>

        {isSignup ? (
          <div className="space-y-1">
            <label className="text-xs font-semibold uppercase tracking-[0.2em] text-neutral-600">
              Confirmer le mot de passe
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              autoComplete="new-password"
              required
              minLength={6}
              className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm text-neutral-900 shadow-sm focus:border-neutral-900 focus:outline-none"
              placeholder="••••••••"
            />
          </div>
        ) : null}

        {error ? (
          <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
            {error}
          </p>
        ) : null}

        {message ? (
          <p className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
            {message}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={isSubmitting}
          className="mt-2 inline-flex items-center justify-center rounded-md bg-neutral-900 px-3 py-2 text-sm font-semibold uppercase tracking-[0.2em] text-white transition disabled:cursor-not-allowed disabled:bg-neutral-400"
        >
          {isSubmitting
            ? isSignup
              ? "Création en cours..."
              : "Connexion..."
            : isSignup
              ? "Créer un compte"
              : "Se connecter"}
        </button>

        {!isSignup ? (
          <p className="text-center text-xs text-neutral-500">
            Pas encore de compte ?{" "}
            <button
              type="button"
              onClick={() => setMode("signup")}
              className="font-semibold text-neutral-900 underline underline-offset-4"
            >
              Inscrivez-vous
            </button>
          </p>
        ) : (
          <p className="text-center text-xs text-neutral-500">
            Déjà inscrit ?{" "}
            <button
              type="button"
              onClick={() => setMode("login")}
              className="font-semibold text-neutral-900 underline underline-offset-4"
            >
              Connectez-vous
            </button>
          </p>
        )}
      </form>

      <p className="mt-6 text-center text-xs text-neutral-500">
        Besoin d&apos;aide ?{" "}
        <Link
          href="mailto:contact@mnemos.fr"
          className="font-semibold text-neutral-900 underline underline-offset-4"
        >
          contact@mnemos.fr
        </Link>
      </p>
    </div>
  );
};

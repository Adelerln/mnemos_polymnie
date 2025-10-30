"use client";

import { useSession } from "@/hooks/useSession";
import { supabase } from "@/lib/supabase-client";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useState } from "react";

export const LoginForm = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { refreshSession } = useSession();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const normalizedEmail = email.trim().toLowerCase();
      const sanitizedPassword = password.trim();

      if (!normalizedEmail || !sanitizedPassword) {
        setError("Email et mot de passe sont requis.");
        return;
      }

      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: normalizedEmail,
        password: sanitizedPassword,
      });

      if (signInError) {
        setError(
          signInError.message === "Invalid login credentials"
            ? "Identifiants incorrects. Vérifiez votre email ou réinitialisez votre mot de passe."
            : signInError.message,
        );
        return;
      }

      await refreshSession();
      const redirectTarget = searchParams.get("redirectedFrom") ?? "/dashboard";
      router.replace(redirectTarget);
      router.refresh();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-sm rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
      <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
        <div className="space-y-2 text-center">
          <h1 className="text-xl font-semibold text-neutral-900">Connexion</h1>
          <p className="text-sm text-neutral-500">
            Accédez à votre espace en utilisant vos identifiants.
          </p>
        </div>

        <label className="flex flex-col gap-1">
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-neutral-600">
            Email
          </span>
          <input
            type="email"
            name="email"
            required
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 shadow-sm focus:border-neutral-900 focus:outline-none"
            placeholder="vous@example.com"
          />
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-neutral-600">
            Mot de passe
          </span>
          <input
            type="password"
            name="password"
            required
            autoComplete="current-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 shadow-sm focus:border-neutral-900 focus:outline-none"
            placeholder="Entrez votre mot de passe"
            minLength={6}
          />
        </label>

        {error ? (
          <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
            {error}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={isSubmitting}
          className="mt-2 inline-flex items-center justify-center rounded-md bg-neutral-900 px-3 py-2 text-sm font-medium text-white transition disabled:cursor-not-allowed disabled:bg-neutral-500"
        >
          {isSubmitting ? "Connexion..." : "Se connecter"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-neutral-500">
        Pas encore de compte ?{" "}
        <Link
          href="/signup"
          className="font-medium text-neutral-900 underline underline-offset-4"
        >
          Créer un compte
        </Link>
      </p>
    </div>
  );
};

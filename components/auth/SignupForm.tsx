"use client";

import { useSession } from "@/hooks/useSession";
import { supabase } from "@/lib/supabase-client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

export const SignupForm = () => {
  const router = useRouter();
  const { refreshSession } = useSession();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    const normalizedEmail = email.trim().toLowerCase();
    const sanitizedPassword = password.trim();
    const sanitizedConfirmPassword = confirmPassword.trim();

    if (sanitizedPassword !== sanitizedConfirmPassword) {
      setError("Les mots de passe ne correspondent pas.");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: normalizedEmail, password: sanitizedPassword }),
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as
          | { error?: string }
          | null;
        setError(
          payload?.error ??
            "Impossible de créer le compte pour le moment. Veuillez réessayer.",
        );
        return;
      }

      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: normalizedEmail,
        password: sanitizedPassword,
      });

      if (signInError) {
        setError(signInError.message);
        return;
      }

      await refreshSession();

      router.replace("/dashboard");
      router.refresh();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-sm rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
      <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
        <div className="space-y-2 text-center">
          <h1 className="text-xl font-semibold text-neutral-900">
            Créer un compte
          </h1>
          <p className="text-sm text-neutral-500">
            Rejoignez l&apos;espace de gestion Polymnie.
          </p>
        </div>

        <label className="flex flex-col gap-1">
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-neutral-600">
            Email
          </span>
          <input
            type="email"
            name="email"
            autoComplete="email"
            required
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
            autoComplete="new-password"
            required
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 shadow-sm focus:border-neutral-900 focus:outline-none"
            placeholder="Créez un mot de passe"
            minLength={6}
          />
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-neutral-600">
            Confirmer le mot de passe
          </span>
          <input
            type="password"
            name="confirm-password"
            autoComplete="new-password"
            required
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            className="rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 shadow-sm focus:border-neutral-900 focus:outline-none"
            placeholder="Confirmez votre mot de passe"
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
          {isSubmitting ? "Création en cours..." : "Créer le compte"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-neutral-500">
        Déjà inscrit ?{" "}
        <Link
          href="/login"
          className="font-medium text-neutral-900 underline underline-offset-4"
        >
          Se connecter
        </Link>
      </p>
    </div>
  );
};

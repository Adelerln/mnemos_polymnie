"use client";

import { useSession } from "@/hooks/useSession";
import { supabase } from "@/lib/supabase-client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

type ResetStatus =
  | {
      type: "success" | "error";
      message: string;
    }
  | null;

export const LoginForm = () => {
  const router = useRouter();
  const { refreshSession } = useSession();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSendingReset, setIsSendingReset] = useState(false);
  const [resetStatus, setResetStatus] = useState<ResetStatus>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setResetStatus(null);

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
      router.replace("/homepage");
      router.refresh();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePasswordReset = async () => {
    setResetStatus(null);
    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail) {
      setResetStatus({
        type: "error",
        message:
          "Indiquez votre adresse mail pour recevoir un lien sécurisé de réinitialisation.",
      });
      return;
    }

    try {
      setIsSendingReset(true);
      const redirectTo =
        typeof window !== "undefined"
          ? `${window.location.origin}/reset-password`
          : undefined;

      const { error: resetError } = await supabase.auth.resetPasswordForEmail(
        normalizedEmail,
        {
          redirectTo,
        },
      );

      if (resetError) {
        setResetStatus({
          type: "error",
          message:
            resetError.message ??
            "Impossible d'envoyer le lien de réinitialisation pour le moment.",
        });
        return;
      }

      setResetStatus({
        type: "success",
        message:
          "Nous venons de vous envoyer un lien de réinitialisation. Pensez à vérifier vos spams.",
      });
    } catch {
      setResetStatus({
        type: "error",
        message:
          "Impossible d'envoyer l'email de réinitialisation pour le moment.",
      });
    } finally {
      setIsSendingReset(false);
    }
  };

  return (
    <div className="w-full max-w-md rounded-2xl border border-neutral-200 bg-white p-8 shadow-lg">
      <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
        <div className="space-y-2 text-center">
          <span className="text-xs font-semibold uppercase tracking-[0.3em] text-neutral-500">
            Polymnie
          </span>
          <h1 className="text-2xl font-semibold text-neutral-900">
            Connexion sécurisée
          </h1>
          <p className="text-sm text-neutral-500">
            L’accès à Polymnie se valide par une confirmation envoyée sur votre
            adresse mail.
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
          <p
            className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600"
            aria-live="assertive"
          >
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

        <div className="space-y-2 border-t border-dashed border-neutral-200 pt-4 text-sm">
          <p className="text-xs text-neutral-500">
            Une confirmation par mail vous permet de valider chaque connexion.
          </p>
          <button
            type="button"
            onClick={handlePasswordReset}
            disabled={isSendingReset}
            className="inline-flex w-full items-center justify-center rounded-md border border-neutral-900 px-3 py-2 text-sm font-medium text-neutral-900 transition hover:bg-neutral-900 hover:text-white disabled:cursor-not-allowed disabled:border-neutral-300 disabled:text-neutral-400"
          >
            {isSendingReset ? "Envoi en cours..." : "Mot de passe oublié"}
          </button>
          {resetStatus ? (
            <p
              className={`rounded-md px-3 py-2 text-xs ${
                resetStatus.type === "success"
                  ? "border border-emerald-200 bg-emerald-50 text-emerald-700"
                  : "border border-red-200 bg-red-50 text-red-600"
              }`}
              aria-live="polite"
            >
              {resetStatus.message}
            </p>
          ) : (
            <p className="text-xs text-neutral-500">
              Ce lien est envoyé à l’adresse saisie ci-dessus et reste valable
              pendant 30 minutes.
            </p>
          )}
        </div>
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

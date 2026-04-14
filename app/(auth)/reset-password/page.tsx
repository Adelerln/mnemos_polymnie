"use client";

import { supabase } from "@/lib/supabase-client";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

type ResetFeedback = {
  type: "success" | "error";
  message: string;
} | null;

export default function ResetPasswordPage() {
  const router = useRouter();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [status, setStatus] = useState<ResetFeedback>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus(null);

    const sanitizedPassword = newPassword.trim();
    const sanitizedConfirm = confirmPassword.trim();

    if (sanitizedPassword.length < 6) {
      setStatus({
        type: "error",
        message: "Le mot de passe doit contenir au moins 6 caractères.",
      });
      return;
    }

    if (sanitizedPassword !== sanitizedConfirm) {
      setStatus({
        type: "error",
        message: "Les mots de passe ne correspondent pas.",
      });
      return;
    }

    try {
      setIsSubmitting(true);
      const { error } = await supabase.auth.updateUser({
        password: sanitizedPassword,
      });

      if (error) {
        setStatus({
          type: "error",
          message:
            error.message ??
            "Impossible de mettre à jour votre mot de passe pour le moment.",
        });
        return;
      }

      setStatus({
        type: "success",
        message:
          "Votre mot de passe a été mis à jour. Vous allez être redirigé vers la connexion.",
      });

      window.setTimeout(() => {
        router.push("/login");
      }, 2000);
    } catch {
      setStatus({
        type: "error",
        message:
          "Une erreur est survenue. Veuillez relancer le lien de réinitialisation.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-neutral-50 px-4 py-12">
      <div className="mx-auto w-full max-w-md rounded-3xl border border-neutral-200 bg-white p-8 shadow-lg">
        <div className="space-y-2 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-neutral-500">
            Polymnie
          </p>
          <h1 className="text-2xl font-semibold text-neutral-900">
            Réinitialisation du mot de passe
          </h1>
          <p className="text-sm text-neutral-500">
            Définissez un nouveau mot de passe pour continuer à accéder à vos
            données Mnémos.
          </p>
        </div>

        <form className="mt-8 flex flex-col gap-4" onSubmit={handleSubmit}>
          <label className="flex flex-col gap-1 text-sm">
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-neutral-600">
              Nouveau mot de passe
            </span>
            <input
              type="password"
              name="new-password"
              autoComplete="new-password"
              required
              minLength={6}
              value={newPassword}
              onChange={(event) => setNewPassword(event.target.value)}
              className="rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 shadow-sm focus:border-neutral-900 focus:outline-none"
              placeholder="••••••••"
            />
          </label>

          <label className="flex flex-col gap-1 text-sm">
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-neutral-600">
              Confirmation
            </span>
            <input
              type="password"
              name="confirm-password"
              autoComplete="new-password"
              required
              minLength={6}
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              className="rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 shadow-sm focus:border-neutral-900 focus:outline-none"
              placeholder="••••••••"
            />
          </label>

          {status ? (
            <p
              className={`rounded-md border px-3 py-2 text-sm ${
                status.type === "success"
                  ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                  : "border-red-200 bg-red-50 text-red-600"
              }`}
              aria-live="polite"
            >
              {status.message}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center justify-center rounded-md bg-neutral-900 px-3 py-2 text-sm font-medium text-white transition disabled:cursor-not-allowed disabled:bg-neutral-500"
          >
            {isSubmitting ? "Mise à jour..." : "Mettre à jour le mot de passe"}
          </button>
          <button
            type="button"
            onClick={() => router.push("/login")}
            className="text-sm font-medium text-neutral-900 underline underline-offset-4"
          >
            Retourner à la connexion
          </button>
        </form>
      </div>
    </div>
  );
}

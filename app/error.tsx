"use client";

import { useEffect } from "react";

/**
 * Error boundary pour toutes les pages de l'application.
 * Intercepte les erreurs non gérées dans les composants enfants
 * et affiche un fallback au lieu d'un écran blanc (issue #21).
 *
 * Next.js App Router exige que ce fichier soit un Client Component.
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log côté client — les détails techniques restent dans la console
    console.error("[ErrorBoundary] Erreur capturée :", error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-6 px-4 text-center">
      <div className="rounded-full bg-red-100 p-4">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="size-10 text-red-600"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      </div>

      <h2 className="text-xl font-semibold text-neutral-800">
        Une erreur est survenue
      </h2>
      <p className="max-w-md text-sm text-neutral-500">
        Un problème inattendu empêche l&apos;affichage de cette page.
        Vous pouvez réessayer ou revenir à l&apos;accueil.
      </p>

      <div className="flex gap-3">
        <button
          onClick={reset}
          className="rounded-md bg-neutral-800 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-neutral-700"
        >
          Réessayer
        </button>
        <a
          href="/"
          className="rounded-md border border-neutral-300 px-5 py-2.5 text-sm font-medium text-neutral-700 transition hover:bg-neutral-50"
        >
          Retour à l&apos;accueil
        </a>
      </div>
    </div>
  );
}

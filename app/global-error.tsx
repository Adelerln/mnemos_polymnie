"use client";

/**
 * Error boundary global — protège le root layout lui-même.
 * Si app/layout.tsx plante, ce composant prend le relais.
 *
 * Doit fournir ses propres balises <html> et <body> car
 * le layout racine n'est plus disponible en cas d'erreur ici.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  // Log discret côté client
  console.error("[GlobalError] Erreur critique :", error);

  return (
    <html lang="fr">
      <body className="flex min-h-screen items-center justify-center bg-neutral-100 px-4 text-center font-sans text-neutral-900">
        <div className="flex flex-col items-center gap-6">
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

          <h1 className="text-xl font-semibold">
            Erreur critique
          </h1>
          <p className="max-w-md text-sm text-neutral-500">
            L&apos;application a rencontré un problème grave.
            Veuillez réessayer ou recharger la page.
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
              Recharger
            </a>
          </div>
        </div>
      </body>
    </html>
  );
}

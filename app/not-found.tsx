import Link from "next/link";

/**
 * Page 404 globale — affichée quand aucune route ne correspond.
 * Server Component par défaut (pas besoin de "use client").
 */
export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-6 px-4 text-center">
      <p className="text-6xl font-bold text-neutral-300">404</p>

      <h1 className="text-xl font-semibold text-neutral-800">
        Page introuvable
      </h1>
      <p className="max-w-md text-sm text-neutral-500">
        La page que vous recherchez n&apos;existe pas ou a été déplacée.
      </p>

      <Link
        href="/"
        className="rounded-md bg-neutral-800 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-neutral-700"
      >
        Retour à l&apos;accueil
      </Link>
    </div>
  );
}

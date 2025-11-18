import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-neutral-50 px-4 py-24">
      <div className="grid w-full max-w-6xl gap-12 lg:grid-cols-[1.1fr_0.9fr]">
        <section className="space-y-6 rounded-[32px] bg-white p-10 shadow-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-neutral-500">
            Polymnie par Mnémos
          </p>
          <h1 className="text-4xl font-semibold leading-tight text-neutral-900">
            Pilotez vos séjours et vos projets en toute sérénité.
          </h1>
          <p className="text-lg text-neutral-600">
            Centralisez les dossiers familles, les documents sensibles et les
            échanges internes dans une interface unique. Chaque membre de
            l’équipe dispose d’un espace sécurisé relié à Supabase.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link
              href="/signup"
              className="inline-flex items-center justify-center rounded-full bg-neutral-900 px-6 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-white transition hover:bg-neutral-800"
            >
              Créer un compte
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center justify-center rounded-full border border-neutral-300 px-6 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-neutral-800 transition hover:border-neutral-900 hover:text-neutral-900"
            >
              Se connecter
            </Link>
          </div>
          <ul className="space-y-3 text-sm text-neutral-600">
            <li>• Accès sécurisé par email + mot de passe</li>
            <li>• Rôles et politiques RLS prêtes pour Supabase</li>
            <li>• API projet pour générer et supprimer vos contenus</li>
          </ul>
        </section>
        <section className="rounded-[32px] bg-neutral-900/95 p-10 text-white shadow-2xl">
          <div className="space-y-4">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-neutral-400">
              Fonctionnalités clés
            </p>
            <div className="space-y-6 text-neutral-100">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-neutral-400">
                  Authentification
                </p>
                <p className="mt-2 text-base">
                  Confirmation par email, middleware sécurisé et gestion
                  proactive des sessions via Supabase.
                </p>
              </div>
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-neutral-400">
                  Projets
                </p>
                <p className="mt-2 text-base">
                  APIs `/api/projects/generate` et `/api/projects/delete` pour
                  orchestrer vos ressources et assets liés.
                </p>
              </div>
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-neutral-400">
                  Dashboard
                </p>
                <p className="mt-2 text-base">
                  Accès réservé, redirection automatique et visibilité immédiate
                  sur les projets associés à votre compte.
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

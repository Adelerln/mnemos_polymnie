import { LoginForm } from "@/components/auth/LoginForm";

const contact = {
  company: "Mnémos",
  address: "24 rue des Archives",
  postalCode: "75003",
  city: "Paris",
  phone: "+33 1 86 95 32 10",
  email: "contact@mnemos.fr",
};

export default function LoginPage() {
  return (
    <div className="flex min-h-screen flex-col bg-neutral-50">
      <main className="flex flex-1 items-center justify-center px-4 py-12">
        <div className="w-full max-w-4xl space-y-10">
          <section className="rounded-[32px] bg-neutral-900 p-8 text-white shadow-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-neutral-400">
              Polymnie par Mnémos
            </p>
            <h1 className="mt-4 text-4xl font-semibold leading-tight">
              Bienvenue sur Polymnie
            </h1>
            <p className="mt-4 text-base text-neutral-200">
              Centralisez vos séjours et dossiers familles dans un espace
              sécurisé conçu pour les équipes Mnémos. Connectez-vous afin de
              retrouver vos opérations, vos interlocuteurs et vos données
              financières.
            </p>
            <div className="mt-8 rounded-2xl bg-white/5 p-6 backdrop-blur">
              <p className="text-sm font-semibold">
                Authentification avec confirmation par mail
              </p>
              <p className="mt-2 text-sm text-neutral-200">
                Chaque connexion déclenche une validation envoyée sur votre
                adresse mail professionnelle. Une fois confirmée, l’accès est
                actif pour la session en cours et vous redirige vers le tableau
                de bord.
              </p>
            </div>
          </section>

          <div className="flex justify-center">
            <LoginForm />
          </div>
        </div>
      </main>

      <footer className="border-t border-neutral-200 bg-white px-4 py-6">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-3 text-sm text-neutral-600 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-base font-semibold text-neutral-900">
            {contact.company}
          </p>
          <div className="space-y-1 text-sm sm:text-right">
            <p>
              {contact.address} · {contact.postalCode} {contact.city}
            </p>
            <p>Tél. {contact.phone}</p>
            <p>{contact.email}</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

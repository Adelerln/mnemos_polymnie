import { AuthForm } from "@/components/auth/AuthForm";

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
        <div className="grid w-full max-w-5xl gap-10 md:grid-cols-2">
          <section className="rounded-[32px] bg-neutral-900 p-8 text-white shadow-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-neutral-400">
              Polymnie par Mnémos
            </p>
            <h1 className="mt-4 text-4xl font-semibold leading-tight">
              Connectez-vous à votre espace
            </h1>
            <p className="mt-4 text-base text-neutral-200">
              Centralisez vos dossiers familles, vos séjours et toutes les
              opérations critiques de Mnémos. Chaque connexion est protégée par
              un mot de passe et une confirmation par email.
            </p>
            <div className="mt-8 rounded-2xl bg-white/5 p-6 backdrop-blur">
              <p className="text-sm font-semibold">
                Authentification email + mot de passe
              </p>
              <p className="mt-2 text-sm text-neutral-200">
                Après votre inscription, un email de confirmation valide votre
                adresse professionnelle avant la première connexion.
              </p>
            </div>
          </section>

          <div className="flex items-center justify-center">
            <AuthForm defaultMode="login" />
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

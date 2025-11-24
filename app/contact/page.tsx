import { Button } from "@/components/ui/Button";

export default function ContactPage() {
  return (
    <main className="mx-auto max-w-5xl px-4 py-12 md:py-16">
      <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
        <section className="space-y-6 rounded-2xl border bg-white p-8 shadow-sm">
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-neutral-500">
              Contact
            </p>
            <h1 className="text-3xl font-semibold text-neutral-900">
              Formulaire de contact
            </h1>
            <p className="text-base text-neutral-600">
              Une question sur l&apos;utilisation de Polymnie, un besoin de support
              ou une demande de démo ? Laissez-nous un message et nous vous
              répondrons rapidement.
            </p>
          </div>

          <form className="space-y-5">
            <div className="space-y-2">
              <label className="text-sm font-medium text-neutral-800" htmlFor="name">
                Nom complet
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-900 shadow-xs outline-none transition focus:border-neutral-900 focus:ring-2 focus:ring-neutral-900/10"
                placeholder="Prénom Nom"
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium text-neutral-800" htmlFor="email">
                  Email professionnel
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-900 shadow-xs outline-none transition focus:border-neutral-900 focus:ring-2 focus:ring-neutral-900/10"
                  placeholder="vous@entreprise.fr"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-neutral-800" htmlFor="subject">
                  Sujet
                </label>
                <input
                  id="subject"
                  name="subject"
                  type="text"
                  className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-900 shadow-xs outline-none transition focus:border-neutral-900 focus:ring-2 focus:ring-neutral-900/10"
                  placeholder="Support, démo, amélioration..."
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-neutral-800" htmlFor="message">
                Message
              </label>
              <textarea
                id="message"
                name="message"
                rows={5}
                required
                className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-900 shadow-xs outline-none transition focus:border-neutral-900 focus:ring-2 focus:ring-neutral-900/10"
                placeholder="Expliquez votre besoin, votre contexte ou vos objectifs."
              />
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-neutral-500">
              Nous répondons en moyenne sous 24h ouvrées.
            </p>
              <Button type="submit" className="w-full sm:w-auto">
                Envoyer le message
              </Button>
            </div>
          </form>
        </section>

        <aside className="space-y-4 rounded-2xl border bg-neutral-900 p-8 text-white shadow-lg">
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-neutral-400">
              Assistance
            </p>
            <h2 className="text-xl font-semibold">Nos coordonnées</h2>
            <p className="text-sm text-neutral-200">
              Un canal direct pour joindre l&apos;équipe Polymnie et Mnémos.
            </p>
          </div>
          <div className="space-y-3 text-sm text-neutral-200">
            <p className="font-semibold text-white">Téléphone</p>
            <p>+33 1 23 45 67 89</p>

            <p className="mt-4 font-semibold text-white">Email</p>
            <p>support@polymnie.app</p>

            <p className="mt-4 font-semibold text-white">Horaires</p>
            <p>Lundi - Vendredi · 9h00 - 18h30</p>
          </div>
          <div className="rounded-xl border border-white/10 bg-white/5 p-4 text-sm text-neutral-100">
            <p className="font-semibold">Besoin d&apos;un rendez-vous ?</p>
            <p className="mt-2 text-neutral-200">
              Indiquez vos disponibilités dans le message. Nous planifierons un
              créneau en visio pour avancer rapidement.
            </p>
          </div>
        </aside>
      </div>
    </main>
  );
}

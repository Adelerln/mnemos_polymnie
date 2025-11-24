export default function DocumentationPage() {
  return (
    <main className="mx-auto max-w-5xl px-4 py-12 md:py-16">
      <div className="space-y-6 rounded-2xl border bg-white p-8 shadow-sm">
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-neutral-500">
            Ressources
          </p>
          <h1 className="text-3xl font-semibold text-neutral-900">
            Documentation d&apos;utilisation
          </h1>
          <p className="text-base text-neutral-600">
            Parcourez les repères essentiels pour configurer Polymnie, former vos
            équipes et maintenir vos données à jour. Cette page rassemble les
            étapes clés pour démarrer sereinement.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <section className="space-y-3 rounded-xl border bg-neutral-50 p-6">
            <h2 className="text-lg font-semibold text-neutral-900">
              Prise en main rapide
            </h2>
            <ul className="space-y-2 text-sm text-neutral-700">
              <li>1. Créez vos premiers comptes et rôles pour l&apos;équipe.</li>
              <li>2. Importez les familles et dossiers existants depuis vos exports.</li>
              <li>3. Configurez les centres, séjours et plannings transports.</li>
              <li>4. Activez les notifications essentielles pour les encadrants.</li>
            </ul>
          </section>

          <section className="space-y-3 rounded-xl border bg-white p-6 shadow-[0_1px_0_rgba(0,0,0,0.04)]">
            <h2 className="text-lg font-semibold text-neutral-900">
              Guides détaillés
            </h2>
            <ul className="space-y-2 text-sm text-neutral-700">
              <li>• Gestion des dossiers familles et suivi des pièces.</li>
              <li>• Paramétrage des équipes et circulation des convocations.</li>
              <li>• Supervision des transports et diffusion des informations clés.</li>
              <li>• Sécurité des données et bonnes pratiques RGPD.</li>
            </ul>
          </section>
        </div>

        <section className="space-y-3 rounded-xl border bg-white p-6">
          <h2 className="text-lg font-semibold text-neutral-900">Envie d&apos;aller plus loin ?</h2>
          <p className="text-sm text-neutral-700">
            Vous pouvez compléter cette documentation avec vos propres procédures
            internes : pas à pas pour les équipes terrain, checklists avant
            départ, consignes de sécurité, ou encore modèles de communication
            pour les familles.
          </p>
        </section>
      </div>
    </main>
  );
}

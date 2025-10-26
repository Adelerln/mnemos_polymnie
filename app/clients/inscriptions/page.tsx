import Link from "next/link";
import {
  ArrowLeft,
  CalendarDays,
  RefreshCw,
  Search,
  Users,
} from "lucide-react";

const PLACEHOLDER_ROWS = Array.from({ length: 8 });

export default function ClientInscriptionsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#e0e3e8] via-[#d5d8e0] to-[#c9cdd6] py-12">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-6 text-[#2b2f36] lg:px-10">
        <header className="flex flex-col gap-4 rounded-2xl border border-[#d9dce2] bg-white/80 p-6 shadow-lg backdrop-blur">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="space-y-1">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#5c606b]">
                Suivi des inscriptions
              </p>
              <h1 className="text-3xl font-semibold tracking-tight text-[#1f2330]">
                Inscriptions famille
              </h1>
            </div>
            <Link
              href="/clients"
              className="inline-flex items-center gap-2 rounded-full border border-[#c9ccd5] bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-[#2b2f36] transition hover:bg-[#f4f6fa]"
            >
              <ArrowLeft className="size-3.5" />
              Retour fiche famille
            </Link>
          </div>
          <p className="text-sm text-[#565b66]">
            Consultez et filtrez toutes les inscriptions des enfants d&apos;une
            famille. Cette vue est une maquette statique, prête à être connectée
            à Supabase.
          </p>
        </header>

        <section className="grid gap-4 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)_minmax(0,1fr)]">
          <div className="space-y-4 rounded-2xl border border-[#d3d7df] bg-white p-6 shadow-md">
            <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-[#1f2330]">
              Filtres familles & participants
            </h2>
            <div className="grid gap-4 md:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
              <div className="space-y-3">
                <label className="flex items-center gap-2 text-sm text-[#2b2f36]">
                  <input type="radio" name="search-type" value="participant" defaultChecked />
                  Participant
                  <input
                    className="flex-1 rounded border border-[#d4d7df] bg-white px-3 py-2 text-sm focus:border-[#7f8696] focus:outline-none"
                    placeholder="Nom du participant..."
                  />
                </label>
                <label className="flex items-center gap-2 text-sm text-[#2b2f36]">
                  <input type="radio" name="search-type" value="famille" />
                  Famille
                  <input
                    className="flex-1 rounded border border-[#d4d7df] bg-white px-3 py-2 text-sm focus:border-[#7f8696] focus:outline-none"
                    placeholder="Nom famille..."
                  />
                  <input
                    className="w-40 rounded border border-[#d4d7df] bg-white px-3 py-2 text-sm focus:border-[#7f8696] focus:outline-none"
                    placeholder="ID Client"
                  />
                </label>
                <label className="flex items-center gap-2 text-sm text-[#2b2f36]">
                  <input type="radio" name="search-type" value="partenaire" />
                  Partenaire
                  <input
                    className="flex-1 rounded border border-[#d4d7df] bg-white px-3 py-2 text-sm focus:border-[#7f8696] focus:outline-none"
                    placeholder="Nom..."
                  />
                </label>
              </div>
              <div className="space-y-3">
                <div className="grid gap-3 md:grid-cols-2">
                  <label className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-[#5c606b]">
                    <input type="radio" name="status" value="reference" defaultChecked />
                    Réf séjour
                    <input
                      className="flex-1 rounded border border-[#d4d7df] bg-white px-3 py-2 text-sm focus:border-[#7f8696] focus:outline-none"
                      placeholder="SÉJOUR-2025-01"
                    />
                  </label>
                  <label className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-[#5c606b]">
                    <input type="radio" name="status" value="lieu" />
                    Lieu
                    <input
                      className="flex-1 rounded border border-[#d4d7df] bg-white px-3 py-2 text-sm focus:border-[#7f8696] focus:outline-none"
                      placeholder="Ville..."
                    />
                  </label>
                </div>
                <div className="grid gap-3 md:grid-cols-2">
                  <label className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-[#5c606b]">
                    Période du
                    <input
                      className="flex-1 rounded border border-[#d4d7df] bg-white px-3 py-2 text-sm focus:border-[#7f8696] focus:outline-none"
                      placeholder="01/07/2025"
                    />
                  </label>
                  <label className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-[#5c606b]">
                    au
                    <input
                      className="flex-1 rounded border border-[#d4d7df] bg-white px-3 py-2 text-sm focus:border-[#7f8696] focus:outline-none"
                      placeholder="31/08/2025"
                    />
                  </label>
                </div>
                <div className="flex items-center gap-3">
                  <label className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-[#5c606b]">
                    <input type="checkbox" defaultChecked />
                    Afficher restant dû familles
                  </label>
                  <button className="inline-flex items-center justify-center rounded-md border border-[#d4d7df] bg-white px-3 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-[#2b2f36] transition hover:bg-[#f0f3f8]">
                    <Search className="size-4" />
                  </button>
                  <button className="inline-flex items-center justify-center rounded-md border border-[#d4d7df] bg-white px-3 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-[#2b2f36] transition hover:bg-[#f0f3f8]">
                    <RefreshCw className="size-4" />
                  </button>
                </div>
                <div className="grid gap-3 md:grid-cols-2">
                  <label className="flex items-center justify-between gap-2 rounded border border-[#d4d7df] bg-[#f7f8fb] px-3 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-[#5c606b]">
                    Inscriptions archivées ?
                    <select className="rounded border border-[#d4d7df] bg-white px-2 py-1 text-xs focus:border-[#7f8696]">
                      <option>Oui</option>
                      <option>Non</option>
                    </select>
                  </label>
                  <label className="flex items-center justify-between gap-2 rounded border border-[#d4d7df] bg-[#f7f8fb] px-3 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-[#5c606b]">
                    Inscriptions annulées ?
                    <select className="rounded border border-[#d4d7df] bg-white px-2 py-1 text-xs focus:border-[#7f8696]">
                      <option>Non</option>
                      <option>Oui</option>
                    </select>
                  </label>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4 rounded-2xl border border-[#d3d7df] bg-white p-6 shadow-md">
            <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-[#1f2330]">
              Paramètres séjour
            </h2>
            <div className="space-y-3 text-xs uppercase tracking-[0.14em] text-[#5c606b]">
              <label className="flex flex-col gap-1">
                Saison
                <input
                  className="rounded border border-[#d4d7df] bg-white px-3 py-2 text-sm text-[#2b2f36] focus:border-[#7f8696] focus:outline-none"
                  placeholder="Été"
                />
              </label>
              <label className="flex flex-col gap-1">
                Année
                <input
                  className="rounded border border-[#d4d7df] bg-white px-3 py-2 text-sm text-[#2b2f36] focus:border-[#7f8696] focus:outline-none"
                  placeholder="2025"
                />
              </label>
              <label className="flex flex-col gap-1">
                Thématique artistique
                <input
                  className="rounded border border-[#d4d7df] bg-white px-3 py-2 text-sm text-[#2b2f36] focus:border-[#7f8696] focus:outline-none"
                  placeholder="Musique, théâtre..."
                />
              </label>
              <label className="flex flex-col gap-1">
                Assurance
                <input
                  className="rounded border border-[#d4d7df] bg-white px-3 py-2 text-sm text-[#2b2f36] focus:border-[#7f8696] focus:outline-none"
                  placeholder="Contrat..."
                />
              </label>
            </div>
          </div>

          <div className="flex flex-col items-center justify-between rounded-2xl border border-[#d3d7df] bg-white p-6 text-center shadow-md">
            <div className="space-y-3">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#5c606b]">
                Nombre d&apos;inscriptions
              </p>
              <div className="rounded-full bg-[#e8f6ef] px-5 py-4 text-3xl font-semibold text-[#248c58] shadow-inner">
                0
              </div>
            </div>
            <div className="flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.16em] text-[#5c606b]">
              <span className="inline-flex items-center gap-1 rounded-full bg-[#fee9ef] px-3 py-1 text-[#d43a6a]">
                <Users className="size-4" />
                Participants
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-[#e8efff] px-3 py-1 text-[#3c5dc9]">
                <CalendarDays className="size-4" />
                Séjours
              </span>
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-[#d3d7df] bg-white/90 shadow-xl">
          <div className="overflow-hidden rounded-t-2xl bg-[#1f2330]">
            <table className="w-full border-collapse text-left text-xs font-semibold uppercase tracking-[0.16em] text-white">
              <thead>
                <tr>
                  {[
                    "Nom",
                    "Prénom",
                    "Date de naissance",
                    "Âge",
                    "Réf séjour",
                    "Thème",
                    "Ville de départ",
                    "Ville de retour",
                    "Partenaire",
                  ].map((header) => (
                    <th key={header} className="px-5 py-3">
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
            </table>
          </div>
          <div className="max-h-[480px] overflow-auto">
            <table className="w-full border-collapse text-sm text-[#2b2f36]">
              <tbody>
                {PLACEHOLDER_ROWS.map((_, index) => (
                  <tr
                    key={index}
                    className={index % 2 === 0 ? "bg-white" : "bg-[#f7f8fb]"}
                  >
                    <td className="px-5 py-4 text-sm font-medium text-[#5c606b]">
                      --- 
                    </td>
                    <td className="px-5 py-4 text-sm font-medium text-[#5c606b]">
                      ---
                    </td>
                    <td className="px-5 py-4 text-sm text-[#5c606b]">--/--/----</td>
                    <td className="px-5 py-4 text-sm text-[#5c606b]">--</td>
                    <td className="px-5 py-4 text-sm text-[#5c606b]">---</td>
                    <td className="px-5 py-4 text-sm text-[#5c606b]">---</td>
                    <td className="px-5 py-4 text-sm text-[#5c606b]">---</td>
                    <td className="px-5 py-4 text-sm text-[#5c606b]">---</td>
                    <td className="px-5 py-4 text-sm text-[#5c606b]">---</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <footer className="flex items-center justify-between px-5 py-4 text-xs font-semibold uppercase tracking-[0.16em] text-[#5c606b]">
            <span>0 inscription affichée</span>
            <span>En attente de connexion Supabase</span>
          </footer>
        </section>
      </div>
    </div>
  );
}

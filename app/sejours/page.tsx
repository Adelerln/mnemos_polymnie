"use client";

import {
  Suspense,
  useState,
  type ChangeEvent,
  type FormEvent,
} from "react";

type SejourFormState = {
  reference: string;
  centre: string;
  annee: string;
  saison: string;
  periodeGlobale: string;
  dateDebut: string;
  dateFin: string;
  prixBase: string;
  nomCommum: string;
  ddcsCentre: string;
  ddcsComplementaire: string;
  codeAnalytique: string;
  archive: boolean;
  sansPiqueNique: boolean;
};

const createEmptySejour = (): SejourFormState => ({
  reference: "",
  centre: "",
  annee: "",
  saison: "",
  periodeGlobale: "",
  dateDebut: "",
  dateFin: "",
  prixBase: "",
  nomCommum: "",
  ddcsCentre: "",
  ddcsComplementaire: "",
  codeAnalytique: "",
  archive: false,
  sansPiqueNique: false,
});

export default function SejoursPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-neutral-200/60 px-4 text-[#1f2330]">
          Chargement des séjours…
        </div>
      }
    >
      <SejoursPageContent />
    </Suspense>
  );
}

function SejoursPageContent() {
  const [filters, setFilters] = useState({
    annee: "",
    centre: "",
    saison: "",
    reference: "",
  });
  const [form, setForm] = useState<SejourFormState>(() => createEmptySejour());
  const [sejourList] = useState<Array<{ id: number; reference: string; centre: string; annee: string; periode: string }>>([]);
  const assuranceRows: Array<{ id: number; name: string; value: string; unit: string }> = [];
  const artisticOptions: Array<{ id: number; sejour: string; option: string; price: string }> = [];
  const entryDates: Array<{ id: number; date: string }> = [];
  const exitDates: Array<{ id: number; date: string }> = [];
  const departureCities: Array<{ id: number; city: string; price: string }> = [];
  const returnCities: Array<{ id: number; city: string; price: string }> = [];
  const sejourPeriods: Array<{ id: number; period: string; prestashop: string }> = [];
  const partnerPricing: Array<{ id: number; name: string; base: string; transport: string }> = [];
  const taskCategories: Array<{ id: number; category: string; tasks: string; daysBefore: string }> = [];
  const staffMembers: Array<{ id: number; name: string; firstName: string; role: string }> = [];

  const handleFilterChange =
    (field: keyof typeof filters) =>
    (event: ChangeEvent<HTMLInputElement>) => {
      const value = event.target.value;
      setFilters((prev) => ({
        ...prev,
        [field]: value,
      }));
    };

  const handleFormChange =
    (field: keyof SejourFormState) =>
    (event: ChangeEvent<HTMLInputElement>) => {
      const value =
        field === "archive" || field === "sansPiqueNique"
          ? (event.target as HTMLInputElement).checked
          : event.target.value;

      setForm((prev) => ({
        ...prev,
        [field]: field === "archive" || field === "sansPiqueNique" ? Boolean(value) : (value as string),
      }));
    };

  const handleReset = () => {
    setFilters({ annee: "", centre: "", saison: "", reference: "" });
    setForm(createEmptySejour());
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    // TODO: connect to Supabase
  };

  return (
    <div className="min-h-screen bg-[#dde1e7] py-10">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 text-[#1f2330] md:px-8">
        <header className="rounded-2xl border border-[#c9ccd5] bg-white/90 px-6 py-5 shadow-lg">
          <h1 className="text-3xl font-semibold tracking-tight text-[#1f2330]">
            Gestion des séjours
          </h1>
          <p className="mt-1 text-sm text-[#5c606b]">
            Consultez et mettez à jour les informations de vos séjours.
          </p>
        </header>

        <section className="space-y-4 rounded-2xl border border-[#d0d4dc] bg-white p-6 shadow-xl">
          <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-[#1f2330]">
            Recherche
          </h2>
          <div className="grid gap-3 lg:grid-cols-[repeat(4,minmax(0,1fr))_auto_auto_auto]">
            <input
              className="rounded border border-[#d4d7df] bg-white px-3 py-2 text-sm text-[#2b2f36] focus:border-[#7f8696] focus:outline-none"
              placeholder="Année"
              value={filters.annee}
              onChange={handleFilterChange("annee")}
            />
            <input
              className="rounded border border-[#d4d7df] bg-white px-3 py-2 text-sm text-[#2b2f36] focus:border-[#7f8696] focus:outline-none"
              placeholder="Centre"
              value={filters.centre}
              onChange={handleFilterChange("centre")}
            />
            <input
              className="rounded border border-[#d4d7df] bg-white px-3 py-2 text-sm text-[#2b2f36] focus:border-[#7f8696] focus:outline-none"
              placeholder="Saison"
              value={filters.saison}
              onChange={handleFilterChange("saison")}
            />
            <input
              className="rounded border border-[#d4d7df] bg-white px-3 py-2 text-sm text-[#2b2f36] focus:border-[#7f8696] focus:outline-none"
              placeholder="Période"
            />
            <button className="inline-flex items-center justify-center rounded-md border border-[#d4d7df] bg-[#f7f8fb] px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-[#2b2f36] transition hover:bg-[#eef1f7]">
              🔍
            </button>
            <button
              type="button"
              onClick={handleReset}
              className="inline-flex items-center justify-center rounded-md border border-[#d4d7df] bg-[#f7f8fb] px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-[#2b2f36] transition hover:bg-[#eef1f7]"
            >
              ⟳
            </button>
            <button className="inline-flex items-center justify-center rounded-md border border-[#d4d7df] bg-[#f7f8fb] px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-[#2b2f36] transition hover:bg-[#eef1f7]">
              Trier
            </button>
          </div>
          <textarea
            className="h-40 w-full rounded border border-[#d4d7df] bg-[#f7f8fb] px-3 py-2 text-sm text-[#2b2f36] focus:border-[#7f8696] focus:outline-none"
            placeholder="Résultats de la recherche"
            readOnly
          />
        </section>

        <form
          onSubmit={handleSubmit}
          className="space-y-5 rounded-2xl border border-[#d0d4dc] bg-white/95 p-6 shadow-xl"
        >
          <div className="flex flex-wrap items-center gap-3 text-xs font-semibold uppercase tracking-[0.16em] text-[#5c606b]">
            <label className="inline-flex items-center gap-2">
              Archivé ?
              <input
                type="checkbox"
                className="size-4 accent-[#f0a481]"
                checked={form.archive}
                onChange={handleFormChange("archive")}
              />
            </label>
          </div>

          <div className="rounded-xl border border-[#b04c5b] bg-[#8f1f33] p-6 text-white shadow-lg">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-lg font-semibold uppercase tracking-[0.18em]">
                Informations séjour
              </h2>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  className="inline-flex items-center justify-center rounded-md border border-white/20 bg-white/10 p-2 text-white transition hover:bg-white/20"
                >
                  +
                </button>
                <button
                  type="button"
                  className="inline-flex items-center justify-center rounded-md border border-white/20 bg-white/10 p-2 text-white transition hover:bg-white/20"
                >
                  −
                </button>
                <button
                  type="button"
                  className="inline-flex items-center justify-center rounded-md border border-white/20 bg-white/10 p-2 text-white transition hover:bg-white/20"
                >
                  ⧉
                </button>
              </div>
            </div>

            <div className="space-y-3 text-xs font-semibold uppercase tracking-[0.14em] text-white/80">
              <div className="grid gap-3 lg:grid-cols-[minmax(0,2fr)_minmax(0,2fr)_minmax(0,1fr)]">
                <label className="flex flex-col gap-1">
                  Nom du centre
                  <input
                    className="rounded border border-white/30 bg-white/20 px-3 py-2 text-sm font-medium text-white placeholder:text-white/70 focus:border-white focus:outline-none"
                    value={form.centre}
                    onChange={handleFormChange("centre")}
                  />
                </label>
                <div className="grid gap-2 sm:grid-cols-2">
                  <label className="flex flex-col gap-1">
                    Nom commun
                    <input
                      className="rounded border border-white/30 bg-white/20 px-3 py-2 text-sm font-medium text-white placeholder:text-white/70 focus:border-white focus:outline-none"
                      value={form.nomCommum}
                      onChange={handleFormChange("nomCommum")}
                    />
                  </label>
                  <label className="flex flex-col gap-1">
                    Ref séjour
                    <input
                      className="rounded border border-white/30 bg-white/20 px-3 py-2 text-sm font-medium text-white placeholder:text-white/70 focus:border-white focus:outline-none"
                      value={form.reference}
                      onChange={handleFormChange("reference")}
                    />
                  </label>
                </div>
              </div>

              <div className="grid gap-3 lg:grid-cols-[repeat(4,minmax(0,1fr))]">
                <label className="flex flex-col gap-1">
                  Saison
                  <input
                    className="rounded border border-white/30 bg-white/20 px-3 py-2 text-sm text-white focus:border-white focus:outline-none"
                    value={form.saison}
                    onChange={handleFormChange("saison")}
                  />
                </label>
                <label className="flex flex-col gap-1">
                  Année
                  <input
                    className="rounded border border-white/30 bg-white/20 px-3 py-2 text-sm text-white focus:border-white focus:outline-none"
                    value={form.annee}
                    onChange={handleFormChange("annee")}
                  />
                </label>
                <label className="flex flex-col gap-1">
                  Période globale
                  <input
                    className="rounded border border-white/30 bg-white/20 px-3 py-2 text-sm text-white focus:border-white focus:outline-none"
                    value={form.periodeGlobale}
                    onChange={handleFormChange("periodeGlobale")}
                  />
                </label>
                <label className="flex flex-col gap-1">
                  Prix de base
                  <input
                    className="rounded border border-white/30 bg-white/20 px-3 py-2 text-sm text-white focus:border-white focus:outline-none"
                    value={form.prixBase}
                    onChange={handleFormChange("prixBase")}
                  />
                </label>
              </div>

              <div className="grid gap-3 lg:grid-cols-[repeat(4,minmax(0,1fr))]">
                <label className="flex flex-col gap-1">
                  Date début
                  <input
                    type="date"
                    className="rounded border border-white/30 bg-white/20 px-3 py-2 text-sm text-white focus:border-white focus:outline-none"
                    value={form.dateDebut}
                    onChange={handleFormChange("dateDebut")}
                  />
                </label>
                <label className="flex flex-col gap-1">
                  Date fin
                  <input
                    type="date"
                    className="rounded border border-white/30 bg-white/20 px-3 py-2 text-sm text-white focus:border-white focus:outline-none"
                    value={form.dateFin}
                    onChange={handleFormChange("dateFin")}
                  />
                </label>
                <label className="flex flex-col gap-1">
                  N° DDCS centre
                  <input
                    className="rounded border border-white/30 bg-white/20 px-3 py-2 text-sm text-white focus:border-white focus:outline-none"
                    value={form.ddcsCentre}
                    onChange={handleFormChange("ddcsCentre")}
                  />
                </label>
                <label className="flex flex-col gap-1">
                  N° DDCS complémentaire
                  <input
                    className="rounded border border-white/30 bg-white/20 px-3 py-2 text-sm text-white focus:border-white focus:outline-none"
                    value={form.ddcsComplementaire}
                    onChange={handleFormChange("ddcsComplementaire")}
                  />
                </label>
              </div>
            </div>
          </div>

          <div className="grid gap-4 text-xs font-semibold uppercase tracking-[0.16em] text-[#5c606b] md:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
            <label className="flex flex-col gap-1">
              Code analytique comptable
              <input
                className="rounded border border-[#d4d7df] bg-white px-3 py-2 text-sm text-[#2b2f36] focus:border-[#7f8696] focus:outline-none"
                value={form.codeAnalytique}
                onChange={handleFormChange("codeAnalytique")}
              />
            </label>
            <label className="inline-flex items-center gap-2">
              Séjour sans pique-nique ?
              <input
                type="checkbox"
                className="size-4 accent-[#0f4c65]"
                checked={form.sansPiqueNique}
                onChange={handleFormChange("sansPiqueNique")}
              />
            </label>
          </div>

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={handleReset}
              className="inline-flex items-center justify-center rounded-md border border-[#d4d7df] bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-[#2b2f36] transition hover:bg-[#eef1f7]"
            >
              Réinitialiser
            </button>
            <button
              type="submit"
              className="inline-flex items-center justify-center rounded-md border border-[#0f4c65] bg-[#0f4c65] px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-white transition hover:bg-[#0c3850]"
            >
              Enregistrer
            </button>
          </div>
        </form>

        <section className="space-y-6 rounded-2xl border border-[#d0d4dc] bg-white/90 p-6 shadow-xl">
          <div className="grid gap-6 xl:grid-cols-2">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold uppercase tracking-[0.18em] text-[#1f2330]">
                  Assurances
                </h3>
                <button className="inline-flex items-center justify-center rounded-md border border-[#d4d7df] bg-[#ffe2d6] px-2 py-1 text-sm font-semibold text-[#2b2f36] transition hover:bg-[#ffd0bd]">
                  +
                </button>
              </div>
              <div className="overflow-hidden rounded-xl border border-[#d4d7df] bg-[#f7f8fb]">
                <table className="w-full border-collapse text-xs font-semibold uppercase tracking-[0.12em] text-[#5c606b]">
                  <thead className="bg-[#eceef3]">
                    <tr>
                      <th className="px-3 py-2 text-left">Nom de l&apos;assurance</th>
                      <th className="px-3 py-2 text-left">Valeur</th>
                      <th className="px-3 py-2 text-left">%/€</th>
                    </tr>
                  </thead>
                  <tbody>
                    {assuranceRows.length === 0 ? (
                      <tr>
                        <td colSpan={3} className="px-3 py-4 text-center text-xs font-medium text-[#7f8696]">
                          Aucune assurance configurée.
                        </td>
                      </tr>
                    ) : (
                      assuranceRows.map((row) => (
                        <tr key={row.id} className="border-t border-[#e3e6ed] odd:bg-white even:bg-[#f5f6f9]">
                          <td className="px-3 py-2 text-sm text-[#2b2f36]">{row.name}</td>
                          <td className="px-3 py-2 text-sm text-[#2b2f36]">{row.value}</td>
                          <td className="px-3 py-2 text-sm text-[#2b2f36]">{row.unit}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold uppercase tracking-[0.18em] text-[#1f2330]">
                  Options artistiques
                </h3>
                <button className="inline-flex items-center justify-center rounded-md border border-[#d4d7df] bg-[#ffe2d6] px-2 py-1 text-sm font-semibold text-[#2b2f36] transition hover:bg-[#ffd0bd]">
                  +
                </button>
              </div>
              <div className="overflow-hidden rounded-xl border border-[#d4d7df] bg-[#f7f8fb]">
                <table className="w-full border-collapse text-xs font-semibold uppercase tracking-[0.12em] text-[#5c606b]">
                  <thead className="bg-[#eceef3]">
                    <tr>
                      <th className="px-3 py-2 text-left">Nom du séjour</th>
                      <th className="px-3 py-2 text-left">Option artistique</th>
                      <th className="px-3 py-2 text-left">Prix</th>
                    </tr>
                  </thead>
                  <tbody>
                    {artisticOptions.length === 0 ? (
                      <tr>
                        <td colSpan={3} className="px-3 py-4 text-center text-xs font-medium text-[#7f8696]">
                          Aucune option artistique définie.
                        </td>
                      </tr>
                    ) : (
                      artisticOptions.map((row) => (
                        <tr key={row.id} className="border-t border-[#e3e6ed] odd:bg-white even:bg-[#f5f6f9]">
                          <td className="px-3 py-2 text-sm text-[#2b2f36]">{row.sejour}</td>
                          <td className="px-3 py-2 text-sm text-[#2b2f36]">{row.option}</td>
                          <td className="px-3 py-2 text-sm text-[#2b2f36]">{row.price}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div className="grid gap-6 xl:grid-cols-2">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold uppercase tracking-[0.18em] text-[#1f2330]">
                  Dates d&apos;entrées
                </h3>
                <button className="inline-flex items-center justify-center rounded-md border border-[#d4d7df] bg-[#ffe2d6] px-2 py-1 text-sm font-semibold text-[#2b2f36] transition hover:bg-[#ffd0bd]">
                  +
                </button>
              </div>
              <ul className="min-h-[120px] rounded-xl border border-[#d4d7df] bg-[#f7f8fb] px-3 py-2 text-sm text-[#2b2f36]">
                {entryDates.length === 0 ? (
                  <li className="py-4 text-center text-xs font-medium text-[#7f8696]">
                    Aucune date d&apos;entrée.
                  </li>
                ) : (
                  entryDates.map((row) => (
                    <li key={row.id} className="border-b border-[#e3e6ed] py-2 last:border-0">
                      {row.date}
                    </li>
                  ))
                )}
              </ul>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold uppercase tracking-[0.18em] text-[#1f2330]">
                  Dates de sorties
                </h3>
                <button className="inline-flex items-center justify-center rounded-md border border-[#d4d7df] bg-[#ffe2d6] px-2 py-1 text-sm font-semibold text-[#2b2f36] transition hover:bg-[#ffd0bd]">
                  +
                </button>
              </div>
              <ul className="min-h-[120px] rounded-xl border border-[#d4d7df] bg-[#f7f8fb] px-3 py-2 text-sm text-[#2b2f36]">
                {exitDates.length === 0 ? (
                  <li className="py-4 text-center text-xs font-medium text-[#7f8696]">
                    Aucune date de sortie.
                  </li>
                ) : (
                  exitDates.map((row) => (
                    <li key={row.id} className="border-b border-[#e3e6ed] py-2 last:border-0">
                      {row.date}
                    </li>
                  ))
                )}
              </ul>
            </div>
          </div>

          <div className="grid gap-6 xl:grid-cols-2">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold uppercase tracking-[0.18em] text-[#1f2330]">
                  Villes de départ
                </h3>
                <button className="inline-flex items-center justify-center rounded-md border border-[#d4d7df] bg-[#ffe2d6] px-2 py-1 text-sm font-semibold text-[#2b2f36] transition hover:bg-[#ffd0bd]">
                  +
                </button>
              </div>
              <div className="overflow-hidden rounded-xl border border-[#d4d7df] bg-[#f7f8fb]">
                <table className="w-full border-collapse text-xs font-semibold uppercase tracking-[0.12em] text-[#5c606b]">
                  <thead className="bg-[#eceef3]">
                    <tr>
                      <th className="px-3 py-2 text-left">Villes de départ</th>
                      <th className="px-3 py-2 text-left">Prix</th>
                    </tr>
                  </thead>
                  <tbody>
                    {departureCities.length === 0 ? (
                      <tr>
                        <td colSpan={2} className="px-3 py-4 text-center text-xs font-medium text-[#7f8696]">
                          Aucune ville de départ configurée.
                        </td>
                      </tr>
                    ) : (
                      departureCities.map((row) => (
                        <tr key={row.id} className="border-t border-[#e3e6ed] odd:bg-white even:bg-[#f5f6f9]">
                          <td className="px-3 py-2 text-sm text-[#2b2f36]">{row.city}</td>
                          <td className="px-3 py-2 text-sm text-[#2b2f36]">{row.price}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold uppercase tracking-[0.18em] text-[#1f2330]">
                  Villes de retour
                </h3>
                <button className="inline-flex items-center justify-center rounded-md border border-[#d4d7df] bg-[#ffe2d6] px-2 py-1 text-sm font-semibold text-[#2b2f36] transition hover:bg-[#ffd0bd]">
                  +
                </button>
              </div>
              <div className="overflow-hidden rounded-xl border border-[#d4d7df] bg-[#f7f8fb]">
                <table className="w-full border-collapse text-xs font-semibold uppercase tracking-[0.12em] text-[#5c606b]">
                  <thead className="bg-[#eceef3]">
                    <tr>
                      <th className="px-3 py-2 text-left">Villes de retour</th>
                      <th className="px-3 py-2 text-left">Prix</th>
                    </tr>
                  </thead>
                  <tbody>
                    {returnCities.length === 0 ? (
                      <tr>
                        <td colSpan={2} className="px-3 py-4 text-center text-xs font-medium text-[#7f8696]">
                          Aucune ville de retour configurée.
                        </td>
                      </tr>
                    ) : (
                      returnCities.map((row) => (
                        <tr key={row.id} className="border-t border-[#e3e6ed] odd:bg-white even:bg-[#f5f6f9]">
                          <td className="px-3 py-2 text-sm text-[#2b2f36]">{row.city}</td>
                          <td className="px-3 py-2 text-sm text-[#2b2f36]">{row.price}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold uppercase tracking-[0.18em] text-[#1f2330]">
                Périodes de séjour
              </h3>
              <button className="inline-flex items-center justify-center rounded-md border border-[#d4d7df] bg-[#ffe2d6] px-2 py-1 text-sm font-semibold text-[#2b2f36] transition hover:bg-[#ffd0bd]">
                +
              </button>
            </div>
            <div className="overflow-hidden rounded-xl border border-[#d4d7df] bg-[#f7f8fb]">
              <table className="w-full border-collapse text-xs font-semibold uppercase tracking-[0.12em] text-[#5c606b]">
                <thead className="bg-[#eceef3]">
                  <tr>
                    <th className="px-3 py-2 text-left">Période</th>
                    <th className="px-3 py-2 text-left">N° Grp Prestashop</th>
                  </tr>
                </thead>
                <tbody>
                  {sejourPeriods.length === 0 ? (
                    <tr>
                      <td colSpan={2} className="px-3 py-4 text-center text-xs font-medium text-[#7f8696]">
                        Aucune période enregistrée.
                      </td>
                    </tr>
                  ) : (
                    sejourPeriods.map((row) => (
                      <tr key={row.id} className="border-t border-[#e3e6ed] odd:bg-white even:bg-[#f5f6f9]">
                        <td className="px-3 py-2 text-sm text-[#2b2f36]">{row.period}</td>
                        <td className="px-3 py-2 text-sm text-[#2b2f36]">{row.prestashop}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="grid gap-6 xl:grid-cols-[minmax(0,1.4fr)_minmax(0,1.4fr)_minmax(0,1fr)]">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold uppercase tracking-[0.18em] text-[#1f2330]">
                Partenariats
              </h3>
              <div className="overflow-hidden rounded-xl border border-[#d4d7df] bg-[#f7f8fb]">
                <table className="w-full border-collapse text-xs font-semibold uppercase tracking-[0.12em] text-[#5c606b]">
                  <thead className="bg-[#eceef3]">
                    <tr>
                      <th className="px-3 py-2 text-left">Nom du part.</th>
                      <th className="px-3 py-2 text-left">Prix hors transport</th>
                      <th className="px-3 py-2 text-left">Prix transport</th>
                    </tr>
                  </thead>
                  <tbody>
                    {partnerPricing.length === 0 ? (
                      <tr>
                        <td colSpan={3} className="px-3 py-4 text-center text-xs font-medium text-[#7f8696]">
                          Aucun partenariat enregistré.
                        </td>
                      </tr>
                    ) : (
                      partnerPricing.map((row) => (
                        <tr key={row.id} className="border-t border-[#e3e6ed] odd:bg-white even:bg-[#f5f6f9]">
                          <td className="px-3 py-2 text-sm text-[#2b2f36]">{row.name}</td>
                          <td className="px-3 py-2 text-sm text-[#2b2f36]">{row.base}</td>
                          <td className="px-3 py-2 text-sm text-[#2b2f36]">{row.transport}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold uppercase tracking-[0.18em] text-[#1f2330]">
                  Tâches associées
                </h3>
                <button className="inline-flex items-center justify-center rounded-md border border-[#d4d7df] bg-[#ffe2d6] px-2 py-1 text-sm font-semibold text-[#2b2f36] transition hover:bg-[#ffd0bd]">
                  +
                </button>
              </div>
              <div className="overflow-hidden rounded-xl border border-[#d4d7df] bg-[#f7f8fb]">
                <table className="w-full border-collapse text-xs font-semibold uppercase tracking-[0.12em] text-[#5c606b]">
                  <thead className="bg-[#eceef3]">
                    <tr>
                      <th className="px-3 py-2 text-left">Catégorie de tâche</th>
                      <th className="px-3 py-2 text-left">Tâches associées</th>
                      <th className="px-3 py-2 text-left">Nb de jours avant</th>
                    </tr>
                  </thead>
                  <tbody>
                    {taskCategories.length === 0 ? (
                      <tr>
                        <td colSpan={3} className="px-3 py-4 text-center text-xs font-medium text-[#7f8696]">
                          Aucune tâche planifiée.
                        </td>
                      </tr>
                    ) : (
                      taskCategories.map((row) => (
                        <tr key={row.id} className="border-t border-[#e3e6ed] odd:bg-white even:bg-[#f5f6f9]">
                          <td className="px-3 py-2 text-sm text-[#2b2f36]">{row.category}</td>
                          <td className="px-3 py-2 text-sm text-[#2b2f36]">{row.tasks}</td>
                          <td className="px-3 py-2 text-sm text-[#2b2f36]">{row.daysBefore}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold uppercase tracking-[0.18em] text-[#1f2330]">
                Encadrement associé
              </h3>
              <div className="overflow-hidden rounded-xl border border-[#d4d7df] bg-[#f7f8fb]">
                <table className="w-full border-collapse text-xs font-semibold uppercase tracking-[0.12em] text-[#5c606b]">
                  <thead className="bg-[#eceef3]">
                    <tr>
                      <th className="px-3 py-2 text-left">Nom</th>
                      <th className="px-3 py-2 text-left">Prénom</th>
                      <th className="px-3 py-2 text-left">Fonction</th>
                    </tr>
                  </thead>
                  <tbody>
                    {staffMembers.length === 0 ? (
                      <tr>
                        <td colSpan={3} className="px-3 py-4 text-center text-xs font-medium text-[#7f8696]">
                          Aucun membre associé.
                        </td>
                      </tr>
                    ) : (
                      staffMembers.map((row) => (
                        <tr key={row.id} className="border-t border-[#e3e6ed] odd:bg-white even:bg-[#f5f6f9]">
                          <td className="px-3 py-2 text-sm text-[#2b2f36]">{row.name}</td>
                          <td className="px-3 py-2 text-sm text-[#2b2f36]">{row.firstName}</td>
                          <td className="px-3 py-2 text-sm text-[#2b2f36]">{row.role}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-[#d0d4dc] bg-white/80 px-6 py-4 text-xs font-semibold uppercase tracking-[0.16em] text-[#5c606b] shadow">
          <p>
            {sejourList.length === 0
              ? "Aucun séjour sélectionné."
              : `${sejourList.length} séjour${sejourList.length > 1 ? "s" : ""} listé${
                  sejourList.length > 1 ? "s" : ""
                }.`}
          </p>
        </section>
      </div>
    </div>
  );
}

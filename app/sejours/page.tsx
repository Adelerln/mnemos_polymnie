"use client";

import {
  Suspense,
  useEffect,
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
        <div className="flex min-h-screen items-center justify-center bg-neutral-200/60 px-4 text-[#204991]">
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
  const [searchTerm, setSearchTerm] = useState("");
  const [isSearchPanelOpen, setIsSearchPanelOpen] = useState(false);
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

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setIsSearchPanelOpen((open) => !open);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const filteredSejours = sejourList.filter((item) => {
    const term = searchTerm.trim().toLowerCase();
    const matchesFilters =
      (!filters.annee || item.annee.toLowerCase().includes(filters.annee.toLowerCase())) &&
      (!filters.centre || item.centre.toLowerCase().includes(filters.centre.toLowerCase())) &&
      (!filters.saison || item.periode.toLowerCase().includes(filters.saison.toLowerCase())) &&
      (!filters.reference || item.reference.toLowerCase().includes(filters.reference.toLowerCase()));
    if (!matchesFilters) return false;
    if (!term) return true;
    return (
      item.reference.toLowerCase().includes(term) ||
      item.centre.toLowerCase().includes(term) ||
      item.annee.toLowerCase().includes(term) ||
      item.periode.toLowerCase().includes(term)
    );
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-[#CFE5FF] to-[#CFE5FF] py-12 text-[#204991]">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-5 md:px-10">
        <header className="rounded-3xl border border-[#CFE5FF] bg-white/95 px-8 py-7 shadow-[0_25px_60px_rgba(83,15,43,0.05)]">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.5em] text-[#204991]">Séjours</p>
              <h1 className="mt-2 text-3xl font-semibold tracking-tight text-[#204991]">
                Gestion des séjours
              </h1>
              <p className="mt-2 text-sm text-[#204991]">
                Consultez et mettez à jour les informations de vos séjours.
              </p>
            </div>
            <button
              type="button"
              className="inline-flex items-center gap-3 rounded-full border border-[#CFE5FF] bg-white/70 px-5 py-2 text-sm font-medium text-[#204991] transition hover:border-[#B3D2FF] hover:bg-[#B3D2FF]"
              onClick={() => setIsSearchPanelOpen((open) => !open)}
            >
              {isSearchPanelOpen ? "Fermer la recherche" : "Ouvrir la recherche"}
              <span className="rounded-full bg-[#CFE5FF] px-2 py-0.5 text-[10px] font-semibold text-[#204991]">
                ⌘K
              </span>
            </button>
          </div>
          <div className="mt-3 flex items-center gap-2 text-sm text-[#204991]">
            <span className="inline-flex h-1 w-8 rounded-full bg-[#CFE5FF]" aria-hidden="true" />
            {filteredSejours.length > 1
              ? `Résultats : ${filteredSejours.length}`
              : `Résultat : ${filteredSejours.length}`}
          </div>
          {isSearchPanelOpen ? (
            <div className="mt-5 grid gap-4 rounded-2xl border border-[#CFE5FF] bg-[#CFE5FF] p-5 text-sm text-[#204991] shadow-[0_20px_50px_rgba(83,15,43,0.04)]">
              <div className="grid gap-3 md:grid-cols-4">
                <input
                  className="rounded-2xl border border-[#CFE5FF] bg-white/80 px-4 py-2.5 text-sm text-[#204991] placeholder:text-[#204991] focus:border-[#CFE5FF] focus:outline-none"
                  placeholder="Année"
                  value={filters.annee}
                  onChange={handleFilterChange("annee")}
                />
                <input
                  className="rounded-2xl border border-[#CFE5FF] bg-white/80 px-4 py-2.5 text-sm text-[#204991] placeholder:text-[#204991] focus:border-[#CFE5FF] focus:outline-none"
                  placeholder="Centre"
                  value={filters.centre}
                  onChange={handleFilterChange("centre")}
                />
                <input
                  className="rounded-2xl border border-[#CFE5FF] bg-white/80 px-4 py-2.5 text-sm text-[#204991] placeholder:text-[#204991] focus:border-[#CFE5FF] focus:outline-none"
                  placeholder="Saison / période"
                  value={filters.saison}
                  onChange={handleFilterChange("saison")}
                />
                <input
                  className="rounded-2xl border border-[#CFE5FF] bg-white/80 px-4 py-2.5 text-sm text-[#204991] placeholder:text-[#204991] focus:border-[#CFE5FF] focus:outline-none"
                  placeholder="Référence"
                  value={filters.reference}
                  onChange={handleFilterChange("reference")}
                />
              </div>
              <div className="flex flex-wrap items-center gap-3 text-xs font-medium uppercase tracking-[0.18em] text-[#204991]">
                <button
                  type="button"
                  onClick={() => setIsSearchPanelOpen(false)}
                  className="inline-flex items-center justify-center rounded-full border border-transparent bg-[#CFE5FF] px-4 py-2 text-[#204991] transition hover:bg-[#B3D2FF]"
                >
                  Fermer
                </button>
                <button
                  type="button"
                  onClick={handleReset}
                  className="inline-flex items-center justify-center rounded-full border border-[#CFE5FF] bg-white px-4 py-2 text-[#204991] transition hover:bg-[#B3D2FF]"
                >
                  Réinitialiser
                </button>
              </div>
            </div>
          ) : null}
        </header>

        <section className="overflow-hidden rounded-3xl border border-[#CFE5FF] bg-white/95 shadow-[0_30px_70px_rgba(83,15,43,0.04)]">
          <div className="max-h-[360px] overflow-y-auto">
            <table className="w-full border-collapse text-sm text-[#204991]">
              <thead className="sticky top-0 z-10 border-b border-[#CFE5FF] bg-white/95 text-left text-[11px] font-semibold uppercase tracking-[0.3em] text-[#204991]">
                <tr>
                  <th className="px-6 py-3">
                    <span className="text-[#204991]">Référence</span>
                  </th>
                  <th className="px-6 py-3">
                    <span className="text-[#204991]">Centre</span>
                  </th>
                  <th className="px-6 py-3">
                    <span className="text-[#204991]">Année</span>
                  </th>
                  <th className="px-6 py-3">
                    <span className="text-[#204991]">Période</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredSejours.length === 0 ? (
                  <tr>
                    <td
                      className="px-6 py-7 text-center text-sm text-[#204991]"
                      colSpan={4}
                    >
                      Aucun séjour pour le moment. Lancez une recherche (⌘K) ou ajoutez un séjour.
                    </td>
                  </tr>
                ) : (
                  filteredSejours.map((item) => (
                    <tr
                      key={item.id}
                      className="border-b border-[#CFE5FF] transition hover:bg-[#B3D2FF]"
                    >
                      <td className="px-6 py-3 font-semibold text-[#204991]">
                        {item.reference}
                      </td>
                      <td className="px-6 py-3 text-[#204991]">{item.centre}</td>
                      <td className="px-6 py-3 text-[#204991]">{item.annee}</td>
                      <td className="px-6 py-3 text-[#204991]">{item.periode}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>

        <form
          onSubmit={handleSubmit}
          className="space-y-6 rounded-3xl border border-[#CFE5FF] bg-white p-8 shadow-[0_30px_70px_rgba(83,15,43,0.03)]"
        >
          <div className="flex flex-wrap items-center gap-4 text-[13px] font-medium uppercase tracking-[0.2em] text-[#204991]">
            <label className="inline-flex items-center gap-2 text-[#204991]">
              Archivé ?
              <input
                type="checkbox"
                className="size-4 accent-[#CFE5FF]"
                checked={form.archive}
                onChange={handleFormChange("archive")}
              />
            </label>
          </div>

          <div className="rounded-2xl border border-[#CFE5FF] bg-[#CFE5FF] p-6">
            <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-xl font-semibold tracking-tight text-[#204991]">
                Informations séjour
              </h2>
              <div className="flex items-center gap-2 text-[#204991]">
                <button
                  type="button"
                  className="inline-flex size-9 items-center justify-center rounded-full border border-[#CFE5FF] bg-white/70 text-lg font-semibold transition hover:bg-[#B3D2FF]"
                >
                  +
                </button>
                <button
                  type="button"
                  className="inline-flex size-9 items-center justify-center rounded-full border border-[#CFE5FF] bg-white/70 text-lg font-semibold transition hover:bg-[#B3D2FF]"
                >
                  −
                </button>
                <button
                  type="button"
                  className="inline-flex size-9 items-center justify-center rounded-full border border-[#CFE5FF] bg-white/70 text-lg font-semibold transition hover:bg-[#B3D2FF]"
                >
                  ⧉
                </button>
              </div>
            </div>

            <div className="space-y-4 text-sm text-[#204991]">
              <div className="grid gap-4 lg:grid-cols-[minmax(0,2fr)_minmax(0,2fr)_minmax(0,1fr)]">
                <label className="flex flex-col gap-1">
                  <span className="text-xs font-semibold uppercase tracking-[0.25em] text-[#204991]">
                    Nom du centre
                  </span>
                  <input
                    className="rounded-2xl border border-[#CFE5FF] bg-white px-4 py-2.5 text-sm text-[#204991] placeholder:text-[#204991] focus:border-[#CFE5FF] focus:outline-none"
                    value={form.centre}
                    onChange={handleFormChange("centre")}
                  />
                </label>
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="flex flex-col gap-1">
                    <span className="text-xs font-semibold uppercase tracking-[0.25em] text-[#204991]">
                      Nom commun
                    </span>
                    <input
                      className="rounded-2xl border border-[#CFE5FF] bg-white px-4 py-2.5 text-sm text-[#204991] placeholder:text-[#204991] focus:border-[#CFE5FF] focus:outline-none"
                      value={form.nomCommum}
                      onChange={handleFormChange("nomCommum")}
                    />
                  </label>
                  <label className="flex flex-col gap-1">
                    <span className="text-xs font-semibold uppercase tracking-[0.25em] text-[#204991]">
                      Ref séjour
                    </span>
                    <input
                      className="rounded-2xl border border-[#CFE5FF] bg-white px-4 py-2.5 text-sm text-[#204991] placeholder:text-[#204991] focus:border-[#CFE5FF] focus:outline-none"
                      value={form.reference}
                      onChange={handleFormChange("reference")}
                    />
                  </label>
                </div>
              </div>

              <div className="grid gap-4 lg:grid-cols-[repeat(4,minmax(0,1fr))]">
                <label className="flex flex-col gap-1">
                  <span className="text-xs font-semibold uppercase tracking-[0.25em] text-[#204991]">
                    Saison
                  </span>
                  <input
                    className="rounded-2xl border border-[#CFE5FF] bg-white px-4 py-2.5 text-sm text-[#204991] placeholder:text-[#204991] focus:border-[#CFE5FF] focus:outline-none"
                    value={form.saison}
                    onChange={handleFormChange("saison")}
                  />
                </label>
                <label className="flex flex-col gap-1">
                  <span className="text-xs font-semibold uppercase tracking-[0.25em] text-[#204991]">
                    Année
                  </span>
                  <input
                    className="rounded-2xl border border-[#CFE5FF] bg-white px-4 py-2.5 text-sm text-[#204991] placeholder:text-[#204991] focus:border-[#CFE5FF] focus:outline-none"
                    value={form.annee}
                    onChange={handleFormChange("annee")}
                  />
                </label>
              </div>

              <div className="grid gap-4 lg:grid-cols-[repeat(4,minmax(0,1fr))]">
                <label className="flex flex-col gap-1">
                  <span className="text-xs font-semibold uppercase tracking-[0.25em] text-[#204991]">
                    Date début
                  </span>
                  <input
                    type="date"
                    className="rounded-2xl border border-[#CFE5FF] bg-white px-4 py-2.5 text-sm text-[#204991] focus:border-[#CFE5FF] focus:outline-none"
                    value={form.dateDebut}
                    onChange={handleFormChange("dateDebut")}
                  />
                </label>
                <label className="flex flex-col gap-1">
                  <span className="text-xs font-semibold uppercase tracking-[0.25em] text-[#204991]">
                    Date fin
                  </span>
                  <input
                    type="date"
                    className="rounded-2xl border border-[#CFE5FF] bg-white px-4 py-2.5 text-sm text-[#204991] focus:border-[#CFE5FF] focus:outline-none"
                    value={form.dateFin}
                    onChange={handleFormChange("dateFin")}
                  />
                </label>
                <label className="flex flex-col gap-1">
                  <span className="text-xs font-semibold uppercase tracking-[0.25em] text-[#204991]">
                    N° DDCS centre
                  </span>
                  <input
                    className="rounded-2xl border border-[#CFE5FF] bg-white px-4 py-2.5 text-sm text-[#204991] placeholder:text-[#204991] focus:border-[#CFE5FF] focus:outline-none"
                    value={form.ddcsCentre}
                    onChange={handleFormChange("ddcsCentre")}
                  />
                </label>
                <label className="flex flex-col gap-1">
                  <span className="text-xs font-semibold uppercase tracking-[0.25em] text-[#204991]">
                    N° DDCS complémentaire
                  </span>
                  <input
                    className="rounded-2xl border border-[#CFE5FF] bg-white px-4 py-2.5 text-sm text-[#204991] placeholder:text-[#204991] focus:border-[#CFE5FF] focus:outline-none"
                    value={form.ddcsComplementaire}
                    onChange={handleFormChange("ddcsComplementaire")}
                  />
                </label>
              </div>
            </div>
          </div>

          <div className="grid gap-4 text-sm text-[#204991] md:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
            <label className="flex flex-col gap-1">
              <span className="text-xs font-semibold uppercase tracking-[0.25em] text-[#204991]">
                Code analytique comptable
              </span>
              <input
                className="rounded-2xl border border-[#CFE5FF] bg-white px-4 py-2.5 text-sm text-[#204991] focus:border-[#CFE5FF] focus:outline-none"
                value={form.codeAnalytique}
                onChange={handleFormChange("codeAnalytique")}
              />
            </label>
            <label className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.25em] text-[#204991]">
              Séjour sans pique-nique ?
              <input
                type="checkbox"
                className="size-4 accent-[#CFE5FF]"
                checked={form.sansPiqueNique}
                onChange={handleFormChange("sansPiqueNique")}
              />
            </label>
          </div>

          <div className="flex flex-wrap justify-end gap-3">
            <button
              type="button"
              onClick={handleReset}
              className="inline-flex items-center justify-center rounded-full border border-[#CFE5FF] bg-white/80 px-5 py-2 text-xs font-semibold uppercase tracking-[0.25em] text-[#204991] transition hover:bg-[#B3D2FF]"
            >
              Réinitialiser
            </button>
            <button
              type="submit"
              className="inline-flex items-center justify-center rounded-full border border-transparent bg-[#CFE5FF] px-5 py-2 text-xs font-semibold uppercase tracking-[0.25em] text-[#204991] transition hover:bg-[#B3D2FF]"
            >
              Enregistrer
            </button>
          </div>
        </form>

        <section className="space-y-10 rounded-3xl border border-[#CFE5FF]/80 bg-white/60 p-8 shadow-[0_25px_60px_rgba(83,15,43,0.03)]">
          <div className="grid gap-8 xl:grid-cols-2">
            <div className="space-y-4 rounded-2xl border border-[#CFE5FF] bg-[#CFE5FF] p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-semibold tracking-tight text-[#204991]">Assurances</h3>
                <button className="inline-flex size-8 items-center justify-center rounded-full border border-[#CFE5FF] text-sm text-[#204991] transition hover:bg-[#B3D2FF]/80">
                  +
                </button>
              </div>
              <div className="overflow-hidden rounded-xl border border-dashed border-[#CFE5FF] bg-white/90">
                <table className="w-full border-collapse text-xs font-medium uppercase tracking-[0.2em] text-[#204991]">
                  <thead className="bg-[#CFE5FF] text-[#204991]">
                    <tr>
                      <th className="px-4 py-2 text-left">Nom de l&apos;assurance</th>
                      <th className="px-4 py-2 text-left">Valeur</th>
                      <th className="px-4 py-2 text-left">%/€</th>
                    </tr>
                  </thead>
                  <tbody>
                    {assuranceRows.length === 0 ? (
                      <tr>
                        <td colSpan={3} className="px-4 py-5 text-center text-xs font-medium text-[#204991]">
                          Aucune assurance configurée.
                        </td>
                      </tr>
                    ) : (
                      assuranceRows.map((row) => (
                        <tr key={row.id} className="border-t border-[#CFE5FF] odd:bg-white even:bg-[#CFE5FF]/30">
                          <td className="px-4 py-2 text-sm text-[#204991]">{row.name}</td>
                          <td className="px-4 py-2 text-sm text-[#204991]">{row.value}</td>
                          <td className="px-4 py-2 text-sm text-[#204991]">{row.unit}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="space-y-4 rounded-2xl border border-[#CFE5FF] bg-[#CFE5FF] p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-semibold tracking-tight text-[#204991]">Options artistiques</h3>
                <button className="inline-flex size-8 items-center justify-center rounded-full border border-[#CFE5FF] text-sm text-[#204991] transition hover:bg-[#B3D2FF]/80">
                  +
                </button>
              </div>
              <div className="overflow-hidden rounded-xl border border-dashed border-[#CFE5FF] bg-white/90">
                <table className="w-full border-collapse text-xs font-medium uppercase tracking-[0.2em] text-[#204991]">
                  <thead className="bg-[#CFE5FF] text-[#204991]">
                    <tr>
                      <th className="px-4 py-2 text-left">Nom du séjour</th>
                      <th className="px-4 py-2 text-left">Option artistique</th>
                      <th className="px-4 py-2 text-left">Prix</th>
                    </tr>
                  </thead>
                  <tbody>
                    {artisticOptions.length === 0 ? (
                      <tr>
                        <td colSpan={3} className="px-4 py-5 text-center text-xs font-medium text-[#204991]">
                          Aucune option artistique définie.
                        </td>
                      </tr>
                    ) : (
                      artisticOptions.map((row) => (
                        <tr key={row.id} className="border-t border-[#CFE5FF] odd:bg-white even:bg-[#CFE5FF]/30">
                          <td className="px-4 py-2 text-sm text-[#204991]">{row.sejour}</td>
                          <td className="px-4 py-2 text-sm text-[#204991]">{row.option}</td>
                          <td className="px-4 py-2 text-sm text-[#204991]">{row.price}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div className="grid gap-8 xl:grid-cols-2">
            <div className="space-y-4 rounded-2xl border border-[#CFE5FF] bg-[#CFE5FF] p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-semibold tracking-tight text-[#204991]">Dates d&apos;entrées</h3>
                <button className="inline-flex size-8 items-center justify-center rounded-full border border-[#CFE5FF] text-sm text-[#204991] transition hover:bg-[#B3D2FF]/80">
                  +
                </button>
              </div>
              <ul className="min-h-[120px] rounded-2xl border border-dashed border-[#CFE5FF] bg-white/90 px-4 py-3 text-sm text-[#204991]">
                {entryDates.length === 0 ? (
                  <li className="py-4 text-center text-xs font-medium text-[#204991]">
                    Aucune date d&apos;entrée.
                  </li>
                ) : (
                  entryDates.map((row) => (
                    <li key={row.id} className="border-b border-[#CFE5FF] py-2 last:border-0">
                      {row.date}
                    </li>
                  ))
                )}
              </ul>
            </div>
            <div className="space-y-4 rounded-2xl border border-[#CFE5FF] bg-[#CFE5FF] p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-semibold tracking-tight text-[#204991]">Dates de sorties</h3>
                <button className="inline-flex size-8 items-center justify-center rounded-full border border-[#CFE5FF] text-sm text-[#204991] transition hover:bg-[#B3D2FF]/80">
                  +
                </button>
              </div>
              <ul className="min-h-[120px] rounded-2xl border border-dashed border-[#CFE5FF] bg-white/90 px-4 py-3 text-sm text-[#204991]">
                {exitDates.length === 0 ? (
                  <li className="py-4 text-center text-xs font-medium text-[#204991]">
                    Aucune date de sortie.
                  </li>
                ) : (
                  exitDates.map((row) => (
                    <li key={row.id} className="border-b border-[#CFE5FF] py-2 last:border-0">
                      {row.date}
                    </li>
                  ))
                )}
              </ul>
            </div>
          </div>

          <div className="grid gap-8 xl:grid-cols-2">
            <div className="space-y-4 rounded-2xl border border-[#CFE5FF] bg-[#CFE5FF] p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-semibold tracking-tight text-[#204991]">Villes de départ</h3>
                <button className="inline-flex size-8 items-center justify-center rounded-full border border-[#CFE5FF] text-sm text-[#204991] transition hover:bg-[#B3D2FF]/80">
                  +
                </button>
              </div>
              <div className="overflow-hidden rounded-xl border border-dashed border-[#CFE5FF] bg-white/90">
                <table className="w-full border-collapse text-xs font-medium uppercase tracking-[0.2em] text-[#204991]">
                  <thead className="bg-[#CFE5FF] text-[#204991]">
                    <tr>
                      <th className="px-4 py-2 text-left">Villes de départ</th>
                      <th className="px-4 py-2 text-left">Prix</th>
                    </tr>
                  </thead>
                  <tbody>
                    {departureCities.length === 0 ? (
                      <tr>
                        <td colSpan={2} className="px-4 py-5 text-center text-xs font-medium text-[#204991]">
                          Aucune ville de départ configurée.
                        </td>
                      </tr>
                    ) : (
                      departureCities.map((row) => (
                        <tr key={row.id} className="border-t border-[#CFE5FF] odd:bg-white even:bg-[#CFE5FF]/30">
                          <td className="px-4 py-2 text-sm text-[#204991]">{row.city}</td>
                          <td className="px-4 py-2 text-sm text-[#204991]">{row.price}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="space-y-4 rounded-2xl border border-[#CFE5FF] bg-[#CFE5FF] p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-semibold tracking-tight text-[#204991]">Villes de retour</h3>
                <button className="inline-flex size-8 items-center justify-center rounded-full border border-[#CFE5FF] text-sm text-[#204991] transition hover:bg-[#B3D2FF]/80">
                  +
                </button>
              </div>
              <div className="overflow-hidden rounded-xl border border-dashed border-[#CFE5FF] bg-white/90">
                <table className="w-full border-collapse text-xs font-medium uppercase tracking-[0.2em] text-[#204991]">
                  <thead className="bg-[#CFE5FF] text-[#204991]">
                    <tr>
                      <th className="px-4 py-2 text-left">Villes de retour</th>
                      <th className="px-4 py-2 text-left">Prix</th>
                    </tr>
                  </thead>
                  <tbody>
                    {returnCities.length === 0 ? (
                      <tr>
                        <td colSpan={2} className="px-4 py-5 text-center text-xs font-medium text-[#204991]">
                          Aucune ville de retour configurée.
                        </td>
                      </tr>
                    ) : (
                      returnCities.map((row) => (
                        <tr key={row.id} className="border-t border-[#CFE5FF] odd:bg-white even:bg-[#CFE5FF]/30">
                          <td className="px-4 py-2 text-sm text-[#204991]">{row.city}</td>
                          <td className="px-4 py-2 text-sm text-[#204991]">{row.price}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div className="space-y-4 rounded-2xl border border-[#CFE5FF] bg-[#CFE5FF] p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-semibold tracking-tight text-[#204991]">Périodes de séjour</h3>
              <button className="inline-flex size-8 items-center justify-center rounded-full border border-[#CFE5FF] text-sm text-[#204991] transition hover:bg-[#B3D2FF]/80">
                +
              </button>
            </div>
            <div className="overflow-hidden rounded-xl border border-dashed border-[#CFE5FF] bg-white/90">
              <table className="w-full border-collapse text-xs font-medium uppercase tracking-[0.2em] text-[#204991]">
                <thead className="bg-[#CFE5FF] text-[#204991]">
                  <tr>
                    <th className="px-4 py-2 text-left">Période</th>
                    <th className="px-4 py-2 text-left">N° Grp Prestashop</th>
                  </tr>
                </thead>
                <tbody>
                  {sejourPeriods.length === 0 ? (
                    <tr>
                      <td colSpan={2} className="px-4 py-5 text-center text-xs font-medium text-[#204991]">
                        Aucune période enregistrée.
                      </td>
                    </tr>
                  ) : (
                    sejourPeriods.map((row) => (
                      <tr key={row.id} className="border-t border-[#CFE5FF] odd:bg-white even:bg-[#CFE5FF]/30">
                        <td className="px-4 py-2 text-sm text-[#204991]">{row.period}</td>
                        <td className="px-4 py-2 text-sm text-[#204991]">{row.prestashop}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="grid gap-8 xl:grid-cols-[minmax(0,1.4fr)_minmax(0,1.4fr)_minmax(0,1fr)]">
            <div className="space-y-4 rounded-2xl border border-[#CFE5FF] bg-[#CFE5FF] p-5 shadow-sm">
              <h3 className="text-base font-semibold tracking-tight text-[#204991]">Partenariats</h3>
              <div className="overflow-hidden rounded-xl border border-dashed border-[#CFE5FF] bg-white/90">
                <table className="w-full border-collapse text-xs font-medium uppercase tracking-[0.2em] text-[#204991]">
                  <thead className="bg-[#CFE5FF] text-[#204991]">
                    <tr>
                      <th className="px-4 py-2 text-left">Nom du part.</th>
                      <th className="px-4 py-2 text-left">Prix hors transport</th>
                      <th className="px-4 py-2 text-left">Prix transport</th>
                    </tr>
                  </thead>
                  <tbody>
                    {partnerPricing.length === 0 ? (
                      <tr>
                        <td colSpan={3} className="px-4 py-5 text-center text-xs font-medium text-[#204991]">
                          Aucun partenariat enregistré.
                        </td>
                      </tr>
                    ) : (
                      partnerPricing.map((row) => (
                        <tr key={row.id} className="border-t border-[#CFE5FF] odd:bg-white even:bg-[#CFE5FF]/30">
                          <td className="px-4 py-2 text-sm text-[#204991]">{row.name}</td>
                          <td className="px-4 py-2 text-sm text-[#204991]">{row.base}</td>
                          <td className="px-4 py-2 text-sm text-[#204991]">{row.transport}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="space-y-4 rounded-2xl border border-[#CFE5FF] bg-[#CFE5FF] p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-semibold tracking-tight text-[#204991]">Tâches associées</h3>
                <button className="inline-flex size-8 items-center justify-center rounded-full border border-[#CFE5FF] text-sm text-[#204991] transition hover:bg-[#B3D2FF]/80">
                  +
                </button>
              </div>
              <div className="overflow-hidden rounded-xl border border-dashed border-[#CFE5FF] bg-white/90">
                <table className="w-full border-collapse text-xs font-medium uppercase tracking-[0.2em] text-[#204991]">
                  <thead className="bg-[#CFE5FF] text-[#204991]">
                    <tr>
                      <th className="px-4 py-2 text-left">Catégorie de tâche</th>
                      <th className="px-4 py-2 text-left">Tâches associées</th>
                      <th className="px-4 py-2 text-left">Nb de jours avant</th>
                    </tr>
                  </thead>
                  <tbody>
                    {taskCategories.length === 0 ? (
                      <tr>
                        <td colSpan={3} className="px-4 py-5 text-center text-xs font-medium text-[#204991]">
                          Aucune tâche planifiée.
                        </td>
                      </tr>
                    ) : (
                      taskCategories.map((row) => (
                        <tr key={row.id} className="border-t border-[#CFE5FF] odd:bg-white even:bg-[#CFE5FF]/30">
                          <td className="px-4 py-2 text-sm text-[#204991]">{row.category}</td>
                          <td className="px-4 py-2 text-sm text-[#204991]">{row.tasks}</td>
                          <td className="px-4 py-2 text-sm text-[#204991]">{row.daysBefore}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="space-y-4 rounded-2xl border border-[#CFE5FF] bg-[#CFE5FF] p-5 shadow-sm">
              <h3 className="text-base font-semibold tracking-tight text-[#204991]">Encadrement associé</h3>
              <div className="overflow-hidden rounded-xl border border-dashed border-[#CFE5FF] bg-white/90">
                <table className="w-full border-collapse text-xs font-medium uppercase tracking-[0.2em] text-[#204991]">
                  <thead className="bg-[#CFE5FF] text-[#204991]">
                    <tr>
                      <th className="px-4 py-2 text-left">Nom</th>
                      <th className="px-4 py-2 text-left">Prénom</th>
                      <th className="px-4 py-2 text-left">Fonction</th>
                    </tr>
                  </thead>
                  <tbody>
                    {staffMembers.length === 0 ? (
                      <tr>
                        <td colSpan={3} className="px-4 py-5 text-center text-xs font-medium text-[#204991]">
                          Aucun membre associé.
                        </td>
                      </tr>
                    ) : (
                      staffMembers.map((row) => (
                        <tr key={row.id} className="border-t border-[#CFE5FF] odd:bg-white even:bg-[#CFE5FF]/30">
                          <td className="px-4 py-2 text-sm text-[#204991]">{row.name}</td>
                          <td className="px-4 py-2 text-sm text-[#204991]">{row.firstName}</td>
                          <td className="px-4 py-2 text-sm text-[#204991]">{row.role}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-3xl border border-dashed border-[#CFE5FF] bg-white/50 px-6 py-4 text-xs font-semibold uppercase tracking-[0.3em] text-[#204991]">
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

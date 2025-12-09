"use client";

import Link from "next/link";
import {
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ChangeEvent,
} from "react";
import { useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  CalendarDays,
  FileText,
  RefreshCw,
  Search,
  Users,
} from "lucide-react";

import {
  fetchInscriptions,
  type InscriptionRecord,
} from "@/services/inscriptions";

const formatDate = (value: string) => {
  if (!value) {
    return "—";
  }
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return value;
  }
  return parsed.toLocaleDateString("fr-FR");
};

const computeAge = (birthDate: string, referenceDate?: string) => {
  if (!birthDate) {
    return "";
  }
  const birth = new Date(birthDate);
  const ref = referenceDate ? new Date(referenceDate) : new Date();

  if (Number.isNaN(birth.getTime()) || Number.isNaN(ref.getTime())) {
    return "";
  }

  let years = ref.getFullYear() - birth.getFullYear();
  let months = ref.getMonth() - birth.getMonth();

  if (ref.getDate() < birth.getDate()) {
    months -= 1;
  }
  if (months < 0) {
    years -= 1;
    months += 12;
  }

  if (years < 0) {
    return "";
  }

  const yearLabel = `${years} an${years > 1 ? "s" : ""}`;
  if (years === 0) {
    return `${months} mois`;
  }
  return months > 0 ? `${yearLabel} et ${months} mois` : yearLabel;
};

export default function InscriptionsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-white to-[#F5D4FF] px-4 text-[#7D498C]">
          Chargement des inscriptions…
        </div>
      }
    >
      <InscriptionsPageContent />
    </Suspense>
  );
}

function InscriptionsPageContent() {
  const searchParams = useSearchParams();
  const initialFilters = useMemo(
    () => ({
      idClient: searchParams.get("idClient") ?? "",
      childFirstName: searchParams.get("childFirstName") ?? "",
      childLastName: searchParams.get("childLastName") ?? "",
      childBirthDate: searchParams.get("childBirthDate") ?? "",
      childGender: searchParams.get("childGender") ?? "",
    }),
    [searchParams],
  );

  const [filters, setFilters] = useState(initialFilters);
  const [inscriptions, setInscriptions] = useState<InscriptionRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [lastRefreshed, setLastRefreshed] = useState<string | null>(null);

  const loadInscriptions = useCallback(
    async (options: typeof filters) => {
      setIsLoading(true);
      setFetchError(null);
      try {
        const data = await fetchInscriptions(options);
        setInscriptions(data);
        setLastRefreshed(new Date().toLocaleTimeString("fr-FR"));
      } catch (error) {
        console.error(error);
        setFetchError(
          error instanceof Error
            ? error.message
            : "Impossible de charger les inscriptions.",
        );
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  useEffect(() => {
    setFilters(initialFilters);
    void loadInscriptions(initialFilters);
  }, [initialFilters, loadInscriptions]);

  const handleFiltersChange =
    (field: keyof typeof filters) =>
    (event: ChangeEvent<HTMLInputElement>) => {
      const value = event.target.value;
      setFilters((prev) => ({
        ...prev,
        [field]: value,
      }));
    };

  const handleSearch = () => {
    void loadInscriptions(filters);
  };

  const handleReset = () => {
    setFilters(initialFilters);
    void loadInscriptions(initialFilters);
  };

  const totalInscriptions = inscriptions.length;

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-[#F5D4FF] py-12 text-[#7D498C]">
      <div className="mx-auto flex min-h-[calc(100vh-6rem)] w-full max-w-6xl flex-col gap-8 px-5 text-[#7D498C] md:px-10">
        <header className="flex flex-col gap-6 rounded-3xl border border-[#F5D4FF] bg-white p-8 shadow-[0_25px_60px_rgba(32,73,145,0.08)]">
          <div className="flex flex-wrap items-center justify-between gap-6">
            <div className="space-y-1">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#7D498C]">
                Suivi des inscriptions
              </p>
              <h1 className="text-3xl font-semibold tracking-tight text-[#7D498C]">
                Inscriptions famille
              </h1>
            </div>
            <Link
              href="/clients"
              className="inline-flex items-center gap-2 rounded-full border border-[#7D498C] bg-white px-5 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-[#7D498C] transition hover:bg-[#EED6FF]"
            >
              <ArrowLeft className="size-4" />
              Retour fiche famille
            </Link>
          </div>
          <p className="max-w-4xl text-sm text-[#7D498C]/80">
            Maquette plein écran pour visualiser les inscriptions des enfants
            d&apos;une famille. Reliez cette page à Supabase pour afficher des données
            en temps réel.
          </p>
        </header>

        <section className="space-y-6">
          <div className="space-y-4 overflow-hidden rounded-3xl border border-[#F5D4FF] bg-white p-8 shadow-[0_25px_60px_rgba(32,73,145,0.08)]">
            <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-[#7D498C]">
              Filtres familles & participants
            </h2>
            <div className="grid gap-5 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
              <div className="space-y-4">
                <label className="flex flex-wrap items-center gap-3 text-sm text-[#7D498C]">
                  <span className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="search-type"
                      value="participant"
                      defaultChecked
                      className="accent-[#D8C2E8]"
                    />
                    Participant
                  </span>
                  <input
                    className="min-w-[200px] flex-1 rounded border border-[#D8C2E8] bg-white px-3 py-2 text-sm text-[#7D498C] placeholder:text-[#7D498C]/60 focus:border-[#B793D6] focus:outline-none"
                    placeholder="Nom du participant..."
                    value={filters.childFirstName}
                    onChange={handleFiltersChange("childFirstName")}
                  />
                </label>
                <label className="flex flex-wrap items-center gap-3 text-sm text-[#7D498C]">
                  <span className="flex items-center gap-2">
                    <input type="radio" name="search-type" value="famille" className="accent-[#D8C2E8]" />
                    Famille
                  </span>
                  <input
                    className="min-w-[200px] flex-1 rounded border border-[#D8C2E8] bg-white px-3 py-2 text-sm text-[#7D498C] placeholder:text-[#7D498C]/60 focus:border-[#B793D6] focus:outline-none"
                    placeholder="Nom famille..."
                    value={filters.childLastName}
                    onChange={handleFiltersChange("childLastName")}
                  />
                  <input
                    className="min-w-[160px] flex-1 rounded border border-[#D8C2E8] bg-white px-3 py-2 text-sm text-[#7D498C] placeholder:text-[#7D498C]/60 focus:border-[#B793D6] focus:outline-none md:flex-none md:w-44"
                    placeholder="ID Client"
                    value={filters.idClient}
                    onChange={handleFiltersChange("idClient")}
                  />
                </label>
                <label className="flex flex-wrap items-center gap-3 text-sm text-[#7D498C]">
                  <span className="flex items-center gap-2">
                    <input type="radio" name="search-type" value="partenaire" className="accent-[#D8C2E8]" />
                    Partenaire
                  </span>
                  <input
                    className="min-w-[200px] flex-1 rounded border border-[#D8C2E8] bg-white px-3 py-2 text-sm text-[#7D498C] placeholder:text-[#7D498C]/60 focus:border-[#B793D6] focus:outline-none"
                    placeholder="Nom partenaire..."
                  />
                </label>
              </div>
              <div className="space-y-4">
                <div className="grid gap-3 lg:grid-cols-2">
                  <label className="flex flex-wrap items-center gap-3 text-xs font-semibold uppercase tracking-[0.14em] text-[#7D498C]">
                    <span className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="period-type"
                        value="reference"
                        defaultChecked
                        className="accent-[#D8C2E8]"
                      />
                      Réf séjour
                    </span>
                    <input
                      className="min-w-[200px] flex-1 rounded border border-[#D8C2E8] bg-white px-3 py-2 text-sm text-[#7D498C] placeholder:text-[#7D498C]/60 focus:border-[#B793D6] focus:outline-none"
                      placeholder="Ex: SEJ-2025-01"
                    />
                  </label>
                  <label className="flex flex-wrap items-center gap-3 text-xs font-semibold uppercase tracking-[0.14em] text-[#7D498C]">
                    <span className="flex items-center gap-2">
                      <input type="radio" name="period-type" value="lieu" className="accent-[#D8C2E8]" />
                      Lieu
                    </span>
                    <input
                      className="min-w-[200px] flex-1 rounded border border-[#D8C2E8] bg-white px-3 py-2 text-sm text-[#7D498C] placeholder:text-[#7D498C]/60 focus:border-[#B793D6] focus:outline-none"
                      placeholder="Ville..."
                    />
                  </label>
                </div>
                <div className="grid gap-3 lg:grid-cols-2">
                  <label className="flex flex-wrap items-center gap-3 text-xs font-semibold uppercase tracking-[0.14em] text-[#7D498C]">
                    Période du
                    <input
                      className="min-w-[200px] flex-1 rounded border border-[#D8C2E8] bg-white px-3 py-2 text-sm text-[#7D498C] placeholder:text-[#7D498C]/60 focus:border-[#B793D6] focus:outline-none"
                      placeholder="01/07/2025"
                    />
                  </label>
                  <label className="flex flex-wrap items-center gap-3 text-xs font-semibold uppercase tracking-[0.14em] text-[#7D498C]">
                    au
                    <input
                      className="min-w-[200px] flex-1 rounded border border-[#D8C2E8] bg-white px-3 py-2 text-sm text-[#7D498C] placeholder:text-[#7D498C]/60 focus:border-[#B793D6] focus:outline-none"
                      placeholder="31/08/2025"
                    />
                  </label>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <label className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-[#7D498C]">
                    <input type="checkbox" defaultChecked className="accent-[#D8C2E8]" />
                    Afficher restant dû familles
                  </label>
                  <button
                    type="button"
                    onClick={handleSearch}
                    className="inline-flex size-10 flex-shrink-0 items-center justify-center rounded-full border border-[#7D498C] bg-white text-xs font-semibold uppercase tracking-[0.16em] text-[#7D498C] transition hover:bg-[#EED6FF]"
                  >
                    <Search className="size-4" />
                  </button>
                  <button
                    type="button"
                    onClick={handleReset}
                    className="inline-flex size-10 flex-shrink-0 items-center justify-center rounded-full border border-[#7D498C] bg-white text-xs font-semibold uppercase tracking-[0.16em] text-[#7D498C] transition hover:bg-[#EED6FF]"
                  >
                    <RefreshCw className="size-4" />
                  </button>
                </div>
                <div className="grid gap-3 lg:grid-cols-2">
                  <label className="flex flex-wrap items-center justify-between gap-2 rounded border border-[#D8C2E8] bg-white px-3 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-[#7D498C]">
                    Inscriptions archivées ?
                    <select className="rounded border border-[#D8C2E8] bg-white px-2 py-1 text-xs text-[#7D498C] focus:border-[#B793D6]">
                      <option>Oui</option>
                      <option>Non</option>
                    </select>
                  </label>
                  <label className="flex flex-wrap items-center justify-between gap-2 rounded border border-[#D8C2E8] bg-white px-3 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-[#7D498C]">
                    Inscriptions annulées ?
                    <select className="rounded border border-[#D8C2E8] bg-white px-2 py-1 text-xs text-[#7D498C] focus:border-[#B793D6]">
                      <option>Non</option>
                      <option>Oui</option>
                    </select>
                  </label>
                </div>
              </div>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
            <div className="space-y-4 rounded-3xl border border-[#F5D4FF] bg-white p-8 shadow-[0_25px_60px_rgba(32,73,145,0.08)] xl:flex-[2]">
              <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-[#7D498C]">
                Paramètres séjour
              </h2>
              <div className="space-y-3 text-xs uppercase tracking-[0.14em] text-[#7D498C]">
                <label className="flex flex-col gap-1">
                  Saison
                  <input
                    className="rounded border border-[#D8C2E8] bg-white px-3 py-2 text-sm text-[#7D498C] placeholder:text-[#7D498C]/60 focus:border-[#B793D6] focus:outline-none"
                    placeholder="Été"
                  />
                </label>
                <label className="flex flex-col gap-1">
                  Année
                  <input
                    className="rounded border border-[#D8C2E8] bg-white px-3 py-2 text-sm text-[#7D498C] placeholder:text-[#7D498C]/60 focus:border-[#B793D6] focus:outline-none"
                    placeholder="2025"
                  />
                </label>
                <label className="flex flex-col gap-1">
                  Thématique artistique
                  <input
                    className="rounded border border-[#D8C2E8] bg-white px-3 py-2 text-sm text-[#7D498C] placeholder:text-[#7D498C]/60 focus:border-[#B793D6] focus:outline-none"
                    placeholder="Musique, théâtre..."
                  />
                </label>
                <label className="flex flex-col gap-1">
                  Assurance
                  <input
                    className="rounded border border-[#D8C2E8] bg-white px-3 py-2 text-sm text-[#7D498C] placeholder:text-[#7D498C]/60 focus:border-[#B793D6] focus:outline-none"
                    placeholder="Contrat..."
                  />
                </label>
              </div>
            </div>

            <div className="flex flex-col items-center justify-between rounded-3xl border border-[#F5D4FF] bg-white p-8 text-center shadow-[0_25px_60px_rgba(32,73,145,0.08)] xl:flex-1">
              <div className="space-y-4">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#7D498C]/80">
                  Nombre d&apos;inscriptions
                </p>
                <div className="rounded-2xl border border-[#D8C2E8] bg-white px-7 py-5 text-4xl font-semibold text-[#7D498C] shadow-inner shadow-[#d7aef0]">
                  {isLoading ? "…" : totalInscriptions}
                </div>
              </div>
              <div className="flex flex-col gap-3 text-xs font-semibold uppercase tracking-[0.16em] text-[#7D498C]">
                <span className="inline-flex items-center gap-2 rounded-full border border-[#F5D4FF] bg-white px-3 py-1 text-[#7D498C]">
                  <Users className="size-4" />
                  Participants
                </span>
                <span className="inline-flex items-center gap-2 rounded-full border border-[#F5D4FF] bg-white px-3 py-1 text-[#7D498C]">
                  <CalendarDays className="size-4" />
                  Séjours
                </span>
              </div>
            </div>
          </div>
        </section>

        <section className="flex-1 rounded-3xl border border-[#F5D4FF] bg-white shadow-[0_30px_70px_rgba(32,73,145,0.08)]">
          <div className="max-h-[620px] overflow-auto rounded-3xl border border-[#F5D4FF] bg-white">
            <table className="w-full border-collapse text-sm text-[#7D498C]">
              <thead className="sticky top-0 z-10 border-b border-[#F5D4FF] bg-white text-left text-xs font-semibold uppercase tracking-[0.16em] text-[#7D498C]">
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
                  <th className="px-5 py-3 text-center">Fiche</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td
                      colSpan={10}
                      className="px-5 py-6 text-center text-sm font-medium text-[#7D498C]/80"
                    >
                      Chargement des inscriptions…
                    </td>
                  </tr>
                ) : inscriptions.length === 0 ? (
                  <tr>
                    <td
                      colSpan={10}
                      className="px-5 py-6 text-center text-sm font-medium text-[#7D498C]/80"
                    >
                      Aucune inscription trouvée pour ces critères.
                    </td>
                  </tr>
                ) : (
                  inscriptions.map((inscription) => (
                    <tr key={inscription.id} className="border-b border-[#F5D4FF] bg-white">
                      <td className="px-5 py-4 text-sm font-semibold uppercase tracking-wide text-[#7D498C]">
                        {inscription.childLastName || "—"}
                      </td>
                      <td className="px-5 py-4 text-sm font-medium text-[#7D498C]">
                        {inscription.childFirstName || "—"}
                      </td>
                      <td className="px-5 py-4 text-sm text-[#7D498C]">
                        {formatDate(inscription.childBirthDate)}
                      </td>
                      <td className="px-5 py-4 text-sm text-[#7D498C]">
                        {computeAge(
                          inscription.childBirthDate,
                          inscription.dateEntree || inscription.dateSortie,
                        ) || "—"}
                      </td>
                      <td className="px-5 py-4 text-sm text-[#7D498C]">
                        {inscription.referenceSejour || "—"}
                      </td>
                      <td className="px-5 py-4 text-sm text-[#7D498C]">
                        {inscription.theme || "—"}
                      </td>
                      <td className="px-5 py-4 text-sm text-[#7D498C]">
                        {inscription.villeDepart || "—"}
                      </td>
                      <td className="px-5 py-4 text-sm text-[#7D498C]">
                        {inscription.villeRetour || "—"}
                      </td>
                      <td className="px-5 py-4 text-sm text-[#7D498C]">
                        {inscription.partenaire || "—"}
                      </td>
                      <td className="px-5 py-4 text-center text-sm">
                        {inscription.id ? (
                          <Link
                            href={`/fiche?id=${inscription.id}`}
                            className="inline-flex items-center justify-center rounded-full border border-[#7D498C] bg-white p-2 text-[#7D498C] transition hover:bg-[#EED6FF]"
                            aria-label={`Consulter la fiche ${inscription.numInscription || ""}`}
                          >
                            <FileText className="size-4" />
                          </Link>
                        ) : (
                          "—"
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-[#F5D4FF] bg-white px-6 py-4 text-xs font-semibold uppercase tracking-[0.16em] text-[#7D498C]/80">
            <span>
              {isLoading
                ? "Chargement…"
                : `${totalInscriptions} inscription${totalInscriptions > 1 ? "s" : ""} affichée${totalInscriptions > 1 ? "s" : ""}`}
            </span>
            <span>
              {fetchError
                ? fetchError
                : lastRefreshed
                ? `Dernière mise à jour ${lastRefreshed}`
                : "En attente d'une recherche"}
            </span>
          </footer>
        </section>
      </div>
    </div>
  );
}

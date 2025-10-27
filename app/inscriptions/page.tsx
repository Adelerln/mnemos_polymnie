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
        <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-[#d8dce4] via-[#cfd4df] to-[#c4cad6] px-4 text-[#2b2f36]">
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
    <div className="min-h-screen bg-gradient-to-br from-[#d8dce4] via-[#cfd4df] to-[#c4cad6] py-12">
      <div className="flex min-h-[calc(100vh-6rem)] w-full flex-col gap-8 px-4 text-[#2b2f36] md:px-8 lg:px-12">
        <header className="flex flex-col gap-6 rounded-3xl border border-[#d2d6de] bg-white/85 p-8 shadow-xl backdrop-blur">
          <div className="flex flex-wrap items-center justify-between gap-6">
            <div className="space-y-1">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#5c606b]">
                Suivi des inscriptions
              </p>
              <h1 className="text-4xl font-semibold tracking-tight text-[#1f2330]">
                Inscriptions famille
              </h1>
            </div>
            <Link
              href="/clients"
              className="inline-flex items-center gap-2 rounded-full border border-[#c9ccd5] bg-white px-5 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-[#2b2f36] transition hover:bg-[#f4f6fa]"
            >
              <ArrowLeft className="size-4" />
              Retour fiche famille
            </Link>
          </div>
          <p className="max-w-4xl text-sm text-[#565b66]">
            Maquette plein écran pour visualiser les inscriptions des enfants
            d&apos;une famille. Reliez cette page à Supabase pour afficher des données
            en temps réel.
          </p>
        </header>

        <section className="grid gap-6 xl:grid-cols-[minmax(0,2.6fr)_minmax(0,1.5fr)_minmax(0,1fr)]">
          <div className="space-y-4 rounded-3xl border border-[#d3d7df] bg-white p-8 shadow-lg">
            <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-[#1f2330]">
              Filtres familles & participants
            </h2>
            <div className="grid gap-5 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
              <div className="space-y-4">
                <label className="flex flex-wrap items-center gap-3 text-sm text-[#2b2f36]">
                  <span className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="search-type"
                      value="participant"
                      defaultChecked
                    />
                    Participant
                  </span>
                  <input
                    className="min-w-[200px] flex-1 rounded border border-[#d4d7df] bg-white px-3 py-2 text-sm focus:border-[#7f8696] focus:outline-none"
                    placeholder="Nom du participant..."
                    value={filters.childFirstName}
                    onChange={handleFiltersChange("childFirstName")}
                  />
                </label>
                <label className="flex flex-wrap items-center gap-3 text-sm text-[#2b2f36]">
                  <span className="flex items-center gap-2">
                    <input type="radio" name="search-type" value="famille" />
                    Famille
                  </span>
                  <input
                    className="min-w-[200px] flex-1 rounded border border-[#d4d7df] bg-white px-3 py-2 text-sm focus:border-[#7f8696] focus:outline-none"
                    placeholder="Nom famille..."
                    value={filters.childLastName}
                    onChange={handleFiltersChange("childLastName")}
                  />
                  <input
                    className="min-w-[160px] flex-1 rounded border border-[#d4d7df] bg-white px-3 py-2 text-sm focus:border-[#7f8696] focus:outline-none md:flex-none md:w-44"
                    placeholder="ID Client"
                    value={filters.idClient}
                    onChange={handleFiltersChange("idClient")}
                  />
                </label>
                <label className="flex flex-wrap items-center gap-3 text-sm text-[#2b2f36]">
                  <span className="flex items-center gap-2">
                    <input type="radio" name="search-type" value="partenaire" />
                    Partenaire
                  </span>
                  <input
                    className="min-w-[200px] flex-1 rounded border border-[#d4d7df] bg-white px-3 py-2 text-sm focus:border-[#7f8696] focus:outline-none"
                    placeholder="Nom partenaire..."
                  />
                </label>
              </div>
              <div className="space-y-4">
                <div className="grid gap-3 lg:grid-cols-2">
                  <label className="flex flex-wrap items-center gap-3 text-xs font-semibold uppercase tracking-[0.14em] text-[#5c606b]">
                    <span className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="period-type"
                        value="reference"
                        defaultChecked
                      />
                      Réf séjour
                    </span>
                    <input
                      className="min-w-[200px] flex-1 rounded border border-[#d4d7df] bg-white px-3 py-2 text-sm focus:border-[#7f8696] focus:outline-none"
                      placeholder="Ex: SEJ-2025-01"
                    />
                  </label>
                  <label className="flex flex-wrap items-center gap-3 text-xs font-semibold uppercase tracking-[0.14em] text-[#5c606b]">
                    <span className="flex items-center gap-2">
                      <input type="radio" name="period-type" value="lieu" />
                      Lieu
                    </span>
                    <input
                      className="min-w-[200px] flex-1 rounded border border-[#d4d7df] bg-white px-3 py-2 text-sm focus:border-[#7f8696] focus:outline-none"
                      placeholder="Ville..."
                    />
                  </label>
                </div>
                <div className="grid gap-3 lg:grid-cols-2">
                  <label className="flex flex-wrap items-center gap-3 text-xs font-semibold uppercase tracking-[0.14em] text-[#5c606b]">
                    Période du
                    <input
                      className="min-w-[200px] flex-1 rounded border border-[#d4d7df] bg-white px-3 py-2 text-sm focus:border-[#7f8696] focus:outline-none"
                      placeholder="01/07/2025"
                    />
                  </label>
                  <label className="flex flex-wrap items-center gap-3 text-xs font-semibold uppercase tracking-[0.14em] text-[#5c606b]">
                    au
                    <input
                      className="min-w-[200px] flex-1 rounded border border-[#d4d7df] bg-white px-3 py-2 text-sm focus:border-[#7f8696] focus:outline-none"
                      placeholder="31/08/2025"
                    />
                  </label>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <label className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-[#5c606b]">
                    <input type="checkbox" defaultChecked />
                    Afficher restant dû familles
                  </label>
                  <button
                    type="button"
                    onClick={handleSearch}
                    className="inline-flex flex-shrink-0 items-center justify-center rounded-md border border-[#d4d7df] bg-white px-3 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-[#2b2f36] transition hover:bg-[#f0f3f8]"
                  >
                    <Search className="size-4" />
                  </button>
                  <button
                    type="button"
                    onClick={handleReset}
                    className="inline-flex flex-shrink-0 items-center justify-center rounded-md border border-[#d4d7df] bg-white px-3 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-[#2b2f36] transition hover:bg-[#f0f3f8]"
                  >
                    <RefreshCw className="size-4" />
                  </button>
                </div>
                <div className="grid gap-3 lg:grid-cols-2">
                  <label className="flex flex-wrap items-center justify-between gap-2 rounded border border-[#d4d7df] bg-[#f7f8fb] px-3 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-[#5c606b]">
                    Inscriptions archivées ?
                    <select className="rounded border border-[#d4d7df] bg-white px-2 py-1 text-xs focus:border-[#7f8696]">
                      <option>Oui</option>
                      <option>Non</option>
                    </select>
                  </label>
                  <label className="flex flex-wrap items-center justify-between gap-2 rounded border border-[#d4d7df] bg-[#f7f8fb] px-3 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-[#5c606b]">
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

          <div className="space-y-4 rounded-3xl border border-[#d3d7df] bg-white p-8 shadow-lg">
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

          <div className="flex flex-col items-center justify-between rounded-3xl border border-[#d3d7df] bg-white p-8 text-center shadow-lg">
            <div className="space-y-4">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#5c606b]">
                Nombre d&apos;inscriptions
              </p>
              <div className="rounded-2xl bg-[#e7f4ec] px-7 py-5 text-4xl font-semibold text-[#238b57] shadow-inner">
                {isLoading ? "…" : totalInscriptions}
              </div>
            </div>
            <div className="flex flex-col gap-3 text-xs font-semibold uppercase tracking-[0.16em] text-[#5c606b]">
              <span className="inline-flex items-center gap-2 rounded-full bg-[#fee9ef] px-3 py-1 text-[#d43a6a]">
                <Users className="size-4" />
                Participants
              </span>
              <span className="inline-flex items-center gap-2 rounded-full bg-[#e8efff] px-3 py-1 text-[#3c5dc9]">
                <CalendarDays className="size-4" />
                Séjours
              </span>
            </div>
          </div>
        </section>

        <section className="flex-1 rounded-3xl border border-[#d3d7df] bg-white/95 shadow-2xl">
          <div className="max-h-[620px] overflow-auto rounded-3xl">
            <table className="w-full border-collapse text-sm text-[#2b2f36]">
              <thead className="sticky top-0 z-10 bg-[#1f2330] text-left text-xs font-semibold uppercase tracking-[0.16em] text-white">
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
                      className="px-5 py-6 text-center text-sm font-medium text-[#5c606b]"
                    >
                      Chargement des inscriptions…
                    </td>
                  </tr>
                ) : inscriptions.length === 0 ? (
                  <tr>
                    <td
                      colSpan={10}
                      className="px-5 py-6 text-center text-sm font-medium text-[#5c606b]"
                    >
                      Aucune inscription trouvée pour ces critères.
                    </td>
                  </tr>
                ) : (
                  inscriptions.map((inscription) => (
                    <tr
                      key={inscription.id}
                      className="border-b border-[#e3e6ed] bg-white odd:bg-[#f7f8fb]"
                    >
                      <td className="px-5 py-4 text-sm font-semibold uppercase tracking-wide text-[#1f2330]">
                        {inscription.childLastName || "—"}
                      </td>
                      <td className="px-5 py-4 text-sm font-medium text-[#2b2f36]">
                        {inscription.childFirstName || "—"}
                      </td>
                      <td className="px-5 py-4 text-sm text-[#4d525d]">
                        {formatDate(inscription.childBirthDate)}
                      </td>
                      <td className="px-5 py-4 text-sm text-[#4d525d]">
                        {computeAge(
                          inscription.childBirthDate,
                          inscription.dateEntree || inscription.dateSortie,
                        ) || "—"}
                      </td>
                      <td className="px-5 py-4 text-sm text-[#2b2f36]">
                        {inscription.referenceSejour || "—"}
                      </td>
                      <td className="px-5 py-4 text-sm text-[#2b2f36]">
                        {inscription.theme || "—"}
                      </td>
                      <td className="px-5 py-4 text-sm text-[#2b2f36]">
                        {inscription.villeDepart || "—"}
                      </td>
                      <td className="px-5 py-4 text-sm text-[#2b2f36]">
                        {inscription.villeRetour || "—"}
                      </td>
                      <td className="px-5 py-4 text-sm text-[#2b2f36]">
                        {inscription.partenaire || "—"}
                      </td>
                      <td className="px-5 py-4 text-center text-sm">
                        {inscription.id ? (
                          <Link
                            href={`/fiche?id=${inscription.id}`}
                            className="inline-flex items-center justify-center rounded-full border border-[#d4d7df] bg-white p-2 text-[#2b2f36] transition hover:border-[#0f4c65] hover:text-[#0f4c65]"
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
          <footer className="flex flex-wrap items-center justify-between gap-3 px-6 py-4 text-xs font-semibold uppercase tracking-[0.16em] text-[#5c606b]">
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

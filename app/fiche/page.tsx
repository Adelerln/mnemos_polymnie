"use client";

import {
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ChangeEvent,
  type FormEvent,
} from "react";
import { useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  Download,
  RefreshCw,
  Save,
  Users,
} from "lucide-react";
import { useRouter } from "next/navigation";

import {
  fetchInscriptionById,
  saveInscription,
  type InscriptionRecord,
} from "@/services/inscriptions";

type InscriptionFormState = Omit<InscriptionRecord, "id"> & {
  id?: number;
};

const createEmptyInscription = (): InscriptionFormState => ({
  id: undefined,
  idClient: "",
  childFirstName: "",
  childLastName: "",
  childBirthDate: "",
  childGender: "",
  numInscription: "",
  referenceSejour: "",
  nomSejour: "",
  lieuSejour: "",
  theme: "",
  villeDepart: "",
  villeRetour: "",
  periodeSejour: "",
  dateEntree: "",
  dateSortie: "",
  assurance: "",
  partenaire: "",
  createdAt: undefined,
  updatedAt: undefined,
});

const formatDateForInput = (value: string) => {
  if (!value) {
    return "";
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return date.toISOString().slice(0, 10);
};

const computeAgeAtDate = (birthDate: string, referenceDate: string) => {
  if (!birthDate || !referenceDate) {
    return "";
  }
  const birth = new Date(birthDate);
  const ref = new Date(referenceDate);

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
  const monthLabel = `${months} mois`;

  if (years === 0) {
    return monthLabel;
  }
  if (months === 0) {
    return yearLabel;
  }

  return `${yearLabel} et ${monthLabel}`;
};

export default function FichePage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-neutral-200/70 px-4 text-[#1f2330]">
          Chargement de la fiche…
        </div>
      }
    >
      <FichePageContent />
    </Suspense>
  );
}

function FichePageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const inscriptionIdParam = searchParams.get("id");
  const prefillData = useMemo(() => {
    const birthDateParam = searchParams.get("childBirthDate") ?? "";

    return {
      idClient: searchParams.get("idClient") ?? "",
      childId: searchParams.get("childId") ?? "",
      childFirstName: searchParams.get("childFirstName") ?? "",
      childLastName: searchParams.get("childLastName") ?? "",
      childBirthDate: formatDateForInput(birthDateParam),
      childGender: searchParams.get("childGender") ?? "",
    };
  }, [searchParams]);
  const [form, setForm] = useState<InscriptionFormState>(() =>
    createEmptyInscription(),
  );
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPartnerLinked, setIsPartnerLinked] = useState(false);
  const [isCancelled, setIsCancelled] = useState(false);
  const [parentTwoHandled, setParentTwoHandled] = useState(false);

  const arrivalDate = form.dateEntree || form.dateSortie;
  const computedAge = useMemo(
    () => computeAgeAtDate(form.childBirthDate, arrivalDate),
    [form.childBirthDate, arrivalDate],
  );

  const loadInscription = useCallback(
    async (id: number) => {
      try {
        setIsLoading(true);
        setError(null);
        const record = await fetchInscriptionById(id);
        if (!record) {
          setFeedback("Aucune inscription trouvée pour cet identifiant.");
          setForm(createEmptyInscription());
          return;
        }

        setForm({
          ...record,
          id: record.id,
          dateEntree: formatDateForInput(record.dateEntree),
          dateSortie: formatDateForInput(record.dateSortie),
          childBirthDate: formatDateForInput(record.childBirthDate),
        });
        setFeedback(null);
      } catch (err) {
        console.error(err);
        setError(
          err instanceof Error
            ? err.message
            : "Impossible de charger l'inscription.",
        );
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  useEffect(() => {
    if (inscriptionIdParam) {
      const numericId = Number.parseInt(inscriptionIdParam, 10);
      if (Number.isNaN(numericId)) {
        setError("Identifiant d'inscription invalide.");
        return;
      }
      void loadInscription(numericId);
      return;
    }

    setForm((prev) => {
      const base = createEmptyInscription();
      return {
        ...base,
        ...prev,
        id: undefined,
        idClient: prefillData.idClient || prev.idClient || base.idClient,
        childFirstName:
          prefillData.childFirstName || prev.childFirstName || base.childFirstName,
        childLastName:
          prefillData.childLastName || prev.childLastName || base.childLastName,
        childBirthDate:
          prefillData.childBirthDate || prev.childBirthDate || base.childBirthDate,
        childGender:
          prefillData.childGender || prev.childGender || base.childGender,
      };
    });
    setIsPartnerLinked(false);
    setIsCancelled(false);
  }, [inscriptionIdParam, loadInscription, prefillData]);

  const handleFieldChange =
    (field: keyof InscriptionFormState) =>
    (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const value = event.target.value;
      setForm((prev) => ({
        ...prev,
        [field]: value,
      }));
    };

  const handleSave = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setFeedback(null);

    if (!form.idClient.trim()) {
      setError("L'identifiant client est requis.");
      return;
    }

    if (!form.childLastName.trim() || !form.childFirstName.trim()) {
      setError("Nom et prénom de l'enfant sont requis.");
      return;
    }

    try {
      setIsSaving(true);
      const record: InscriptionRecord = {
        id: form.id,
        idClient: form.idClient.trim(),
        childFirstName: form.childFirstName.trim(),
        childLastName: form.childLastName.trim(),
        childBirthDate: form.childBirthDate,
        childGender: form.childGender,
        numInscription: form.numInscription,
        referenceSejour: form.referenceSejour,
        nomSejour: form.nomSejour,
        lieuSejour: form.lieuSejour,
        theme: form.theme,
        villeDepart: form.villeDepart,
        villeRetour: form.villeRetour,
        periodeSejour: form.periodeSejour,
        dateEntree: form.dateEntree,
        dateSortie: form.dateSortie,
        assurance: form.assurance,
        partenaire: isPartnerLinked ? form.partenaire : "",
        createdAt: form.createdAt,
        updatedAt: form.updatedAt,
      };

      const saved = await saveInscription(record);
      setForm({
        ...saved,
        id: saved.id,
        dateEntree: formatDateForInput(saved.dateEntree),
        dateSortie: formatDateForInput(saved.dateSortie),
        childBirthDate: formatDateForInput(saved.childBirthDate),
      });
      setFeedback("Inscription enregistrée avec succès.");
      if (!record.id && saved.id) {
        const params = new URLSearchParams({
          idClient: saved.idClient,
          childFirstName: saved.childFirstName,
          childLastName: saved.childLastName,
          childBirthDate: formatDateForInput(saved.childBirthDate),
          childGender: saved.childGender,
        });
        router.push(`/inscriptions?${params.toString()}`);
      }
    } catch (err) {
      console.error(err);
      setError(
        err instanceof Error
          ? err.message
          : "Erreur lors de l'enregistrement de l'inscription.",
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-200/70 py-10">
      <div className="flex w-full flex-col gap-8 px-4 text-[#1f2330] sm:px-6 lg:px-10 xl:px-16">
        <header className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-[#ccd0d8] bg-white/90 px-6 py-5 shadow-lg">
          <div className="space-y-1">
            <h1 className="text-3xl font-semibold tracking-tight">
              Fiche inscription
            </h1>
            <p className="text-sm text-[#5c606b]">
              Gérez les informations complètes d&apos;une inscription.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-full border border-[#d4d7df] bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-[#2b2f36] transition hover:bg-[#f3f5f9]"
            >
              <ArrowLeft className="size-4" />
              Retour
            </button>
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-full border border-[#d4d7df] bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-[#2b2f36] transition hover:bg-[#f3f5f9]"
            >
              <RefreshCw className="size-4" />
              Rafraîchir
            </button>
          </div>
        </header>

        <form
          onSubmit={handleSave}
          className="space-y-6 rounded-2xl border border-[#c8ccd6] bg-white/95 p-6 shadow-xl"
        >
          <section className="grid gap-4 rounded-xl bg-[#0f4c65] p-6 text-white xl:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-3">
                <label className="flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.14em]">
                  ID Client
                  <input
                    className="min-w-[160px] flex-1 rounded border border-white/30 bg-white/20 px-3 py-2 text-sm font-semibold text-white placeholder:text-white/70 focus:border-white focus:outline-none"
                    value={form.idClient}
                    onChange={handleFieldChange("idClient")}
                    placeholder="ID client"
                  />
                </label>
                <div className="ml-auto flex items-center gap-2">
                  <button
                    type="button"
                    className="inline-flex items-center justify-center rounded-md border border-white/40 bg-white/10 p-2 text-white transition hover:bg-white/20"
                  >
                    <Download className="size-4" />
                  </button>
                  <button
                    type="button"
                    className="inline-flex items-center justify-center rounded-md border border-white/40 bg-white/10 p-2 text-white transition hover:bg-white/20"
                  >
                    <Users className="size-4" />
                  </button>
                </div>
                <label className="flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.14em]">
                  Num inscription
                  <input
                    className="min-w-[160px] flex-1 rounded border border-white/30 bg-white/20 px-3 py-2 text-sm font-semibold text-white placeholder:text-white/70 focus:border-white focus:outline-none"
                    value={form.numInscription}
                    onChange={handleFieldChange("numInscription")}
                    placeholder="N°"
                  />
                </label>
              </div>

              <div className="flex flex-wrap gap-3">
                <input
                  className="min-w-[180px] flex-1 rounded border border-white/30 bg-white/20 px-3 py-2 text-sm font-semibold uppercase tracking-[0.16em] text-white placeholder:text-white/70 focus:border-white focus:outline-none"
                  value={form.childLastName}
                  onChange={handleFieldChange("childLastName")}
                  placeholder="Nom de l'enfant"
                />
                <input
                  className="min-w-[180px] flex-1 rounded border border-white/30 bg-white/20 px-3 py-2 text-sm font-semibold text-white placeholder:text-white/70 focus:border-white focus:outline-none"
                  value={form.childFirstName}
                  onChange={handleFieldChange("childFirstName")}
                  placeholder="Prénom"
                />
                <input
                  type="date"
                  className="min-w-[160px] flex-1 rounded border border-white/30 bg-white/20 px-3 py-2 text-sm text-white placeholder:text-white/50 focus:border-white focus:outline-none"
                  value={form.childBirthDate}
                  onChange={handleFieldChange("childBirthDate")}
                />
                <input
                  className="min-w-[120px] flex-none rounded border border-white/30 bg-white/20 px-3 py-2 text-sm uppercase text-white placeholder:text-white/70 focus:border-white focus:outline-none"
                  value={form.childGender}
                  onChange={handleFieldChange("childGender")}
                  placeholder="Sexe"
                />
                <div className="min-w-[200px] flex-1 rounded border border-white/30 bg-white/10 px-3 py-2 text-sm text-white">
                  {computedAge || "Âge calculé"}
                </div>
              </div>
            </div>
            <div className="space-y-3 text-sm">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-white/80">
                  Inscription faite le{" "}
                  <span className="font-semibold">
                    {form.createdAt
                      ? new Date(form.createdAt).toLocaleString("fr-FR")
                      : "—"}
                  </span>
                </p>
                <label className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em]">
                  Inscription annulée
                  <input
                    type="checkbox"
                    className="size-4 accent-white"
                    checked={isCancelled}
                    onChange={(event) => setIsCancelled(event.target.checked)}
                  />
                </label>
              </div>
              <div className="rounded-lg border border-white/30 bg-white/10 px-3 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-white/80">
                Dernière modification :{" "}
                <span className="text-white">
                  {form.updatedAt
                    ? new Date(form.updatedAt).toLocaleString("fr-FR")
                    : "—"}
                </span>
              </div>
            </div>
          </section>

          <label className="flex items-center gap-2 rounded-lg border border-[#d4d7df] bg-white px-3 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-[#2b2f36]">
            <input
              type="checkbox"
              className="size-4 accent-[#1f2330]"
              checked={parentTwoHandled}
              onChange={(event) => setParentTwoHandled(event.target.checked)}
            />
            Si inscription effectuée par Parent 2, cocher la case
          </label>

          <section className="space-y-4 rounded-xl bg-[#0f4c65] p-6 text-white">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-sm font-semibold uppercase tracking-[0.16em]">
                Inscription liée à un partenaire
              </h2>
              <label className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em]">
                <input
                  type="checkbox"
                  className="size-4 accent-white"
                  checked={isPartnerLinked}
                  onChange={(event) => setIsPartnerLinked(event.target.checked)}
                />
                Activer
              </label>
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
              <label className="flex flex-col gap-1 text-xs font-semibold uppercase tracking-[0.14em]">
                Référence séjour
                <input
                  className="rounded border border-white/30 bg-white/20 px-3 py-2 text-sm font-medium text-white placeholder:text-white/70 focus:border-white focus:outline-none"
                  value={form.referenceSejour}
                  onChange={handleFieldChange("referenceSejour")}
                />
              </label>
              <label className="flex flex-col gap-1 text-xs font-semibold uppercase tracking-[0.14em]">
                Lieu de séjour
                <input
                  className="rounded border border-white/30 bg-white/20 px-3 py-2 text-sm font-medium text-white placeholder:text-white/70 focus:border-white focus:outline-none"
                  value={form.lieuSejour}
                  onChange={handleFieldChange("lieuSejour")}
                />
              </label>
              <label className="flex flex-col gap-1 text-xs font-semibold uppercase tracking-[0.14em] lg:col-span-2">
                Nom du séjour
                <input
                  className="rounded border border-white/30 bg-white/20 px-3 py-2 text-sm font-medium uppercase tracking-[0.16em] text-white placeholder:text-white/70 focus:border-white focus:outline-none"
                  value={form.nomSejour}
                  onChange={handleFieldChange("nomSejour")}
                />
              </label>
              <label className="flex flex-col gap-1 text-xs font-semibold uppercase tracking-[0.14em]">
                Ville de départ
                <input
                  className="rounded border border-white/30 bg-white/20 px-3 py-2 text-sm font-medium text-white placeholder:text-white/70 focus:border-white focus:outline-none"
                  value={form.villeDepart}
                  onChange={handleFieldChange("villeDepart")}
                />
              </label>
              <label className="flex flex-col gap-1 text-xs font-semibold uppercase tracking-[0.14em]">
                Ville de retour
                <input
                  className="rounded border border-white/30 bg-white/20 px-3 py-2 text-sm font-medium text-white placeholder:text-white/70 focus:border-white focus:outline-none"
                  value={form.villeRetour}
                  onChange={handleFieldChange("villeRetour")}
                />
              </label>
              <label className="flex flex-col gap-1 text-xs font-semibold uppercase tracking-[0.14em]">
                Thème
                <input
                  className="rounded border border-white/30 bg-white/20 px-3 py-2 text-sm font-medium text-white placeholder:text-white/70 focus:border-white focus:outline-none"
                  value={form.theme}
                  onChange={handleFieldChange("theme")}
                />
              </label>
              <label className="flex flex-col gap-1 text-xs font-semibold uppercase tracking-[0.14em]">
                Période de séjour
                <input
                  className="rounded border border-white/30 bg-white/20 px-3 py-2 text-sm font-medium text-white placeholder:text-white/70 focus:border-white focus:outline-none"
                  value={form.periodeSejour}
                  onChange={handleFieldChange("periodeSejour")}
                />
              </label>
              <label className="flex flex-col gap-1 text-xs font-semibold uppercase tracking-[0.14em]">
                Date d&apos;entrée
                <input
                  type="date"
                  className="rounded border border-white/30 bg-white/20 px-3 py-2 text-sm font-medium text-white focus:border-white focus:outline-none"
                  value={form.dateEntree}
                  onChange={handleFieldChange("dateEntree")}
                />
              </label>
              <label className="flex flex-col gap-1 text-xs font-semibold uppercase tracking-[0.14em]">
                Date de sortie
                <input
                  type="date"
                  className="rounded border border-white/30 bg-white/20 px-3 py-2 text-sm font-medium text-white focus:border-white focus:outline-none"
                  value={form.dateSortie}
                  onChange={handleFieldChange("dateSortie")}
                />
              </label>
              <label className="flex flex-col gap-1 text-xs font-semibold uppercase tracking-[0.14em]">
                Assurance
                <input
                  className="rounded border border-white/30 bg-white/20 px-3 py-2 text-sm font-medium text-white placeholder:text-white/70 focus:border-white focus:outline-none"
                  value={form.assurance}
                  onChange={handleFieldChange("assurance")}
                />
              </label>
              {isPartnerLinked ? (
                <label className="flex flex-col gap-1 text-xs font-semibold uppercase tracking-[0.14em]">
                  Partenaire
                  <input
                    className="rounded border border-white/30 bg-white/20 px-3 py-2 text-sm font-medium text-white placeholder:text-white/70 focus:border-white focus:outline-none"
                    value={form.partenaire}
                    onChange={handleFieldChange("partenaire")}
                  />
                </label>
              ) : null}
            </div>
          </section>

          <section className="grid gap-6 rounded-xl border border-[#d4d7df] bg-[#f3f4f8] p-6 lg:grid-cols-2">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold uppercase tracking-[0.16em]">
                  Réductions
                </h3>
                <button
                  type="button"
                  className="inline-flex items-center justify-center rounded-md border border-[#c9ccd5] bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-[#2b2f36] transition hover:bg-[#eef1f7]"
                >
                  +
                </button>
              </div>
              <div className="min-h-[120px] rounded-xl border border-dashed border-[#c9ccd5] bg-white" />
              <button
                type="button"
                className="inline-flex items-center justify-center rounded-md border border-[#d43a3a] bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-[#d43a3a] transition hover:bg-[#fdeaea]"
              >
                Rafraîchir inscription
              </button>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold uppercase tracking-[0.16em]">
                  Suppléments
                </h3>
                <button
                  type="button"
                  className="inline-flex items-center justify-center rounded-md border border-[#c9ccd5] bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-[#2b2f36] transition hover:bg-[#eef1f7]"
                >
                  +
                </button>
              </div>
              <div className="min-h-[120px] rounded-xl border border-dashed border-[#c9ccd5] bg-white" />
              <button
                type="button"
                className="inline-flex items-center justify-center rounded-md border border-[#d43a3a] bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-[#d43a3a] transition hover:bg-[#fdeaea]"
              >
                Rafraîchir inscription
              </button>
            </div>
          </section>

          <footer className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#d4d7df] bg-white px-4 py-3 text-xs font-semibold uppercase tracking-[0.16em] text-[#5c606b]">
            <div className="flex flex-wrap items-center gap-3">
              {error ? (
                <span className="text-red-600">{error}</span>
              ) : feedback ? (
                <span className="text-[#2f7a57]">{feedback}</span>
              ) : null}
            </div>
            <button
              type="submit"
              className="inline-flex items-center gap-2 rounded-md border border-[#0f4c65] bg-[#0f4c65] px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-white transition hover:bg-[#0c3d51] disabled:opacity-60"
              disabled={isSaving || isLoading}
            >
              {isSaving ? (
                "Enregistrement..."
              ) : (
                <>
                  <Save className="size-4" />
                  Enregistrer
                </>
              )}
            </button>
          </footer>
        </form>
      </div>
    </div>
  );
}

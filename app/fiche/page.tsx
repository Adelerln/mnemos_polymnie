"use client";

import {
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useRef,
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
import { useProjectLogger } from "@/hooks/useProjectLogger";

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
  const { logEdit, error: logError } = useProjectLogger();
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
  const [colosApprenantes, setColosApprenantes] = useState(false);
  const [passColo, setPassColo] = useState(false);
  const [financialSummary, setFinancialSummary] = useState({
    sejourTitle: "",
    sejourTheme: "",
    sejourAmount: "",
    transportOutCity: "",
    transportOutAmount: "",
    transportReturnCity: "",
    transportReturnAmount: "",
    assuranceLabel: "",
    assuranceAmount: "",
    supplementsTotal: "",
    reductionsTotal: "",
    totalBeforeCoverage: "",
    totalFamily: "",
  });
  const [coverageRows] = useState<Array<{ id: number; partner: string; partnerId: string; amount: string }>>([]);
  const [documentsState, setDocumentsState] = useState({
    ficheSanitaire: false,
    pai: false,
    vaccins: false,
    css: false,
    autorisation: false,
    baignade: false,
    passVaccinal: false,
    secu: false,
    sortie: false,
    mutuelle: false,
    ordonnance: false,
    livret: false,
  });
  const documentLabels: Record<keyof typeof documentsState, string> = {
    ficheSanitaire: "Fiche sanitaire",
    pai: "PAI",
    vaccins: "Vaccins",
    css: "Attestation CSS / AME",
    autorisation: "Autorisation parentale",
    baignade: "Certificat baignade",
    passVaccinal: "Pass vaccinal",
    secu: "Attestation sécu",
    sortie: "Attestation sortie territoire",
    mutuelle: "Mutuelle",
    ordonnance: "Ordonnance",
    livret: "Livret inclusion ou autre",
  };
  const [transportInfo, setTransportInfo] = useState({ mode: "", auto: true, details: "" });
  const [childMetrics, setChildMetrics] = useState({ taille: "", poids: "", pointure: "" });
  const [notes, setNotes] = useState("");
  const [eventType, setEventType] = useState("Inscription");
  const [cancellationInfo, setCancellationInfo] = useState({
    withFees: false,
    amountFamily: "",
    amountPartner: "",
    status: "",
  });
  const lastSavedInscriptionRef = useRef<InscriptionRecord | null>(null);

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
        lastSavedInscriptionRef.current = record;
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
    lastSavedInscriptionRef.current = null;
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

  const handleFinancialFieldChange =
    (field: keyof typeof financialSummary) =>
    (event: ChangeEvent<HTMLInputElement>) => {
      const value = event.target.value;
      setFinancialSummary((prev) => ({
        ...prev,
        [field]: value,
      }));
    };

  const handleDocumentToggle = (field: keyof typeof documentsState) => () => {
    setDocumentsState((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  const handleTransportFieldChange =
    (field: keyof typeof transportInfo) =>
    (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const value =
        field === "auto" ? (event.target as HTMLInputElement).checked : event.target.value;
      setTransportInfo((prev) => ({
        ...prev,
        [field]: field === "auto" ? Boolean(value) : (value as string),
      }));
    };

  const handleMetricsChange =
    (field: keyof typeof childMetrics) =>
    (event: ChangeEvent<HTMLInputElement>) => {
      const value = event.target.value;
      setChildMetrics((prev) => ({
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
      const previousRecord = lastSavedInscriptionRef.current;
      const actionType: "insert" | "update" = previousRecord ? "update" : "insert";

      const saved = await saveInscription(record);

      if (typeof saved.id === "number") {
        await logEdit({
          action: actionType,
          tableName: "inscriptions",
          recordId: saved.id,
          before: previousRecord ?? null,
          after: saved,
          editedByInscription: saved.id,
        });
      } else {
        console.warn(
          "[Fiche] Impossible de consigner l'opération d'inscription : identifiant introuvable.",
        );
      }

      setForm({
        ...saved,
        id: saved.id,
        dateEntree: formatDateForInput(saved.dateEntree),
        dateSortie: formatDateForInput(saved.dateSortie),
        childBirthDate: formatDateForInput(saved.childBirthDate),
      });
      lastSavedInscriptionRef.current = saved;
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

  const handleEventTypeChange = (event: ChangeEvent<HTMLInputElement>) => {
    setEventType(event.target.value);
  };

  const handleCancelInfoChange =
    (field: keyof typeof cancellationInfo) =>
    (event: ChangeEvent<HTMLInputElement>) => {
      const value =
        field === "withFees" ? (event.target as HTMLInputElement).checked : event.target.value;
      setCancellationInfo((prev) => ({
        ...prev,
        [field]: field === "withFees" ? Boolean(value) : (value as string),
      }));
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

          <section className="grid gap-6 rounded-xl border border-[#d4d7df] bg-[#f3f4f8] p-6 xl:grid-cols-[minmax(0,2.4fr)_minmax(0,1.4fr)_minmax(0,1fr)]">
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h3 className="text-lg font-semibold uppercase tracking-[0.18em] text-[#1f2330]">
                  Total de l&apos;inscription
                </h3>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    className="inline-flex items-center justify-center rounded-md border border-[#c9ccd5] bg-white p-2 text-[#2b2f36] transition hover:bg-[#eef1f7]"
                  >
                    ◀
                  </button>
                  <button
                    type="button"
                    className="inline-flex items-center justify-center rounded-md border border-[#c9ccd5] bg-white p-2 text-[#2b2f36] transition hover:bg-[#eef1f7]"
                  >
                    ▶
                  </button>
                </div>
              </div>
              <div className="space-y-3 rounded-xl border border-[#d4d7df] bg-white p-5 shadow-inner">
                <div className="grid gap-2 lg:grid-cols-[minmax(0,2fr)_minmax(0,2fr)_120px]">
                  <label className="flex flex-col gap-1 text-xs font-semibold uppercase tracking-[0.14em] text-[#5c606b]">
                    Séjour
                    <input
                    className="rounded border border-[#d4d7df] bg-[#f7f8fb] px-3 py-2 text-sm text-[#2b2f36] focus:border-[#7f8696] focus:outline-none"
                    placeholder="Nom du séjour"
                    value={financialSummary.sejourTitle}
                    onChange={handleFinancialFieldChange("sejourTitle")}
                    />
                  </label>
                  <label className="flex flex-col gap-1 text-xs font-semibold uppercase tracking-[0.14em] text-[#5c606b]">
                    Thème
                    <input
                    className="rounded border border-[#d4d7df] bg-[#f7f8fb] px-3 py-2 text-sm text-[#2b2f36] focus:border-[#7f8696] focus:outline-none"
                    placeholder="Thème"
                    value={financialSummary.sejourTheme}
                    onChange={handleFinancialFieldChange("sejourTheme")}
                    />
                  </label>
                  <input
                    className="rounded border border-[#d4d7df] bg-[#f1f4ff] px-3 py-2 text-sm font-semibold text-[#1f2330] focus:border-[#7f8696] focus:outline-none"
                    placeholder="Montant"
                    value={financialSummary.sejourAmount}
                    onChange={handleFinancialFieldChange("sejourAmount")}
                  />
                </div>
                <div className="grid gap-2 lg:grid-cols-[repeat(2,minmax(0,1fr))]">
                  <div className="grid gap-1 sm:grid-cols-[minmax(0,1fr)_120px]">
                    <label className="flex flex-col gap-1 text-xs font-semibold uppercase tracking-[0.14em] text-[#5c606b]">
                      Transport aller
                      <input
                        className="rounded border border-[#d4d7df] bg-[#f7f8fb] px-3 py-2 text-sm text-[#2b2f36] focus:border-[#7f8696] focus:outline-none"
                        placeholder="Ville de départ"
                        value={financialSummary.transportOutCity}
                        onChange={handleFinancialFieldChange("transportOutCity")}
                      />
                    </label>
                    <input
                      className="rounded border border-[#d4d7df] bg-[#f1f4ff] px-3 py-2 text-sm font-semibold text-[#1f2330] focus:border-[#7f8696] focus:outline-none"
                      placeholder="Montant"
                      value={financialSummary.transportOutAmount}
                      onChange={handleFinancialFieldChange("transportOutAmount")}
                    />
                  </div>
                  <div className="grid gap-1 sm:grid-cols-[minmax(0,1fr)_120px]">
                    <label className="flex flex-col gap-1 text-xs font-semibold uppercase tracking-[0.14em] text-[#5c606b]">
                      Transport retour
                      <input
                        className="rounded border border-[#d4d7df] bg-[#f7f8fb] px-3 py-2 text-sm text-[#2b2f36] focus:border-[#7f8696] focus:outline-none"
                        placeholder="Ville de retour"
                        value={financialSummary.transportReturnCity}
                        onChange={handleFinancialFieldChange("transportReturnCity")}
                      />
                    </label>
                    <input
                      className="rounded border border-[#d4d7df] bg-[#f1f4ff] px-3 py-2 text-sm font-semibold text-[#1f2330] focus:border-[#7f8696] focus:outline-none"
                      placeholder="Montant"
                      value={financialSummary.transportReturnAmount}
                      onChange={handleFinancialFieldChange("transportReturnAmount")}
                    />
                  </div>
                </div>
                <div className="grid gap-2 lg:grid-cols-[repeat(2,minmax(0,1fr))] text-sm font-semibold uppercase tracking-[0.12em] text-[#2b2f36]">
                  <label className="flex flex-col gap-1 rounded border border-[#d4d7df] bg-[#f7f8fb] px-3 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-[#5c606b]">
                    Total des suppléments
                    <input
                      className="mt-1 rounded border border-[#d4d7df] bg-white px-2 py-1 text-sm text-[#2b2f36] focus:border-[#7f8696] focus:outline-none"
                      placeholder="Montant"
                      value={financialSummary.supplementsTotal}
                      onChange={handleFinancialFieldChange("supplementsTotal")}
                    />
                  </label>
                  <label className="flex flex-col gap-1 rounded border border-[#d4d7df] bg-[#f7f8fb] px-3 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-[#5c606b]">
                    Total des réductions
                    <input
                      className="mt-1 rounded border border-[#d4d7df] bg-white px-2 py-1 text-sm text-[#2b2f36] focus:border-[#7f8696] focus:outline-none"
                      placeholder="Montant"
                      value={financialSummary.reductionsTotal}
                      onChange={handleFinancialFieldChange("reductionsTotal")}
                    />
                  </label>
                </div>
                <div className="grid gap-2 lg:grid-cols-[minmax(0,2fr)_120px] text-sm font-semibold uppercase tracking-[0.12em] text-[#2b2f36]">
                  <input
                    className="rounded border border-[#d4d7df] bg-[#f7f8fb] px-3 py-2 text-sm text-[#2b2f36] focus:border-[#7f8696] focus:outline-none"
                    placeholder="Assurance"
                    value={financialSummary.assuranceLabel}
                    onChange={handleFinancialFieldChange("assuranceLabel")}
                  />
                  <input
                    className="rounded border border-[#d4d7df] bg-[#f1f4ff] px-3 py-2 text-sm font-semibold text-[#1f2330] focus:border-[#7f8696] focus:outline-none"
                    placeholder="Montant"
                    value={financialSummary.assuranceAmount}
                    onChange={handleFinancialFieldChange("assuranceAmount")}
                  />
                </div>
                <div className="grid gap-2 lg:grid-cols-[minmax(0,4fr)_120px] text-sm font-semibold uppercase tracking-[0.12em] text-[#2b2f36]">
                  <span className="flex items-center rounded border border-[#d4d7df] bg-[#d9e1ff] px-3 py-2">
                    Total avant prises en charge
                  </span>
                  <input
                    className="rounded border border-[#aeb7ff] bg-[#cdd4ff] px-3 py-2 text-sm font-semibold text-[#1f2330] focus:border-[#7f8696] focus:outline-none"
                    placeholder="Montant"
                    value={financialSummary.totalBeforeCoverage}
                    onChange={handleFinancialFieldChange("totalBeforeCoverage")}
                  />
                </div>
                <div className="flex flex-wrap items-center justify-end gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-[#2b2f36]">
                  <span>Total pour la famille</span>
                  <input
                    className="w-32 rounded border border-[#d4d7df] bg-white px-3 py-2 text-sm font-semibold text-[#1f2330] focus:border-[#7f8696] focus:outline-none"
                    value={financialSummary.totalFamily}
                    onChange={handleFinancialFieldChange("totalFamily")}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="rounded-xl border border-[#d4d7df] bg-white p-4 shadow-sm">
                <h4 className="text-sm font-semibold uppercase tracking-[0.16em] text-[#1f2330]">
                  Synthèse
                </h4>
                <dl className="mt-3 grid grid-cols-2 gap-x-3 gap-y-2 text-xs uppercase tracking-[0.12em] text-[#5c606b]">
                  <div>
                    <dt>Séjour</dt>
                    <dd className="text-sm font-semibold text-[#1f2330]">
                      Famille
                    </dd>
                  </div>
                  <div>
                    <dt>Réductions</dt>
                    <dd className="text-sm font-semibold text-[#1f2330]">
                      Famille
                    </dd>
                  </div>
                  <div>
                    <dt>Transport aller</dt>
                    <dd className="text-sm font-semibold text-[#1f2330]">
                      Famille
                    </dd>
                  </div>
                  <div>
                    <dt>Suppléments</dt>
                    <dd className="text-sm font-semibold text-[#1f2330]">
                      Famille
                    </dd>
                  </div>
                  <div>
                    <dt>Transport retour</dt>
                    <dd className="text-sm font-semibold text-[#1f2330]">
                      Famille
                    </dd>
                  </div>
                  <div>
                    <dt>Assurance</dt>
                    <dd className="text-sm font-semibold text-[#1f2330]">
                      Famille
                    </dd>
                  </div>
                </dl>
                <button
                  type="button"
                  className="mt-4 inline-flex items-center justify-center rounded-md border border-[#d4d7df] bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-[#2b2f36] transition hover:bg-[#eef1f7]"
                >
                  Tout famille
                </button>
              </div>

              <div className="space-y-3 rounded-xl border border-[#d4d7df] bg-white p-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-semibold uppercase tracking-[0.16em] text-[#1f2330]">
                    Prises en charge
                  </h4>
                  <button
                    type="button"
                    className="inline-flex items-center justify-center rounded-md border border-[#c9ccd5] bg-[#ffe8b4] px-2 py-1 text-sm font-semibold text-[#2b2f36] transition hover:bg-[#ffd680]"
                  >
                    +
                  </button>
                </div>
                <div className="overflow-hidden rounded-lg border border-dashed border-[#d4d7df] bg-[#fbfbfd]">
                  <table className="w-full border-collapse text-xs uppercase tracking-[0.12em] text-[#5c606b]">
                    <thead className="bg-[#f0f1f5]">
                      <tr>
                        <th className="px-3 py-2 text-left">Partenaire</th>
                        <th className="px-3 py-2 text-left">ID partenaire</th>
                        <th className="px-3 py-2 text-right">Montant PeC</th>
                      </tr>
                    </thead>
                    <tbody>
                      {coverageRows.length === 0 ? (
                        <tr>
                          <td
                            colSpan={3}
                            className="px-3 py-4 text-center text-xs font-medium text-[#7f8696]"
                          >
                            Aucune prise en charge enregistrée.
                          </td>
                        </tr>
                      ) : (
                        coverageRows.map((row) => (
                          <tr key={row.id} className="border-t border-[#e3e6ed]">
                            <td className="px-3 py-2 text-sm text-[#2b2f36]">
                              {row.partner}
                            </td>
                            <td className="px-3 py-2 text-sm text-[#2b2f36]">
                              {row.partnerId}
                            </td>
                            <td className="px-3 py-2 text-right text-sm text-[#2b2f36]">
                              {row.amount}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex flex-col gap-2 rounded-xl border border-[#d4d7df] bg-white p-4 shadow-sm text-xs font-semibold uppercase tracking-[0.16em] text-[#5c606b]">
                <label className="inline-flex items-center gap-2">
                  <input
                    type="checkbox"
                    className="size-4 accent-[#0f4c65]"
                    checked={colosApprenantes}
                    onChange={(event) => setColosApprenantes(event.target.checked)}
                  />
                  Colos apprenantes ?
                </label>
                <label className="inline-flex items-center gap-2">
                  <input
                    type="checkbox"
                    className="size-4 accent-[#0f4c65]"
                    checked={passColo}
                    onChange={(event) => setPassColo(event.target.checked)}
                  />
                  Pass colo ?
                </label>
              </div>

              <div className="rounded-xl border border-[#0f4c65] bg-[#0f4c65] p-4 text-white shadow">
                <h4 className="text-sm font-semibold uppercase tracking-[0.18em]">
                  Informations documents séjour
                </h4>
                <div className="mt-3 space-y-2 text-xs font-semibold uppercase tracking-[0.12em]">
                  {(Object.keys(documentsState) as Array<keyof typeof documentsState>).map((key) => (
                    <label key={key} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        className="size-4 accent-white"
                        checked={documentsState[key]}
                        onChange={handleDocumentToggle(key)}
                      />
                      <span>{documentLabels[key]}</span>
                    </label>
                  ))}
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  <button
                    type="button"
                    className="inline-flex items-center justify-center rounded-md border border-white/30 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-white transition hover:bg-white/20"
                  >
                    Infos sanitaires
                  </button>
                  <button
                    type="button"
                    className="inline-flex items-center justify-center gap-2 rounded-md border border-white/30 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-white transition hover:bg-white/20"
                  >
                    <Save className="size-3.5" />
                    Relance sanitaire
                  </button>
                </div>
              </div>
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

          <section className="grid gap-6 rounded-xl border border-[#d4d7df] bg-[#f3f4f8] p-6 xl:grid-cols-[minmax(0,2fr)_minmax(0,1.4fr)_minmax(0,1fr)]">
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.16em] text-[#5c606b]">
                <span className="text-base text-[#1f2330]">Transport :</span>
                <input
                  className="min-w-[160px] flex-1 rounded border border-[#d4d7df] bg-white px-3 py-2 text-sm text-[#2b2f36] focus:border-[#7f8696] focus:outline-none"
                  value={transportInfo.mode}
                  onChange={handleTransportFieldChange("mode")}
                  placeholder="Mode de transport"
                />
                <label className="inline-flex items-center gap-2">
                  <input
                    type="checkbox"
                    className="size-4 accent-[#0f4c65]"
                    checked={transportInfo.auto}
                    onChange={handleTransportFieldChange("auto")}
                  />
                  Auto
                </label>
              </div>
              <textarea
                className="min-h-[120px] w-full rounded border border-[#d4d7df] bg-white px-3 py-2 text-sm text-[#2b2f36] focus:border-[#7f8696] focus:outline-none"
                placeholder="Informations transport"
                value={transportInfo.details}
                onChange={handleTransportFieldChange("details")}
              />

              <div className="grid gap-3 rounded-xl border border-[#d4d7df] bg-white p-4 text-xs font-semibold uppercase tracking-[0.16em] text-[#5c606b]">
                {[
                  "Option",
                  "Inscription",
                  "Réception Acompte",
                  "Réception Solde",
                  "Réception Paiement",
                  "Changement Transport",
                  "Changement Dates",
                  "Changement Thème",
                  "Réception Attestation JPA",
                ].map((label) => (
                  <label key={label} className="inline-flex items-center gap-2">
                    <input
                      type="radio"
                      name="inscription-event"
                      value={label}
                      checked={eventType === label}
                      onChange={handleEventTypeChange}
                      className="size-4 accent-[#0f4c65]"
                    />
                    {label}
                  </label>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <div className="grid gap-3 rounded-xl border border-[#d4d7df] bg-white p-4 shadow-sm text-sm font-semibold uppercase tracking-[0.16em] text-[#1f2330]">
                <button
                  type="button"
                  className="flex items-center justify-center gap-2 rounded-md border border-[#d4d7df] bg-white py-3 text-sm text-[#2b2f36] transition hover:bg-[#eef1f7]"
                >
                  ✉ Mail
                </button>
                <button
                  type="button"
                  className="flex items-center justify-center gap-2 rounded-md border border-[#d4d7df] bg-white py-3 text-sm text-[#2b2f36] transition hover:bg-[#eef1f7]"
                >
                  🚍 Convocation
                </button>
                <button
                  type="button"
                  className="flex items-center justify-center gap-2 rounded-md border border-[#d4d7df] bg-white py-3 text-sm text-[#2b2f36] transition hover:bg-[#eef1f7]"
                >
                  Confirmation d&apos;inscription
                </button>
                <button
                  type="button"
                  className="flex items-center justify-center gap-2 rounded-md border border-[#d4d7df] bg-white py-3 text-sm text-[#2b2f36] transition hover:bg-[#eef1f7]"
                >
                  Confirmation sans prix
                </button>
                <div className="grid gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-[#5c606b]">
                  <label className="flex flex-col gap-1">
                    Plan pour convocation
                    <input
                      className="rounded border border-[#d4d7df] bg-white px-3 py-2 text-sm text-[#2b2f36] focus:border-[#7f8696] focus:outline-none"
                      placeholder="URL ou référence"
                    />
                  </label>
                  <label className="flex flex-col gap-1">
                    Notes
                    <textarea
                      className="min-h-[120px] rounded border border-[#d4d7df] bg-white px-3 py-2 text-sm text-[#2b2f36] focus:border-[#7f8696] focus:outline-none"
                      value={notes}
                      onChange={(event) => setNotes(event.target.value)}
                    />
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    <label className="flex flex-col gap-1">
                      Taille
                      <input
                        className="rounded border border-[#d4d7df] bg-white px-2 py-1 text-sm text-[#2b2f36] focus:border-[#7f8696] focus:outline-none"
                        value={childMetrics.taille}
                        onChange={handleMetricsChange("taille")}
                      />
                    </label>
                    <label className="flex flex-col gap-1">
                      Poids
                      <input
                        className="rounded border border-[#d4d7df] bg-white px-2 py-1 text-sm text-[#2b2f36] focus:border-[#7f8696] focus:outline-none"
                        value={childMetrics.poids}
                        onChange={handleMetricsChange("poids")}
                      />
                    </label>
                    <label className="flex flex-col gap-1">
                      Pointure
                      <input
                        className="rounded border border-[#d4d7df] bg-white px-2 py-1 text-sm text-[#2b2f36] focus:border-[#7f8696] focus:outline-none"
                        value={childMetrics.pointure}
                        onChange={handleMetricsChange("pointure")}
                      />
                    </label>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="rounded-xl border border-[#d4d7df] bg-white p-4 shadow-sm">
                <h4 className="text-sm font-semibold uppercase tracking-[0.16em] text-[#c95144]">
                  Annuler l&apos;inscription
                </h4>
                <div className="mt-3 grid gap-3 text-xs font-semibold uppercase tracking-[0.14em] text-[#5c606b]">
                  <label className="inline-flex items-center gap-2">
                    <input
                      type="checkbox"
                      className="size-4 accent-[#c95144]"
                      checked={cancellationInfo.withFees}
                      onChange={handleCancelInfoChange("withFees")}
                    />
                    Avec frais
                  </label>
                  <div className="grid gap-2">
                    <label className="flex flex-col gap-1">
                      Montant conservé familles
                      <input
                        className="rounded border border-[#d4d7df] bg-white px-3 py-2 text-sm text-[#2b2f36] focus:border-[#c95144] focus:outline-none"
                        value={cancellationInfo.amountFamily}
                        onChange={handleCancelInfoChange("amountFamily")}
                      />
                    </label>
                    <label className="flex flex-col gap-1">
                      Montant conservé partenaire
                      <input
                        className="rounded border border-[#d4d7df] bg-white px-3 py-2 text-sm text-[#2b2f36] focus:border-[#c95144] focus:outline-none"
                        value={cancellationInfo.amountPartner}
                        onChange={handleCancelInfoChange("amountPartner")}
                      />
                    </label>
                    <label className="flex flex-col gap-1">
                      Statut annulation
                      <input
                        className="rounded border border-[#d4d7df] bg-white px-3 py-2 text-sm text-[#2b2f36] focus:border-[#c95144] focus:outline-none"
                        value={cancellationInfo.status}
                        onChange={handleCancelInfoChange("status")}
                      />
                    </label>
                  </div>
                  <button
                    type="button"
                    className="mt-2 inline-flex items-center justify-center rounded-md border border-[#c95144] bg-[#fceae9] px-3 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-[#c95144] transition hover:bg-[#fbd1cd]"
                  >
                    Déclencher l&apos;annulation
                  </button>
                </div>
              </div>
            </div>
          </section>

          <footer className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#d4d7df] bg-white px-4 py-3 text-xs font-semibold uppercase tracking-[0.16em] text-[#5c606b]">
            <div className="flex flex-col gap-1 md:flex-row md:items-center md:gap-3">
              {error ? (
                <span className="text-red-600">{error}</span>
              ) : feedback ? (
                <span className="text-[#2f7a57]">{feedback}</span>
              ) : null}
              {logError ? (
                <span className="text-[11px] uppercase tracking-[0.16em] text-amber-600">
                  Journalisation indisponible : {logError}
                </span>
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

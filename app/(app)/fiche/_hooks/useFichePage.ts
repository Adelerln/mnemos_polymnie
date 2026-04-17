"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type FormEvent,
} from "react";
import { useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";

import {
  fetchInscriptionById,
  saveInscription,
  type InscriptionRecord,
} from "@/services/inscriptions";
import { useProjectLogger } from "@/hooks/useProjectLogger";

import type { InscriptionFormState, DocumentsState } from "../_lib/types";
import {
  createEmptyInscription,
  formatDateForInput,
  computeAgeAtDate,
} from "../_lib/helpers";

export function useFichePage() {
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

  // ─── State ──────────────────────────────────────────────────

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
  const [coverageRows] = useState<
    Array<{ id: number; partner: string; partnerId: string; amount: string }>
  >([]);
  const [documentsState, setDocumentsState] = useState<DocumentsState>({
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
  const [transportInfo, setTransportInfo] = useState({
    mode: "",
    auto: true,
    details: "",
  });
  const [childMetrics, setChildMetrics] = useState({
    taille: "",
    poids: "",
    pointure: "",
  });
  const [notes, setNotes] = useState("");
  const [eventType, setEventType] = useState("Inscription");
  const [cancellationInfo, setCancellationInfo] = useState({
    withFees: false,
    amountFamily: "",
    amountPartner: "",
    status: "",
  });
  const lastSavedInscriptionRef = useRef<InscriptionRecord | null>(null);

  // ─── Computed ───────────────────────────────────────────────

  const arrivalDate = form.dateEntree || form.dateSortie;
  const computedAge = useMemo(
    () => computeAgeAtDate(form.childBirthDate, arrivalDate),
    [form.childBirthDate, arrivalDate],
  );

  // ─── Effects ────────────────────────────────────────────────

  const loadInscription = useCallback(async (id: number) => {
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
  }, []);

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
          prefillData.childFirstName ||
          prev.childFirstName ||
          base.childFirstName,
        childLastName:
          prefillData.childLastName ||
          prev.childLastName ||
          base.childLastName,
        childBirthDate:
          prefillData.childBirthDate ||
          prev.childBirthDate ||
          base.childBirthDate,
        childGender:
          prefillData.childGender || prev.childGender || base.childGender,
      };
    });
    lastSavedInscriptionRef.current = null;
    setIsPartnerLinked(false);
    setIsCancelled(false);
  }, [inscriptionIdParam, loadInscription, prefillData]);

  // ─── Handlers ───────────────────────────────────────────────

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

  const handleDocumentToggle =
    (field: keyof DocumentsState) => () => {
      setDocumentsState((prev) => ({
        ...prev,
        [field]: !prev[field],
      }));
    };

  const handleTransportFieldChange =
    (field: keyof typeof transportInfo) =>
    (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const value =
        field === "auto"
          ? (event.target as HTMLInputElement).checked
          : event.target.value;
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
      const actionType: "insert" | "update" = previousRecord
        ? "update"
        : "insert";

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
        field === "withFees"
          ? (event.target as HTMLInputElement).checked
          : event.target.value;
      setCancellationInfo((prev) => ({
        ...prev,
        [field]: field === "withFees" ? Boolean(value) : (value as string),
      }));
    };

  // ─── Return ─────────────────────────────────────────────────

  return {
    // Form
    form,
    isLoading,
    isSaving,
    feedback,
    error,
    logError,
    handleFieldChange,
    handleSave,

    // Financial
    financialSummary,
    handleFinancialFieldChange,
    coverageRows,

    // Flags
    isPartnerLinked,
    isCancelled,
    parentTwoHandled,
    colosApprenantes,
    setColosApprenantes,
    passColo,
    setPassColo,
    computedAge,

    // Documents
    documentsState,
    handleDocumentToggle,

    // Transport
    transportInfo,
    handleTransportFieldChange,

    // Child metrics
    childMetrics,
    handleMetricsChange,

    // Notes
    notes,
    setNotes,

    // Event type
    eventType,
    handleEventTypeChange,

    // Cancellation
    cancellationInfo,
    handleCancelInfoChange,
  };
}

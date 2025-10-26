"use client";

import {
  Building2,
  CalendarDays,
  CreditCard,
  FileText,
  LineChart,
  NotebookPen,
  Search,
  UserRoundPlus,
} from "lucide-react";
import {
  ChangeEvent,
  FormEvent,
  KeyboardEvent,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  fetchFamilies,
  saveFamily,
  type FamilyRecord,
  type SecondaryContact,
  type Child,
  type HealthFormState,
} from "@/services/api";

type ChildFormState = {
  lastName: string;
  firstName: string;
  birthDate: string;
  gender: "F" | "M" | "";
};

type FamilyFormState = {
  id: string;
  rowId?: number;
  civility: string;
  lastName: string;
  firstName: string;
  address: string;
  complement: string;
  postalCode: string;
  city: string;
  country: string;
  phone1: string;
  phone2: string;
  email: string;
  partner: string;
  prestashopP1: string;
  prestashopP2: string;
  secondaryContact: SecondaryContact;
  children: Child[];
  createdAt?: string;
  updatedAt?: string;
};

type FamilyEditableField =
  | "civility"
  | "lastName"
  | "firstName"
  | "address"
  | "complement"
  | "country"
  | "email"
  | "partner"
  | "prestashopP1"
  | "prestashopP2";
type CityLookupState = "idle" | "loading" | "error";

const quickActions = [
  {
    id: "inscriptions",
    label: "Consulter les inscriptions",
    icon: CalendarDays,
  },
  {
    id: "paiements",
    label: "Consulter paiements",
    icon: CreditCard,
  },
  {
    id: "factures",
    label: "Consulter factures",
    icon: FileText,
  },
  {
    id: "nouveau-paiement",
    label: "Nouveau paiement",
    icon: CreditCard,
  },
  {
    id: "nouvel-avoir",
    label: "Nouvel avoir",
    icon: LineChart,
  },
  {
    id: "nouveau-devis",
    label: "Nouveau devis",
    icon: Building2,
  },
];

const auditEntries = [
  { label: "Créé par" },
  { label: "Créé le" },
  { label: "Dernière modification" },
  { label: "Mise à jour" },
];

const CIVILITY_OPTIONS = ["", "M", "Mme", "M et Mme", "Famille"] as const;
const GENDER_OPTIONS = ["", "F", "M"] as const;

const createEmptySecondaryContact = (): SecondaryContact => ({
  lastName: "",
  firstName: "",
  role: "",
  phone: "",
  email: "",
});

const createEmptyHealthForm = (): HealthFormState => ({
  allergies: "",
  diet: "",
  healthIssues: "",
  instructions: "",
  friend: "",
  vacaf: "",
  transportNotes: "",
});

const createEmptyFamilyForm = (id = ""): FamilyFormState => ({
  id,
  rowId: undefined,
  civility: "",
  lastName: "",
  firstName: "",
  address: "",
  complement: "",
  postalCode: "",
  city: "",
  country: "",
  phone1: "",
  phone2: "",
  email: "",
  partner: "",
  prestashopP1: "",
  prestashopP2: "",
  secondaryContact: createEmptySecondaryContact(),
  children: [],
  createdAt: undefined,
  updatedAt: undefined,
});

const createEmptyChildForm = (): ChildFormState => ({
  lastName: "",
  firstName: "",
  birthDate: "",
  gender: "" as ChildFormState["gender"],
});

const mapChildrenForForm = (children: Child[]): Child[] =>
  children.map((child) => ({
    ...child,
    gender: child.gender === "F" || child.gender === "M" ? child.gender : "",
    health: child.health
      ? { ...createEmptyHealthForm(), ...child.health }
      : createEmptyHealthForm(),
  }));

const mapFamilyRecordToFormState = (record: FamilyRecord): FamilyFormState => ({
  id: record.id,
  rowId: record.rowId,
  civility: record.civility,
  lastName: record.lastName,
  firstName: record.firstName,
  address: record.address,
  complement: record.complement,
  postalCode: record.postalCode,
  city: record.city,
  country: record.country,
  phone1: record.phone1,
  phone2: record.phone2,
  email: record.email,
  partner: record.partner,
  prestashopP1: record.prestashopP1,
  prestashopP2: record.prestashopP2,
  secondaryContact: record.secondaryContact
    ? { ...record.secondaryContact }
    : createEmptySecondaryContact(),
  children: mapChildrenForForm(record.children),
  createdAt: record.createdAt,
  updatedAt: record.updatedAt,
});

const mapFormStateToFamilyRecord = (
  form: FamilyFormState,
  includeSecondaryContact: boolean,
): FamilyRecord => ({
  id: form.id.trim(),
  rowId: form.rowId,
  civility: form.civility,
  lastName: form.lastName,
  firstName: form.firstName,
  address: form.address,
  complement: form.complement,
  postalCode: form.postalCode,
  city: form.city,
  country: form.country,
  phone1: form.phone1,
  phone2: form.phone2,
  email: form.email,
  partner: form.partner,
  prestashopP1: form.prestashopP1,
  prestashopP2: form.prestashopP2,
  secondaryContact: includeSecondaryContact
    ? { ...form.secondaryContact }
    : null,
  children: form.children.map((child) => ({
    ...child,
    health: { ...child.health },
  })),
  createdAt: form.createdAt,
  updatedAt: form.updatedAt,
});

const generateChildId = () => {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return Math.random().toString(36).slice(2, 10);
};

const computeNextFamilyId = (items: FamilyRecord[]) => {
  const numericIds = items
    .map((item) => Number.parseInt(item.id, 10))
    .filter(Number.isFinite);

  if (numericIds.length === 0) {
    return "1";
  }

  const maxId = Math.max(...numericIds);
  return String(maxId + 1);
};

const formatFrenchPhoneNumber = (input: string) => {
  const digits = input.replace(/\D/g, "").slice(0, 10);
  const groups = digits.match(/.{1,2}/g) ?? [];
  return groups.join(" ");
};

const normalizePostalCode = (input: string) =>
  input.replace(/\D/g, "").slice(0, 5);

const computeAgeFromBirthDate = (value: string) => {
  if (!value) {
    return "";
  }

  const birthDate = new Date(value);

  if (Number.isNaN(birthDate.getTime())) {
    return "";
  }

  const today = new Date();

  let years = today.getFullYear() - birthDate.getFullYear();
  let months = today.getMonth() - birthDate.getMonth();
  const days = today.getDate() - birthDate.getDate();

  if (days < 0) {
    months -= 1;
  }

  if (months < 0) {
    years -= 1;
    months += 12;
  }

  const yearLabel = `${years} an${years > 1 ? "s" : ""}`;
  const monthLabel = `${months} mois`;

  if (years <= 0) {
    return monthLabel;
  }

  if (months <= 0) {
    return yearLabel;
  }

  return `${yearLabel} et ${monthLabel}`;
};

export default function ClientsPage() {
  const [families, setFamilies] = useState<FamilyRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const nextFamilyId = useMemo(
    () => computeNextFamilyId(families),
    [families],
  );
  const [selectedFamilyId, setSelectedFamilyId] = useState<string | null>(null);
  const [familyForm, setFamilyForm] = useState<FamilyFormState>(() =>
    createEmptyFamilyForm(nextFamilyId),
  );
  const [secondaryContactEnabled, setSecondaryContactEnabled] = useState(false);
  const [childForm, setChildForm] = useState<ChildFormState>(() =>
    createEmptyChildForm(),
  );
  const [isChildFormOpen, setIsChildFormOpen] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [childError, setChildError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [cityLookupState, setCityLookupState] =
    useState<CityLookupState>("idle");
  const [cityLookupError, setCityLookupError] = useState<string | null>(null);
  const [cityOptions, setCityOptions] = useState<string[]>([]);
  const [healthModalChildId, setHealthModalChildId] = useState<string | null>(
    null,
  );
  const [healthForm, setHealthForm] = useState<HealthFormState>(() =>
    createEmptyHealthForm(),
  );
  const [healthFeedback, setHealthFeedback] = useState<string | null>(null);
  const [isAutoSavingChildren, setIsAutoSavingChildren] = useState(false);

  // Charger les familles au montage du composant
  useEffect(() => {
    const loadFamilies = async () => {
      try {
        setIsLoading(true);
        const familiesData = await fetchFamilies();
        setFamilies(familiesData);
      } catch (error) {
        console.error("Erreur lors du chargement des familles:", error);
        setSaveError("Erreur lors du chargement des familles");
      } finally {
        setIsLoading(false);
      }
    };

    loadFamilies();
  }, []);

  useEffect(() => {
    if (!selectedFamilyId) {
      setFamilyForm((prev) => {
        if (prev.id === nextFamilyId) {
          return prev;
        }
        return {
          ...prev,
          id: nextFamilyId,
        };
      });
    }
  }, [nextFamilyId, selectedFamilyId]);

  const postalCode = familyForm.postalCode;

  useEffect(() => {
    if (postalCode.length !== 5) {
      setCityOptions([]);
      setCityLookupState("idle");
      setCityLookupError(null);
      setFamilyForm((prev) => {
        if (prev.postalCode !== postalCode || prev.city === "") {
          return prev;
        }
        return {
          ...prev,
          city: "",
        };
      });
      return;
    }

    const controller = new AbortController();

    const fetchCity = async () => {
      setCityLookupState("loading");
      setCityLookupError(null);

      try {
        const response = await fetch(
          `https://geo.api.gouv.fr/communes?codePostal=${postalCode}&fields=nom&format=json`,
          { signal: controller.signal },
        );

        if (!response.ok) {
          throw new Error("Réponse invalide du service postal.");
        }

        const data = (await response.json()) as Array<{ nom: string }>;
        const names = Array.isArray(data)
          ? data
              .map((item) => item.nom)
              .filter(Boolean)
              .sort((a, b) => a.localeCompare(b))
          : [];

        if (controller.signal.aborted) {
          return;
        }

        setCityOptions(names);
        setFamilyForm((prev) => {
          if (prev.postalCode !== postalCode) {
            return prev;
          }

          const nextCity = names[0] ?? "";

          if (prev.city === nextCity) {
            return prev;
          }

          return {
            ...prev,
            city: nextCity,
          };
        });
        setCityLookupState("idle");
      } catch (error) {
        if (controller.signal.aborted) {
          return;
        }

        const message =
          error instanceof Error
            ? error.message
            : "Impossible de récupérer la ville.";

        setCityLookupState("error");
        setCityLookupError(message);
        setCityOptions([]);
        setFamilyForm((prev) =>
          prev.postalCode === postalCode && prev.city !== ""
            ? { ...prev, city: "" }
            : prev,
        );
      }
    };

    void fetchCity();

    return () => {
      controller.abort();
    };
  }, [postalCode]);

  const orderedFamilies = useMemo(
    () =>
      [...families].sort((a, b) =>
        a.id.localeCompare(b.id, undefined, { numeric: true }),
      ),
    [families],
  );

  const filteredFamilies = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();

    if (!term) {
      return orderedFamilies;
    }

    return orderedFamilies.filter((family) => {
      const haystack = [
        family.id,
        family.lastName,
        family.firstName,
        family.postalCode,
        family.city,
      ]
        .join(" ")
        .toLowerCase();

      return haystack.includes(term);
    });
  }, [orderedFamilies, searchTerm]);

  const totalChildren = useMemo(
    () => families.reduce((total, family) => total + family.children.length, 0),
    [families],
  );

  const activeHealthChild = useMemo(() => {
    if (!healthModalChildId) {
      return null;
    }

    return (
      familyForm.children.find((child) => child.id === healthModalChildId) ??
      null
    );
  }, [healthModalChildId, familyForm.children]);

  const handleFamilyFieldChange =
    (field: FamilyEditableField) =>
    (event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      const value = event.target.value;
      setFamilyForm((prev) => ({
        ...prev,
        [field]: value,
      }));
    };

  const handleSecondaryContactChange =
    (field: keyof SecondaryContact) =>
    (event: ChangeEvent<HTMLInputElement>) => {
      const value = event.target.value;
      setFamilyForm((prev) => ({
        ...prev,
        secondaryContact: {
          ...prev.secondaryContact,
          [field]: value,
        },
      }));
    };

  const handleChildFieldChange =
    (field: keyof ChildFormState) =>
    (
      event: ChangeEvent<HTMLInputElement | HTMLSelectElement>,
    ) => {
      const value = event.target.value as ChildFormState[typeof field];
      setChildForm((prev) => ({
        ...prev,
        [field]: value,
      }));
    };

  const handlePostalCodeChange = (event: ChangeEvent<HTMLInputElement>) => {
    const value = normalizePostalCode(event.target.value);
    setFamilyForm((prev) => ({
      ...prev,
      postalCode: value,
    }));
    setCityOptions([]);
    setCityLookupError(null);
  };

  const handleCityManualChange = (
    event: ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const value = event.target.value;
    setFamilyForm((prev) => ({
      ...prev,
      city: value,
    }));
  };

  const handlePhoneChange =
    (field: "phone1" | "phone2") =>
    (event: ChangeEvent<HTMLInputElement>) => {
      const formatted = formatFrenchPhoneNumber(event.target.value);
      setFamilyForm((prev) => ({
        ...prev,
        [field]: formatted,
      }));
    };

  const handleSelectFamily = (familyId: string) => {
    const record = families.find((family) => family.id === familyId);

    if (!record) {
      return;
    }

    setSelectedFamilyId(record.id);
    setFamilyForm(mapFamilyRecordToFormState(record));
    setSecondaryContactEnabled(Boolean(record.secondaryContact));
    setCityOptions(record.city ? [record.city] : []);
    setCityLookupState("idle");
    setCityLookupError(null);
    setIsChildFormOpen(false);
    setChildForm(createEmptyChildForm());
    setSaveError(null);
    setChildError(null);
    setFeedback(null);
    setHealthModalChildId(null);
    setHealthForm(createEmptyHealthForm());
    setHealthFeedback(null);
  };

  const resetFamilyForms = useCallback(() => {
    setSelectedFamilyId(null);
    setFamilyForm(createEmptyFamilyForm(nextFamilyId));
    setSecondaryContactEnabled(false);
    setChildForm(createEmptyChildForm());
    setIsChildFormOpen(false);
    setSaveError(null);
    setChildError(null);
    setFeedback(null);
    setCityOptions([]);
    setCityLookupState("idle");
    setCityLookupError(null);
    setHealthModalChildId(null);
    setHealthForm(createEmptyHealthForm());
    setHealthFeedback(null);
  }, [nextFamilyId]);

  const upsertFamiliesState = useCallback((family: FamilyRecord) => {
    setFamilies((prev) => {
      const next = [...prev];
      const existingIndex = next.findIndex((item) => item.id === family.id);

      if (existingIndex >= 0) {
        next[existingIndex] = family;
      } else {
        next.push(family);
      }

      return next;
    });
  }, []);

  const handleSaveFamily = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaveError(null);
    setFeedback(null);
    setIsSaving(true);

    if (!familyForm.id.trim()) {
      setSaveError("Le numéro de client est manquant.");
      setIsSaving(false);
      return;
    }

    if (!familyForm.lastName.trim()) {
      setSaveError("Veuillez renseigner le nom de famille.");
      setIsSaving(false);
      return;
    }

    if (!familyForm.firstName.trim()) {
      setSaveError("Veuillez renseigner le prénom.");
      setIsSaving(false);
      return;
    }

    try {
      const record = mapFormStateToFamilyRecord(
        familyForm,
        secondaryContactEnabled,
      );

      // Sauvegarder en base de données
      const savedFamily = await saveFamily(record);

      // Mettre à jour l'état local
      upsertFamiliesState(savedFamily);

      setSelectedFamilyId(savedFamily.id);
      setFamilyForm(mapFamilyRecordToFormState(savedFamily));
      setSecondaryContactEnabled(Boolean(savedFamily.secondaryContact));
      if (savedFamily.city) {
        setCityOptions([savedFamily.city]);
      }
      setFeedback("Fiche famille enregistrée avec succès.");
    } catch (error) {
      console.error("Erreur lors de la sauvegarde:", error);
      setSaveError(
        error instanceof Error 
          ? error.message 
          : "Erreur lors de la sauvegarde de la fiche famille"
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleSecondaryContact = () => {
    setSecondaryContactEnabled((prev) => {
      if (prev) {
        setFamilyForm((current) => ({
          ...current,
          secondaryContact: createEmptySecondaryContact(),
        }));
      }

      return !prev;
    });
  };

  const handleAddChild = async () => {
    setChildError(null);

    if (!childForm.lastName.trim() || !childForm.firstName.trim()) {
      setChildError("Nom et prénom de l'enfant sont requis.");
      return;
    }

    if (!childForm.birthDate.trim()) {
      setChildError("Merci d'indiquer la date de naissance.");
      return;
    }

    const newChild: Child = {
      id: generateChildId(),
      lastName: childForm.lastName.trim(),
      firstName: childForm.firstName.trim(),
      birthDate: childForm.birthDate,
      gender: childForm.gender,
      health: createEmptyHealthForm(),
    };

    const nextChildren = [...familyForm.children, newChild];

    setFamilyForm((prev) => ({
      ...prev,
      children: nextChildren,
    }));

    setChildForm(createEmptyChildForm());
    setIsChildFormOpen(false);

    const hasExistingFamily = Boolean(familyForm.rowId || selectedFamilyId);

    if (!hasExistingFamily) {
      setFeedback("Enfant ajouté. Enregistrez la fiche pour le conserver.");
      return;
    }

    try {
      setIsAutoSavingChildren(true);
      const formToSave: FamilyFormState = {
        ...familyForm,
        children: nextChildren,
      };
      const record = mapFormStateToFamilyRecord(
        formToSave,
        secondaryContactEnabled,
      );
      const savedFamily = await saveFamily(record);
      upsertFamiliesState(savedFamily);
      setFamilyForm(mapFamilyRecordToFormState(savedFamily));
      setSecondaryContactEnabled(Boolean(savedFamily.secondaryContact));
      if (savedFamily.city) {
        setCityOptions([savedFamily.city]);
      }
      setSelectedFamilyId(savedFamily.id);
      setFeedback("Enfant ajouté et sauvegardé.");
    } catch (error) {
      console.error("Erreur lors de la sauvegarde de l'enfant:", error);
      setChildError(
        error instanceof Error
          ? error.message
          : "Erreur lors de la sauvegarde de l'enfant.",
      );
      setFeedback(
        "Impossible de sauvegarder automatiquement l'enfant. Enregistrez la fiche.",
      );
    } finally {
      setIsAutoSavingChildren(false);
    }
  };

  const handleRemoveChild = (childId: string) => {
    if (healthModalChildId === childId) {
      setHealthModalChildId(null);
      setHealthForm(createEmptyHealthForm());
      setHealthFeedback(null);
    }

    setFamilyForm((prev) => ({
      ...prev,
      children: prev.children.filter((child) => child.id !== childId),
    }));
  };

  const handleOpenHealthModal = (childId: string) => {
    const child = familyForm.children.find((item) => item.id === childId);

    if (!child) {
      return;
    }

    setHealthModalChildId(childId);
    setHealthForm({
      ...createEmptyHealthForm(),
      ...child.health,
    });
    setHealthFeedback(null);
  };

  const handleCloseHealthModal = () => {
    setHealthModalChildId(null);
    setHealthForm(createEmptyHealthForm());
    setHealthFeedback(null);
  };

  const handleHealthFieldChange =
    (field: keyof HealthFormState) =>
    (
      event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    ) => {
      const value = event.target.value;
      setHealthForm((prev) => ({
        ...prev,
        [field]: value,
      }));
    };

  const handleSaveHealth = () => {
    if (!healthModalChildId) {
      return;
    }

    setFamilyForm((prev) => ({
      ...prev,
      children: prev.children.map((child) =>
        child.id === healthModalChildId
          ? { ...child, health: { ...healthForm } }
          : child,
      ),
    }));
    setHealthFeedback("Informations sanitaires enregistrées.");
  };

  const handleSearchChange = (event: ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const handleRowKeyDown =
    (familyId: string) => (event: KeyboardEvent<HTMLTableRowElement>) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        handleSelectFamily(familyId);
      }
    };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#d9dce1] via-[#ced1d7] to-[#c3c7ce] py-12">
      <div className="flex w-full flex-col gap-10 px-6 text-[#2b2f36] md:px-10 xl:px-16">
        <header className="rounded-2xl border border-[#d4d7df] bg-white shadow-xl">
          <div className="flex flex-col gap-4 border-b border-[#e3e6ed] px-8 py-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#5c606b]">
                Fiches familles
              </p>
              <h1 className="text-3xl font-semibold tracking-tight text-[#1f2330]">
                Dossier client
              </h1>
            </div>
            <div className="flex flex-wrap items-center gap-3 text-sm text-[#2b2f36]">
              <div className="flex items-center gap-2 rounded-full border border-[#d4d7df] bg-[#eef0f5] px-5 py-2">
                <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[#5c606b]">
                  Inscrits mineurs
                </span>
                <span className="text-base font-semibold text-[#b45b12]">
                  {totalChildren}
                </span>
              </div>
              <label className="flex items-center gap-2 rounded-md border border-[#ccd0d8] bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-[#2b2f36] focus-within:border-[#7f8696] focus-within:ring-1 focus-within:ring-[#b2b7c4]">
                <Search className="size-4 text-[#7f8696]" />
                <input
                  className="min-w-[200px] border-none bg-transparent text-sm font-normal uppercase tracking-[0.12em] text-[#2b2f36] outline-none placeholder:text-[#868b97]"
                  placeholder="Recherche famille"
                  value={searchTerm}
                  onChange={handleSearchChange}
                />
              </label>
            </div>
          </div>
          <div className="overflow-hidden">
            <table className="w-full border-collapse text-sm text-[#2b2f36]">
              <thead className="bg-[#1f2330] text-left text-xs font-semibold uppercase tracking-[0.18em] text-white">
                <tr>
                  <th className="px-5 py-3">ID client</th>
                  <th className="px-5 py-3">Nom de famille</th>
                  <th className="px-5 py-3">Prénom</th>
                  <th className="px-5 py-3">Code postal</th>
                  <th className="px-5 py-3">Ville</th>
                </tr>
              </thead>
              <tbody className="bg-white">
                {filteredFamilies.length === 0 ? (
                  <tr>
                    <td
                      className="px-5 py-6 text-center text-sm text-[#7f8696]"
                      colSpan={5}
                    >
                      Aucune famille enregistrée pour le moment.
                    </td>
                  </tr>
                ) : (
                  filteredFamilies.map((item) => {
                    const isSelected = selectedFamilyId === item.id;
                    return (
                      <tr
                        key={item.id}
                        className={`border-t border-[#e3e6ed] transition hover:bg-[#f7f8fb] focus:bg-[#f0f3f8] ${isSelected ? "bg-[#f0f3f8]" : ""}`}
                        onClick={() => handleSelectFamily(item.id)}
                        onKeyDown={handleRowKeyDown(item.id)}
                        tabIndex={0}
                        role="button"
                        aria-pressed={isSelected}
                      >
                        <td className="px-5 py-3 font-semibold text-[#1f2330]">
                          {item.id}
                        </td>
                        <td className="px-5 py-3 uppercase tracking-wide text-[#1f2330]">
                          {item.lastName}
                        </td>
                        <td className="px-5 py-3 text-[#2b2f36]">
                          {item.firstName}
                        </td>
                        <td className="px-5 py-3 text-[#4d525d]">
                          {item.postalCode}
                        </td>
                        <td className="px-5 py-3 text-[#2b2f36]">
                          {item.city}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </header>

        <section className="rounded-2xl border border-[#d4d7df] bg-white shadow-xl">
          <header className="rounded-t-2xl bg-[#2f3442] px-8 py-5 text-white">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold uppercase tracking-[0.2em]">
                Informations famille
              </h2>
              <div className="flex items-center gap-2 text-xs uppercase tracking-[0.16em]">
                <button
                  type="button"
                  className="inline-flex size-9 items-center justify-center rounded-full border border-white/30 bg-white/10 transition hover:bg-white/20"
                  onClick={resetFamilyForms}
                >
                  <NotebookPen className="size-4" />
                  <span className="sr-only">Nouvelle fiche famille</span>
                </button>
                <button
                  type="button"
                  className="inline-flex size-9 items-center justify-center rounded-full border border-white/30 bg-white/10 transition hover:bg-white/20"
                  onClick={resetFamilyForms}
                >
                  <UserRoundPlus className="size-4" />
                  <span className="sr-only">Ajouter une famille</span>
                </button>
              </div>
            </div>
          </header>

          <form
            className="grid gap-8 px-8 py-8 text-[#2b2f36] lg:grid-cols-[280px_1fr]"
            onSubmit={handleSaveFamily}
            noValidate
          >
            <aside className="space-y-5 text-sm">
              <div className="space-y-3 rounded-xl border border-[#e3e6ed] bg-[#f7f8fb] p-5">
                <h3 className="text-xs font-semibold uppercase tracking-[0.16em] text-[#5c606b]">
                  Recherche presta
                </h3>
                <label className="flex flex-col gap-1 text-xs">
                  <span className="font-medium text-[#5c606b]">
                    ID Prestashop P1
                  </span>
                  <input
                    className="rounded border border-[#d4d7df] bg-white px-3 py-2 text-sm text-[#2b2f36] focus:border-[#7f8696] focus:outline-none"
                    value={familyForm.prestashopP1}
                    onChange={handleFamilyFieldChange("prestashopP1")}
                    placeholder="Ex: 12345"
                  />
                </label>
                <label className="flex flex-col gap-1 text-xs">
                  <span className="font-medium text-[#5c606b]">
                    ID Prestashop P2
                  </span>
                  <input
                    className="rounded border border-[#d4d7df] bg-white px-3 py-2 text-sm text-[#2b2f36] focus:border-[#7f8696] focus:outline-none"
                    value={familyForm.prestashopP2}
                    onChange={handleFamilyFieldChange("prestashopP2")}
                    placeholder="Ex: 67890"
                  />
                </label>
                <p className="text-xs text-[#6d7280]">
                  Renseignez les identifiants avant de lancer la recherche dans
                  Prestashop.
                </p>
              </div>

              <div className="space-y-3 rounded-xl border border-[#e3e6ed] bg-[#f7f8fb] p-5">
                <h3 className="text-xs font-semibold uppercase tracking-[0.16em] text-[#5c606b]">
                  Parent 2
                </h3>
                <p className="text-xs text-[#6d7280]">
                  Ajouter un responsable secondaire au dossier famille.
                </p>
                {secondaryContactEnabled ? (
                  <div className="space-y-3">
                    <div className="grid gap-3 text-xs">
                      <label className="flex flex-col gap-1">
                        <span className="font-medium text-[#5c606b]">
                          Nom
                        </span>
                        <input
                          className="rounded border border-[#d4d7df] bg-white px-3 py-2 text-sm text-[#2b2f36] focus:border-[#7f8696] focus:outline-none"
                          value={familyForm.secondaryContact.lastName}
                          onChange={handleSecondaryContactChange("lastName")}
                          placeholder="Nom"
                        />
                      </label>
                      <label className="flex flex-col gap-1">
                        <span className="font-medium text-[#5c606b]">
                          Prénom
                        </span>
                        <input
                          className="rounded border border-[#d4d7df] bg-white px-3 py-2 text-sm text-[#2b2f36] focus:border-[#7f8696] focus:outline-none"
                          value={familyForm.secondaryContact.firstName}
                          onChange={handleSecondaryContactChange("firstName")}
                          placeholder="Prénom"
                        />
                      </label>
                      <label className="flex flex-col gap-1">
                        <span className="font-medium text-[#5c606b]">
                          Rôle dans la famille
                        </span>
                        <input
                          className="rounded border border-[#d4d7df] bg-white px-3 py-2 text-sm text-[#2b2f36] focus:border-[#7f8696] focus:outline-none"
                          value={familyForm.secondaryContact.role}
                          onChange={handleSecondaryContactChange("role")}
                          placeholder="Responsable légal, etc."
                        />
                      </label>
                      <label className="flex flex-col gap-1">
                        <span className="font-medium text-[#5c606b]">
                          Téléphone
                        </span>
                        <input
                          className="rounded border border-[#d4d7df] bg-white px-3 py-2 text-sm text-[#2b2f36] focus:border-[#7f8696] focus:outline-none"
                          value={familyForm.secondaryContact.phone}
                          onChange={handleSecondaryContactChange("phone")}
                          placeholder="07 00 00 00 00"
                        />
                      </label>
                      <label className="flex flex-col gap-1">
                        <span className="font-medium text-[#5c606b]">
                          Email
                        </span>
                        <input
                          className="rounded border border-[#d4d7df] bg-white px-3 py-2 text-sm text-[#2b2f36] focus:border-[#7f8696] focus:outline-none"
                          value={familyForm.secondaryContact.email}
                          onChange={handleSecondaryContactChange("email")}
                          placeholder="parent@example.com"
                        />
                      </label>
                    </div>
                    <button
                      type="button"
                      className="inline-flex w-full items-center justify-center gap-2 rounded-md border border-[#d4d7df] bg-white px-3 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-[#2b2f36] transition hover:bg-[#f0f3f8]"
                      onClick={handleToggleSecondaryContact}
                    >
                      Retirer le parent 2
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    className="inline-flex w-full items-center justify-center gap-2 rounded-md border border-[#d4d7df] bg-white px-3 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-[#2b2f36] transition hover:bg-[#f0f3f8]"
                    onClick={handleToggleSecondaryContact}
                  >
                    <UserRoundPlus className="size-4" />
                    Ajouter
                  </button>
                )}
              </div>
            </aside>

            <div className="space-y-6">
              <div className="grid gap-4 rounded-xl border border-[#e3e6ed] bg-[#f7f8fb] p-6">
                <div className="grid gap-3 text-xs font-semibold uppercase tracking-[0.18em] text-[#5c606b] sm:grid-cols-2 lg:grid-cols-4">
                  <label className="space-y-1">
                    <span>ID client</span>
                    <input
                      className="w-full rounded-lg border border-[#d4d7df] bg-white px-3 py-2 text-base font-semibold uppercase text-[#1f2330] focus:border-[#7f8696] focus:outline-none"
                      value={familyForm.id}
                      readOnly
                    />
                  </label>
                  <label className="space-y-1">
                    <span>Civilité</span>
                    <select
                      className="w-full rounded-lg border border-[#d4d7df] bg-white px-3 py-2 text-sm font-medium text-[#2b2f36] focus:border-[#7f8696] focus:outline-none"
                      value={familyForm.civility}
                      onChange={handleFamilyFieldChange("civility")}
                    >
                      {CIVILITY_OPTIONS.map((option) => (
                        <option key={option} value={option}>
                          {option ? option : "Sélectionner"}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="space-y-1">
                    <span>Nom de famille</span>
                    <input
                      className="w-full rounded-lg border border-[#d4d7df] bg-white px-3 py-2 text-sm font-medium uppercase text-[#1f2330] focus:border-[#7f8696] focus:outline-none"
                      value={familyForm.lastName}
                      onChange={handleFamilyFieldChange("lastName")}
                      placeholder="Nom"
                    />
                  </label>
                  <label className="space-y-1">
                    <span>Prénom</span>
                    <input
                      className="w-full rounded-lg border border-[#d4d7df] bg-white px-3 py-2 text-sm font-medium text-[#1f2330] focus:border-[#7f8696] focus:outline-none"
                      value={familyForm.firstName}
                      onChange={handleFamilyFieldChange("firstName")}
                      placeholder="Prénom"
                    />
                  </label>
                </div>

                <div className="space-y-3 text-sm text-[#2b2f36]">
                  <div className="grid gap-3 md:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
                    <label className="flex flex-col gap-1">
                      <span className="text-xs font-semibold uppercase tracking-[0.14em] text-[#5c606b]">
                        Adresse
                      </span>
                      <input
                        className="rounded border border-[#d4d7df] bg-white px-3 py-2 text-[#2b2f36] focus:border-[#7f8696] focus:outline-none"
                        value={familyForm.address}
                        onChange={handleFamilyFieldChange("address")}
                        placeholder="N° et rue"
                      />
                    </label>
                    <label className="flex flex-col gap-1">
                      <span className="text-xs font-semibold uppercase tracking-[0.14em] text-[#5c606b]">
                        Téléphone 1
                      </span>
                      <input
                        className="rounded border border-[#d4d7df] bg-white px-3 py-2 text-[#2b2f36] focus:border-[#7f8696] focus:outline-none"
                        value={familyForm.phone1}
                        onChange={handlePhoneChange("phone1")}
                        placeholder="07 71 07 26 55"
                        inputMode="tel"
                        maxLength={14}
                      />
                    </label>
                  </div>

                  <div className="grid gap-3 md:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
                    <label className="flex flex-col gap-1">
                      <span className="text-xs font-semibold uppercase tracking-[0.14em] text-[#5c606b]">
                        Complément
                      </span>
                      <input
                        className="rounded border border-[#d4d7df] bg-white px-3 py-2 text-[#2b2f36] focus:border-[#7f8696] focus:outline-none"
                        value={familyForm.complement}
                        onChange={handleFamilyFieldChange("complement")}
                        placeholder="Bâtiment, étage..."
                      />
                    </label>
                    <label className="flex flex-col gap-1">
                      <span className="text-xs font-semibold uppercase tracking-[0.14em] text-[#5c606b]">
                        Téléphone 2
                      </span>
                      <input
                        className="rounded border border-[#d4d7df] bg-white px-3 py-2 text-[#2b2f36] focus:border-[#7f8696] focus:outline-none"
                        value={familyForm.phone2}
                        onChange={handlePhoneChange("phone2")}
                        placeholder="07 00 00 00 00"
                        inputMode="tel"
                        maxLength={14}
                      />
                    </label>
                  </div>

                  <div className="grid gap-3 md:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
                    <div className="flex flex-col gap-1">
                      <span className="text-xs font-semibold uppercase tracking-[0.14em] text-[#5c606b]">
                        Code postal et ville
                      </span>
                      <div className="grid grid-cols-[120px_1fr] gap-3">
                        <input
                          className="rounded border border-[#d4d7df] bg-white px-3 py-2 text-[#2b2f36] focus:border-[#7f8696] focus:outline-none"
                          value={familyForm.postalCode}
                          onChange={handlePostalCodeChange}
                          placeholder="75017"
                          inputMode="numeric"
                        />
                        {cityOptions.length > 1 ? (
                          <select
                            className="rounded border border-[#d4d7df] bg-white px-3 py-2 text-sm text-[#2b2f36] focus:border-[#7f8696] focus:outline-none"
                            value={familyForm.city}
                            onChange={handleCityManualChange}
                          >
                            {cityOptions.map((city) => (
                              <option key={city} value={city}>
                                {city}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <input
                            className="rounded border border-[#d4d7df] bg-white px-3 py-2 text-sm text-[#2b2f36] focus:border-[#7f8696] focus:outline-none"
                            value={familyForm.city}
                            onChange={
                              cityOptions.length === 0
                                ? handleCityManualChange
                                : undefined
                            }
                            placeholder="Renseignez un code postal"
                            readOnly={cityOptions.length === 1}
                          />
                        )}
                      </div>
                      {cityLookupState === "loading" ? (
                        <p className="pt-1 text-[11px] font-medium uppercase tracking-[0.16em] text-[#7f8696]">
                          Recherche de la commune…
                        </p>
                      ) : null}
                      {cityLookupState === "error" && cityLookupError ? (
                        <p className="pt-1 text-[11px] font-medium uppercase tracking-[0.16em] text-red-600">
                          {cityLookupError}
                        </p>
                      ) : null}
                    </div>
                    <label className="flex flex-col gap-1">
                      <span className="text-xs font-semibold uppercase tracking-[0.14em] text-[#5c606b]">
                        Mail
                      </span>
                      <input
                        className="rounded border border-[#d4d7df] bg-white px-3 py-2 text-[#2b2f36] focus:border-[#7f8696] focus:outline-none"
                        value={familyForm.email}
                        onChange={handleFamilyFieldChange("email")}
                        placeholder="famille@example.com"
                      />
                    </label>
                  </div>

                  <div className="grid gap-3 md:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
                    <label className="flex flex-col gap-1">
                      <span className="text-xs font-semibold uppercase tracking-[0.14em] text-[#5c606b]">
                        Pays
                      </span>
                      <input
                        className="rounded border border-[#d4d7df] bg-white px-3 py-2 text-[#2b2f36] focus:border-[#7f8696] focus:outline-none"
                        value={familyForm.country}
                        onChange={handleFamilyFieldChange("country")}
                        placeholder="France"
                      />
                    </label>
                    <label className="flex flex-col gap-1">
                      <span className="text-xs font-semibold uppercase tracking-[0.14em] text-[#5c606b]">
                        Partenaire principal
                      </span>
                      <input
                        className="rounded border border-[#d4d7df] bg-white px-3 py-2 text-[#2b2f36] focus:border-[#7f8696] focus:outline-none"
                        value={familyForm.partner}
                        onChange={handleFamilyFieldChange("partner")}
                        placeholder="Nom du partenaire"
                      />
                    </label>
                  </div>

                </div>

                <div className="flex flex-wrap items-center justify-end gap-2 pt-2">
                  {saveError ? (
                    <p className="text-sm font-medium text-red-600">{saveError}</p>
                  ) : feedback ? (
                    <p className="text-sm font-medium text-[#2f7a57]">
                      {feedback}
                    </p>
                  ) : null}
                  <div className="flex gap-2">
                    <button
                      type="button"
                      className="inline-flex items-center gap-2 rounded-md border border-[#d4d7df] bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-[#2b2f36] transition hover:bg-[#f0f3f8] disabled:opacity-50"
                      onClick={resetFamilyForms}
                      disabled={isSaving}
                    >
                      Réinitialiser
                    </button>
                    <button
                      type="submit"
                      className="inline-flex items-center gap-2 rounded-md border border-[#b96d3c] bg-[#c77845] px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-white transition hover:bg-[#b45b12] disabled:opacity-50"
                      disabled={isSaving}
                    >
                      {isSaving ? "Enregistrement..." : "Enregistrer la fiche"}
                    </button>
                  </div>
                </div>
              </div>

              <div className="space-y-5 rounded-xl border border-[#e3e6ed] bg-white p-6 shadow-lg">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-[#1f2330]">
                    Informations enfants
                  </h3>
                  <button
                    type="button"
                    className="inline-flex items-center gap-2 rounded-md border border-[#d4d7df] bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-[#2b2f36] transition hover:bg-[#f0f3f8]"
                    onClick={() => {
                      setIsChildFormOpen((open) => !open);
                      setChildError(null);
                    }}
                  >
                    <UserRoundPlus className="size-3.5" />
                    {isChildFormOpen ? "Fermer" : "Ajouter"}
                  </button>
                </div>
                <div className="overflow-hidden rounded-xl border border-[#d4d7df]">
                  <table className="w-full border-collapse text-sm text-[#2b2f36]">
                    <thead className="bg-[#2f3442] text-xs font-semibold uppercase tracking-[0.16em] text-white">
                      <tr>
                        <th className="px-5 py-3 text-left">Nom de famille</th>
                        <th className="px-5 py-3 text-left">Prénom</th>
                        <th className="px-5 py-3 text-left">Date de naissance</th>
                        <th className="px-5 py-3 text-left">Âge</th>
                        <th className="px-5 py-3 text-left">Sexe</th>
                        <th className="px-5 py-3 text-center">Infos</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white">
                      {familyForm.children.length === 0 ? (
                        <tr>
                          <td
                            className="px-5 py-6 text-center text-sm text-[#7f8696]"
                            colSpan={6}
                          >
                            Les enfants de la famille apparaîtront ici une fois
                            ajoutés.
                          </td>
                        </tr>
                      ) : (
                        familyForm.children.map((child) => (
                          <tr key={child.id} className="border-t border-[#e3e6ed]">
                            <td className="px-5 py-3 uppercase tracking-wide text-[#1f2330]">
                              {child.lastName}
                            </td>
                            <td className="px-5 py-3 text-[#2b2f36]">
                              {child.firstName}
                            </td>
                            <td className="px-5 py-3 text-[#4d525d]">
                              {child.birthDate}
                            </td>
                            <td className="px-5 py-3 text-[#2b2f36]">
                              {computeAgeFromBirthDate(child.birthDate)}
                            </td>
                            <td className="px-5 py-3 text-[#2b2f36]">
                              {child.gender}
                            </td>
                            <td className="px-5 py-3 text-center text-xs uppercase tracking-[0.16em] text-[#5c606b]">
                              <div className="flex flex-col items-center gap-2">
                                <button
                                  type="button"
                                  className="rounded-md border border-[#d4d7df] bg-white px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#2b2f36] transition hover:bg-[#f0f3f8]"
                                  onClick={() => handleOpenHealthModal(child.id)}
                                >
                                  Fiche sanitaire
                                </button>
                                <button
                                  type="button"
                                  className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#b45b12] transition hover:text-[#8f4104]"
                                  onClick={() => handleRemoveChild(child.id)}
                                >
                                  Retirer
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
                {isChildFormOpen ? (
                  <div className="rounded-xl border border-dashed border-[#d4d7df] bg-[#f7f8fb] p-5">
                    <h4 className="text-xs font-semibold uppercase tracking-[0.16em] text-[#1f2330]">
                      Nouvelle fiche enfant
                    </h4>
                    <div className="mt-3 grid gap-3 text-sm text-[#2b2f36] md:grid-cols-2">
                      <label className="flex flex-col gap-1">
                        <span className="text-xs font-semibold uppercase tracking-[0.14em] text-[#5c606b]">
                          Nom de famille
                        </span>
                        <input
                          className="rounded border border-[#d4d7df] bg-white px-3 py-2 text-[#2b2f36] focus:border-[#7f8696] focus:outline-none"
                          value={childForm.lastName}
                          onChange={handleChildFieldChange("lastName")}
                          placeholder="Nom"
                        />
                      </label>
                      <label className="flex flex-col gap-1">
                        <span className="text-xs font-semibold uppercase tracking-[0.14em] text-[#5c606b]">
                          Prénom
                        </span>
                        <input
                          className="rounded border border-[#d4d7df] bg-white px-3 py-2 text-[#2b2f36] focus:border-[#7f8696] focus:outline-none"
                          value={childForm.firstName}
                          onChange={handleChildFieldChange("firstName")}
                          placeholder="Prénom"
                        />
                      </label>
                      <label className="flex flex-col gap-1">
                        <span className="text-xs font-semibold uppercase tracking-[0.14em] text-[#5c606b]">
                          Date de naissance
                        </span>
                        <input
                          type="date"
                          className="rounded border border-[#d4d7df] bg-white px-3 py-2 text-[#2b2f36] focus:border-[#7f8696] focus:outline-none"
                          value={childForm.birthDate}
                          onChange={handleChildFieldChange("birthDate")}
                        />
                      </label>
                      <label className="flex flex-col gap-1">
                        <span className="text-xs font-semibold uppercase tracking-[0.14em] text-[#5c606b]">
                          Âge
                        </span>
                        <input
                          className="rounded border border-[#d4d7df] bg-[#f7f8fb] px-3 py-2 text-[#2b2f36] focus:border-[#7f8696] focus:outline-none"
                          value={computeAgeFromBirthDate(childForm.birthDate)}
                          placeholder="Calcul automatique"
                          readOnly
                        />
                      </label>
                      <label className="flex flex-col gap-1 md:col-span-2">
                        <span className="text-xs font-semibold uppercase tracking-[0.14em] text-[#5c606b]">
                          Sexe
                        </span>
                        <select
                          className="rounded border border-[#d4d7df] bg-white px-3 py-2 text-sm text-[#2b2f36] focus:border-[#7f8696] focus:outline-none"
                          value={childForm.gender}
                          onChange={handleChildFieldChange("gender")}
                        >
                          {GENDER_OPTIONS.map((option) => (
                            <option key={option} value={option}>
                              {option ? option : "Sélectionner"}
                            </option>
                          ))}
                        </select>
                      </label>
                    </div>
                    {childError ? (
                      <p className="mt-3 text-sm font-medium text-[#c43d3d]">
                        {childError}
                      </p>
                    ) : null}
                    <div className="mt-4 flex flex-wrap items-center justify-end gap-2">
                      <button
                        type="button"
                        className="inline-flex items-center gap-2 rounded-md border border-[#d4d7df] bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-[#2b2f36] transition hover:bg-[#f0f3f8]"
                        onClick={() => {
                          setChildForm(createEmptyChildForm());
                          setIsChildFormOpen(false);
                          setChildError(null);
                        }}
                      >
                        Annuler
                      </button>
                      <button
                        type="button"
                        className="inline-flex items-center gap-2 rounded-md border border-[#b96d3c] bg-[#c77845] px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-white transition hover:bg-[#b45b12] disabled:opacity-50"
                        onClick={handleAddChild}
                        disabled={isAutoSavingChildren}
                      >
                        {isAutoSavingChildren
                          ? "Sauvegarde..."
                          : "Ajouter l'enfant"}
                      </button>
                    </div>
                  </div>
                ) : null}
              </div>

              <div className="grid gap-4 rounded-xl border border-[#e3e6ed] bg-white p-6 shadow-lg sm:grid-cols-2 lg:grid-cols-3">
                {quickActions.map(({ id, label, icon: Icon }) => (
                  <button
                    key={id}
                    type="button"
                    className="flex items-center gap-3 rounded-lg border border-[#e3e6ed] bg-[#f7f8fb] px-4 py-3 text-left text-sm font-semibold uppercase tracking-[0.14em] text-[#2b2f36] transition hover:-translate-y-0.5 hover:border-[#c77845] hover:bg-[#fff4ec] hover:shadow-xl"
                  >
                    <span className="flex size-10 items-center justify-center rounded-full bg-[#2f3442] text-white shadow-lg">
                      <Icon className="size-5" />
                    </span>
                    <span className="leading-tight text-[#2b2f36]">{label}</span>
                  </button>
                ))}
              </div>

              <div className="grid gap-4 rounded-xl border border-[#e3e6ed] bg-white p-6 text-xs uppercase tracking-[0.16em] text-[#5c606b] shadow-lg sm:grid-cols-2 lg:grid-cols-4">
                {auditEntries.map(({ label }) => (
                  <div key={label}>
                    {label}
                    <p className="mt-1 text-sm font-semibold text-[#1f2330]">
                      À compléter
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </form>
        </section>
      </div>

      {healthModalChildId && activeHealthChild ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-950/70 px-4 py-10 backdrop-blur">
          <div className="relative w-full max-w-3xl rounded-2xl border border-[#3f4350] bg-[#2b2f36] p-8 shadow-2xl">
            <button
              type="button"
              className="absolute right-5 top-5 text-sm font-semibold uppercase tracking-[0.16em] text-[#d0d4de] transition hover:text-white"
              onClick={handleCloseHealthModal}
            >
              Fermer
            </button>
            <header className="mb-4 text-center">
              <h3 className="text-lg font-semibold uppercase tracking-[0.2em] text-white">
                Informations sanitaires
              </h3>
              <p className="mt-1 text-sm text-[#d0d4de]">
                {activeHealthChild.firstName} {activeHealthChild.lastName}
              </p>
            </header>
            <div className="grid gap-4 text-sm text-[#e5e8f0] md:grid-cols-2">
              <label className="flex flex-col gap-1">
                <span className="text-xs font-semibold uppercase tracking-[0.14em] text-[#f0f1f5]">
                  Allergies
                </span>
                <textarea
                  className="min-h-[80px] rounded border border-white/20 bg-white/90 px-3 py-2 text-[#1f2330] focus:border-[#c77845] focus:outline-none"
                  value={healthForm.allergies}
                  onChange={handleHealthFieldChange("allergies")}
                  placeholder="Aliments, médicaments..."
                />
              </label>
              <label className="flex flex-col gap-1">
                <span className="text-xs font-semibold uppercase tracking-[0.14em] text-[#f0f1f5]">
                  Régime alimentaire
                </span>
                <input
                  className="rounded border border-white/20 bg-white/90 px-3 py-2 text-[#1f2330] focus:border-[#c77845] focus:outline-none"
                  value={healthForm.diet}
                  onChange={handleHealthFieldChange("diet")}
                  placeholder="Sans porc, végétarien..."
                />
              </label>
              <label className="flex flex-col gap-1">
                <span className="text-xs font-semibold uppercase tracking-[0.14em] text-[#f0f1f5]">
                  Difficultés de santé
                </span>
                <textarea
                  className="min-h-[80px] rounded border border-white/20 bg-white/90 px-3 py-2 text-[#1f2330] focus:border-[#c77845] focus:outline-none"
                  value={healthForm.healthIssues}
                  onChange={handleHealthFieldChange("healthIssues")}
                  placeholder="Traitements, pathologies suivies..."
                />
              </label>
              <label className="flex flex-col gap-1">
                <span className="text-xs font-semibold uppercase tracking-[0.14em] text-[#f0f1f5]">
                  Conduite à tenir
                </span>
                <textarea
                  className="min-h-[80px] rounded border border-white/20 bg-white/90 px-3 py-2 text-[#1f2330] focus:border-[#c77845] focus:outline-none"
                  value={healthForm.instructions}
                  onChange={handleHealthFieldChange("instructions")}
                  placeholder="Geste à effectuer en cas d'incident..."
                />
              </label>
              <label className="md:col-span-2 flex flex-col gap-1">
                <span className="text-xs font-semibold uppercase tracking-[0.14em] text-[#f0f1f5]">
                  Recommandations (s&apos;affichent sur la liste transport)
                </span>
                <textarea
                  className="min-h-[80px] rounded border border-white/20 bg-white/90 px-3 py-2 text-[#1f2330] focus:border-[#c77845] focus:outline-none"
                  value={healthForm.transportNotes}
                  onChange={handleHealthFieldChange("transportNotes")}
                  placeholder="À rappeler aux équipes transport..."
                />
              </label>
              <label className="flex flex-col gap-1">
                <span className="text-xs font-semibold uppercase tracking-[0.14em] text-[#f0f1f5]">
                  Ami(e) de
                </span>
                <input
                  className="rounded border border-white/20 bg-white/90 px-3 py-2 text-[#1f2330] focus:border-[#c77845] focus:outline-none"
                  value={healthForm.friend}
                  onChange={handleHealthFieldChange("friend")}
                  placeholder="Nom et prénom"
                />
              </label>
              <label className="flex flex-col gap-1">
                <span className="text-xs font-semibold uppercase tracking-[0.14em] text-[#f0f1f5]">
                  Matricule VACAF
                </span>
                <input
                  className="rounded border border-white/20 bg-white/90 px-3 py-2 text-[#1f2330] focus:border-[#c77845] focus:outline-none"
                  value={healthForm.vacaf}
                  onChange={handleHealthFieldChange("vacaf")}
                  placeholder="Numéro VACAF"
                />
              </label>
            </div>
            {healthFeedback ? (
              <p className="mt-4 text-sm font-medium text-emerald-400">
                {healthFeedback}
              </p>
            ) : null}
            <div className="mt-6 flex flex-wrap items-center justify-end gap-2">
              <button
                type="button"
                className="inline-flex items-center gap-2 rounded-md border border-[#505664] bg-transparent px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-[#d0d4de] transition hover:bg-[#3a3f4c]"
                onClick={handleCloseHealthModal}
              >
                Fermer
              </button>
              <button
                type="button"
                className="inline-flex items-center gap-2 rounded-md border border-[#b96d3c] bg-[#c77845] px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-white transition hover:bg-[#b45b12]"
                onClick={handleSaveHealth}
              >
                Enregistrer
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

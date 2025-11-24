"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Building2,
  CalendarDays,
  CreditCard,
  FileText,
  LineChart,
  NotebookPen,
  Plus,
  Search,
  Save,
  Trash2,
  Undo2,
  UserRoundPlus,
} from "lucide-react";
import {
  ChangeEvent,
  FormEvent,
  KeyboardEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  deleteFamily,
  fetchFamilies,
  saveFamily,
  type FamilyRecord,
  type SecondaryContact,
  type Child,
  type HealthFormState,
} from "@/services/api";
import { useProjectLogger } from "@/hooks/useProjectLogger";

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

type AddressSuggestion = {
  label: string;
  address: string;
  city: string;
  postcode: string;
};

const quickActions = [
  {
    id: "inscriptions",
    label: "Consulter inscriptions",
    icon: CalendarDays,
    href: "/inscriptions",
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

const createEmptySearchFilters = () => ({
  lastName: "",
  firstName: "",
  address: "",
  postalCode: "",
  city: "",
  country: "",
  phone1: "",
  phone2: "",
  email: "",
  partner: "",
  childLastName: "",
  childFirstName: "",
  childBirthDate: "",
});

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

const formatDateToFrench = (value: string) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("fr-FR");
};

const isSecondaryContactEmpty = (contact: SecondaryContact) =>
  !contact.lastName.trim() &&
  !contact.firstName.trim() &&
  !contact.role.trim() &&
  !contact.phone.trim() &&
  !contact.email.trim();

export default function ClientsPage() {
  const router = useRouter();
  const { logEdit, error: logError } = useProjectLogger();
  const [families, setFamilies] = useState<FamilyRecord[]>([]);
  const [, setIsLoading] = useState(true);
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
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSecondaryContactModalOpen, setIsSecondaryContactModalOpen] =
    useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const searchFilterRefs = {
    primary: useRef<HTMLInputElement | null>(null),
    lastUsed: useRef<HTMLInputElement | HTMLSelectElement | null>(null),
  };
  const [addressQuery, setAddressQuery] = useState("");
  const [addressSuggestions, setAddressSuggestions] = useState<
    AddressSuggestion[]
  >([]);
  const [isAddressLoading, setIsAddressLoading] = useState(false);
  const [addressError, setAddressError] = useState<string | null>(null);
  const [searchFilters, setSearchFilters] = useState(createEmptySearchFilters);
  const [isSearchPanelOpen, setIsSearchPanelOpen] = useState(false);

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

  useEffect(() => {
    const hasCountry = (familyForm.country ?? "").trim() !== "";
    const hasPostalOrCity =
      (familyForm.postalCode ?? "").trim() !== "" ||
      (familyForm.city ?? "").trim() !== "";

    if (!hasCountry && hasPostalOrCity) {
      setFamilyForm((prev) => {
        if ((prev.country ?? "").trim() !== "") {
          return prev;
        }
        return { ...prev, country: "France" };
      });
    }
  }, [familyForm.postalCode, familyForm.city, familyForm.country]);

  useEffect(() => {
    const query = addressQuery.trim();
    if (query.length < 3) {
      setAddressSuggestions([]);
      setAddressError(null);
      return;
    }

    const controller = new AbortController();
    setIsAddressLoading(true);
    setAddressError(null);

    const timer = setTimeout(async () => {
      try {
        const response = await fetch(
          `https://api-adresse.data.gouv.fr/search/?q=${encodeURIComponent(query)}&limit=5`,
          { signal: controller.signal },
        );
        if (!response.ok) {
          throw new Error("Adresse API indisponible");
        }
        const data = (await response.json()) as {
          features: Array<{ properties: { label: string; name: string; city: string; postcode: string } }>;
        };
        const options =
          data.features?.map((item) => ({
            label: item.properties.label,
            address: item.properties.name,
            city: item.properties.city,
            postcode: item.properties.postcode,
          })) ?? [];
        if (!controller.signal.aborted) {
          setAddressSuggestions(options);
        }
      } catch (error) {
        if (controller.signal.aborted) return;
        const message =
          error instanceof Error ? error.message : "Erreur lors de la récupération des adresses.";
        setAddressError(message);
        setAddressSuggestions([]);
      } finally {
        if (!controller.signal.aborted) {
          setIsAddressLoading(false);
        }
      }
    }, 300);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [addressQuery]);

  useEffect(() => {
    const hasCountry = (familyForm.country ?? "").trim() !== "";
    const hasPostalOrCity =
      (familyForm.postalCode ?? "").trim() !== "" ||
      (familyForm.city ?? "").trim() !== "";

    if (!hasCountry && hasPostalOrCity) {
      setFamilyForm((prev) => {
        if ((prev.country ?? "").trim() !== "") {
          return prev;
        }
        return { ...prev, country: "France" };
      });
    }
  }, [familyForm.postalCode, familyForm.city, familyForm.country]);

  const orderedFamilies = useMemo(
    () =>
      [...families].sort((a, b) =>
        a.id.localeCompare(b.id, undefined, { numeric: true }),
      ),
    [families],
  );

  const filteredFamilies = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    const hasFilters = Object.values(searchFilters).some((value) => value.trim() !== "");

    if (!term && !hasFilters) {
      return orderedFamilies;
    }

    return orderedFamilies.filter((family) => {
      if (hasFilters) {
        const matches = [
          !searchFilters.lastName || family.lastName.toLowerCase().includes(searchFilters.lastName.toLowerCase()),
          !searchFilters.firstName || family.firstName.toLowerCase().includes(searchFilters.firstName.toLowerCase()),
          !searchFilters.address || (family.address ?? "").toLowerCase().includes(searchFilters.address.toLowerCase()),
          !searchFilters.postalCode || (family.postalCode ?? "").toLowerCase().includes(searchFilters.postalCode.toLowerCase()),
          !searchFilters.city || (family.city ?? "").toLowerCase().includes(searchFilters.city.toLowerCase()),
          !searchFilters.country || (family.country ?? "").toLowerCase().includes(searchFilters.country.toLowerCase()),
          !searchFilters.phone1 || (family.phone1 ?? "").toLowerCase().includes(searchFilters.phone1.toLowerCase()),
          !searchFilters.phone2 || (family.phone2 ?? "").toLowerCase().includes(searchFilters.phone2.toLowerCase()),
          !searchFilters.email || (family.email ?? "").toLowerCase().includes(searchFilters.email.toLowerCase()),
          !searchFilters.partner || (family.partner ?? "").toLowerCase().includes(searchFilters.partner.toLowerCase()),
          !searchFilters.childLastName ||
            family.children.some((child) =>
              (child.lastName ?? "").toLowerCase().includes(searchFilters.childLastName.toLowerCase()),
            ),
          !searchFilters.childFirstName ||
            family.children.some((child) =>
              (child.firstName ?? "").toLowerCase().includes(searchFilters.childFirstName.toLowerCase()),
            ),
          !searchFilters.childBirthDate ||
            family.children.some(
              (child) =>
                (child.birthDate ?? "").toLowerCase().startsWith(searchFilters.childBirthDate.toLowerCase()) ||
                (child.birthDate ?? "").toLowerCase().includes(searchFilters.childBirthDate.toLowerCase()),
            ),
        ];

        if (matches.some((value) => value === false)) {
          return false;
        }
      }

      if (!term) {
        return true;
      }

      const haystack = [
        family.id,
        family.lastName,
        family.firstName,
        family.postalCode,
        family.city,
        family.address,
        family.complement,
        family.phone1,
        family.phone2,
        family.email,
        family.partner,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return haystack.includes(term);
    });
  }, [orderedFamilies, searchFilters, searchTerm]);

  const displayedFamilies = useMemo(
    () => filteredFamilies,
    [filteredFamilies],
  );

  const paddedFamilies = useMemo(() => {
    const rows: (FamilyRecord | null)[] = [...displayedFamilies];
    while (rows.length < 5) {
      rows.push(null);
    }
    return rows;
  }, [displayedFamilies]);

  const activeHealthChild = useMemo(() => {
    if (!healthModalChildId) {
      return null;
    }

    return (
      familyForm.children.find((child) => child.id === healthModalChildId) ??
      null
    );
  }, [healthModalChildId, familyForm.children]);

  const secondaryContactInfo = familyForm.secondaryContact;
  const hasSecondaryContactInfo = !isSecondaryContactEmpty(
    secondaryContactInfo,
  );
  const secondaryContactFullName = [
    secondaryContactInfo.firstName.trim(),
    secondaryContactInfo.lastName.trim(),
  ]
    .filter(Boolean)
    .join(" ");
  const canDeleteFamily = Boolean(selectedFamilyId || familyForm.rowId);

  const handleFamilyFieldChange =
    (field: FamilyEditableField) =>
    (event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      const value = event.target.value;
      setFamilyForm((prev) => ({
        ...prev,
        [field]: value,
      }));
      setIsDirty(true);
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
      setIsDirty(true);
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
      setIsDirty(true);
    };

  const handlePostalCodeChange = (event: ChangeEvent<HTMLInputElement>) => {
    const value = normalizePostalCode(event.target.value);
    setFamilyForm((prev) => ({
      ...prev,
      postalCode: value,
    }));
    setCityOptions([]);
    setCityLookupError(null);
    setIsDirty(true);
  };

  const handleCityManualChange = (
    event: ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const value = event.target.value;
    setFamilyForm((prev) => ({
      ...prev,
      city: value,
    }));
    setIsDirty(true);
  };

  const handlePhoneChange =
    (field: "phone1" | "phone2") =>
    (event: ChangeEvent<HTMLInputElement>) => {
      const formatted = formatFrenchPhoneNumber(event.target.value);
    setFamilyForm((prev) => ({
      ...prev,
      [field]: formatted,
    }));
    setIsDirty(true);
  };

  const handleSelectFamily = (familyId: string) => {
    if (isDirty) {
      alert("Enregistrez ou annulez les modifications avant de changer de fiche.");
      return;
    }
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
    setIsSecondaryContactModalOpen(false);
    setIsDirty(false);
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
    setIsSecondaryContactModalOpen(false);
    setIsDirty(false);
  }, [nextFamilyId]);

  const handleCreateNewFamily = () => {
    if (isDirty) {
      alert("Enregistrez ou annulez les modifications avant de créer une nouvelle fiche.");
      return;
    }
    const freshId = nextFamilyId;
    setSelectedFamilyId(freshId);
    setFamilyForm(createEmptyFamilyForm(freshId));
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
    setIsSecondaryContactModalOpen(false);
    setIsDirty(true);
  };

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
      const existingFamily = families.find(
        (family) => family.id === record.id,
      );
      const actionType: "insert" | "update" = existingFamily
        ? "update"
        : "insert";

      // Sauvegarder en base de données
      const savedFamily = await saveFamily(record);

      const recordIdForLog =
        savedFamily.rowId ?? existingFamily?.rowId ?? undefined;

      if (recordIdForLog !== undefined) {
        await logEdit({
          action: actionType,
          tableName: "clients",
          recordId: recordIdForLog,
          before: existingFamily ?? null,
          after: savedFamily,
        });
      } else {
        console.warn(
          "[Clients] Impossible d'enregistrer le log : identifiant de fiche introuvable.",
        );
      }

      // Mettre à jour l'état local
      upsertFamiliesState(savedFamily);

      setSelectedFamilyId(savedFamily.id);
      setFamilyForm(mapFamilyRecordToFormState(savedFamily));
      setSecondaryContactEnabled(Boolean(savedFamily.secondaryContact));
      if (savedFamily.city) {
        setCityOptions([savedFamily.city]);
      }
      setFeedback("Fiche famille enregistrée avec succès.");
      setIsDirty(false);
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

  const handleOpenSecondaryContactModal = () => {
    if (!secondaryContactEnabled) {
      setSecondaryContactEnabled(true);
    }
    setIsSecondaryContactModalOpen(true);
  };

  const handleCloseSecondaryContactModal = () => {
    if (isSecondaryContactEmpty(familyForm.secondaryContact)) {
      setSecondaryContactEnabled(false);
      setFamilyForm((current) => ({
        ...current,
        secondaryContact: createEmptySecondaryContact(),
      }));
    }
    setIsSecondaryContactModalOpen(false);
  };

  const handleRemoveSecondaryContact = () => {
    setSecondaryContactEnabled(false);
    setFamilyForm((current) => ({
      ...current,
      secondaryContact: createEmptySecondaryContact(),
    }));
    setIsSecondaryContactModalOpen(false);
  };

  const handleDeleteFamily = async () => {
    const targetId = selectedFamilyId ?? familyForm.id.trim();

    if (!canDeleteFamily || !targetId) {
      return;
    }

     const familyToDelete = families.find((family) => family.id === targetId);

    const confirmation = window.confirm(
      "Confirmer la suppression de cette fiche famille ?",
    );

    if (!confirmation) {
      return;
    }

    setIsDeleting(true);
    setSaveError(null);
    setFeedback(null);

    try {
      await deleteFamily(targetId);
      setFamilies((prev) => prev.filter((family) => family.id !== targetId));
      resetFamilyForms();
      setFeedback("Fiche famille supprimée.");

      const recordIdForLog = familyToDelete?.rowId;

      if (recordIdForLog !== undefined) {
        await logEdit({
          action: "delete",
          tableName: "clients",
          recordId: recordIdForLog,
          before: familyToDelete ?? null,
          after: null,
        });
      } else {
        console.warn(
          "[Clients] Impossible de consigner la suppression : identifiant de fiche introuvable.",
        );
      }
    } catch (error) {
      console.error("Erreur lors de la suppression de la famille:", error);
      setSaveError(
        error instanceof Error
          ? error.message
          : "Erreur lors de la suppression de la fiche famille.",
      );
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCreateChildRegistration = (childId: string) => {
    const child = familyForm.children.find((item) => item.id === childId);

    if (!child) {
      setFeedback("Impossible de trouver les informations de l'enfant.");
      return;
    }

    const params = new URLSearchParams({
      mode: "new",
      idClient: familyForm.id,
      childId,
      childFirstName: child.firstName,
      childLastName: child.lastName,
      childBirthDate: child.birthDate,
      childGender: child.gender ?? "",
    });

    router.push(`/fiche?${params.toString()}`);
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
    setIsDirty(true);

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
      const existingFamily = families.find(
        (family) => family.id === record.id,
      );
      const savedFamily = await saveFamily(record);

      const recordIdForLog =
        savedFamily.rowId ?? existingFamily?.rowId ?? undefined;

      if (recordIdForLog !== undefined) {
        // Logging disabled here to éviter les erreurs console lors de l'ajout d'un enfant.
        // await logEdit({ ... });
      } else {
        console.warn(
          "[Clients] Impossible de consigner l'ajout d'enfant : identifiant client introuvable.",
        );
      }

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
    setIsDirty(true);
  };

  const handleSearchFilterChange =
    (field: keyof typeof searchFilters) =>
    (event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      const value = event.target.value;
      setSearchFilters((prev) => ({ ...prev, [field]: value }));
    };

  const handleSearchFiltersKeyDown = (
    event: KeyboardEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    if (event.key === "Enter") {
      event.preventDefault();
      setIsSearchPanelOpen(false);
    }
  };

  useEffect(() => {
    const handleGlobalShortcut = (event: globalThis.KeyboardEvent) => {
      const isCmdK =
        event.key.toLowerCase() === "k" &&
        (event.metaKey || event.ctrlKey);
      const isEsc = event.key === "Escape";

      if (isCmdK) {
        event.preventDefault();
        if (isDirty) {
          alert("Enregistrez ou annulez les modifications avant de rechercher.");
          return;
        }
        setIsSearchPanelOpen((prev) => !prev);
        const target =
          searchFilterRefs.lastUsed.current ?? searchFilterRefs.primary.current;
        if (target) {
          target.focus();
          if ("select" in target) {
            target.select();
          }
        }
      }

      if (isEsc) {
        event.preventDefault();
        setIsSearchPanelOpen(false);
      }
    };

    window.addEventListener("keydown", handleGlobalShortcut);
    return () => window.removeEventListener("keydown", handleGlobalShortcut);
  }, [isDirty, searchFilterRefs.primary, searchFilterRefs.lastUsed]);

  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (isDirty) {
        event.preventDefault();
        event.returnValue = "";
      }
    };
    const handleClickCapture = (event: MouseEvent) => {
      if (!isDirty) return;
      const target = event.target as HTMLElement | null;
      const link = target?.closest("a");
      if (link) {
        event.preventDefault();
        event.stopPropagation();
        alert("Enregistrez ou annulez les modifications avant de quitter la fiche.");
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    document.addEventListener("click", handleClickCapture, true);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      document.removeEventListener("click", handleClickCapture, true);
    };
  }, [isDirty]);

  const handleRowKeyDown =
    (familyId: string) => (event: KeyboardEvent<HTMLTableRowElement>) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        handleSelectFamily(familyId);
      }
    };

  const handleAddressChange = (event: ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setFamilyForm((prev) => ({
      ...prev,
      address: value,
    }));
    setAddressQuery(value);
    setIsDirty(true);
  };

  const handleSelectAddressSuggestion = (suggestion: AddressSuggestion) => {
    setFamilyForm((prev) => ({
      ...prev,
      address: suggestion.address || suggestion.label,
      city: suggestion.city || prev.city,
      postalCode: suggestion.postcode || prev.postalCode,
      country: prev.country || "France",
    }));
    setAddressQuery("");
    setAddressSuggestions([]);
    setIsAddressLoading(false);
    setAddressError(null);
    setIsDirty(true);
  };

  const formatClientName = (family: FamilyRecord) => {
    const civ = family.civility ? `${family.civility} ` : "";
    const last = family.lastName ? family.lastName.toUpperCase() : "";
    const first = family.firstName ?? "";
    return `${civ}${first} ${last}`.trim();
  };
  const fieldBg = isDirty ? "bg-white" : "bg-[#f5f5f5]";

  return (
    <div className="min-h-screen bg-neutral-50 py-12">
      <div className="flex w-full flex-col gap-10 px-6 text-[#2b2f36] md:px-10 xl:px-16">
        <header className="mx-auto w-full max-w-6xl rounded-3xl border border-[#d4d7df] bg-[#FFF8F6] shadow-xl">
          <div className="flex flex-col gap-4 px-8 py-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight text-[#1f2330]">
                Dossiers Clients
              </h1>
            </div>
            <div className="flex flex-wrap items-center gap-3 text-sm text-[#2b2f36]">
              <button
                type="button"
                className="inline-flex items-center gap-2 rounded-md border border-[#ccd0d8] bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-[#2b2f36] transition hover:border-[#7f8696] hover:bg-[#f7f8fb]"
                onClick={() => {
                  if (isDirty) {
                    alert("Enregistrez ou annulez les modifications avant de rechercher.");
                    return;
                  }
                  if (isSearchPanelOpen) {
                    setSearchFilters(createEmptySearchFilters());
                    searchFilterRefs.lastUsed.current = null;
                    setIsSearchPanelOpen(false);
                  } else {
                    setIsSearchPanelOpen(true);
                    const target =
                      searchFilterRefs.lastUsed.current ?? searchFilterRefs.primary.current;
                    if (target) {
                      target.focus();
                      if ("select" in target) {
                        target.select();
                      }
                    }
                  }
                }}
              >
                <Search className="size-4 text-[#7f8696]" />
                {isSearchPanelOpen ? "Fermer la recherche" : "Ouvrir la recherche"}
              </button>
            </div>
          </div>
          <div className="px-8 pb-4 text-sm text-[#5c606b]">
            {filteredFamilies.length > 1
              ? `Résultats : ${filteredFamilies.length}`
              : `Résultat : ${filteredFamilies.length}`}
          </div>
          {isSearchPanelOpen ? (
            <div className="mx-auto mb-4 grid w-full max-w-5xl gap-3 rounded-2xl border border-[#d4d7df] bg-white p-4 text-sm text-[#2b2f36] shadow-sm">
              <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-[0.16em] text-[#5c606b]">
                <span>Mode recherche</span>
              </div>
              <div className="grid gap-3 md:grid-cols-3">
                <label className="flex flex-col gap-1">
                  <span className="text-xs font-semibold uppercase tracking-[0.12em] text-[#5c606b]">
                    Nom
                  </span>
                  <input
                    className="rounded border border-[#ccd0d8] bg-white px-3 py-2 outline-none focus:border-[#7f8696]"
                    ref={searchFilterRefs.primary}
                    value={searchFilters.lastName}
                    onChange={handleSearchFilterChange("lastName")}
                    onKeyDown={handleSearchFiltersKeyDown}
                    onFocus={(event) => {
                      searchFilterRefs.lastUsed.current = event.currentTarget;
                    }}
                  />
                </label>
                <label className="flex flex-col gap-1">
                  <span className="text-xs font-semibold uppercase tracking-[0.12em] text-[#5c606b]">
                    Prénom
                  </span>
                  <input
                    className="rounded border border-[#ccd0d8] bg-white px-3 py-2 outline-none focus:border-[#7f8696]"
                    value={searchFilters.firstName}
                    onChange={handleSearchFilterChange("firstName")}
                    onKeyDown={handleSearchFiltersKeyDown}
                    onFocus={(event) => {
                      searchFilterRefs.lastUsed.current = event.currentTarget;
                    }}
                  />
                </label>
                <label className="flex flex-col gap-1">
                  <span className="text-xs font-semibold uppercase tracking-[0.12em] text-[#5c606b]">
                    Adresse
                  </span>
                  <input
                    className="rounded border border-[#ccd0d8] bg-white px-3 py-2 outline-none focus:border-[#7f8696]"
                    value={searchFilters.address}
                    onChange={handleSearchFilterChange("address")}
                    onKeyDown={handleSearchFiltersKeyDown}
                    onFocus={(event) => {
                      searchFilterRefs.lastUsed.current = event.currentTarget;
                    }}
                  />
                </label>
              </div>

              <div className="grid gap-3 md:grid-cols-3">
                <label className="flex flex-col gap-1">
                  <span className="text-xs font-semibold uppercase tracking-[0.12em] text-[#5c606b]">
                    Email
                  </span>
                  <input
                    className="rounded border border-[#ccd0d8] bg-white px-3 py-2 outline-none focus:border-[#7f8696]"
                    value={searchFilters.email}
                    onChange={handleSearchFilterChange("email")}
                    onKeyDown={handleSearchFiltersKeyDown}
                    onFocus={(event) => {
                      searchFilterRefs.lastUsed.current = event.currentTarget;
                    }}
                    inputMode="email"
                  />
                </label>
                <label className="flex flex-col gap-1">
                  <span className="text-xs font-semibold uppercase tracking-[0.12em] text-[#5c606b]">
                    Téléphone 1
                  </span>
                  <input
                    className="rounded border border-[#ccd0d8] bg-white px-3 py-2 outline-none focus:border-[#7f8696]"
                    value={searchFilters.phone1}
                    onChange={handleSearchFilterChange("phone1")}
                    onKeyDown={handleSearchFiltersKeyDown}
                    onFocus={(event) => {
                      searchFilterRefs.lastUsed.current = event.currentTarget;
                    }}
                    inputMode="tel"
                  />
                </label>
                <label className="flex flex-col gap-1">
                  <span className="text-xs font-semibold uppercase tracking-[0.12em] text-[#5c606b]">
                    Téléphone 2
                  </span>
                  <input
                    className="rounded border border-[#ccd0d8] bg-white px-3 py-2 outline-none focus:border-[#7f8696]"
                    value={searchFilters.phone2}
                    onChange={handleSearchFilterChange("phone2")}
                    onKeyDown={handleSearchFiltersKeyDown}
                    onFocus={(event) => {
                      searchFilterRefs.lastUsed.current = event.currentTarget;
                    }}
                    inputMode="tel"
                  />
                </label>
              </div>

              <div className="grid gap-3 md:grid-cols-[repeat(3,minmax(0,1fr))]">
                <label className="flex flex-col gap-1">
                  <span className="text-xs font-semibold uppercase tracking-[0.12em] text-[#5c606b]">
                    Code postal
                  </span>
                  <input
                    className="rounded border border-[#ccd0d8] bg-white px-3 py-2 outline-none focus:border-[#7f8696]"
                    value={searchFilters.postalCode}
                    onChange={handleSearchFilterChange("postalCode")}
                    onKeyDown={handleSearchFiltersKeyDown}
                    onFocus={(event) => {
                      searchFilterRefs.lastUsed.current = event.currentTarget;
                    }}
                    inputMode="numeric"
                    maxLength={10}
                  />
                </label>
                <label className="flex flex-col gap-1">
                  <span className="text-xs font-semibold uppercase tracking-[0.12em] text-[#5c606b]">
                    Ville
                  </span>
                  <input
                    className="rounded border border-[#ccd0d8] bg-white px-3 py-2 outline-none focus:border-[#7f8696]"
                    value={searchFilters.city}
                    onChange={handleSearchFilterChange("city")}
                    onKeyDown={handleSearchFiltersKeyDown}
                    onFocus={(event) => {
                      searchFilterRefs.lastUsed.current = event.currentTarget;
                    }}
                  />
                </label>
                <label className="flex flex-col gap-1">
                  <span className="text-xs font-semibold uppercase tracking-[0.12em] text-[#5c606b]">
                    Pays
                  </span>
                  <input
                    className="rounded border border-[#ccd0d8] bg-white px-3 py-2 outline-none focus:border-[#7f8696]"
                    value={searchFilters.country}
                    onChange={handleSearchFilterChange("country")}
                    onKeyDown={handleSearchFiltersKeyDown}
                    onFocus={(event) => {
                      searchFilterRefs.lastUsed.current = event.currentTarget;
                    }}
                  />
                </label>
              </div>

              <div className="grid gap-3 md:grid-cols-[2fr_1fr]">
                <label className="flex flex-col gap-1">
                  <span className="text-xs font-semibold uppercase tracking-[0.12em] text-[#5c606b]">
                    Partenaire principal
                  </span>
                  <input
                    className="rounded border border-[#ccd0d8] bg-white px-3 py-2 outline-none focus:border-[#7f8696]"
                    value={searchFilters.partner}
                    onChange={handleSearchFilterChange("partner")}
                    onKeyDown={handleSearchFiltersKeyDown}
                    onFocus={(event) => {
                      searchFilterRefs.lastUsed.current = event.currentTarget;
                    }}
                  />
                </label>
                <div />
              </div>

              <div className="grid gap-3 md:grid-cols-3">
                <label className="flex flex-col gap-1">
                  <span className="text-xs font-semibold uppercase tracking-[0.12em] text-[#5c606b]">
                    Nom de l&apos;enfant
                  </span>
                  <input
                    className="rounded border border-[#ccd0d8] bg-white px-3 py-2 outline-none focus:border-[#7f8696]"
                    value={searchFilters.childLastName}
                    onChange={handleSearchFilterChange("childLastName")}
                    onKeyDown={handleSearchFiltersKeyDown}
                    onFocus={(event) => {
                      searchFilterRefs.lastUsed.current = event.currentTarget;
                    }}
                  />
                </label>
                <label className="flex flex-col gap-1">
                  <span className="text-xs font-semibold uppercase tracking-[0.12em] text-[#5c606b]">
                    Prénom de l&apos;enfant
                  </span>
                  <input
                    className="rounded border border-[#ccd0d8] bg-white px-3 py-2 outline-none focus:border-[#7f8696]"
                    value={searchFilters.childFirstName}
                    onChange={handleSearchFilterChange("childFirstName")}
                    onKeyDown={handleSearchFiltersKeyDown}
                    onFocus={(event) => {
                      searchFilterRefs.lastUsed.current = event.currentTarget;
                    }}
                  />
                </label>
                <label className="flex flex-col gap-1">
                  <span className="text-xs font-semibold uppercase tracking-[0.12em] text-[#5c606b]">
                    Date de naissance (enfant)
                  </span>
                  <input
                    type="date"
                    className="rounded border border-[#ccd0d8] bg-white px-3 py-2 outline-none focus:border-[#7f8696]"
                    value={searchFilters.childBirthDate}
                    onChange={handleSearchFilterChange("childBirthDate")}
                    onKeyDown={handleSearchFiltersKeyDown}
                    onFocus={(event) => {
                      searchFilterRefs.lastUsed.current = event.currentTarget;
                    }}
                  />
                </label>
              </div>
            </div>
          ) : null}
          <div className="mx-auto mb-6 w-full max-w-5xl overflow-hidden rounded-2xl border border-[#e6e9f0] bg-red-200 shadow-sm">
            <div
              className="max-h-[300px] overflow-y-auto overscroll-y-contain touch-pan-y sm:max-h-[320px]"
              style={{ WebkitOverflowScrolling: "touch" }}
            >
              <table className="w-full border-collapse bg-white text-sm text-[#2b2f36]">
                <thead className="sticky top-0 z-10 bg-[#A56A57] text-left text-xs font-semibold uppercase tracking-[0.18em] text-white shadow">
                  <tr>
                    <th className="px-5 py-3">ID client</th>
                    <th className="px-5 py-3">Client</th>
                    <th className="px-5 py-3">Code postal</th>
                    <th className="px-5 py-3">Ville</th>
                  </tr>
                </thead>
                <tbody className="bg-white">
                  {paddedFamilies.every((item) => item === null) ? (
                    <tr>
                      <td
                        className="px-5 py-6 text-center text-sm text-[#7f8696]"
                        colSpan={4}
                      >
                        Aucune famille enregistrée pour le moment.
                      </td>
                    </tr>
                  ) : (
                    paddedFamilies.map((item, index) => {
                      if (!item) {
                        return (
                          <tr
                            key={`placeholder-${index}`}
                            className="border-t border-[#e3e6ed] bg-white/60 text-[#9aa0ad]"
                          >
                            <td className="px-5 py-3">—</td>
                            <td className="px-5 py-3">—</td>
                            <td className="px-5 py-3">—</td>
                            <td className="px-5 py-3">—</td>
                          </tr>
                        );
                      }

                      const isSelected = selectedFamilyId === item.id;
                      return (
                        <tr
                          key={item.id}
                        className={`cursor-pointer border-t border-[#e3e6ed] transition hover:bg-[#f7f8fb] focus:bg-[#f0f3f8] ${isSelected ? "bg-[#f0f3f8]" : ""}`}
                          onClick={() => handleSelectFamily(item.id)}
                          onKeyDown={handleRowKeyDown(item.id)}
                          tabIndex={0}
                          role="button"
                          aria-pressed={isSelected}
                        >
                          <td className="px-5 py-3 font-semibold text-[#1f2330]">
                            {item.id}
                          </td>
                          <td className="px-5 py-3 text-[#2b2f36]">
                            {formatClientName(item)}
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
          </div>
        </header>

        <section className="mx-auto w-full max-w-6xl rounded-3xl border border-[#d4d7df] bg-[#FDEFE8] shadow-xl">
          <header className="rounded-t-3xl bg-[#97163a] px-8 py-5 text-white">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <h2 className="text-2xl font-semibold tracking-tight">
                  Informations Client
                </h2>
                {selectedFamilyId ? (
                  <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em]">
                    <span className="text-white/80">ID client</span>
                    <input
                      className="h-8 w-28 rounded-md border border-white/30 bg-white/10 px-3 text-sm text-white outline-none placeholder:text-white/60"
                      value={familyForm.id}
                      readOnly
                    />
                  </div>
                ) : null}
              </div>
              <div className="flex flex-wrap items-center gap-2 text-xs uppercase tracking-[0.16em]">
                <button
                  type="button"
                  className="group relative inline-flex size-9 items-center justify-center rounded-full border border-white/30 bg-white/10 text-white transition hover:bg-white/20 cursor-pointer"
                  onClick={handleCreateNewFamily}
                >
                  <Plus className="size-4" />
                  <span className="sr-only">Ajouter</span>
                  <span className="pointer-events-none absolute -bottom-9 left-1/2 -translate-x-1/2 rounded-md bg-[#1f2330] px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-white opacity-0 shadow-sm transition group-hover:opacity-100">
                    Ajouter
                  </span>
                </button>
                <button
                  type="button"
                  className="group relative inline-flex size-9 items-center justify-center rounded-full border border-white/30 bg-white/10 text-white transition hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  onClick={handleDeleteFamily}
                  disabled={!canDeleteFamily || isDeleting || isSaving}
                >
                  <Trash2 className="size-4" />
                  <span className="sr-only">Supprimer</span>
                  <span className="pointer-events-none absolute -bottom-9 left-1/2 -translate-x-1/2 rounded-md bg-[#1f2330] px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-white opacity-0 shadow-sm transition group-hover:opacity-100">
                    Supprimer
                  </span>
                </button>
                <button
                  type="submit"
                  form="family-form"
                  className="group relative inline-flex size-9 items-center justify-center rounded-full border border-white/30 bg-white/10 text-white transition hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  disabled={isSaving || isDeleting}
                  title="Enregistrer"
                >
                  <Save className="size-4" />
                  <span className="sr-only">Enregistrer</span>
                  <span className="pointer-events-none absolute -bottom-9 left-1/2 -translate-x-1/2 rounded-md bg-[#1f2330] px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-white opacity-0 shadow-sm transition group-hover:opacity-100">
                    Enregistrer
                  </span>
                </button>
                <button
                  type="button"
                  className="group relative inline-flex size-9 items-center justify-center rounded-full border border-white/30 bg-white/10 text-white transition hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  onClick={resetFamilyForms}
                  disabled={isSaving || isDeleting}
                  title="Annuler"
                >
                  <Undo2 className="size-4" />
                  <span className="sr-only">Annuler les modifications</span>
                  <span className="pointer-events-none absolute -bottom-9 left-1/2 -translate-x-1/2 rounded-md bg-[#1f2330] px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-white opacity-0 shadow-sm transition group-hover:opacity-100">
                    Annuler
                  </span>
                </button>
              </div>
            </div>
          </header>

          {selectedFamilyId ? (
            <form
              id="family-form"
              className="grid gap-8 rounded-b-3xl bg-white px-8 py-8 text-[#2b2f36]"
              onSubmit={handleSaveFamily}
              noValidate
            >
              <div className="space-y-8">
                <div className="rounded-xl bg-[#1f2330] p-5 text-white">
                  <div className="grid gap-3 text-xs font-semibold uppercase tracking-[0.18em] sm:grid-cols-2 lg:grid-cols-[repeat(4,minmax(0,1fr))]">
                    <label className="space-y-1">
                      <span>Civilité</span>
                      <select
                        className={`w-full rounded-lg border border-[#4b5163] px-3 py-2 text-sm font-medium text-[#1f2330] outline-none ${fieldBg}`}
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
                        className={`w-full rounded-lg border border-[#4b5163] px-3 py-2 text-sm font-medium text-[#1f2330] outline-none ${fieldBg}`}
                        value={familyForm.lastName}
                        onChange={handleFamilyFieldChange("lastName")}
                        placeholder="Nom"
                      />
                    </label>
                    <label className="space-y-1">
                      <span>Prénom</span>
                      <input
                        className={`w-full rounded-lg border border-[#4b5163] px-3 py-2 text-sm font-medium text-[#1f2330] outline-none ${fieldBg}`}
                        value={familyForm.firstName}
                        onChange={handleFamilyFieldChange("firstName")}
                        placeholder="Prénom"
                      />
                    </label>
                  </div>
                </div>

                <div className="grid gap-6 lg:grid-cols-[320px_1fr_1fr] items-start">
                  <aside className="space-y-5 text-sm lg:row-span-2">
                    <div className="space-y-3 rounded-xl border border-[#e3e6ed] bg-[#f7f8fb] p-5">
                      <h3 className="text-xs font-semibold uppercase tracking-[0.16em] text-[#5c606b]">
                        Parent 2
                      </h3>
                      <p className="text-xs text-[#6d7280]">
                        Ajouter un responsable secondaire au dossier famille.
                      </p>
                      <div className="space-y-3">
                        <button
                          type="button"
                          className="inline-flex w-full items-center justify-center gap-2 rounded-md border border-[#d4d7df] bg-white px-3 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-[#2b2f36] transition hover:bg-[#f0f3f8] cursor-pointer"
                          onClick={handleOpenSecondaryContactModal}
                        >
                          {secondaryContactEnabled ? (
                            <>
                              <NotebookPen className="size-4" />
                              Modifier le parent 2
                            </>
                          ) : (
                            <>
                              <UserRoundPlus className="size-4" />
                              Ajouter le parent 2
                            </>
                          )}
                        </button>
                        {secondaryContactEnabled ? (
                          <>
                            <div className="rounded-lg border border-[#d4d7df] bg-white px-4 py-3 text-xs text-[#2b2f36] shadow-sm">
                              <p className="font-semibold uppercase tracking-[0.12em] text-[#1f2330]">
                                {secondaryContactFullName || "Informations à compléter"}
                              </p>
                              <p className="mt-1 text-[11px] font-medium uppercase tracking-[0.14em] text-[#5c606b]">
                                {secondaryContactInfo.role || "Rôle non renseigné"}
                              </p>
                              <div className="mt-3 space-y-1 text-sm">
                                {secondaryContactInfo.phone ? (
                                  <p className="text-[#2b2f36]">
                                    Tél. {secondaryContactInfo.phone}
                                  </p>
                                ) : null}
                                {secondaryContactInfo.email ? (
                                  <p className="text-[#2b2f36]">
                                    {secondaryContactInfo.email}
                                  </p>
                                ) : null}
                                {!hasSecondaryContactInfo ? (
                                  <p className="text-[#6d7280]">
                                    Aucun détail renseigné pour l&apos;instant.
                                  </p>
                                ) : null}
                              </div>
                            </div>
                            <button
                              type="button"
                              className="inline-flex w-full items-center justify-center gap-2 rounded-md border border-[#d4d7df] bg-white px-3 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-[#2b2f36] transition hover:bg-[#f0f3f8] cursor-pointer"
                              onClick={handleRemoveSecondaryContact}
                            >
                              Retirer le parent 2
                            </button>
                          </>
                        ) : null}
                      </div>
                    </div>
                  </aside>

                  <div className="space-y-4 text-sm text-[#2b2f36] lg:col-span-2">
                    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                      <label className="flex flex-col gap-1 md:col-span-2 xl:col-span-2">
                        <span className="text-xs font-semibold uppercase tracking-[0.14em] text-[#5c606b]">
                          Adresse
                        </span>
                        <input
                          className={`rounded border border-[#d4d7df] px-3 py-2 text-[#2b2f36] focus:border-[#7f8696] focus:outline-none ${fieldBg}`}
                          value={familyForm.address}
                          onChange={handleAddressChange}
                          placeholder="N° et rue"
                        />
                        {addressError ? (
                          <p className="mt-1 text-xs font-semibold text-red-600">
                            {addressError}
                          </p>
                        ) : null}
                        {isAddressLoading ? (
                          <p className="mt-1 text-xs text-[#5c606b]">
                            Recherche d&apos;adresses...
                          </p>
                        ) : null}
                        {addressSuggestions.length > 0 ? (
                          <div className="mt-2 rounded-lg border border-[#ccd0d8] bg-white shadow-lg">
                            <ul className="divide-y divide-[#e7e9ef]">
                              {addressSuggestions.map((suggestion, index) => (
                                <li
                                  key={`${suggestion.label}-${index}`}
                                  className="cursor-pointer px-3 py-2 text-sm hover:bg-[#f7f8fb]"
                                  onClick={() => handleSelectAddressSuggestion(suggestion)}
                                >
                                  <p className="font-semibold text-[#1f2330]">
                                    {suggestion.label}
                                  </p>
                                  <p className="text-xs text-[#5c606b]">
                                    {suggestion.postcode} {suggestion.city}
                                  </p>
                                </li>
                              ))}
                            </ul>
                          </div>
                        ) : null}
                      </label>
                      <label className="flex flex-col gap-1">
                        <span className="text-xs font-semibold uppercase tracking-[0.14em] text-[#5c606b]">
                          Téléphone 1
                        </span>
                        <input
                          className={`rounded border border-[#d4d7df] px-3 py-2 text-[#2b2f36] focus:border-[#7f8696] focus:outline-none ${fieldBg}`}
                          value={familyForm.phone1}
                          onChange={handlePhoneChange("phone1")}
                          placeholder="07 71 07 26 55"
                          inputMode="tel"
                          maxLength={14}
                        />
                      </label>

                      <label className="flex flex-col gap-1 md:col-span-2 xl:col-span-2">
                        <span className="text-xs font-semibold uppercase tracking-[0.14em] text-[#5c606b]">
                          Complément
                        </span>
                        <input
                          className={`rounded border border-[#d4d7df] px-3 py-2 text-[#2b2f36] focus:border-[#7f8696] focus:outline-none ${fieldBg}`}
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
                      <div className="flex flex-col gap-1 md:col-span-2 xl:col-span-2">
                        <span className="text-xs font-semibold uppercase tracking-[0.14em] text-[#5c606b]">
                          Code postal et ville
                        </span>
                        <div className="grid grid-cols-[120px_1fr] gap-3">
                          <input
                            className={`rounded border border-[#d4d7df] px-3 py-2 text-[#2b2f36] focus:border-[#7f8696] focus:outline-none ${fieldBg}`}
                            value={familyForm.postalCode}
                            onChange={handlePostalCodeChange}
                            placeholder="75017"
                            inputMode="numeric"
                          />
                          {cityOptions.length > 1 ? (
                            <select
                              className={`rounded border border-[#d4d7df] px-3 py-2 text-sm text-[#2b2f36] focus:border-[#7f8696] focus:outline-none ${fieldBg}`}
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
                              className={`rounded border border-[#d4d7df] px-3 py-2 text-sm text-[#2b2f36] focus:border-[#7f8696] focus:outline-none ${fieldBg}`}
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
                      <label className="flex flex-col gap-1">
                        <span className="text-xs font-semibold uppercase tracking-[0.14em] text-[#5c606b]">
                          Mail
                        </span>
                        <input
                          className={`rounded border border-[#d4d7df] px-3 py-2 text-[#2b2f36] focus:border-[#7f8696] focus:outline-none ${fieldBg}`}
                          value={familyForm.email}
                          onChange={handleFamilyFieldChange("email")}
                          placeholder="famille@example.com"
                        />
                      </label>
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
                      <label className="flex flex-col gap-1 md:col-span-2 xl:col-span-1">
                        <span className="text-xs font-semibold uppercase tracking-[0.14em] text-[#5c606b]">
                          Pays
                        </span>
                        <input
                          className={`rounded border border-[#d4d7df] px-3 py-2 text-[#2b2f36] focus:border-[#7f8696] focus:outline-none ${fieldBg}`}
                          value={familyForm.country}
                          onChange={handleFamilyFieldChange("country")}
                          placeholder="France"
                        />
                      </label>
                      <label className="flex flex-col gap-1 md:col-span-2 xl:col-span-3">
                        <span className="text-xs font-semibold uppercase tracking-[0.14em] text-[#5c606b]">
                          Partenaire principal
                        </span>
                        <input
                          className={`rounded border border-[#d4d7df] px-3 py-2 text-[#2b2f36] focus:border-[#7f8696] focus:outline-none ${fieldBg}`}
                          value={familyForm.partner}
                          onChange={handleFamilyFieldChange("partner")}
                          placeholder="Nom du partenaire"
                        />
                      </label>
                    </div>

                    <div className="flex flex-wrap items-center justify-end gap-2 pt-2">
                      <div className="flex flex-col items-end gap-1">
                        {saveError ? (
                          <p className="text-sm font-medium text-red-600">
                            {saveError}
                          </p>
                        ) : feedback ? (
                          <p className="text-sm font-medium text-[#2f7a57]">
                            {feedback}
                          </p>
                        ) : null}
                        {logError ? (
                          <p className="text-xs font-medium uppercase tracking-[0.14em] text-amber-600">
                            Journalisation indisponible : {logError}
                          </p>
                        ) : null}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="space-y-5 rounded-3xl border border-[#e3e6ed] bg-white p-6 shadow-lg w-full">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-[#1f2330]">
                        Informations enfants
                      </h3>
                      <button
                        type="button"
                        className="inline-flex items-center gap-2 rounded-md border border-[#d4d7df] bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-[#2b2f36] transition hover:bg-[#f0f3f8] cursor-pointer"
                        onClick={() => {
                          setIsChildFormOpen((open) => !open);
                          setChildError(null);
                        }}
                      >
                        <UserRoundPlus className="size-3.5" />
                        {isChildFormOpen ? "Fermer" : "Ajouter"}
                      </button>
                    </div>
                    <div className="w-full overflow-hidden rounded-2xl border border-[#d4d7df]">
                      <table className="w-full border-collapse text-sm text-[#2b2f36]">
                        <thead className="bg-[#2f3442] text-xs font-semibold uppercase tracking-[0.16em] text-white">
                          <tr>
                            <th className="px-5 py-3 text-left">Nom de famille</th>
                            <th className="px-5 py-3 text-left">Prénom</th>
                            <th className="px-5 py-3 text-left">Date de naissance</th>
                            <th className="px-5 py-3 text-left">Âge</th>
                            <th className="px-5 py-3 text-left">Sexe</th>
                            <th className="px-5 py-3 text-center">
                              <span className="sr-only">Inscription</span>
                            </th>
                            <th className="px-5 py-3 text-center">Infos</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white">
                          {familyForm.children.length === 0 ? (
                            <tr>
                              <td
                                className="px-5 py-6 text-center text-sm text-[#7f8696]"
                                colSpan={7}
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
                                  {formatDateToFrench(child.birthDate)}
                                </td>
                                <td className="px-5 py-3 text-[#2b2f36] whitespace-nowrap min-w-[180px]">
                                  {computeAgeFromBirthDate(child.birthDate)}
                                </td>
                                <td className="px-5 py-3 text-[#2b2f36]">
                                  {child.gender}
                                </td>
                                <td className="px-5 py-3 text-center">
                                  <button
                                    type="button"
                                    className="inline-flex items-center justify-center rounded-full border border-[#d4d7df] bg-white px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#2b2f36] transition hover:border-[#c77845] hover:text-[#c77845] cursor-pointer"
                                    onClick={() => handleCreateChildRegistration(child.id)}
                                    aria-label={`Créer une inscription pour ${child.firstName} ${child.lastName}`}
                                  >
                                    Créer inscription
                                  </button>
                                </td>
                                <td className="px-5 py-3 text-center text-xs uppercase tracking-[0.16em] text-[#5c606b]">
                                  <div className="flex flex-col items-center gap-2">
                                    <button
                                      type="button"
                                      className="rounded-md border border-[#d4d7df] bg-white px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#2b2f36] transition hover:bg-[#f0f3f8] cursor-pointer"
                                      onClick={() => handleOpenHealthModal(child.id)}
                                    >
                                      Infos sanitaire
                                    </button>
                                    <button
                                      type="button"
                                      className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#b45b12] transition hover:text-[#8f4104] cursor-pointer"
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
                              className="rounded border border-[#d4d7df] bg-[#f7f8fb] px-3 py-2 text-[#2b2f36] focus:border-[#7f8696] focus:outline-none min-w-[200px]"
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
                            className="inline-flex items-center gap-2 rounded-md border border-[#d4d7df] bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-[#2b2f36] transition hover:bg-[#f0f3f8] cursor-pointer"
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
                            className="inline-flex items-center gap-2 rounded-md border border-[#b96d3c] bg-[#c77845] px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-white transition hover:bg-[#b45b12] disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
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

                  <div className="grid gap-4 rounded-3xl border border-[#e3e6ed] bg-white p-6 shadow-lg sm:grid-cols-3 lg:grid-cols-6">
                    {quickActions.map(({ id, label, icon: Icon, href }) => {
                      const content = (
                        <div className="flex h-full flex-col items-center justify-center gap-3">
                          <span className="flex size-12 items-center justify-center rounded-full bg-[#2f3442] text-white shadow-lg">
                            <Icon className="size-6" />
                          </span>
                          <span className="leading-tight text-[#2b2f36] text-center">{label}</span>
                        </div>
                      );

                      if (href) {
                        return (
                          <Link
                            key={id}
                            href={href}
                            className="h-full rounded-lg border border-[#e3e6ed] bg-[#f7f8fb] px-4 py-3 text-left text-sm font-semibold uppercase tracking-[0.14em] text-[#2b2f36] transition hover:-translate-y-0.5 hover:border-[#c77845] hover:bg-[#fde2e4] hover:shadow-xl cursor-pointer"
                          >
                            {content}
                          </Link>
                        );
                      }

                      return (
                        <button
                          key={id}
                          type="button"
                          className="h-full rounded-lg border border-[#e3e6ed] bg-[#f7f8fb] px-4 py-3 text-left text-sm font-semibold uppercase tracking-[0.14em] text-[#2b2f36] transition hover:-translate-y-0.5 hover:border-[#c77845] hover:bg-[#fde2e4] hover:shadow-xl cursor-pointer"
                        >
                          {content}
                        </button>
                      );
                    })}
                  </div>

                  <div className="grid gap-4 rounded-2xl border border-[#e3e6ed] bg-white p-6 text-[11px] uppercase tracking-[0.16em] text-[#5c606b] shadow-lg sm:grid-cols-2 lg:grid-cols-4">
                    {auditEntries.map(({ label }) => (
                      <div key={label} className="italic text-[#6b7080]">
                        {label}
                        <p className="mt-1 italic font-semibold text-[#555a66]">
                          A completer
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
          </form>
        ) : (
          <div className="rounded-b-3xl bg-white px-8 py-10 text-sm text-[#5c606b]">
            Sélectionnez un dossier dans le tableau pour afficher la fiche.
          </div>
        )}
        </section>
      </div>

      {isSecondaryContactModalOpen ? (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-neutral-950/70 px-4 py-10 backdrop-blur">
          <div className="relative w-full max-w-xl rounded-2xl border border-[#3f4350] bg-[#2b2f36] p-8 shadow-2xl">
            <button
              type="button"
              className="absolute right-5 top-5 text-sm font-semibold uppercase tracking-[0.16em] text-[#d0d4de] transition hover:text-white"
              onClick={handleCloseSecondaryContactModal}
            >
              Fermer
            </button>
            <header className="mb-4 text-center">
              <h3 className="text-lg font-semibold uppercase tracking-[0.2em] text-white">
                Parent 2
              </h3>
              <p className="mt-1 text-sm text-[#d0d4de]">
                Renseignez les informations du responsable secondaire.
              </p>
            </header>
            <div className="grid gap-4 text-sm text-[#e5e8f0] md:grid-cols-2">
              <label className="flex flex-col gap-1">
                <span className="text-xs font-semibold uppercase tracking-[0.14em] text-[#f0f1f5]">
                  Nom
                </span>
                <input
                  className="rounded border border-white/20 bg-white/90 px-3 py-2 text-[#1f2330] focus:border-[#c77845] focus:outline-none"
                  value={familyForm.secondaryContact.lastName}
                  onChange={handleSecondaryContactChange("lastName")}
                  placeholder="Nom"
                />
              </label>
              <label className="flex flex-col gap-1">
                <span className="text-xs font-semibold uppercase tracking-[0.14em] text-[#f0f1f5]">
                  Prénom
                </span>
                <input
                  className="rounded border border-white/20 bg-white/90 px-3 py-2 text-[#1f2330] focus:border-[#c77845] focus:outline-none"
                  value={familyForm.secondaryContact.firstName}
                  onChange={handleSecondaryContactChange("firstName")}
                  placeholder="Prénom"
                />
              </label>
              <label className="flex flex-col gap-1 md:col-span-2">
                <span className="text-xs font-semibold uppercase tracking-[0.14em] text-[#f0f1f5]">
                  Rôle dans la famille
                </span>
                <input
                  className="rounded border border-white/20 bg-white/90 px-3 py-2 text-[#1f2330] focus:border-[#c77845] focus:outline-none"
                  value={familyForm.secondaryContact.role}
                  onChange={handleSecondaryContactChange("role")}
                  placeholder="Responsable légal, grand-parent..."
                />
              </label>
              <label className="flex flex-col gap-1">
                <span className="text-xs font-semibold uppercase tracking-[0.14em] text-[#f0f1f5]">
                  Téléphone
                </span>
                <input
                  className="rounded border border-white/20 bg-white/90 px-3 py-2 text-[#1f2330] focus:border-[#c77845] focus:outline-none"
                  value={familyForm.secondaryContact.phone}
                  onChange={handleSecondaryContactChange("phone")}
                  placeholder="07 00 00 00 00"
                />
              </label>
              <label className="flex flex-col gap-1">
                <span className="text-xs font-semibold uppercase tracking-[0.14em] text-[#f0f1f5]">
                  Email
                </span>
                <input
                  className="rounded border border-white/20 bg-white/90 px-3 py-2 text-[#1f2330] focus:border-[#c77845] focus:outline-none"
                  value={familyForm.secondaryContact.email}
                  onChange={handleSecondaryContactChange("email")}
                  placeholder="parent@example.com"
                />
              </label>
            </div>
            <div className="mt-6 flex flex-wrap items-center justify-end gap-2">
              <button
                type="button"
                className="inline-flex items-center gap-2 rounded-md border border-[#505664] bg-transparent px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-[#d0d4de] transition hover:bg-[#3a3f4c]"
                onClick={handleCloseSecondaryContactModal}
              >
                Fermer
              </button>
              <button
                type="button"
                className="inline-flex items-center gap-2 rounded-md border border-[#c7433c] bg-[#d65a52] px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-white transition hover:bg-[#b9403a]"
                onClick={handleRemoveSecondaryContact}
              >
                Retirer le parent 2
              </button>
            </div>
          </div>
        </div>
      ) : null}

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

"use client";

import { useRouter } from "next/navigation";
import {
  type ChangeEvent,
  type FormEvent,
  type KeyboardEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { deleteFamily, fetchFamilies, saveFamily } from "@/services/families";
import { upsertSecondaryAdult } from "@/services/adults";
import type {
  FamilyRecord,
  SecondaryContact,
  Child,
  HealthFormState,
} from "@/lib/mappers";
import type {
  ChildFormState,
  FamilyFormState,
  FamilyEditableField,
} from "@/types/famille";
import { useProjectLogger } from "@/hooks/useProjectLogger";
import type { ParentCardData } from "@/components/ParentsGrid";

import type { CityLookupState, AddressSuggestion } from "../_lib/types";
import {
  SEARCH_STATE_STORAGE_KEY,
} from "../_lib/constants";
import {
  createEmptySecondaryContact,
  createEmptyHealthForm,
  createEmptyFamilyForm,
  createEmptyChildForm,
  createEmptySearchFilters,
  mapFamilyRecordToFormState,
  mapFormStateToFamilyRecord,
  generateChildId,
  computeNextFamilyId,
  formatPhoneFR,
  normalizePostalCode,
  normalizeText,
} from "../_lib/helpers";

export function useClientsPage() {
  const router = useRouter();
  const { logEdit, error: logError } = useProjectLogger();

  // ─── State ──────────────────────────────────────────────────

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
  const [editingChildId, setEditingChildId] = useState<string | null>(null);
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

  const [editingAdultIndex, setEditingAdultIndex] = useState<number | null>(
    null,
  );

  // ─── Effects ────────────────────────────────────────────────

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = localStorage.getItem(SEARCH_STATE_STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as {
        filters?: ReturnType<typeof createEmptySearchFilters>;
        term?: string;
        isPanelOpen?: boolean;
      };
      if (parsed.filters) {
        setSearchFilters({ ...createEmptySearchFilters(), ...parsed.filters });
      }
      if (typeof parsed.term === "string") {
        setSearchTerm(parsed.term);
      }
      if (typeof parsed.isPanelOpen === "boolean") {
        setIsSearchPanelOpen(parsed.isPanelOpen);
      }
    } catch (error) {
      console.error("Impossible de restaurer l'état de recherche:", error);
    }
  }, []);

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
          throw new Error("reponse invalide du service postal.");
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
            : "Impossible de recuperer la ville.";

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
          features: Array<{
            properties: {
              label: string;
              name: string;
              city: string;
              postcode: string;
            };
          }>;
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
          error instanceof Error
            ? error.message
            : "Erreur lors de la racuparation des adresses.";
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

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const payload = {
        filters: searchFilters,
        term: searchTerm,
        isPanelOpen: isSearchPanelOpen,
      };
      localStorage.setItem(SEARCH_STATE_STORAGE_KEY, JSON.stringify(payload));
    } catch (error) {
      console.error("Impossible d'enregistrer l'état de recherche:", error);
    }
  }, [searchFilters, searchTerm, isSearchPanelOpen]);

  useEffect(() => {
    const handleGlobalShortcut = (event: globalThis.KeyboardEvent) => {
      const isCmdK =
        event.key.toLowerCase() === "k" &&
        (event.metaKey || event.ctrlKey);
      const isEsc = event.key === "Escape";

      if (isCmdK) {
        event.preventDefault();
        if (isDirty) {
          alert(
            "Enregistrez ou annulez les modifications avant de rechercher.",
          );
          return;
        }
        setIsSearchPanelOpen((prev) => !prev);
        const target =
          searchFilterRefs.lastUsed.current ??
          searchFilterRefs.primary.current;
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
        alert(
          "Enregistrez ou annulez les modifications avant de quitter la fiche.",
        );
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    document.addEventListener("click", handleClickCapture, true);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      document.removeEventListener("click", handleClickCapture, true);
    };
  }, [isDirty]);

  // ─── Computed ───────────────────────────────────────────────

  const orderedFamilies = useMemo(
    () =>
      [...families].sort((a, b) =>
        a.id.localeCompare(b.id, undefined, { numeric: true }),
      ),
    [families],
  );

  const hasActiveSearch = useMemo(() => {
    const term = searchTerm.trim();
    const hasFilters = Object.values(searchFilters).some(
      (value) => value.trim() !== "",
    );
    return hasFilters || term !== "";
  }, [searchFilters, searchTerm]);

  const filteredFamilies = useMemo(() => {
    const hasFilters = Object.values(searchFilters).some(
      (value) => value.trim() !== "",
    );
    const phoneFilterRaw = (
      searchFilters.phone1 || searchFilters.phone2
    ).trim();
    const phoneFilter = phoneFilterRaw
      ? phoneFilterRaw.replace(/\s+/g, "").toLowerCase()
      : "";
    const normalizedFilters = {
      lastName: normalizeText(searchFilters.lastName),
      firstName: normalizeText(searchFilters.firstName),
      address: normalizeText(searchFilters.address),
      postalCode: normalizeText(searchFilters.postalCode),
      city: normalizeText(searchFilters.city),
      country: normalizeText(searchFilters.country),
      email: normalizeText(searchFilters.email),
      partner: normalizeText(searchFilters.partner),
      childLastName: normalizeText(searchFilters.childLastName),
      childFirstName: normalizeText(searchFilters.childFirstName),
      childBirthDate: normalizeText(searchFilters.childBirthDate),
    };
    const normTerm = normalizeText(searchTerm.trim());

    if (!hasActiveSearch) {
      return [];
    }

    return orderedFamilies.filter((family) => {
      const allAdults = [
        {
          lastName: family.lastName ?? "",
          firstName: family.firstName ?? "",
          address: family.address ?? "",
          complement: family.complement ?? "",
          postalCode: family.postalCode ?? "",
          city: family.city ?? "",
          country: family.country ?? "",
          phone1: family.phone1 ?? "",
          phone2: family.phone2 ?? "",
          email: family.email ?? "",
          partner: family.partner ?? "",
        },
        ...(family.secondaryAdults ?? []).map((adult) => ({
          lastName: adult.lastName ?? "",
          firstName: adult.firstName ?? "",
          address: adult.address ?? "",
          complement: adult.complement ?? "",
          postalCode: adult.postalCode ?? "",
          city: adult.city ?? "",
          country: adult.country ?? "",
          phone1: adult.phone ?? "",
          phone2: adult.phone2 ?? "",
          email: adult.email ?? "",
          partner: adult.partner ?? "",
        })),
      ];

      if (hasFilters) {
        const matches = [
          !normalizedFilters.lastName ||
            allAdults.some((adult) =>
              normalizeText(adult.lastName).includes(
                normalizedFilters.lastName,
              ),
            ),
          !normalizedFilters.firstName ||
            allAdults.some((adult) =>
              normalizeText(adult.firstName).includes(
                normalizedFilters.firstName,
              ),
            ),
          !normalizedFilters.address ||
            allAdults.some((adult) => {
              const addr = normalizeText(adult.address);
              const comp = normalizeText(adult.complement);
              return (
                addr.includes(normalizedFilters.address) ||
                comp.includes(normalizedFilters.address)
              );
            }),
          !normalizedFilters.postalCode ||
            allAdults.some((adult) =>
              normalizeText(adult.postalCode).includes(
                normalizedFilters.postalCode,
              ),
            ),
          !normalizedFilters.city ||
            allAdults.some((adult) =>
              normalizeText(adult.city).includes(normalizedFilters.city),
            ),
          !normalizedFilters.country ||
            allAdults.some((adult) =>
              normalizeText(adult.country).includes(
                normalizedFilters.country,
              ),
            ),
          !phoneFilter ||
            allAdults.some((adult) =>
              [adult.phone1, adult.phone2]
                .map((phone) => phone.replace(/\s+/g, "").toLowerCase())
                .some((phone) => phone.includes(phoneFilter)),
            ),
          !normalizedFilters.email ||
            allAdults.some((adult) =>
              normalizeText(adult.email).includes(normalizedFilters.email),
            ),
          !normalizedFilters.partner ||
            allAdults.some((adult) =>
              normalizeText(adult.partner).includes(
                normalizedFilters.partner,
              ),
            ),
          !normalizedFilters.childLastName ||
            family.children.some((child) =>
              normalizeText(child.lastName ?? "").includes(
                normalizedFilters.childLastName,
              ),
            ),
          !normalizedFilters.childFirstName ||
            family.children.some((child) =>
              normalizeText(child.firstName ?? "").includes(
                normalizedFilters.childFirstName,
              ),
            ),
          !normalizedFilters.childBirthDate ||
            family.children.some((child) =>
              normalizeText(child.birthDate ?? "").includes(
                normalizedFilters.childBirthDate,
              ),
            ),
        ];

        if (matches.some((value) => value === false)) {
          return false;
        }
      }

      if (!normTerm) {
        return true;
      }

      const adultStrings = allAdults.flatMap((adult) =>
        [
          adult.lastName,
          adult.firstName,
          adult.address,
          adult.complement,
          adult.postalCode,
          adult.city,
          adult.country,
          adult.phone1,
          adult.phone2,
          adult.email,
          adult.partner,
        ]
          .filter(Boolean)
          .map((value) => normalizeText(value)),
      );

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
        ...adultStrings,
      ]
        .filter(Boolean)
        .map((value) => normalizeText(String(value)))
        .join(" ");

      return haystack.includes(normTerm);
    });
  }, [orderedFamilies, searchFilters, searchTerm, hasActiveSearch]);

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

  const secondaryAdultEntries = familyForm.secondaryAdults ?? [];
  const parentCards = useMemo(
    () =>
      [
        {
          id: "primary",
          kind: "primary" as const,
          role: familyForm.primaryRole ?? "",
          civility: familyForm.civility,
          firstName: familyForm.firstName,
          lastName: familyForm.lastName,
          phone1: familyForm.phone1,
          phone2: familyForm.phone2,
          email: familyForm.email,
          address: familyForm.address,
          complement: familyForm.complement,
          postalCode: familyForm.postalCode,
          city: familyForm.city,
          country: familyForm.country,
          partner: familyForm.partner,
        },
        ...secondaryAdultEntries.map((adult, index) => ({
          id: `secondary-${index}`,
          kind: "secondary" as const,
          role: adult.role ?? "",
          civility: adult.civility ?? "",
          firstName: adult.firstName ?? "",
          lastName: adult.lastName ?? "",
          phone1: adult.phone ?? "",
          phone2: adult.phone2 ?? "",
          email: adult.email ?? "",
          address: adult.address ?? "",
          complement: adult.complement ?? "",
          postalCode: adult.postalCode ?? "",
          city: adult.city ?? "",
          country: adult.country ?? "",
          partner: adult.partner ?? "",
        })),
      ] satisfies ParentCardData[],
    [
      familyForm.address,
      familyForm.city,
      familyForm.complement,
      familyForm.country,
      familyForm.civility,
      familyForm.email,
      familyForm.firstName,
      familyForm.lastName,
      familyForm.partner,
      familyForm.phone1,
      familyForm.phone2,
      familyForm.postalCode,
      familyForm.primaryRole,
      secondaryAdultEntries,
    ],
  );
  const canDeleteFamily = Boolean(selectedFamilyId || familyForm.rowId);

  // ─── Handlers ───────────────────────────────────────────────

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

  const handleParentFieldChange = (
    parentId: string,
    field:
      | "role"
      | "civility"
      | "firstName"
      | "lastName"
      | "phone1"
      | "phone2"
      | "email"
      | "address"
      | "complement"
      | "postalCode"
      | "city"
      | "country"
      | "partner",
    value: string,
  ) => {
    if (parentId === "primary") {
      const updates: Partial<FamilyFormState> = {};
      if (field === "role") updates.primaryRole = value;
      if (field === "civility") updates.civility = value;
      if (field === "firstName") updates.firstName = value;
      if (field === "lastName") updates.lastName = value;
      if (field === "phone1") updates.phone1 = formatPhoneFR(value);
      if (field === "phone2") updates.phone2 = formatPhoneFR(value);
      if (field === "email") updates.email = value;
      if (field === "address") updates.address = value;
      if (field === "complement") updates.complement = value;
      if (field === "postalCode")
        updates.postalCode = normalizePostalCode(value);
      if (field === "city") updates.city = value;
      if (field === "country") updates.country = value;
      if (field === "partner") updates.partner = value;
      if (Object.keys(updates).length > 0) {
        setFamilyForm((prev) => ({
          ...prev,
          ...updates,
        }));
        setIsDirty(true);
      }
      return;
    }

    const index = Number(parentId.replace("secondary-", ""));
    if (Number.isNaN(index)) {
      return;
    }

    setFamilyForm((prev) => {
      const nextAdults = [...(prev.secondaryAdults ?? [])];
      const current = nextAdults[index] ?? createEmptySecondaryContact();
      let mappedField: keyof SecondaryContact = "role";

      switch (field) {
        case "role":
          mappedField = "role";
          break;
        case "civility":
          mappedField = "civility";
          break;
        case "firstName":
          mappedField = "firstName";
          break;
        case "lastName":
          mappedField = "lastName";
          break;
        case "phone1":
          mappedField = "phone";
          break;
        case "phone2":
          mappedField = "phone2";
          break;
        case "email":
          mappedField = "email";
          break;
        case "address":
          mappedField = "address";
          break;
        case "complement":
          mappedField = "complement";
          break;
        case "postalCode":
          mappedField = "postalCode";
          break;
        case "city":
          mappedField = "city";
          break;
        case "country":
          mappedField = "country";
          break;
        case "partner":
          mappedField = "partner";
          break;
        default:
          mappedField = "role";
      }

      let nextValue = value;
      if (mappedField === "phone" || mappedField === "phone2") {
        nextValue = formatPhoneFR(value);
      }
      if (mappedField === "postalCode") {
        nextValue = normalizePostalCode(value);
      }

      nextAdults[index] = {
        ...createEmptySecondaryContact(),
        ...current,
        [mappedField]: nextValue,
      };
      return {
        ...prev,
        secondaryAdults: nextAdults,
      };
    });

    setSecondaryContactEnabled(true);
    setIsDirty(true);
  };

  const handleChildFieldChange =
    (field: keyof ChildFormState) =>
    (event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
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
      const formatted = formatPhoneFR(event.target.value);
      setFamilyForm((prev) => ({
        ...prev,
        [field]: formatted,
      }));
      setIsDirty(true);
    };

  const handleSelectFamily = (familyId: string) => {
    if (isDirty) {
      alert(
        "Enregistrez ou annulez les modifications avant de changer de fiche.",
      );
      return;
    }
    const record = families.find((family) => family.id === familyId);

    if (!record) {
      return;
    }

    setSelectedFamilyId(record.id);
    setFamilyForm(mapFamilyRecordToFormState(record));
    setSecondaryContactEnabled(
      Boolean(record.secondaryContact) ||
        (record.secondaryAdults ?? []).length > 0,
    );
    setCityOptions(record.city ? [record.city] : []);
    setCityLookupState("idle");
    setCityLookupError(null);
    setIsChildFormOpen(false);
    setChildForm(createEmptyChildForm());
    setEditingChildId(null);
    setSaveError(null);
    setChildError(null);
    setFeedback(null);
    setHealthModalChildId(null);
    setIsSecondaryContactModalOpen(false);
    setEditingAdultIndex(null);
    setIsDirty(false);
  };

  const resetFamilyForms = useCallback(() => {
    setSelectedFamilyId(null);
    setFamilyForm(createEmptyFamilyForm(nextFamilyId));
    setSecondaryContactEnabled(false);
    setChildForm(createEmptyChildForm());
    setEditingChildId(null);
    setIsChildFormOpen(false);
    setSaveError(null);
    setChildError(null);
    setFeedback(null);
    setCityOptions([]);
    setCityLookupState("idle");
    setCityLookupError(null);
    setHealthModalChildId(null);
    setIsSecondaryContactModalOpen(false);
    setIsDirty(false);
  }, [nextFamilyId]);

  const handleCreateNewFamily = () => {
    if (isDirty) {
      alert(
        "Enregistrez ou annulez les modifications avant de creer une nouvelle fiche.",
      );
      return;
    }
    const freshId = nextFamilyId;
    setSelectedFamilyId(freshId);
    setFamilyForm(createEmptyFamilyForm(freshId));
    setSecondaryContactEnabled(false);
    setChildForm(createEmptyChildForm());
    setEditingChildId(null);
    setIsChildFormOpen(false);
    setSaveError(null);
    setChildError(null);
    setFeedback(null);
    setCityOptions([]);
    setCityLookupState("idle");
    setCityLookupError(null);
    setHealthModalChildId(null);
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
      setSaveError("Le numaro de client est manquant.");
      setIsSaving(false);
      return;
    }

    if (!familyForm.lastName.trim()) {
      setSaveError("Veuillez renseigner le nom de famille.");
      setIsSaving(false);
      return;
    }

    if (!familyForm.firstName.trim()) {
      setSaveError("Veuillez renseigner le prenom.");
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

      // Sauvegarder en base de donnees
      const savedFamily = await saveFamily(record);

      const recordIdForLog =
        savedFamily.rowId ?? existingFamily?.rowId ?? undefined;

      if (recordIdForLog !== undefined) {
        await logEdit({
          action: actionType,
          tableName: "families",
          recordId: recordIdForLog,
          before: existingFamily ?? null,
          after: savedFamily,
        });
      } else {
        console.warn(
          "[Clients] Impossible d'enregistrer le log : identifiant de fiche introuvable.",
        );
      }

      // Mettre a jour l'atat local
      upsertFamiliesState(savedFamily);

      setSelectedFamilyId(savedFamily.id);
      setFamilyForm(mapFamilyRecordToFormState(savedFamily));
      setSecondaryContactEnabled(Boolean(savedFamily.secondaryContact));
      if (savedFamily.city) {
        setCityOptions([savedFamily.city]);
      }
      setFeedback("Fiche famille enregistree avec succes.");
      setIsDirty(false);
    } catch (error) {
      console.error("Erreur lors de la sauvegarde:", error);
      setSaveError(
        error instanceof Error
          ? error.message
          : "Erreur lors de la sauvegarde de la fiche famille",
      );
    } finally {
      setIsSaving(false);
    }
  };

  const refreshFamiliesAfterAdultChange = async (familyId: string) => {
    const familiesData = await fetchFamilies();
    setFamilies(familiesData);
    const refreshed = familiesData.find((f) => f.id === familyId);
    if (refreshed) {
      setFamilyForm(mapFamilyRecordToFormState(refreshed));
      setSelectedFamilyId(refreshed.id);
      setSecondaryContactEnabled(
        Boolean(refreshed.secondaryContact) ||
          (refreshed.secondaryAdults ?? []).length > 0,
      );
    }
  };

  const handleOpenSecondaryContactModal = (index: number | null = null) => {
    setEditingAdultIndex(index);
    setIsSecondaryContactModalOpen(true);
  };

  const handleCloseSecondaryContactModal = () => {
    setIsSecondaryContactModalOpen(false);
    setEditingAdultIndex(null);
  };

  const handleRemoveSecondaryContact = () => {
    setSecondaryContactEnabled(false);
    setFamilyForm((current) => ({
      ...current,
      secondaryAdults: [],
      secondaryContact: createEmptySecondaryContact(),
    }));
    setIsSecondaryContactModalOpen(false);
    setEditingAdultIndex(null);
  };

  const handleSaveSecondaryAdult = async (adult: SecondaryContact) => {
    if (!selectedFamilyId) {
      throw new Error("Famille introuvable pour enregistrer l'adulte.");
    }

    const familyRowId =
      familyForm.rowId ??
      families.find((f) => f.id === selectedFamilyId)?.rowId;
    if (!familyRowId) {
      throw new Error(
        "Identifiant technique de la famille manquant pour lier l'adulte.",
      );
    }

    const position =
      editingAdultIndex !== null
        ? familyForm.secondaryAdults[editingAdultIndex]?.position ??
          editingAdultIndex + 1
        : (familyForm.secondaryAdults?.length ?? 0) + 1;
    const payloadForSave = {
      familyRowId,
      familyIdClient: familyForm.id,
      adultId:
        editingAdultIndex !== null
          ? familyForm.secondaryAdults[editingAdultIndex]?.adultId ?? undefined
          : undefined,
      civility: adult.civility ?? "",
      lastName: adult.lastName,
      firstName: adult.firstName,
      address: adult.address ?? "",
      complement: adult.complement ?? "",
      postalCode: adult.postalCode ?? "",
      city: adult.city ?? "",
      country: adult.country ?? "",
      phone1: adult.phone ?? "",
      phone2: adult.phone2 ?? "",
      email: adult.email ?? "",
      partnerName: adult.partner ?? "",
      role: adult.role,
      position,
      canBeContacted: true,
    };

    console.log(
      "[Adult] Sauvegarde adulte secondaire payload:",
      payloadForSave,
    );

    const newAdultId = await upsertSecondaryAdult(payloadForSave);
    console.log("[Adult] Adulte secondaire enregistra avec id:", newAdultId);

    setFamilyForm((prev) => {
      const nextAdults = [...(prev.secondaryAdults ?? [])];
      const payload: SecondaryContact = {
        ...createEmptySecondaryContact(),
        ...adult,
        adultId: newAdultId,
        position,
        canBeContacted: true,
        partner: adult.partner ?? "",
      };
      if (editingAdultIndex !== null && nextAdults[editingAdultIndex]) {
        nextAdults[editingAdultIndex] = {
          ...nextAdults[editingAdultIndex],
          ...payload,
        };
      } else {
        nextAdults.push(payload);
      }
      return { ...prev, secondaryAdults: nextAdults };
    });

    await refreshFamiliesAfterAdultChange(selectedFamilyId);

    setIsSecondaryContactModalOpen(false);
    setEditingAdultIndex(null);
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
      setFeedback("Fiche famille supprimee.");

      const recordIdForLog = familyToDelete?.rowId;

      if (recordIdForLog !== undefined) {
        await logEdit({
          action: "delete",
          tableName: "families",
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

  const handleEditChild = (childId: string) => {
    const child = familyForm.children.find((item) => item.id === childId);

    if (!child) {
      setChildError("Impossible de trouver les informations de l'enfant.");
      return;
    }

    setChildForm({
      lastName: child.lastName,
      firstName: child.firstName,
      birthDate: child.birthDate,
      gender: child.gender ?? "",
    });
    setEditingChildId(childId);
    setIsChildFormOpen(true);
    setChildError(null);
    setFeedback(null);
  };

  const handleAddChild = async () => {
    setChildError(null);
    const isEditing = Boolean(editingChildId);
    const editingId = editingChildId;

    if (!childForm.lastName.trim() || !childForm.firstName.trim()) {
      setChildError("Nom et prenom de l'enfant sont requis.");
      return;
    }

    if (!childForm.birthDate.trim()) {
      setChildError("Merci d'indiquer la date de naissance.");
      return;
    }

    const existingChild = editingId
      ? familyForm.children.find((child) => child.id === editingId)
      : null;

    const newChild: Child = {
      id: editingId ?? generateChildId(),
      lastName: childForm.lastName.trim(),
      firstName: childForm.firstName.trim(),
      birthDate: childForm.birthDate,
      gender: childForm.gender,
      health: existingChild?.health ?? createEmptyHealthForm(),
    };

    const nextChildren = editingId
      ? familyForm.children.map((child) =>
          child.id === editingId ? { ...child, ...newChild } : child,
        )
      : [...familyForm.children, newChild];

    setFamilyForm((prev) => ({
      ...prev,
      children: nextChildren,
    }));
    setIsDirty(true);

    setChildForm(createEmptyChildForm());
    setEditingChildId(null);
    setIsChildFormOpen(false);

    const hasExistingFamily = Boolean(familyForm.rowId || selectedFamilyId);

    if (!hasExistingFamily) {
      setFeedback(
        isEditing
          ? "Enfant mis a jour. Enregistrez la fiche pour le conserver."
          : "Enfant ajouta. Enregistrez la fiche pour le conserver.",
      );
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
        // Logging disabled here to aviter les erreurs console lors de l'ajout d'un enfant.
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
      setFeedback(
        isEditing
          ? "Enfant mis a jour et sauvegarda."
          : "Enfant ajouta et sauvegarda.",
      );
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
    }

    if (editingChildId === childId) {
      setEditingChildId(null);
      setChildForm(createEmptyChildForm());
      setIsChildFormOpen(false);
    }

    setFamilyForm((prev) => ({
      ...prev,
      children: prev.children.filter((child) => child.id !== childId),
    }));
    setIsDirty(true);
  };

  const handleOpenHealthModal = (childId: string) => {
    const child = familyForm.children.find((item) => item.id === childId);

    if (!child) {
      return;
    }

    setHealthModalChildId(childId);
  };

  const handleCloseHealthModal = () => {
    setHealthModalChildId(null);
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

  const handleReset = () => {
    setSearchFilters(createEmptySearchFilters());
    setSearchTerm("");
    setIsSearchPanelOpen(false);
    searchFilterRefs.lastUsed.current = null;
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

  const handleConfirmManualAddress = () => {
    setAddressSuggestions([]);
    setAddressQuery("");
    setIsAddressLoading(false);
    setAddressError(null);
    setIsDirty(true);
  };

  const handleEditParentCard = (parentId: string) => {
    if (parentId === "primary") {
      return;
    }
    const index = Number(parentId.replace("secondary-", ""));
    if (Number.isNaN(index)) {
      return;
    }
    handleOpenSecondaryContactModal(index);
  };

  const handleCreateParentCard = () => {
    const nextIndex = secondaryAdultEntries.length;
    setFamilyForm((prev) => ({
      ...prev,
      secondaryAdults: [
        ...(prev.secondaryAdults ?? []),
        createEmptySecondaryContact(),
      ],
    }));
    setSecondaryContactEnabled(true);
    setEditingAdultIndex(nextIndex);
    setIsSecondaryContactModalOpen(true);
    setIsDirty(true);
  };

  // Wrappers pour les callbacks inline du JSX

  const handleToggleSearchPanel = () => {
    if (isDirty) {
      alert(
        "Enregistrez ou annulez les modifications avant de rechercher.",
      );
      return;
    }
    if (isSearchPanelOpen) {
      setSearchFilters(createEmptySearchFilters());
      searchFilterRefs.lastUsed.current = null;
      setIsSearchPanelOpen(false);
    } else {
      setIsSearchPanelOpen(true);
      const target =
        searchFilterRefs.lastUsed.current ??
        searchFilterRefs.primary.current;
      if (target) {
        target.focus();
        if ("select" in target) {
          target.select();
        }
      }
    }
  };

  const handleCloseSearchPanel = () => {
    setIsSearchPanelOpen(false);
  };

  const handleToggleChildForm = () => {
    setIsChildFormOpen((open) => !open);
    setChildError(null);
    setChildForm(createEmptyChildForm());
    setEditingChildId(null);
  };

  const handleCancelChildForm = () => {
    setChildForm(createEmptyChildForm());
    setIsChildFormOpen(false);
    setChildError(null);
    setEditingChildId(null);
  };

  const handleSaveChildHealth = (health: HealthFormState) => {
    if (!healthModalChildId) return;
    setFamilyForm((prev) => ({
      ...prev,
      children: prev.children.map((child) =>
        child.id === healthModalChildId
          ? { ...child, health: { ...health } }
          : child,
      ),
    }));
    setIsDirty(true);
  };

  // ─── Return ─────────────────────────────────────────────────

  return {
    // Search
    isSearchPanelOpen,
    searchFilters,
    searchFilterRefs,
    hasActiveSearch,
    filteredFamilies,
    handleSearchFilterChange,
    handleSearchFiltersKeyDown,
    handleReset,
    handleToggleSearchPanel,
    handleCloseSearchPanel,

    // Family list
    paddedFamilies,
    selectedFamilyId,
    handleSelectFamily,

    // Family form
    familyForm,
    isDirty,
    isSaving,
    isDeleting,
    canDeleteFamily,
    saveError,
    feedback,
    logError,
    handleCreateNewFamily,
    handleDeleteFamily,
    handleSaveFamily,
    resetFamilyForms,

    // Parents
    parentCards,
    handleParentFieldChange,
    handleEditParentCard,
    handleCreateParentCard,

    // Children
    childForm,
    editingChildId,
    isChildFormOpen,
    childError,
    isAutoSavingChildren,
    handleChildFieldChange,
    handleAddChild,
    handleEditChild,
    handleRemoveChild,
    handleOpenHealthModal,
    handleCreateChildRegistration,
    handleToggleChildForm,
    handleCancelChildForm,

    // Secondary Adult Modal
    isSecondaryContactModalOpen,
    editingAdultIndex,
    handleCloseSecondaryContactModal,
    handleSaveSecondaryAdult,
    handleRemoveSecondaryContact,

    // Health Modal
    healthModalChildId,
    activeHealthChild,
    handleCloseHealthModal,
    handleSaveChildHealth,
  };
}

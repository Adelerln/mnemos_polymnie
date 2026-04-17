import type { FamilyRecord, SecondaryContact, Child, HealthFormState } from "@/lib/mappers";
import type { ChildFormState, FamilyFormState } from "@/types/famille";
import { formatFrenchPhoneNumber } from "@/lib/phone";

// ─── Fonctions factory ──────────────────────────────────────

export const createEmptySecondaryContact = (): SecondaryContact => ({
  civility: "",
  lastName: "",
  firstName: "",
  role: "",
  phone: "",
  phone2: "",
  address: "",
  complement: "",
  postalCode: "",
  city: "",
  country: "",
  email: "",
  partner: "",
});

export const createEmptyHealthForm = (): HealthFormState => ({
  allergies: "",
  diet: "",
  healthIssues: "",
  instructions: "",
  friend: "",
  vacaf: "",
  transportNotes: "",
});

export const createEmptyFamilyForm = (id = ""): FamilyFormState => ({
  id,
  rowId: undefined,
  label: "",
  primaryAdultId: null,
  primaryRole: "",
  secondaryAdults: [],
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
  familyEmail: null,
  notes: null,
  prestashopP1: "",
  prestashopP2: "",
  secondaryContact: createEmptySecondaryContact(),
  children: [],
  createdAt: undefined,
  updatedAt: undefined,
});

export const createEmptyChildForm = (): ChildFormState => ({
  lastName: "",
  firstName: "",
  birthDate: "",
  gender: "" as ChildFormState["gender"],
});

export const createEmptySearchFilters = () => ({
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

export type SearchFilters = ReturnType<typeof createEmptySearchFilters>;

// ─── Mapping ────────────────────────────────────────────────

export const mapChildrenForForm = (children: Child[]): Child[] =>
  children.map((child) => ({
    ...child,
    gender: child.gender === "F" || child.gender === "M" ? child.gender : "",
    health: child.health
      ? { ...createEmptyHealthForm(), ...child.health }
      : createEmptyHealthForm(),
  }));

export const mapFamilyRecordToFormState = (record: FamilyRecord): FamilyFormState => ({
  id: record.id,
  rowId: record.rowId,
  label: record.label,
  primaryAdultId: record.primaryAdultId ?? null,
  primaryRole: record.primaryRole ?? "",
  secondaryAdults: record.secondaryAdults ?? [],
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
  familyEmail: record.familyEmail ?? null,
  notes: record.notes ?? null,
  prestashopP1: record.prestashopP1,
  prestashopP2: record.prestashopP2,
  secondaryContact: record.secondaryContact
    ? { ...createEmptySecondaryContact(), ...record.secondaryContact }
    : createEmptySecondaryContact(),
  children: mapChildrenForForm(record.children),
  createdAt: record.createdAt,
  updatedAt: record.updatedAt,
});

export const mapFormStateToFamilyRecord = (
  form: FamilyFormState,
  includeSecondaryContact: boolean,
): FamilyRecord => ({
  id: form.id.trim(),
  rowId: form.rowId,
  label: form.label || form.id.trim(),
  primaryAdultId: form.primaryAdultId ?? null,
  primaryRole: form.primaryRole ?? "",
  secondaryAdults: (form.secondaryAdults ?? []).map((sa) => ({
    ...sa,
    adultId: sa.adultId ?? null,
    role: sa.role ?? null,
    position: sa.position ?? null,
    canBeContacted: sa.canBeContacted ?? false,
  })),
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
  familyEmail: form.familyEmail ?? null,
  notes: form.notes ?? null,
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

// ─── Utilitaires ────────────────────────────────────────────

export const generateChildId = () => {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return Math.random().toString(36).slice(2, 10);
};

export const computeNextFamilyId = (items: FamilyRecord[]) => {
  const numericIds = items
    .map((item) => Number.parseInt(item.id, 10))
    .filter(Number.isFinite);
  if (numericIds.length === 0) return "1";
  return String(Math.max(...numericIds) + 1);
};

export const formatPhoneFR = (value: string) => formatFrenchPhoneNumber(value);

export const normalizePostalCode = (input: string) =>
  input.replace(/\D/g, "").slice(0, 5);

export const computeAgeFromBirthDate = (value: string) => {
  if (!value) return "";
  const birthDate = new Date(value);
  if (Number.isNaN(birthDate.getTime())) return "";

  const today = new Date();
  let years = today.getFullYear() - birthDate.getFullYear();
  let months = today.getMonth() - birthDate.getMonth();
  const days = today.getDate() - birthDate.getDate();

  if (days < 0) months -= 1;
  if (months < 0) {
    years -= 1;
    months += 12;
  }

  const yearLabel = `${years} an${years > 1 ? "s" : ""}`;
  const monthLabel = `${months} mois`;
  if (years <= 0) return monthLabel;
  if (months <= 0) return yearLabel;
  return `${yearLabel} et ${monthLabel}`;
};

export const formatDateToFrench = (value: string) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("fr-FR");
};

export const isSecondaryContactEmpty = (contact: SecondaryContact) =>
  !contact.lastName.trim() &&
  !contact.firstName.trim() &&
  !contact.role.trim() &&
  !contact.phone.trim() &&
  !contact.email.trim();

export const normalizeText = (value: string) =>
  value ? value.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase() : "";

export const formatPrimaryAdultName = (family: FamilyRecord) => {
  const civ = family.civility ? `${family.civility} ` : "";
  const last = family.lastName ? family.lastName.toUpperCase() : "";
  const first = family.firstName ?? "";
  return `${civ}${first} ${last}`.trim();
};

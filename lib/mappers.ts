/**
 * Mappers bidirectionnels : BDD (snake_case) ↔ Vue (camelCase).
 * Centralise la conversion pour éviter la duplication dans les services.
 */

import type {
  ChildRow,
  FamilyRow,
  FamilyRowPayload,
} from "@/types/database";

// ─── Types view-model (camelCase, consommés par le front) ──

export type HealthFormState = {
  allergies: string;
  diet: string;
  healthIssues: string;
  instructions: string;
  friend: string;
  vacaf: string;
  transportNotes: string;
};

export type Child = {
  id: string;
  lastName: string;
  firstName: string;
  birthDate: string;
  gender: "F" | "M" | "";
  health: HealthFormState;
};

export type SecondaryContact = {
  civility?: string;
  adultId?: string | null;
  position?: number | null;
  canBeContacted?: boolean;
  canBeContactedGlobal?: boolean;
  lastName: string;
  firstName: string;
  role: string;
  phone: string;
  phone2?: string;
  address?: string;
  complement?: string;
  postalCode?: string;
  city?: string;
  country?: string;
  email: string;
  partner?: string;
};

export type FamilyRecord = {
  /** Identifiant fonctionnel (alias de id_client) */
  id: string;
  /** Identifiant technique de la ligne */
  rowId?: number;
  primaryAdultId?: string | null;
  label: string;
  civility: string;
  lastName: string;
  firstName: string;
  primaryRole?: string | null;
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
  secondaryContact: SecondaryContact | null;
  familyEmail?: string | null;
  notes?: string | null;
  secondaryAdults: Array<
    SecondaryContact & {
      adultId: string | null;
      role: string | null;
      position: number | null;
      canBeContacted: boolean;
      canBeContactedGlobal?: boolean;
      partner?: string;
    }
  >;
  children: Child[];
  createdAt?: string;
  updatedAt?: string;
};

// ─── Constantes ────────────────────────────────────────────

export const defaultHealthState: HealthFormState = {
  allergies: "",
  diet: "",
  healthIssues: "",
  instructions: "",
  friend: "",
  vacaf: "",
  transportNotes: "",
};

// ─── Helpers internes (extraction liens adultes) ───────────

export const pickPrimaryAdult = (row: FamilyRow) =>
  (row.family_adults ?? []).find((link) => link?.is_primary) ?? null;

export const pickSecondaryAdult = (row: FamilyRow) =>
  (row.family_adults ?? []).find((link) => !link?.is_primary) ?? null;

export const pickAllSecondaryAdults = (row: FamilyRow) =>
  (row.family_adults ?? []).filter((link) => !link?.is_primary);

// ─── Mappers BDD → Vue ────────────────────────────────────

/** Convertit une ligne children (snake_case) en Child (camelCase) */
export const mapChildRowToChild = (row: ChildRow): Child => ({
  id: row.id,
  lastName: row.last_name ?? "",
  firstName: row.first_name ?? "",
  birthDate: row.birth_date ?? "",
  gender: row.gender === "F" || row.gender === "M" ? row.gender : "",
  health: {
    allergies: row.allergies ?? "",
    diet: row.diet ?? "",
    healthIssues: row.health_issues ?? "",
    instructions: row.instructions ?? "",
    transportNotes: row.transport_notes ?? "",
    friend: row.friend ?? "",
    vacaf: "",
  },
});

/** Convertit une ligne families+relations en FamilyRecord */
export const mapRowToFamilyRecord = (row: FamilyRow): FamilyRecord => {
  const primaryAdultLink = pickPrimaryAdult(row);
  const primaryAdult = primaryAdultLink?.adult ?? null;
  const secondaryAdult = pickSecondaryAdult(row);

  return {
    id: row.id_client,
    rowId: row.id,
    primaryAdultId: primaryAdultLink?.adult_id ?? null,
    primaryRole: primaryAdultLink?.role ?? "",
    label:
      row.label ??
      ([primaryAdult?.first_name, primaryAdult?.last_name].filter(Boolean).join(" ").trim() ||
        row.id_client),
    civility: primaryAdult?.civility ?? "",
    lastName: primaryAdult?.last_name ?? "",
    firstName: primaryAdult?.first_name ?? "",
    address: primaryAdult?.address ?? "",
    complement: primaryAdult?.complement ?? "",
    postalCode: primaryAdult?.postal_code ?? "",
    city: primaryAdult?.city ?? "",
    country: primaryAdult?.country ?? "",
    phone1: primaryAdult?.phone_1 ?? "",
    phone2: primaryAdult?.phone_2 ?? "",
    email: primaryAdult?.email ?? "",
    partner: primaryAdult?.partner?.name ?? "",
    prestashopP1: "",
    prestashopP2: "",
    secondaryContact: secondaryAdult?.adult
      ? {
          lastName: secondaryAdult.adult.last_name ?? "",
          firstName: secondaryAdult.adult.first_name ?? "",
          role: secondaryAdult.role ?? "",
          canBeContactedGlobal:
            secondaryAdult.can_be_contacted_global ?? secondaryAdult.can_be_contacted ?? true,
          phone: secondaryAdult.adult.phone_1 ?? "",
          phone2: secondaryAdult.adult.phone_2 ?? "",
          address: secondaryAdult.adult.address ?? "",
          complement: secondaryAdult.adult.complement ?? "",
          postalCode: secondaryAdult.adult.postal_code ?? "",
          city: secondaryAdult.adult.city ?? "",
          country: secondaryAdult.adult.country ?? "",
          email: secondaryAdult.adult.email ?? "",
        }
      : null,
    secondaryAdults: pickAllSecondaryAdults(row).map((link) => ({
      adultId: link.adult_id ?? null,
      role: link.role ?? null,
      position: link.position ?? null,
      canBeContacted: Boolean(link.can_be_contacted ?? true),
      canBeContactedGlobal: link.can_be_contacted_global ?? link.can_be_contacted ?? true,
      civility: link.adult?.civility ?? "",
      lastName: link.adult?.last_name ?? "",
      firstName: link.adult?.first_name ?? "",
      address: link.adult?.address ?? "",
      complement: link.adult?.complement ?? "",
      postalCode: link.adult?.postal_code ?? "",
      city: link.adult?.city ?? "",
      country: link.adult?.country ?? "",
      phone: link.adult?.phone_1 ?? "",
      phone2: link.adult?.phone_2 ?? "",
      email: link.adult?.email ?? "",
      partner: link.adult?.partner?.name ?? "",
    })),
    familyEmail: row.email ?? null,
    notes: row.notes ?? null,
    children: (row.children ?? []).map(mapChildRowToChild),
    createdAt: row.created_at ?? undefined,
    updatedAt: row.updated_at ?? undefined,
  };
};

// ─── Mappers Vue → BDD ────────────────────────────────────

/** Convertit un FamilyRecord en payload pour insert/update families */
export const mapFamilyRecordToRow = (family: FamilyRecord): FamilyRowPayload => ({
  id_client: family.id,
  label: family.label || family.id,
  notes: family.notes ?? null,
  email: family.familyEmail ?? null,
});

/** Génère un ID enfant unique (UUID ou fallback) */
export const generateChildId = (): string => {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return Math.random().toString(36).slice(2, 10);
};

/** Convertit un Child (camelCase) en ChildRow (snake_case) pour upsert */
export const mapChildToRow = (familyId: string) => (child: Child): ChildRow => ({
  id: child.id || generateChildId(),
  family_id: familyId,
  last_name: child.lastName,
  first_name: child.firstName,
  birth_date: child.birthDate,
  gender: child.gender,
  allergies: child.health?.allergies ?? "",
  diet: child.health?.diet ?? "",
  health_issues: child.health?.healthIssues ?? "",
  instructions: child.health?.instructions ?? "",
  transport_notes: child.health?.transportNotes ?? "",
  friend: child.health?.friend ?? "",
  // Nouveaux champs BDD — pas encore gérés par le formulaire
  conduite_a_tenir: null,
  status: "draft",
  created_by: null,
});

/**
 * Types alignés sur le schéma Supabase (snake_case).
 * Source de vérité : docs/context-ia/BDDcontext.txt
 */

// ─── Noms de tables ────────────────────────────────────────
export const FAMILY_TABLE = "families" as const;
export const CHILDREN_TABLE = "children" as const;
export const ADULTS_TABLE = "adults" as const;
export const FAMILY_ADULTS_TABLE = "family_adults" as const;
export const PARTNERS_TABLE = "partners" as const;

// ─── Enums BDD ─────────────────────────────────────────────

export type AdultCivility = "M." | "Mme" | "M. et Mme" | "Mlle";

export type ChildGender = "F" | "M";

export type FamilyAdultRole =
  | "Père"
  | "Mère"
  | "Éducateur"
  | "Éducatrice"
  | "Assistant(e) social(e)"
  | "Famille d'accueil"
  | "Autre";

/** Enum partner_type en BDD (CSE, ASSOCIATION, AUTRE) */
export type PartnerType = "CSE" | "ASSOCIATION" | "AUTRE";

// ─── Row types (colonnes Supabase) ────────────────────────

/** Ligne de la table `children` */
export type ChildRow = {
  id: string;
  family_id: number;
  last_name: string | null;
  first_name: string | null;
  birth_date: string | null;
  gender: string | null;
  allergies: string | null;
  diet: string | null;
  health_issues: string | null;
  instructions: string | null;
  transport_notes: string | null;
  friend: string | null;
  created_at?: string;
  updated_at?: string;
  anonymized_at?: string | null;
};

/** Ligne de la table `families` */
export type FamilyRow = {
  id?: number;
  id_client: string;
  label: string | null;
  notes: string | null;
  email: string | null;
  user_id?: string | null;
  family_adults?: FamilyAdultJoin[];
  children?: ChildRow[];
  created_at?: string;
  updated_at?: string;
  anonymized_at?: string | null;
};

/** Ligne de la table `family_adults` avec jointure adulte */
export type FamilyAdultJoin = {
  is_primary: boolean;
  adult_id: number;
  role: string;
  can_be_contacted?: boolean | null;
  can_be_contacted_global?: boolean | null;
  position?: number | null;
  adult: AdultJoin | null;
};

/** Sous-objet adulte dans la jointure family_adults → adults → partners */
export type AdultJoin = {
  civility: string | null;
  first_name: string | null;
  last_name: string | null;
  address: string | null;
  complement: string | null;
  postal_code: string | null;
  city: string | null;
  country: string | null;
  phone_1: string | null;
  phone_2: string | null;
  email: string | null;
  notes: string | null;
  partner: { name: string | null; id?: number | null } | null;
};

/** Payload pour créer/modifier une famille (colonnes éditables) */
export type FamilyRowPayload = Pick<
  FamilyRow,
  "id_client" | "label" | "notes" | "email"
>;

/** Payload pour upsert adulte principal */
export type UpsertPrimaryAdultInput = {
  familyRowId: number;
  familyIdClient: string;
  adultId?: number;
  civility: string;
  lastName: string;
  firstName: string;
  role?: string | null;
  address: string;
  complement: string;
  postalCode: string;
  city: string;
  country: string;
  phone1: string;
  phone2: string;
  email: string;
  partnerName: string;
};

/** Payload pour upsert adulte secondaire */
export type UpsertSecondaryAdultInput = {
  familyRowId: number;
  familyIdClient: string;
  adultId?: number | null;
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
  partnerName: string;
  role: string | null;
  position?: number | null;
  canBeContacted?: boolean;
  canBeContactedGlobal?: boolean;
};

/** Résultat de recherche de doublons adultes */
export type AdultDuplicateMatch = {
  id: number;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  phone_1: string | null;
  phone_2: string | null;
  address: string | null;
  complement: string | null;
  postal_code: string | null;
  city: string | null;
  country: string | null;
  family_links: Array<{
    family_id: number | null;
    family: Array<{ id_client: string | null; label: string | null }>;
  }>;
};

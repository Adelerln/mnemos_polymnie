/** Rôle utilisateur — dupliqué ici pour éviter l'import circulaire avec index.ts */
type UserRole = "admin" | "encadrant" | "direction";

/**
 * Status famille côté UI.
 * Pas d'enum en BDD pour l'instant, gardé côté front pour le filtrage.
 */
export type FamilleStatus = "active" | "archived" | "anonymized";

export interface Famille {
  id: string;
  nom: string;
  email: string;
  telephone?: string;
  statut: FamilleStatus;
  referent?: string;
  notes?: string;
  rolesAutorises?: UserRole[];
}

// ─── Types view-model famille (camelCase, consommés par le front) ──

/** État du formulaire santé d'un enfant. */
export type HealthFormState = {
  allergies: string;
  diet: string;
  healthIssues: string;
  instructions: string;
  friend: string;
  vacaf: string;
  transportNotes: string;
};

/** Enfant côté UI. */
export type Child = {
  id: string;
  lastName: string;
  firstName: string;
  birthDate: string;
  gender: "F" | "M" | "";
  health: HealthFormState;
};

/** Contact secondaire (adulte lié à une famille). */
export type SecondaryContact = {
  civility?: string;
  adultId?: number | null;
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

/** Famille complète côté UI. */
export type FamilyRecord = {
  /** Identifiant fonctionnel (alias de id_client) */
  id: string;
  /** Identifiant technique de la ligne */
  rowId?: number;
  primaryAdultId?: number | null;
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
      adultId: number | null;
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

// ─── Types formulaire famille ──────────────────────────────

/** État simplifié d'un enfant dans le formulaire d'ajout. */
export type ChildFormState = {
  lastName: string;
  firstName: string;
  birthDate: string;
  gender: "F" | "M" | "";
};

/** État complet du formulaire famille. */
export type FamilyFormState = {
  id: string;
  rowId?: number;
  label: string;
  primaryAdultId?: number | null;
  primaryRole?: string | null;
  secondaryAdults: SecondaryContact[];
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
  familyEmail?: string | null;
  notes?: string | null;
  prestashopP1: string;
  prestashopP2: string;
  secondaryContact: SecondaryContact;
  children: Child[];
  createdAt?: string;
  updatedAt?: string;
};

/** Champs éditables inline dans la fiche famille. */
export type FamilyEditableField =
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

/**
 * Types domaine Inscription — record UI, row BDD, filtres.
 */

// ─── View-model (camelCase, consommé par le front) ────────

/** Inscription côté UI (camelCase). */
export type InscriptionRecord = {
  id?: number;
  idClient: string;
  childFirstName: string;
  childLastName: string;
  childId?: string;
  childBirthDate: string;
  childGender: string;
  numInscription: string;
  referenceSejour: string;
  nomSejour: string;
  lieuSejour: string;
  theme: string;
  villeDepart: string;
  villeRetour: string;
  periodeSejour: string;
  dateEntree: string;
  dateSortie: string;
  assurance: string;
  partenaire: string;
  createdAt?: string;
  updatedAt?: string;
};

// ─── Row BDD (snake_case) ─────────────────────────────────

/** Ligne inscription telle que stockée en BDD. */
export type InscriptionRow = {
  id?: number;
  id_client: string | null;
  child_first_name: string | null;
  child_last_name: string | null;
  child_birth_date: string | null;
  child_gender: string | null;
  num_inscription: string | null;
  reference_sejour: string | null;
  nom_sejour: string | null;
  lieu_sejour: string | null;
  theme: string | null;
  ville_depart: string | null;
  ville_retour: string | null;
  periode_sejour: string | null;
  date_entree: string | null;
  date_sortie: string | null;
  assurance: string | null;
  partenaire: string | null;
  created_at?: string;
  updated_at?: string;
};

// ─── Filtres ──────────────────────────────────────────────

/** Critères de recherche pour la liste des inscriptions. */
export type InscriptionFilters = {
  idClient?: string;
  childFirstName?: string;
  childLastName?: string;
  childBirthDate?: string;
  childGender?: string;
};

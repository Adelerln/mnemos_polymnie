import type { UserRole } from "./index";
import type { FamilyStatus } from "./database";

/**
 * Status aligné sur l'enum BDD family_status.
 * L'ancien type "en_retard" | "archivee" n'existait pas en BDD.
 */
export type FamilleStatus = FamilyStatus;

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

import type { UserRole } from "./index";

export type FamilleStatus = "active" | "en_retard" | "archivee";

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

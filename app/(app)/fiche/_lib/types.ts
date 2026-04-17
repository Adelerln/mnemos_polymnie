import type { InscriptionRecord } from "@/services/inscriptions";

export type InscriptionFormState = Omit<InscriptionRecord, "id"> & {
  id?: number;
};

export type DocumentsState = {
  ficheSanitaire: boolean;
  pai: boolean;
  vaccins: boolean;
  css: boolean;
  autorisation: boolean;
  baignade: boolean;
  passVaccinal: boolean;
  secu: boolean;
  sortie: boolean;
  mutuelle: boolean;
  ordonnance: boolean;
  livret: boolean;
};

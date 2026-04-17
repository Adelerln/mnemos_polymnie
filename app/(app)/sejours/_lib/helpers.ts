import type { SejourFormState } from "@/types/sejour";

export const createEmptySejour = (): SejourFormState => ({
  reference: "",
  centre: "",
  annee: "",
  saison: "",
  periodeGlobale: "",
  dateDebut: "",
  dateFin: "",
  nomCommum: "",
  ddcsCentre: "",
  ddcsComplementaire: "",
  codeAnalytique: "",
  archive: false,
  sansPiqueNique: false,
});

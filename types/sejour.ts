/**
 * Types domaine Séjour — formulaire de création/édition.
 */

/** État du formulaire de création/édition d'un séjour. */
export type SejourFormState = {
  reference: string;
  centre: string;
  annee: string;
  saison: string;
  periodeGlobale: string;
  dateDebut: string;
  dateFin: string;
  nomCommum: string;
  ddcsCentre: string;
  ddcsComplementaire: string;
  codeAnalytique: string;
  archive: boolean;
  sansPiqueNique: boolean;
};

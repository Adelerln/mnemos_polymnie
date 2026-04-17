import type { DocumentsState } from "./types";

export const FICHE_INPUT_CLASS =
  "rounded-2xl border border-[#D8C2E8] bg-white px-4 py-2 text-sm text-[#7D498C] placeholder:text-[#7D498C]/60 focus:border-[#B793D6] focus:outline-none";
export const FICHE_INPUT_UPPER_CLASS = `${FICHE_INPUT_CLASS} font-semibold uppercase tracking-[0.16em]`;
export const FICHE_SECTION_CLASS =
  "rounded-3xl border border-[#F5D4FF] bg-white p-8 shadow-[0_25px_60px_rgba(32,73,145,0.08)]";
export const FICHE_SUBCARD_CLASS =
  "rounded-2xl border border-[#F5D4FF] bg-white p-6 shadow-[0_20px_45px_rgba(32,73,145,0.05)]";
export const FICHE_LABEL_CLASS =
  "text-xs font-semibold uppercase tracking-[0.18em] text-[#7D498C]";
export const FICHE_TABLE_HEAD_CLASS = "bg-[#F5D4FF] text-[#7D498C]";

export const DOCUMENT_LABELS: Record<keyof DocumentsState, string> = {
  ficheSanitaire: "Fiche sanitaire",
  pai: "PAI",
  vaccins: "Vaccins",
  css: "Attestation CSS / AME",
  autorisation: "Autorisation parentale",
  baignade: "Certificat baignade",
  passVaccinal: "Pass vaccinal",
  secu: "Attestation sécu",
  sortie: "Attestation sortie territoire",
  mutuelle: "Mutuelle",
  ordonnance: "Ordonnance",
  livret: "Livret inclusion ou autre",
};

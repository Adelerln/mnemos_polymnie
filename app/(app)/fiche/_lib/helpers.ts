import type { InscriptionFormState } from "./types";

export const createEmptyInscription = (): InscriptionFormState => ({
  id: undefined,
  idClient: "",
  childFirstName: "",
  childLastName: "",
  childBirthDate: "",
  childGender: "",
  numInscription: "",
  referenceSejour: "",
  nomSejour: "",
  lieuSejour: "",
  theme: "",
  villeDepart: "",
  villeRetour: "",
  periodeSejour: "",
  dateEntree: "",
  dateSortie: "",
  assurance: "",
  partenaire: "",
  createdAt: undefined,
  updatedAt: undefined,
});

export const formatDateForInput = (value: string) => {
  if (!value) {
    return "";
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return date.toISOString().slice(0, 10);
};

export const computeAgeAtDate = (birthDate: string, referenceDate: string) => {
  if (!birthDate || !referenceDate) {
    return "";
  }
  const birth = new Date(birthDate);
  const ref = new Date(referenceDate);

  if (Number.isNaN(birth.getTime()) || Number.isNaN(ref.getTime())) {
    return "";
  }

  let years = ref.getFullYear() - birth.getFullYear();
  let months = ref.getMonth() - birth.getMonth();

  if (ref.getDate() < birth.getDate()) {
    months -= 1;
  }
  if (months < 0) {
    years -= 1;
    months += 12;
  }

  if (years < 0) {
    return "";
  }

  const yearLabel = `${years} an${years > 1 ? "s" : ""}`;
  const monthLabel = `${months} mois`;

  if (years === 0) {
    return monthLabel;
  }
  if (months === 0) {
    return yearLabel;
  }

  return `${yearLabel} et ${monthLabel}`;
};

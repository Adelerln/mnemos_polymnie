import {
  Building2,
  CalendarDays,
  CreditCard,
  FileText,
  LineChart,
} from "lucide-react";

export const quickActions = [
  {
    id: "inscriptions",
    label: "Consulter inscriptions",
    icon: CalendarDays,
    href: "/inscriptions",
  },
  {
    id: "paiements",
    label: "Consulter paiements",
    icon: CreditCard,
  },
  {
    id: "factures",
    label: "Consulter factures",
    icon: FileText,
  },
  {
    id: "nouveau-paiement",
    label: "Nouveau paiement",
    icon: CreditCard,
  },
  {
    id: "nouvel-avoir",
    label: "Nouvel avoir",
    icon: LineChart,
  },
  {
    id: "nouveau-devis",
    label: "Nouveau devis",
    icon: Building2,
  },
];

export const auditEntries = [
  { label: "Cree par" },
  { label: "Cree le" },
  { label: "Derniere modification" },
  { label: "Mise a jour" },
];

export const CIVILITY_OPTIONS = ["", "M", "Mme", "M et Mme"] as const;
export const GENDER_OPTIONS = ["", "F", "M"] as const;

export const PRIMARY_ROLE_OPTIONS = [
  "",
  "Pere",
  "Mere",
  "Educateur",
  "Educatrice",
  "Assistant(e) social(e)",
  "Famille d'accueil",
  "Autre",
] as const;

export const SEARCH_STATE_STORAGE_KEY = "mnemos-clients-search-state";

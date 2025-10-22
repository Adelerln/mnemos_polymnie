import type {
  FeatureCategory,
  FeatureItem,
  NavItem,
  PrimaryNavItem,
} from "@/types";

export const navItems: NavItem[] = [
  { label: "Familles", href: "/familles" },
  { label: "Centres", href: "/centres" },
  { label: "Séjours", href: "/centres" },
  { label: "Inscriptions", href: "/centres" },
  { label: "Partenaires", href: "/partenaires" },
  { label: "Convocations", href: "/direction" },
  { label: "Transports", href: "/transports" },
  { label: "Gestion Direction", href: "/direction" },
  { label: "Personnel", href: "/personnel" },
];

export const featureCategories: FeatureCategory[] = [
  {
    id: "familles",
    title: "Familles",
    subtitle: "Suivi quotidien des familles et dossiers enfants",
    items: [
      {
        id: "dossiers-familles",
        title: "Fiches familles",
        description: "Dossiers détaillés, contacts et historiques",
        href: "/familles",
        icon: "Users",
      },
      {
        id: "reglements",
        title: "Liste des règlements",
        href: "/familles/reglements",
        icon: "CreditCard",
      },
      {
        id: "factures",
        title: "Liste des factures",
        href: "/familles/factures",
        icon: "FileText",
      },
      {
        id: "avoirs",
        title: "Liste des avoirs",
        href: "/familles/avoirs",
        icon: "Files",
      },
      {
        id: "appels",
        title: "Registre des appels",
        href: "/familles/appels",
        icon: "PhoneCall",
      },
      {
        id: "devis",
        title: "Devis individuels",
        href: "/familles/devis",
        icon: "LineChart",
      },
      {
        id: "regularisations",
        title: "Situations à régulariser",
        href: "/familles/regularisations",
        icon: "AlertTriangle",
      },
      {
        id: "numeros-utiles",
        title: "Numéros utiles",
        href: "/familles/numeros-utiles",
        icon: "Phone",
      },
    ],
  },
  {
    id: "partenaires",
    title: "Partenaires",
    subtitle: "Suivi des financeurs et prestataires",
    items: [
      {
        id: "partenaires-contacts",
        title: "Partenaires",
        href: "/partenaires",
        icon: "BriefcaseBusiness",
      },
      {
        id: "prises-en-charge",
        title: "Prises en charge",
        href: "/partenaires/prises-en-charge",
        icon: "HandCoins",
      },
      {
        id: "details-financiers",
        title: "Détails financiers",
        href: "/partenaires/finances",
        icon: "PiggyBank",
      },
      {
        id: "facturation-devis",
        title: "Facturation & devis",
        href: "/partenaires/facturation",
        icon: "FilePieChart",
      },
      {
        id: "suivi-caf",
        title: "Suivi CAF",
        href: "/partenaires/suivi-caf",
        icon: "Building2",
      },
      {
        id: "planning-partenaires",
        title: "Planning partenaires",
        href: "/partenaires/planning",
        icon: "CalendarClock",
      },
    ],
  },
  {
    id: "centres",
    title: "Centres & séjours",
    subtitle: "Gestion logistique et planning des séjours",
    items: [
      {
        id: "centres",
        title: "Centres",
        href: "/centres",
        icon: "Building",
      },
      {
        id: "sejours",
        title: "Séjours",
        href: "/centres/sejours",
        icon: "CalendarDays",
      },
      {
        id: "inscriptions",
        title: "Inscriptions",
        href: "/centres/inscriptions",
        icon: "ClipboardList",
      },
      {
        id: "equipes",
        title: "Tableau équipes",
        href: "/centres/equipes",
        icon: "Layers",
      },
      {
        id: "gestion-sejours",
        title: "Gestion séjours",
        href: "/centres/gestion",
        icon: "ClipboardCheck",
      },
      {
        id: "documents-sejours",
        title: "Documents séjours",
        href: "/centres/documents",
        icon: "Files",
      },
    ],
  },
  {
    id: "prestations",
    title: "Prestations & budgets",
    subtitle: "Pilotage des achats et budgets",
    items: [
      {
        id: "prestataires",
        title: "Gestion prestataires",
        href: "/prestations/prestataires",
        icon: "BriefcaseBusiness",
      },
      {
        id: "gestion-prestations",
        title: "Gestion prestations",
        href: "/prestations/gestion",
        icon: "ClipboardSignature",
      },
      {
        id: "calendrier-prestations",
        title: "Calendrier prestations",
        href: "/prestations/calendrier",
        icon: "CalendarRange",
      },
      {
        id: "budgets",
        title: "Budgets séjours",
        href: "/prestations/budgets",
        icon: "Wallet",
      },
    ],
  },
  {
    id: "direction",
    title: "Gestion par les directeurs",
    subtitle: "Outils de pilotage et RH",
    items: [
      {
        id: "menu-directeur",
        title: "Menu directeur",
        href: "/direction",
        icon: "ShieldCheck",
      },
      {
        id: "menu-encadrant",
        title: "Menu encadrant",
        href: "/direction/encadrants",
        icon: "UsersRound",
      },
      {
        id: "recrutement",
        title: "Recrutement",
        href: "/direction/recrutement",
        icon: "CheckCircle2",
      },
      {
        id: "personnel",
        title: "Personnel",
        href: "/personnel",
        icon: "Users",
      },
      {
        id: "gestion-contrats",
        title: "Gestion des contrats",
        href: "/direction/contrats",
        icon: "Files",
      },
      {
        id: "communications",
        title: "Téléphone encadrant",
        href: "/direction/communications",
        icon: "Phone",
      },
    ],
  },
  {
    id: "transports",
    title: "Transports",
    subtitle: "Convoyages et logistique transport",
    items: [
      {
        id: "convoyages",
        title: "Convoyages",
        href: "/transports/convoyages",
        icon: "Bus",
      },
      {
        id: "gestion-billets",
        title: "Gestion billets",
        href: "/transports/billets",
        icon: "Ticket",
      },
      {
        id: "planning-transports",
        title: "Planning",
        href: "/transports/planning",
        icon: "CalendarClock",
      },
      {
        id: "fiches-pe",
        title: "Fiches P-E",
        href: "/transports/fiches-pe",
        icon: "FileText",
      },
      {
        id: "gestion-voyagistes",
        title: "Gestion voyagistes",
        href: "/transports/voyagistes",
        icon: "BriefcaseBusiness",
      },
      {
        id: "villes-depart",
        title: "Villes de départ",
        href: "/transports/villes",
        icon: "MapPin",
      },
      {
        id: "tickets-metro",
        title: "Tickets métro",
        href: "/transports/tickets-metro",
        icon: "Ticket",
      },
      {
        id: "bons-sncf",
        title: "Bons d'achats SNCF",
        href: "/transports/sncf",
        icon: "Train",
      },
      {
        id: "resume-billets",
        title: "Résumé billets",
        href: "/transports/resume-billets",
        icon: "ClipboardList",
      },
      {
        id: "controle-presences",
        title: "Contrôle présences",
        href: "/transports/presences",
        icon: "ClipboardCheck",
      },
    ],
  },
];

export const supportContacts = [
  {
    label: "Support direction",
    value: "+33 1 23 45 67 89",
  },
  {
    label: "Urgences encadrants",
    value: "+33 6 98 76 54 32",
  },
];

export const announcement = {
  title: "Planning Été 2025",
  description:
    "Les séjours et équipes sont disponibles. Pensez à finaliser les dossiers familles avant le 30 avril.",
  actionLabel: "Consulter le planning",
  actionHref: "/direction/planning-ete",
};

export const knowledgeBaseLinks = [
  {
    label: "Guide d'onboarding",
    href: "/services/knowledge-base/onboarding",
  },
  {
    label: "Checklist départ séjours",
    href: "/services/knowledge-base/checklist",
  },
  {
    label: "Foire aux questions",
    href: "/services/knowledge-base/faq",
  },
  {
    label: "Modèles de communication",
    href: "/services/knowledge-base/modeles",
  },
];

export const landingMainTiles: FeatureItem[] = [
  {
    id: "clients",
    title: "Clients",
    description: "Fiches familles et suivis",
    href: "/clients",
    icon: "Users",
  },
  {
    id: "sejours",
    title: "Séjours",
    description: "Calendriers et centres",
    href: "/sejours",
    icon: "CalendarDays",
  },
  {
    id: "inscriptions",
    title: "Inscriptions",
    description: "Dossiers en cours",
    href: "/inscription",
    icon: "ClipboardList",
  },
  {
    id: "partenaires",
    title: "Partenaires",
    description: "Financeurs et prestataires",
    href: "/partenaires",
    icon: "BriefcaseBusiness",
  },
  {
    id: "transports",
    title: "Transports",
    description: "Convoyages et billets",
    href: "/transports",
    icon: "Bus",
  },
  {
    id: "personnel",
    title: "Personnel",
    description: "Équipes et planning",
    href: "/personnel",
    icon: "UsersRound",
  },
];

export const primaryNavItems: PrimaryNavItem[] = [
  { label: "Famille", href: "/familles" },
  { label: "Séjours", href: "/sejours" },
  { label: "Inscription", href: "/inscription" },
  { label: "Fiche", href: "/fiche" },
  { label: "Partenaires", href: "/partenaires" },
  { label: "Convocation", href: "/convocation" },
  { label: "Transports", href: "/transports" },
  { label: "Paramètres", href: "/parametres" },
];

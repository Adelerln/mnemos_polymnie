"use client";

import Link from "next/link";
import {
  ArrowRight,
  Bed,
  BriefcaseBusiness,
  Building2,
  Bus,
  CalendarClock,
  CalendarRange,
  Calculator,
  ChevronDown,
  ChevronRight,
  ClipboardCheck,
  ClipboardList,
  CreditCard,
  FilePieChart,
  FileText,
  Files,
  HandCoins,
  Handshake,
  IdCard,
  LineChart,
  Megaphone,
  NotebookPen,
  Phone,
  Plane,
  Receipt,
  Route,
  ScrollText,
  Ticket,
  UserPlus,
  Users,
  UsersRound,
  Wallet,
  Wrench,
} from "lucide-react";
import { useEffect, useMemo, useState, type ComponentType } from "react";
import { useRouter } from "next/navigation";

import { useAuth } from "@/hooks/useAuth";

type SubCard = {
  label: string;
  href: string;
  icon: ComponentType<{ className?: string; strokeWidth?: number }>;
};

type HomeCard = {
  id: string;
  title: string;
  href: string;
  subCards: SubCard[];
  icon: ComponentType<{ className?: string; strokeWidth?: number }>;
};

const cards: HomeCard[] = [
  {
    id: "clients",
    title: "Clients",
    href: "/clients",
    icon: Users,
    subCards: [
      { label: "Règlements", href: "/clients/reglements", icon: CreditCard },
      { label: "Factures", href: "/clients/factures", icon: FileText },
      { label: "Avoirs", href: "/clients/avoirs", icon: Receipt },
      { label: "Devis", href: "/clients/devis", icon: LineChart },
    ],
  },
  {
    id: "sejours",
    title: "Séjours",
    href: "/sejours",
    icon: CalendarRange,
    subCards: [
      { label: "Centres", href: "/centres", icon: Building2 },
      { label: "Gestion Séjours", href: "/sejours", icon: ClipboardCheck },
      { label: "Repos Compensateurs", href: "/sejours/repos-compensateurs", icon: Bed },
      { label: "Prestations", href: "/prestations", icon: Wrench },
      { label: "Prestataires", href: "/prestations/prestataires", icon: BriefcaseBusiness },
      { label: "Calendrier", href: "/prestations/calendrier", icon: CalendarClock },
      { label: "Budget", href: "/prestations/budgets", icon: Wallet },
      { label: "Numéros utiles", href: "/familles/numeros-utiles", icon: Phone },
    ],
  },
  {
    id: "inscriptions",
    title: "Inscriptions",
    href: "/inscriptions",
    icon: ClipboardList,
    subCards: [],
  },
  {
    id: "partenaires",
    title: "Partenaires",
    href: "/partenaires",
    icon: Handshake,
    subCards: [
      { label: "Tableau de bord financier", href: "/partenaires/finances", icon: LineChart },
      { label: "Factures et devis", href: "/partenaires/facturation", icon: FilePieChart },
      { label: "Prises en charge", href: "/partenaires/prises-en-charge", icon: HandCoins },
    ],
  },
  {
    id: "transports",
    title: "Transports",
    href: "/transports",
    icon: Bus,
    subCards: [
      { label: "Convocations (Aller / Retour)", href: "/transports/convocations", icon: Megaphone },
      { label: "Tronçons", href: "/transports/troncons", icon: Route },
      { label: "Planning", href: "/transports/planning", icon: CalendarClock },
      { label: "Billets", href: "/transports/billets", icon: Ticket },
      { label: "Fiches / documents", href: "/transports/documents", icon: Files },
      { label: "Voyagistes et émissions", href: "/transports/voyagistes", icon: Plane },
    ],
  },
  {
    id: "personnel",
    title: "Personnel",
    href: "/personnel",
    icon: IdCard,
    subCards: [
      { label: "Documents", href: "/personnel/documents", icon: FileText },
      { label: "Contrats", href: "/personnel/contrats", icon: ScrollText },
      { label: "Registres perso", href: "/personnel/registres", icon: NotebookPen },
      { label: "Tableau équipes", href: "/direction/encadrants", icon: UsersRound },
      { label: "Comptabilité", href: "/personnel/comptabilite", icon: Calculator },
      { label: "Recrutement", href: "/direction/recrutement", icon: UserPlus },
    ],
  },
];

export default function Homepage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [openCardId, setOpenCardId] = useState<string | null>(null);

  const toggleCard = (id: string, hasSubCards: boolean) => {
    if (!hasSubCards) {
      router.push(cards.find((card) => card.id === id)?.href ?? "/");
      return;
    }
    setOpenCardId((prev) => (prev === id ? null : id));
  };

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
    }
  }, [loading, user, router]);

  const heading = useMemo(
    () => ({
      title: "Espace Polymnie",
      subtitle: "Sélectionnez un module pour afficher les sous-éléments en dessous.",
    }),
    []
  );

  const activeCard = useMemo(
    () => cards.find((card) => card.id === openCardId),
    [openCardId]
  );

  if (loading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f5f5f5] text-sm text-neutral-500">
        Chargement en cours…
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-[#f5f5f5] px-4 py-12 text-neutral-900">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-10">
        <header className="space-y-4 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-neutral-500">
            {heading.title}
          </p>
          <h1 className="text-4xl font-semibold leading-tight">
            Page d&apos;accueil
          </h1>
          <p className="text-base text-neutral-600">
            {heading.subtitle}
          </p>
        </header>

        <section className="rounded-[32px] border border-neutral-200 bg-white/80 p-8 shadow-lg">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
            {cards.map((card) => {
              const isOpen = openCardId === card.id;
              const hasSubCards = card.subCards.length > 0;
              const Icon = card.icon;

              return (
                <div
                  key={card.id}
                  className="flex min-h-[220px] flex-col items-center justify-between rounded-3xl border border-neutral-200 bg-white px-5 py-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg"
                >
                  <button
                    type="button"
                    className="flex h-full w-full flex-col items-center gap-4 text-center"
                    onClick={() => toggleCard(card.id, hasSubCards)}
                  >
                    <div className="flex size-14 items-center justify-center rounded-2xl bg-neutral-100 text-neutral-800">
                      <Icon className="h-7 w-7" strokeWidth={1.6} />
                    </div>
                    <p className="text-base font-semibold text-neutral-900">
                      {card.title}
                    </p>
                    {hasSubCards ? (
                      <ChevronDown
                        className={`h-5 w-5 text-neutral-500 transition ${isOpen ? "rotate-180" : ""}`}
                      />
                    ) : (
                      <ChevronRight className="h-5 w-5 text-neutral-500" />
                    )}
                  </button>
                </div>
              );
            })}
          </div>

          <div className="mt-6 rounded-3xl border border-neutral-200 bg-white/80 p-6 shadow-sm">
            {activeCard ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <activeCard.icon className="h-6 w-6 text-neutral-800" strokeWidth={1.5} />
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-neutral-500">
                        {activeCard.title}
                      </p>
                      <p className="text-sm text-neutral-600">
                        {activeCard.subCards.length > 0
                          ? "Choisissez un élément ci-dessous."
                          : "Accès direct disponible."}
                      </p>
                    </div>
                  </div>
                  <Link
                    href={activeCard.href}
                    className="inline-flex items-center gap-2 rounded-full border border-neutral-200 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-neutral-700 transition hover:border-neutral-900 hover:text-neutral-900"
                  >
                    Accès principal
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>

                {activeCard.subCards.length > 0 ? (
                  <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                    {activeCard.subCards.map((sub) => (
                      <Link
                        key={sub.label}
                        href={sub.href}
                        className="flex items-center justify-between rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm font-medium text-neutral-800 transition hover:-translate-y-0.5 hover:border-neutral-900 hover:shadow-md"
                      >
                        <span className="flex items-center gap-2">
                          <sub.icon className="h-4 w-4 text-neutral-600" strokeWidth={1.6} />
                          {sub.label}
                        </span>
                        <ArrowRight className="h-4 w-4 text-neutral-500" />
                      </Link>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-neutral-600">
                    Aucun élément secondaire. Utilisez l&apos;accès principal ci-dessus.
                  </p>
                )}
              </div>
            ) : (
              <p className="text-sm text-neutral-600">Sélectionnez une carte pour afficher ses éléments ici.</p>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

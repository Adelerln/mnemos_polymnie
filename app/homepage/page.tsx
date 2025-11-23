"use client";

import Link from "next/link";
import { ArrowRight, ChevronDown, ChevronRight, FolderOpen } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { useAuth } from "@/hooks/useAuth";

type SubCard = { label: string; href: string };

type HomeCard = {
  id: string;
  title: string;
  href: string;
  subCards: SubCard[];
};

const cards: HomeCard[] = [
  {
    id: "clients",
    title: "Clients",
    href: "/clients",
    subCards: [
      { label: "Règlements", href: "/clients/reglements" },
      { label: "Factures", href: "/clients/factures" },
      { label: "Avoirs", href: "/clients/avoirs" },
      { label: "Devis", href: "/clients/devis" },
    ],
  },
  {
    id: "sejours",
    title: "Séjours",
    href: "/sejours",
    subCards: [
      { label: "Centres", href: "/centres" },
      { label: "Gestion Séjours", href: "/sejours" },
      { label: "Repos Compensateurs", href: "/sejours/repos-compensateurs" },
      { label: "Prestations", href: "/prestations" },
      { label: "Prestataires", href: "/prestations/prestataires" },
      { label: "Calendrier", href: "/prestations/calendrier" },
      { label: "Budget", href: "/prestations/budgets" },
      { label: "Numéros utiles", href: "/familles/numeros-utiles" },
    ],
  },
  {
    id: "inscriptions",
    title: "Inscriptions",
    href: "/inscriptions",
    subCards: [],
  },
  {
    id: "partenaires",
    title: "Partenaires",
    href: "/partenaires",
    subCards: [
      { label: "Tableau de bord financier", href: "/partenaires/finances" },
      { label: "Factures et devis", href: "/partenaires/facturation" },
      { label: "Prises en charge", href: "/partenaires/prises-en-charge" },
    ],
  },
  {
    id: "transports",
    title: "Transports",
    href: "/transports",
    subCards: [
      { label: "Convocations (Aller / Retour)", href: "/transports/convocations" },
      { label: "Tronçons", href: "/transports/troncons" },
      { label: "Planning", href: "/transports/planning" },
      { label: "Billets", href: "/transports/billets" },
      { label: "Fiches / documents", href: "/transports/documents" },
      { label: "Voyagistes et émissions", href: "/transports/voyagistes" },
    ],
  },
  {
    id: "personnel",
    title: "Personnel",
    href: "/personnel",
    subCards: [
      { label: "Documents", href: "/personnel/documents" },
      { label: "Contrats", href: "/personnel/contrats" },
      { label: "Registres perso", href: "/personnel/registres" },
      { label: "Tableau équipes", href: "/direction/encadrants" },
      { label: "Comptabilité", href: "/personnel/comptabilite" },
      { label: "Recrutement", href: "/direction/recrutement" },
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
      subtitle: "Ouvrez un module pour afficher ses sous-menus.",
    }),
    []
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
          <div className="grid gap-6 md:grid-cols-2">
            {cards.map((card) => {
              const isOpen = openCardId === card.id;
              const hasSubCards = card.subCards.length > 0;

              return (
                <div
                  key={card.id}
                  className="rounded-3xl border border-neutral-200 bg-white px-6 py-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg"
                >
                  <button
                    type="button"
                    className="flex w-full items-center justify-between gap-3 text-left"
                    onClick={() => toggleCard(card.id, hasSubCards)}
                  >
                    <div className="space-y-1">
                      <div className="inline-flex items-center gap-2 rounded-full bg-neutral-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-neutral-500">
                        <FolderOpen className="h-4 w-4" strokeWidth={1.6} />
                        {card.title}
                      </div>
                      <p className="text-lg font-semibold text-neutral-900">
                        {hasSubCards ? "Ouvrir les sous-cartes" : "Accéder directement"}
                      </p>
                    </div>
                    <span className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.2em] text-neutral-500">
                      {hasSubCards ? (
                        <>
                          <ChevronDown
                            className={`h-5 w-5 transition ${isOpen ? "rotate-180" : ""}`}
                          />
                        </>
                      ) : (
                        <ChevronRight className="h-5 w-5" />
                      )}
                    </span>
                  </button>

                  {hasSubCards && isOpen ? (
                    <div className="mt-4 space-y-2 rounded-2xl border border-neutral-100 bg-neutral-50 p-3">
                      {card.subCards.map((sub) => (
                        <Link
                          key={sub.label}
                          href={sub.href}
                          className="flex items-center justify-between rounded-xl px-4 py-3 text-sm font-medium text-neutral-800 transition hover:bg-white hover:shadow-sm"
                        >
                          <span>{sub.label}</span>
                          <ArrowRight className="h-4 w-4 text-neutral-500" />
                        </Link>
                      ))}
                    </div>
                  ) : null}

                  {!hasSubCards ? (
                    <div className="mt-4">
                      <Link
                        href={card.href}
                        className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.18em] text-neutral-700 transition hover:text-neutral-900"
                      >
                        Accéder
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    </div>
                  ) : (
                    <div className="mt-4">
                      <Link
                        href={card.href}
                        className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-neutral-500 transition hover:text-neutral-900"
                      >
                        Accès principal
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
}

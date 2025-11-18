"use client";

import Link from "next/link";
import {
  Bus,
  CalendarDays,
  ClipboardList,
  FileText,
  LayoutDashboard,
  Megaphone,
  Settings,
  Users,
  BriefcaseBusiness,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { primaryNavItems } from "@/lib/constants";
import { useAuth } from "@/hooks/useAuth";

const navMeta: Record<
  string,
  {
    icon: LucideIcon;
    description: string;
  }
> = {
  Famille: {
    icon: Users,
    description: "Fiches familles, règlements et suivis quotidiens",
  },
  Séjours: {
    icon: CalendarDays,
    description: "Calendriers, centres et opérations en cours",
  },
  Inscriptions: {
    icon: ClipboardList,
    description: "Dossiers en ligne et validations en attente",
  },
  Fiche: {
    icon: FileText,
    description: "Informations centrales des séjours",
  },
  Partenaires: {
    icon: BriefcaseBusiness,
    description: "Financeurs, conventions et budgets associés",
  },
  Convocation: {
    icon: Megaphone,
    description: "Documents et convocations équipes",
  },
  Transports: {
    icon: Bus,
    description: "Convoyages, billets et suivi des trajets",
  },
  Paramètres: {
    icon: Settings,
    description: "Configuration Polymnie et accès avancés",
  },
};

export default function Homepage() {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
    }
  }, [loading, user, router]);

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
            Espace Polymnie
          </p>
          <h1 className="text-4xl font-semibold leading-tight">
            Choisissez une rubrique pour commencer
          </h1>
          <p className="text-base text-neutral-600">
            Retrouvez les modules principaux présents dans la barre de navigation. Chaque
            carte ouvre directement l’espace correspondant.
          </p>
        </header>

        <section className="rounded-[32px] border border-neutral-200 bg-white/80 p-8 shadow-lg">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {primaryNavItems.map((item) => {
              const meta = navMeta[item.label] ?? {
                icon: LayoutDashboard,
                description: "Accès rapide",
              };
              const Icon = meta.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="group flex flex-col gap-4 rounded-3xl border border-neutral-200 bg-white px-6 py-5 shadow-sm transition hover:-translate-y-1 hover:border-neutral-900 hover:shadow-lg"
                >
                  <div className="flex items-center justify-between">
                    <Icon className="h-10 w-10 text-neutral-900" strokeWidth={1.5} />
                    <span className="text-xs font-semibold uppercase tracking-[0.3em] text-neutral-400">
                      {item.label}
                    </span>
                  </div>
                  <div>
                    <p className="text-xl font-semibold text-neutral-900">{item.label}</p>
                    <p className="mt-2 text-sm text-neutral-500">{meta.description}</p>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
}

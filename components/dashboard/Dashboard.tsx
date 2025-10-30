"use client";

import { useSession } from "@/hooks/useSession";
import { supabase } from "@/lib/supabase-client";
import {
  Activity,
  AlertTriangle,
  ArrowUpRight,
  Download,
  LogOut,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

import {
  activityFeed,
  applications,
  latestUpdates,
  overviewStats,
} from "./data";

export const Dashboard = () => {
  const router = useRouter();
  const { user, mnemosId, loading } = useSession();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [logoutError, setLogoutError] = useState<string | null>(null);

  const welcomeName = useMemo(() => {
    if (!user?.email) {
      return "";
    }
    const [firstPart] = user.email.split("@");
    return firstPart.replace(/\./g, " ");
  }, [user?.email]);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    setLogoutError(null);

    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        setLogoutError(error.message);
        return;
      }

      router.replace("/login");
      router.refresh();
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-100 py-10">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 sm:px-6 lg:px-8">
        <header className="flex flex-col justify-between gap-4 rounded-3xl border border-neutral-200 bg-white/90 p-6 shadow-lg shadow-neutral-900/5 backdrop-blur lg:flex-row lg:items-center">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-neutral-500">
              Tableau de bord
            </p>
            <h1 className="mt-2 text-3xl font-semibold text-neutral-900">
              Bonjour{welcomeName ? `, ${welcomeName}` : ""} 👋
            </h1>
            <p className="mt-2 max-w-xl text-sm text-neutral-600">
              Surveillez vos séjours, vos équipes et la relation familles en un clin d&apos;œil.
              Les indicateurs ci-dessous sont mis à jour en temps réel via Supabase.
            </p>
          </div>
          <div className="flex flex-col items-start gap-3 text-sm text-neutral-700 sm:flex-row sm:items-center sm:gap-6">
            <div className="space-y-1">
              <p className="font-semibold text-neutral-900">Compte connecté</p>
              <p>{user?.email ?? "Utilisateur inconnu"}</p>
              <p className="text-xs uppercase tracking-[0.18em] text-neutral-500">
                ID Supabase · {user?.id ?? "—"}
              </p>
              <p className="text-xs uppercase tracking-[0.18em] text-neutral-500">
                ID Mnemos · {mnemosId ?? "—"}
              </p>
            </div>
            <button
              type="button"
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="inline-flex items-center gap-2 rounded-full border border-neutral-200 bg-neutral-900 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-black disabled:cursor-not-allowed disabled:bg-neutral-500"
            >
              <LogOut className="size-4" />
              {isLoggingOut ? "Déconnexion…" : "Se déconnecter"}
            </button>
          </div>
        </header>

        {logoutError ? (
          <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            {logoutError}
          </p>
        ) : null}

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {overviewStats.map((stat) => (
            <article
              key={stat.title}
              className="rounded-2xl border border-neutral-200 bg-white p-[1px] shadow-sm shadow-neutral-900/5"
            >
              <div className={`rounded-[1.05rem] bg-gradient-to-r ${stat.accent} p-4 text-white`}>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] opacity-80">
                  {stat.title}
                </p>
                <div className="mt-3 flex items-end justify-between">
                  <p className="text-2xl font-semibold">{stat.value}</p>
                  <ArrowUpRight className="size-5 opacity-80" />
                </div>
                <p className="mt-2 text-sm opacity-90">{stat.delta}</p>
              </div>
            </article>
          ))}
        </section>

        <section className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
          <div className="space-y-6">
            <article className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-md shadow-neutral-900/5">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-semibold uppercase tracking-[0.22em] text-neutral-500">
                    Indicateurs d&apos;activité
                  </h2>
                  <p className="mt-2 text-lg font-semibold text-neutral-900">
                    Synthèse hebdomadaire
                  </p>
                </div>
                <button className="inline-flex items-center gap-2 rounded-full border border-neutral-200 px-3 py-1.5 text-xs font-medium uppercase tracking-[0.18em] text-neutral-600 transition hover:border-neutral-900 hover:text-neutral-900">
                  Exporter
                  <Download className="size-4" />
                </button>
              </div>
              <div className="mt-6 h-64 rounded-2xl bg-[radial-gradient(circle_at_top,_#fef3c7,_transparent_65%),_linear-gradient(120deg,_#f5f5f5,_#ffffff)] p-6">
                <div className="flex h-full flex-col justify-between">
                  <div className="flex items-center justify-between text-xs text-neutral-500">
                    <span>Juin</span>
                    <span>Juillet</span>
                    <span>Août</span>
                    <span>Sept.</span>
                    <span>Oct.</span>
                  </div>
                  <div className="relative mt-4 flex-1">
                    <div className="absolute inset-0 grid grid-cols-12 gap-2 opacity-40">
                      {Array.from({ length: 12 }).map((_, index) => (
                        <span key={index} className="rounded-full bg-neutral-200" />
                      ))}
                    </div>
                    <div className="absolute inset-4 flex items-end gap-2">
                      {[45, 62, 55, 78, 90, 68, 74, 96, 84, 72, 88, 73].map((value, index) => (
                        <div
                          key={index}
                          style={{ height: `${value}%` }}
                          className="relative w-full rounded-full bg-gradient-to-t from-orange-200 via-orange-300 to-orange-400"
                        />
                      ))}
                    </div>
                  </div>
                  <div className="mt-6 grid grid-cols-3 gap-3 text-xs text-neutral-600">
                    <div className="rounded-lg border border-neutral-200 p-3 text-center">
                      <p className="font-semibold text-neutral-900">+32%</p>
                      <p>Demandes familles</p>
                    </div>
                    <div className="rounded-lg border border-neutral-200 p-3 text-center">
                      <p className="font-semibold text-neutral-900">+18%</p>
                      <p>Inscriptions validées</p>
                    </div>
                    <div className="rounded-lg border border-neutral-200 p-3 text-center">
                      <p className="font-semibold text-neutral-900">-7%</p>
                      <p>Retards dossiers</p>
                    </div>
                  </div>
                </div>
              </div>
            </article>

            <article className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-md shadow-neutral-900/5">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-semibold uppercase tracking-[0.22em] text-neutral-500">
                    Performances applications
                  </h2>
                  <p className="mt-2 text-lg font-semibold text-neutral-900">
                    Vue d&apos;ensemble des modules
                  </p>
                </div>
                <span className="text-xs font-medium uppercase tracking-[0.18em] text-neutral-500">
                  Mise à jour · il y a 2 min
                </span>
              </div>
              <div className="mt-4 overflow-hidden rounded-2xl border border-neutral-200">
                <table className="min-w-full divide-y divide-neutral-200 text-sm text-neutral-700">
                  <thead className="bg-neutral-50 text-xs uppercase tracking-[0.18em] text-neutral-500">
                    <tr>
                      <th className="px-4 py-3 text-left">Application</th>
                      <th className="px-4 py-3 text-right">Ventes</th>
                      <th className="px-4 py-3 text-right">Prix</th>
                      <th className="px-4 py-3 text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-200">
                    {applications.map((app, index) => (
                      <tr key={app.name} className={index % 2 === 1 ? "bg-neutral-50" : "bg-white"}>
                        <td className="px-4 py-4">
                          <div className="flex flex-col">
                            <span className="font-semibold text-neutral-900">
                              {app.name}
                            </span>
                            <span className="text-xs text-neutral-500">
                              {app.description}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-4 text-right font-semibold text-neutral-900">
                          {app.sales.toLocaleString("fr-FR")}
                        </td>
                        <td className="px-4 py-4 text-right">{app.price}</td>
                        <td className="px-4 py-4 text-right font-semibold text-emerald-600">
                          {app.total}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </article>

            <article className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-md shadow-neutral-900/5">
              <h2 className="text-sm font-semibold uppercase tracking-[0.22em] text-neutral-500">
                Derniers événements
              </h2>
              <div className="mt-4 space-y-4">
                {latestUpdates.map((item) => (
                  <div
                    key={item.description}
                    className="flex items-start gap-3 rounded-2xl border border-neutral-200 p-4"
                  >
                    <div
                      className={`mt-0.5 flex size-10 items-center justify-center rounded-full bg-neutral-900 text-sm font-semibold uppercase tracking-[0.12em] text-white`}
                    >
                      {item.type.slice(0, 1)}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-neutral-900">
                        {item.description}
                      </p>
                      <p className="text-xs uppercase tracking-[0.16em] text-neutral-500">
                        {item.timeAgo}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </article>
          </div>

          <aside className="space-y-6">
            <article className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-md shadow-neutral-900/5">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold uppercase tracking-[0.22em] text-neutral-500">
                  Risque projet
                </h2>
                <AlertTriangle className="size-5 text-amber-500" />
              </div>
              <div className="mt-6 flex flex-col items-center justify-center gap-4">
                <div className="relative flex size-32 items-center justify-center rounded-full bg-slate-100">
                  <div className="size-28 rounded-full border-8 border-amber-400" />
                  <span className="absolute text-2xl font-semibold text-neutral-900">
                    5
                  </span>
                </div>
                <p className="text-sm font-medium text-neutral-900">Équilibré</p>
                <p className="text-xs text-neutral-500 text-center">
                  Surveillez les dossiers transports et les pièces manquantes.
                </p>
                <button className="inline-flex items-center gap-2 rounded-full border border-amber-400 bg-amber-50 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-amber-600 transition hover:border-amber-500">
                  Ajuster le plan
                  <ArrowUpRight className="size-4" />
                </button>
              </div>
            </article>

            <article className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-md shadow-neutral-900/5">
              <div className="flex items-center gap-3">
                <Activity className="size-5 text-neutral-500" />
                <h2 className="text-sm font-semibold uppercase tracking-[0.22em] text-neutral-500">
                  Activité équipe
                </h2>
              </div>
              <div className="mt-4 space-y-4">
                {activityFeed.map((item) => (
                  <div key={`${item.actor}-${item.timeAgo}`} className="flex items-start gap-3">
                    <span className="mt-1 size-2 rounded-full bg-emerald-500" />
                    <div>
                <p className="text-sm text-neutral-700">
                        <span className="font-semibold text-neutral-900">{item.actor}</span> {item.action}
                      </p>
                      <p className="text-xs uppercase tracking-[0.16em] text-neutral-500">
                        {item.timeAgo}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </article>

            <article className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-md shadow-neutral-900/5">
              <h2 className="text-sm font-semibold uppercase tracking-[0.22em] text-neutral-500">
                Support
              </h2>
              <div className="mt-4 space-y-3 text-sm text-neutral-700">
                <p>
                  <span className="font-semibold text-neutral-900">Conseillère familles :</span>
                  <br />
                  sophie.dupont@polymnie.fr · 01 45 89 12 34
                </p>
                <p>
                  <span className="font-semibold text-neutral-900">Astuce :</span>
                  synchronisez les nouveaux partenaires depuis la page &quot;Partenaires&quot; pour alimenter vos tableaux.
                </p>
                <button className="mt-4 inline-flex items-center justify-center rounded-full border border-neutral-200 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-neutral-600 transition hover:border-neutral-900 hover:text-neutral-900">
                  Consulter le wiki équipes
                </button>
              </div>
            </article>
          </aside>
        </section>

        {loading ? (
          <p className="text-center text-xs uppercase tracking-[0.18em] text-neutral-400">
            Chargement des données de session…
          </p>
        ) : null}
      </div>
    </div>
  );
};

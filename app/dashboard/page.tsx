"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { Dashboard } from "@/components/dashboard/Dashboard";
import { useSession } from "@/hooks/useSession";

export default function DashboardPage() {
  const router = useRouter();
  const { user, loading } = useSession();

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login?redirectedFrom=/dashboard");
    }
  }, [loading, user, router]);

  if (!user) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-neutral-100 text-xs font-semibold uppercase tracking-[0.28em] text-neutral-400">
        Chargement du tableau de bord…
      </div>
    );
  }

  return <Dashboard />;
}

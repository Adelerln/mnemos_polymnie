"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { UserRound } from "lucide-react";

import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabase-client";
import { primaryNavItems } from "@/lib/constants";
import { cn } from "@/lib/utils";

export const SiteHeader = () => {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading } = useAuth();
  const isAuthPage =
    pathname?.startsWith("/login") || pathname?.startsWith("/signup");
  const isLandingPage = pathname === "/";

  if (isAuthPage || isLandingPage) {
    return null;
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.replace("/login");
    router.refresh();
  };

  return (
    <header className="sticky top-0 z-40 border-b border-neutral-200 bg-white/80 backdrop-blur">
      <div className="flex h-16 w-full items-center justify-between px-4 md:px-6 lg:px-8">
        <Link
          href="/homepage"
          className="text-sm font-semibold uppercase tracking-[0.22em] text-neutral-800"
        >
          Polymnie
        </Link>
        <div className="flex items-center gap-6">
          <nav className="hidden items-center gap-4 text-xs font-semibold uppercase tracking-[0.2em] text-neutral-500 md:flex">
            {primaryNavItems.map((item) => {
              const isActive =
                item.href === "/"
                  ? pathname === item.href
                  : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "relative flex-shrink-0 whitespace-nowrap pb-1.5 transition hover:text-neutral-900",
                    isActive && "text-neutral-900"
                  )}
                >
                  {item.label}
                  {isActive ? (
                    <span className="absolute inset-x-0 -bottom-1 block h-0.5 bg-neutral-900" />
                  ) : null}
                </Link>
              );
            })}
          </nav>
          {user ? (
            <div className="flex items-center gap-3 text-xs font-medium uppercase tracking-[0.18em] text-neutral-600">
              <UserRound className="hidden size-5 text-neutral-900 sm:inline" />
              <button
                type="button"
                onClick={handleSignOut}
                className="rounded-md border border-neutral-300 px-3 py-1.5 text-neutral-700 transition hover:border-neutral-900 hover:text-neutral-900"
                disabled={loading}
              >
                Déconnexion
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.18em]">
              <Link
                href="/login"
                className="rounded-md border border-neutral-300 px-3 py-1.5 text-neutral-700 transition hover:border-neutral-900 hover:text-neutral-900"
              >
                Connexion
              </Link>
              <Link
                href="/signup"
                className="rounded-md bg-neutral-900 px-3 py-1.5 text-white transition hover:bg-neutral-800"
              >
                S&apos;inscrire
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

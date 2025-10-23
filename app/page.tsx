import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { Footer } from "@/components/layout";
import { LandingTileGrid } from "@/components/features";
import { landingMainTiles } from "@/lib/constants";
import { Button } from "@/components/ui";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-neutral-100 text-neutral-900">
      <main className="flex-1">
        <section className="relative overflow-hidden border-b border-neutral-200 bg-gradient-to-b from-neutral-950 via-neutral-900 to-neutral-800 text-white">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.12),transparent_55%)]" />
          <div className="relative mx-auto flex max-w-4xl flex-col items-center gap-8 px-6 py-24 text-center md:py-28">
            <span className="rounded-full border border-white/20 px-4 py-1 text-xs font-medium uppercase tracking-[0.18em] text-white/70">
              Mnemos SaaS
            </span>
            <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
              La plateforme moderne pour organiser vos colonies de vacances
            </h1>
            <p className="max-w-2xl text-sm text-white/70 sm:text-base">
              Retrouvez toutes vos données clés (familles, partenaires, séjours,
              équipes, transports) dans une interface unique. Simple, professionnelle
              et pensée pour vos équipes.
            </p>
            <Button
              asChild
              size="lg"
              className="bg-white text-neutral-900 transition hover:bg-white/90"
            >
              <Link href="/familles">
                Pour accéder
                <ArrowRight className="size-4" />
              </Link>
            </Button>
          </div>
        </section>

        <section className="mx-auto max-w-5xl px-4 py-16 md:px-6 lg:px-8">
          <div className="mb-10 text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-500">
              Modules clés
            </p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-neutral-900 sm:text-3xl">
              Accédez rapidement aux espaces essentiels
            </h2>
            <p className="mt-3 text-sm text-neutral-600 sm:text-base">
              Choisissez un module pour retrouver vos informations et actions quotidiennes.
            </p>
          </div>

          <LandingTileGrid items={landingMainTiles} />
        </section>
      </main>

      <Footer />
    </div>
  );
}

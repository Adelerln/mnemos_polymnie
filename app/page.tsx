import { Footer } from "@/components/layout";
import { LandingTileGrid } from "@/components/features";
import { landingMainTiles } from "@/lib/constants";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-neutral-100 text-neutral-900">
      <main className="flex-1">
        <section className="mx-auto max-w-[96rem] px-8 py-24 md:px-16 lg:px-20">
          <div className="space-y-16 rounded-[44px] border-[12px] border-neutral-900 p-16 text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-500">
              Modules clés
            </p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-neutral-900 sm:text-3xl">
              Accédez rapidement aux espaces essentiels
            </h2>
            <p className="mt-1 text-sm text-neutral-600 sm:mt-2 sm:text-base">
              Choisissez un module pour retrouver vos informations et actions quotidiennes.
            </p>

            <LandingTileGrid items={landingMainTiles} />
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

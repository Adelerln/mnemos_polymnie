import Link from "next/link";
import { CalendarClock, Menu } from "lucide-react";

import { IconButton } from "@/components/ui";
import { Navbar } from "./Navbar";

export const Header = () => (
  <header className="bg-neutral-950 text-white">
    <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-4 md:px-6 lg:px-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <IconButton
            tone="ghost"
            label="Menu principal"
            className="hidden border-white/20 text-white hover:bg-white/5 md:inline-flex"
          >
            <Menu className="size-4" />
          </IconButton>
          <div>
            <Link href="/" className="text-base font-semibold tracking-tight">
              Menu logiciel Thalie
            </Link>
            <p className="text-xs text-white/60">
              Gestion des colonies de vacances
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <IconButton
            tone="ghost"
            label="Notifications"
            className="border-white/20 text-white hover:bg-white/5"
          >
            <CalendarClock className="size-4" />
          </IconButton>
          <Link
            href="/direction/planning-ete"
            className="inline-flex items-center rounded-full bg-white px-4 py-2 text-xs font-semibold uppercase tracking-wide text-neutral-900 transition hover:bg-white/90"
          >
            Planning
          </Link>
        </div>
      </div>

      <Navbar />
    </div>
  </header>
);

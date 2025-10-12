"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { primaryNavItems } from "@/lib/constants";
import { cn } from "@/lib/utils";

export const SiteHeader = () => {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 border-b border-neutral-200 bg-white/80 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 md:px-6 lg:px-8">
        <Link
          href="/"
          className="text-sm font-semibold uppercase tracking-[0.22em] text-neutral-800"
        >
          Thalie
        </Link>
        <nav className="hidden items-center gap-6 text-xs font-semibold uppercase tracking-[0.2em] text-neutral-500 md:flex">
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
                  "relative pb-1.5 transition hover:text-neutral-900",
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
      </div>
    </header>
  );
};

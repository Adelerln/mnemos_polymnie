"use client";

import { useState } from "react";

import type { FeatureItem } from "@/types";
import { iconMap } from "@/lib/icon-map";
import { cn } from "@/lib/utils";
import Link from "next/link";

type LandingTileGridProps = {
  items: FeatureItem[];
};

const PLACEHOLDER_COUNT = 5;

export const LandingTileGrid = ({ items }: LandingTileGridProps) => {
  const [activeId, setActiveId] = useState<string | null>(null);

  const handleSelect = (id: string) => {
    setActiveId((current) => (current === id ? null : id));
  };

  return (
    <div className="space-y-8">
      <div className="grid min-w-[1080px] grid-cols-6 gap-4 overflow-x-auto rounded-2xl bg-transparent pb-2 md:min-w-full md:overflow-visible md:pb-0">
        {items.map((item) => {
          const Icon = iconMap[item.icon];
          const isActive = activeId === item.id;

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => handleSelect(item.id)}
              className={cn(
                "group flex aspect-square min-h-[160px] flex-col items-center justify-center gap-3 rounded-2xl border bg-white text-center shadow-sm transition focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900/50",
                isActive
                  ? "border-neutral-900 bg-neutral-900 text-white shadow-lg"
                  : "border-neutral-200 hover:-translate-y-1 hover:border-neutral-300 hover:shadow-lg"
              )}
            >
              <span
                className={cn(
                  "flex size-14 items-center justify-center rounded-full transition",
                  isActive
                    ? "bg-white text-neutral-900"
                    : "bg-neutral-900 text-white group-hover:bg-neutral-800"
                )}
              >
                {Icon ? <Icon className="size-6" /> : null}
              </span>
              <div className="space-y-1 px-4">
                <h3
                  className={cn(
                    "text-sm font-semibold uppercase tracking-[0.14em]",
                    isActive ? "text-white" : "text-neutral-900"
                  )}
                >
                  {item.title}
                </h3>
                {item.description ? (
                  <p
                    className={cn(
                      "text-xs",
                      isActive ? "text-white/80" : "text-neutral-500"
                    )}
                  >
                    {item.description}
                  </p>
                ) : null}
              </div>
              <Link
                href={item.href}
                className={cn(
                  "text-xs font-semibold uppercase tracking-[0.18em] transition",
                  isActive ? "text-white underline" : "text-neutral-500"
                )}
                onClick={(event) => event.stopPropagation()}
              >
                Accéder
              </Link>
            </button>
          );
        })}
      </div>

      {activeId ? (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
          {Array.from({ length: PLACEHOLDER_COUNT }).map((_, index) => (
            <div
              key={`${activeId}-placeholder-${index}`}
              className="h-32 rounded-2xl border border-dashed border-neutral-300 bg-white/40"
            />
          ))}
        </div>
      ) : null}
    </div>
  );
};

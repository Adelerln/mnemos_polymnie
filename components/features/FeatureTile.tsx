"use client";

import Link from "next/link";
import { motion } from "framer-motion";

import type { FeatureItem } from "@/types";
import { iconMap } from "@/lib/icon-map";

type FeatureTileProps = {
  feature: FeatureItem;
  index: number;
};

export const FeatureTile = ({ feature, index }: FeatureTileProps) => {
  const Icon = iconMap[feature.icon];

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ delay: index * 0.04, duration: 0.35, ease: "easeOut" }}
    >
      <Link
        href={feature.href}
        className="group flex aspect-square min-h-[160px] w-full flex-col items-center justify-center gap-3 rounded-2xl border border-neutral-200 bg-white text-center shadow-sm transition hover:-translate-y-1 hover:border-neutral-300 hover:shadow-lg"
      >
        <span className="flex size-14 items-center justify-center rounded-full bg-neutral-900 text-white transition group-hover:bg-neutral-800">
          {Icon ? <Icon className="size-6" /> : null}
        </span>
        <div className="space-y-1 px-4">
          <h3 className="text-sm font-semibold uppercase tracking-[0.14em] text-neutral-900">
            {feature.title}
          </h3>
          {feature.description ? (
            <p className="text-xs text-neutral-500">{feature.description}</p>
          ) : null}
        </div>
      </Link>
    </motion.div>
  );
};

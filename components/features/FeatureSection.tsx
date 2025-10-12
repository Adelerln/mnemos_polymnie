"use client";

import { motion } from "framer-motion";

import type { FeatureCategory } from "@/types";
import { useResponsiveGrid } from "@/hooks/useResponsiveGrid";
import { FamilleCard } from "./familles/FamilleCard";

type FeatureSectionProps = {
  category: FeatureCategory;
  index: number;
};

export const FeatureSection = ({ category, index }: FeatureSectionProps) => {
  const gridClasses = useResponsiveGrid();

  return (
    <motion.section
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.45, delay: index * 0.08 }}
      className="space-y-4"
    >
      <div>
        <h2 className="text-lg font-semibold uppercase tracking-[0.18em] text-neutral-700">
          {category.title}
        </h2>
        {category.subtitle ? (
          <p className="mt-1 text-sm text-neutral-500">{category.subtitle}</p>
        ) : null}
      </div>

      <div className={gridClasses}>
        {category.items.map((item) => (
          <FamilleCard key={item.id} item={item} />
        ))}
      </div>
    </motion.section>
  );
};

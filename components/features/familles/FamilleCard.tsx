import Link from "next/link";
import { motion } from "framer-motion";

import type { FeatureItem } from "@/types";
import { Card } from "@/components/ui";
import { iconMap } from "@/lib/icon-map";

type FamilleCardProps = {
  item: FeatureItem;
};

export const FamilleCard = ({ item }: FamilleCardProps) => {
  const Icon = iconMap[item.icon];

  return (
    <motion.div
      whileHover={{ y: -6 }}
      transition={{ type: "spring", stiffness: 260, damping: 20 }}
    >
      <Card className="group relative flex h-full items-center justify-center overflow-hidden border border-border bg-white/95 shadow-sm transition-shadow !p-0">
        <Link
          href={item.href}
          className="flex h-full flex-col items-center gap-3 p-6 text-center text-neutral-900"
        >
          <span className="inline-flex size-12 items-center justify-center rounded-full bg-neutral-900/90 text-white transition group-hover:bg-neutral-900">
            {Icon ? <Icon className="size-10" /> : null}
          </span>
          <div className="space-y-2">
            <h3 className="text-sm font-semibold uppercase tracking-wide">
              {item.title}
            </h3>
          </div>
        </Link>
      </Card>
    </motion.div>
  );
};

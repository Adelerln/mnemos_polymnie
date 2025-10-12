import type { IconName } from "@/lib/icon-map";

export type NavItem = {
  label: string;
  href: string;
  isActive?: boolean;
};

export type FeatureItem = {
  id: string;
  title: string;
  description?: string;
  href: string;
  icon: IconName;
  badge?: string;
};

export type FeatureCategory = {
  id: string;
  title: string;
  subtitle?: string;
  items: FeatureItem[];
};

export type UserRole = "admin" | "encadrant" | "direction";

export type PrimaryNavItem = {
  label: string;
  href: string;
};

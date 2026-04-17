import { formatFrenchPhoneNumber } from "@/lib/phone";
import type { CentreForm } from "@/types/centre";

export const createEmptyForm = (): CentreForm => ({
  name: "",
  is_active: true,
  city: "",
  postal_code: "",
  phone_landline: "",
  commission_expiry_date: "",
  address_street: "",
  address_extra: "",
  generic_email: "",
  ddcs_number: "",
  gps_latitude: "",
  gps_longitude: "",
  commission_pv_date: "",
});

export const normalizeText = (value: string) =>
  value
    ? value
        .normalize("NFD")
        .replace(/\p{Diacritic}/gu, "")
        .toLowerCase()
    : "";

export const formatDate = (value: string | null) => {
  if (!value) return "";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toLocaleDateString("fr-FR");
};

export const formatPhone = (value: string | null) =>
  value ? formatFrenchPhoneNumber(value) : "—";

export const BASE_INPUT_CLASSES =
  "w-full rounded-2xl border border-centres-surface px-4 py-2.5 text-sm text-centres-accent focus:outline-none transition";

export const ACTIVE_INPUT_CLASSES = `${BASE_INPUT_CLASSES} bg-white focus:border-centres-hover`;

export const INACTIVE_INPUT_CLASSES = `${BASE_INPUT_CLASSES} bg-white/70 text-centres-accent/80`;

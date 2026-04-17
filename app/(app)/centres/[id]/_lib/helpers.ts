import type { CentrePayload, ContactForm } from "@/types/centre";

export const createEmptyCentre = (): CentrePayload => ({
  id: null,
  name: "",
  is_active: true,
  address_street: "",
  address_extra: "",
  postal_code: "",
  city: "",
  phone_landline: "",
  generic_email: "",
  ddcs_number: "",
  gps_latitude: "",
  gps_longitude: "",
  commission_pv_date: "",
  commission_expiry_date: "",
});

export const mapCentreRowToPayload = (
  row: Record<string, unknown>,
): CentrePayload => ({
  id: (row.id as number | null) ?? null,
  name: (row.name as string) ?? "",
  is_active: (row.is_active as boolean) ?? true,
  address_street: (row.address_street as string) ?? "",
  address_extra: (row.address_extra as string) ?? "",
  postal_code: (row.postal_code as string) ?? "",
  city: (row.city as string) ?? "",
  phone_landline: (row.phone_landline as string) ?? "",
  generic_email: (row.generic_email as string) ?? "",
  ddcs_number: (row.ddcs_number as string) ?? "",
  gps_latitude:
    row.gps_latitude !== null && row.gps_latitude !== undefined
      ? String(row.gps_latitude)
      : "",
  gps_longitude:
    row.gps_longitude !== null && row.gps_longitude !== undefined
      ? String(row.gps_longitude)
      : "",
  commission_pv_date: (row.commission_pv_date as string) ?? "",
  commission_expiry_date: (row.commission_expiry_date as string) ?? "",
});

export const createEmptyContact = (): ContactForm => ({
  id: null,
  civility: "",
  last_name: "",
  first_name: "",
  role: "",
  phone_1: "",
  phone_2: "",
  email: "",
});

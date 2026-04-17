/**
 * Types domaine Centre — payload BDD, vues liste/détail, formulaire.
 */

// ─── Payload BDD (snake_case) ──────────────────────────────

/** Payload complet pour insert/update d'un centre. */
export type CentrePayload = {
  id?: number | null;
  name: string;
  is_active: boolean;
  address_street: string;
  address_extra: string;
  postal_code: string;
  city: string;
  phone_landline: string;
  generic_email: string;
  ddcs_number: string;
  gps_latitude: string;
  gps_longitude: string;
  commission_pv_date: string;
  commission_expiry_date: string;
};

// ─── Vues liste / détail ───────────────────────────────────

/** Vue résumée pour la liste des centres. */
export type CentreListItem = {
  id: number;
  name: string;
  is_active: boolean | null;
  city: string | null;
  postal_code: string | null;
  phone_landline: string | null;
  commission_expiry_date: string | null;
};

/** Vue complète pour la fiche détail d'un centre. */
export type CentreDetail = {
  id: number;
  name: string;
  is_active: boolean | null;
  city: string | null;
  postal_code: string | null;
  phone_landline: string | null;
  commission_expiry_date: string | null;
  address_street: string | null;
  address_extra: string | null;
  generic_email: string | null;
  ddcs_number: string | null;
  gps_latitude: string | null;
  gps_longitude: string | null;
  commission_pv_date: string | null;
};

// ─── Formulaires ───────────────────────────────────────────

/** État du formulaire de création/édition d'un centre. */
export type CentreForm = {
  name: string;
  is_active: boolean;
  city: string;
  postal_code: string;
  phone_landline: string;
  commission_expiry_date: string;
  address_street: string;
  address_extra: string;
  generic_email: string;
  ddcs_number: string;
  gps_latitude: string;
  gps_longitude: string;
  commission_pv_date: string;
};

// ─── Contacts centre ──────────────────────────────────────

/** Ligne contact telle que retournée par Supabase. */
export type ContactRow = {
  id: number;
  centre_id?: number;
  civility: string | null;
  last_name: string;
  first_name: string;
  role: string | null;
  phone_1: string | null;
  phone_2: string | null;
  email: string | null;
};

/** État du formulaire d'ajout/édition d'un contact. */
export type ContactForm = {
  id?: number | null;
  civility: string;
  last_name: string;
  first_name: string;
  role: string;
  phone_1: string;
  phone_2: string;
  email: string;
};

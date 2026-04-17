/**
 * Service adultes — CRUD et recherche de doublons.
 * Gère aussi la résolution de partenaire (lookup/create).
 */

import { supabase } from "@/lib/supabase-client";
import type {
  UpsertPrimaryAdultInput,
  UpsertSecondaryAdultInput,
  AdultDuplicateMatch,
} from "@/types/database";

// ─── Résolution partenaire ─────────────────────────────────

/** Retrouve un partner par nom (ilike) ou le crée. */
export const resolvePartnerId = async (
  partnerName: string | null | undefined,
): Promise<number | null> => {
  const name = partnerName?.trim();
  if (!name) return null;

  const { data: existing, error: partnerError } = await supabase
    .from("partners")
    .select("id")
    .ilike("name", name)
    .maybeSingle();

  if (partnerError && partnerError.code !== "PGRST116") {
    throw new Error(`Erreur Supabase (partner lookup): ${partnerError.message}`);
  }

  if (existing?.id) return existing.id as number;

  const { data: created, error: insertError } = await supabase
    .from("partners")
    .insert({ name })
    .select("id")
    .single();

  if (insertError) {
    throw new Error(`Erreur Supabase (partner create): ${insertError.message}`);
  }

  return created?.id ?? null;
};

// ─── Upsert adulte principal ───────────────────────────────

/** Crée ou met à jour l'adulte principal et son lien family_adults */
export const upsertPrimaryAdult = async ({
  familyRowId,
  adultId,
  civility,
  lastName,
  firstName,
  role,
  address,
  complement,
  postalCode,
  city,
  country,
  phone1,
  phone2,
  email,
  partnerName,
}: UpsertPrimaryAdultInput): Promise<number> => {
  const partnerId = await resolvePartnerId(partnerName || null);
  let resultingAdultId: number | null = adultId ?? null;

  const adultPayload = {
    civility,
    last_name: lastName,
    first_name: firstName,
    address,
    complement,
    postal_code: postalCode,
    city,
    country,
    phone_1: phone1,
    phone_2: phone2,
    email,
    partner_id: partnerId,
  };

  if (resultingAdultId) {
    const { error } = await supabase
      .from("adults")
      .update(adultPayload)
      .eq("id", resultingAdultId);

    if (error) throw new Error(`Erreur Supabase (update adult): ${error.message}`);
  } else {
    const { data: newAdult, error } = await supabase
      .from("adults")
      .insert(adultPayload)
      .select("id")
      .single();

    if (error) throw new Error(`Erreur Supabase (create adult): ${error.message}`);
    resultingAdultId = newAdult?.id ?? null;
  }

  if (!resultingAdultId) {
    throw new Error("Erreur Supabase (adult): impossible de déterminer l'identifiant adulte.");
  }

  // Retirer le flag is_primary de tous les liens existants
  await supabase
    .from("family_adults")
    .update({ is_primary: false })
    .eq("family_id", familyRowId);

  const { error: linkError } = await supabase
    .from("family_adults")
    .upsert(
      {
        family_id: familyRowId,
        adult_id: resultingAdultId,
        is_primary: true,
        role: role ?? null,
        position: 1,
        can_be_contacted: true,
      },
      { onConflict: "family_id,adult_id" },
    );

  if (linkError) {
    throw new Error(`Erreur Supabase (link primary adult): ${linkError.message}`);
  }

  return resultingAdultId;
};

// ─── Upsert adulte secondaire ──────────────────────────────

/** Crée ou met à jour un adulte secondaire et son lien family_adults */
export const upsertSecondaryAdult = async ({
  familyRowId,
  adultId,
  civility,
  lastName,
  firstName,
  address,
  complement,
  postalCode,
  city,
  country,
  phone1,
  phone2,
  email,
  partnerName,
  role,
  position,
  canBeContacted,
  canBeContactedGlobal,
}: UpsertSecondaryAdultInput): Promise<number> => {
  const partnerId = await resolvePartnerId(partnerName || null);
  let resultingAdultId: number | null = adultId ?? null;

  const adultPayload = {
    civility,
    last_name: lastName,
    first_name: firstName,
    address,
    complement,
    postal_code: postalCode,
    city,
    country,
    phone_1: phone1,
    phone_2: phone2,
    email,
    partner_id: partnerId,
  };

  if (resultingAdultId) {
    const { error } = await supabase
      .from("adults")
      .update(adultPayload)
      .eq("id", resultingAdultId);

    if (error) throw new Error(`Erreur Supabase (update adult): ${error.message}`);
  } else {
    const { data: newAdult, error } = await supabase
      .from("adults")
      .insert(adultPayload)
      .select("id")
      .single();

    if (error) throw new Error(`Erreur Supabase (create adult): ${error.message}`);
    resultingAdultId = newAdult?.id ?? null;
  }

  if (!resultingAdultId) {
    throw new Error("Erreur Supabase (adult): impossible de déterminer l'identifiant adulte secondaire.");
  }

  const { error: linkError } = await supabase
    .from("family_adults")
    .upsert(
      {
        family_id: familyRowId,
        adult_id: resultingAdultId,
        is_primary: false,
        role: role ?? null,
        position: position ?? 1,
        can_be_contacted: canBeContacted ?? true,
        can_be_contacted_global: canBeContactedGlobal ?? canBeContacted ?? true,
      },
      { onConflict: "family_id,adult_id" },
    );

  if (linkError) {
    throw new Error(`Erreur Supabase (link secondary adult): ${linkError.message}`);
  }

  return resultingAdultId;
};

// ─── Recherche de doublons ─────────────────────────────────

/** Recherche des adultes existants par nom/prénom (détection de doublons) */
export const findAdultsByName = async (
  firstName: string,
  lastName: string,
): Promise<AdultDuplicateMatch[]> => {
  const cleanFirst = firstName.trim();
  const cleanLast = lastName.trim();
  if (!cleanFirst || !cleanLast) return [];

  const { data, error } = await supabase
    .from("adults")
    .select(
      `
        id,
        first_name,
        last_name,
        email,
        phone_1,
        phone_2,
        address,
        complement,
        postal_code,
        city,
        country,
        family_links:family_adults(
          family_id,
          family:families(id_client, label)
        )
      `,
    )
    .ilike("first_name", cleanFirst)
    .ilike("last_name", cleanLast);

  if (error) {
    throw new Error(`Erreur Supabase (recherche doublon adulte): ${error.message}`);
  }

  return (data as AdultDuplicateMatch[]) ?? [];
};

/**
 * Service familles — CRUD familles + synchronisation enfants.
 * Orchestre les appels adultes/enfants/famille en une seule opération.
 */

import { supabase } from "@/lib/supabase-client";
import { FAMILY_TABLE, CHILDREN_TABLE } from "@/types/database";
import type { ChildRow, FamilyRow } from "@/types/database";
import {
  mapRowToFamilyRecord,
  mapFamilyRecordToRow,
  mapChildToRow,
  generateChildId,
  type FamilyRecord,
  type Child,
} from "@/lib/mappers";
import { upsertPrimaryAdult } from "@/services/adults";

// ─── Synchronisation enfants ───────────────────────────────

/** Synchronise les enfants d'une famille : upsert les présents, supprime les absents */
const syncChildren = async (
  familyId: string | number,
  children: Child[],
): Promise<ChildRow[]> => {
  const familyKey = String(familyId);
  const childRows = children.map(mapChildToRow(familyKey));
  const ids = childRows.map((child) => child.id);

  if (ids.length === 0) {
    const { error } = await supabase
      .from(CHILDREN_TABLE)
      .delete()
      .eq("family_id", familyKey);
    if (error) {
      throw new Error(`Erreur Supabase (sync children - delete all): ${error.message}`);
    }
    return [] as ChildRow[];
  }

  // Supprimer les enfants retirés du formulaire pour cette famille
  const { error: deleteMissingError } = await supabase
    .from(CHILDREN_TABLE)
    .delete()
    .eq("family_id", familyKey)
    .not("id", "in", `(${ids.map((id) => `'${id}'`).join(",")})`);

  if (deleteMissingError) {
    throw new Error(`Erreur Supabase (sync children - cleanup): ${deleteMissingError.message}`);
  }

  const { data, error: upsertError } = await supabase
    .from(CHILDREN_TABLE)
    .upsert(childRows, { onConflict: "id" })
    .select();

  if (upsertError) {
    throw new Error(`Erreur Supabase (sync children - upsert): ${upsertError.message}`);
  }

  return data as ChildRow[];
};

// ─── Lecture ───────────────────────────────────────────────

/** Charge toutes les familles avec adultes, enfants et partenaires */
export const fetchFamilies = async (): Promise<FamilyRecord[]> => {
  const { data, error } = await supabase
    .from(FAMILY_TABLE)
    .select(
      `
        id,
        id_client,
        label,
        notes,
        email,
        family_adults:family_adults(
          is_primary,
          adult_id,
          role,
          position,
          can_be_contacted,
          can_be_contacted_global,
          adult:adults(
            civility,
            first_name,
            last_name,
            address,
            complement,
            postal_code,
            city,
            country,
            phone_1,
            phone_2,
            email,
            partner:partners(name)
          )
        ),
        children:children(
          id,
          family_id,
          last_name,
          first_name,
          birth_date,
          gender,
          allergies,
          diet,
          health_issues,
          instructions,
          transport_notes,
          friend
        )
      `,
    )
    .order("id_client", { ascending: true });

  if (error) {
    throw new Error(`Erreur Supabase (${FAMILY_TABLE}): ${error.message}`);
  }

  return (data ?? []).map(mapRowToFamilyRecord);
};

// ─── Écriture ──────────────────────────────────────────────

/** Sauvegarde complète : famille + adulte principal + enfants */
export const saveFamily = async (family: FamilyRecord): Promise<FamilyRecord> => {
  const idClient = family.id.trim();
  const timestamp = new Date().toISOString();
  const basePayload = mapFamilyRecordToRow({ ...family, id: idClient });
  const children = (family.children ?? []).map((child) => ({
    ...child,
    id: child.id || generateChildId(),
  }));

  // Vérifier si la famille existe déjà
  const { data: existingFamily, error: checkError } = await supabase
    .from(FAMILY_TABLE)
    .select("id")
    .eq("id_client", idClient)
    .single();

  let data, error;

  if (checkError && checkError.code !== "PGRST116") {
    throw new Error(`Erreur Supabase (check family): ${checkError.message}`);
  }

  if (existingFamily) {
    const result = await supabase
      .from(FAMILY_TABLE)
      .update({ ...basePayload, updated_at: timestamp })
      .eq("id_client", idClient)
      .select()
      .single();
    data = result.data;
    error = result.error;
  } else {
    const result = await supabase
      .from(FAMILY_TABLE)
      .insert({
        ...basePayload,
        created_at: family.createdAt ?? timestamp,
        updated_at: timestamp,
      })
      .select()
      .single();
    data = result.data;
    error = result.error;
  }

  if (error) {
    throw new Error(`Erreur Supabase (save family): ${error.message}`);
  }

  const familyRowId = existingFamily?.id ?? (data as FamilyRow | null)?.id;

  if (familyRowId === undefined || familyRowId === null) {
    throw new Error("Erreur Supabase (save family): identifiant famille manquant.");
  }

  // Sauvegarder l'adulte principal
  const adultId = await upsertPrimaryAdult({
    familyRowId,
    familyIdClient: idClient,
    adultId: family.primaryAdultId ?? undefined,
    role: family.primaryRole ?? null,
    civility: family.civility,
    lastName: family.lastName,
    firstName: family.firstName,
    address: family.address,
    complement: family.complement,
    postalCode: family.postalCode,
    city: family.city,
    country: family.country,
    phone1: family.phone1,
    phone2: family.phone2,
    email: family.email,
    partnerName: family.partner,
  });

  const syncedChildren = await syncChildren(familyRowId, children);

  return mapRowToFamilyRecord({
    ...(data as FamilyRow),
    family_adults: [
      {
        is_primary: true,
        adult_id: adultId,
        role: family.primaryRole ?? null,
        can_be_contacted: true,
        adult: {
          civility: family.civility,
          first_name: family.firstName,
          last_name: family.lastName,
          address: family.address,
          complement: family.complement,
          postal_code: family.postalCode,
          city: family.city,
          country: family.country,
          phone_1: family.phone1,
          phone_2: family.phone2,
          email: family.email,
          notes: null,
          partner: family.partner ? { name: family.partner } : null,
        },
      },
    ],
    children: syncedChildren,
  });
};

// ─── Suppression ───────────────────────────────────────────

/** Supprime une famille par son id_client */
export const deleteFamily = async (familyId: string): Promise<void> => {
  const idClient = familyId.trim();
  const { error } = await supabase
    .from(FAMILY_TABLE)
    .delete()
    .eq("id_client", idClient);

  if (error) {
    throw new Error(`Erreur Supabase (delete family): ${error.message}`);
  }
};

import { supabase } from "@/lib/supabase-client";

const FAMILY_TABLE = "clients";

// Types partagés avec le front (camelCase)
export type SecondaryContact = {
  lastName: string;
  firstName: string;
  role: string;
  phone: string;
  email: string;
};

export type HealthFormState = {
  allergies: string;
  diet: string;
  healthIssues: string;
  instructions: string;
  friend: string;
  vacaf: string;
  transportNotes: string;
};

export type Child = {
  id: string;
  lastName: string;
  firstName: string;
  birthDate: string;
  gender: "F" | "M" | "";
  health: HealthFormState;
};

type FamilyRow = {
  id?: number;
  id_client: string;
  civility: string | null;
  last_name: string | null;
  first_name: string | null;
  address: string | null;
  complement: string | null;
  postal_code: string | null;
  city: string | null;
  country: string | null;
  phone_1: string | null;
  phone_2: string | null;
  email: string | null;
  partner: string | null;
  prestashop_p1: string | null;
  prestashop_p2: string | null;
  secondary_contact: SecondaryContact | null;
  children: Child[] | null;
  created_at?: string;
  updated_at?: string;
};

type FamilyRowPayload = Omit<FamilyRow, "id" | "created_at" | "updated_at">;

// Payload pour la sauvegarde (exclut children et secondary_contact car ces colonnes JSONB
// peuvent ne pas exister dans toutes les installations de la table clients)
type FamilyRowPayloadForSave = Omit<FamilyRowPayload, "children" | "secondary_contact">;

export type FamilyRecord = {
  /** Identifiant fonctionnel (alias de id_client) */
  id: string;
  /** Identifiant technique de la ligne */
  rowId?: number;
  civility: string;
  lastName: string;
  firstName: string;
  address: string;
  complement: string;
  postalCode: string;
  city: string;
  country: string;
  phone1: string;
  phone2: string;
  email: string;
  partner: string;
  prestashopP1: string;
  prestashopP2: string;
  secondaryContact: SecondaryContact | null;
  children: Child[];
  createdAt?: string;
  updatedAt?: string;
};

const mapRowToFamilyRecord = (row: FamilyRow): FamilyRecord => ({
  id: row.id_client,
  rowId: row.id,
  civility: row.civility ?? "",
  lastName: row.last_name ?? "",
  firstName: row.first_name ?? "",
  address: row.address ?? "",
  complement: row.complement ?? "",
  postalCode: row.postal_code ?? "",
  city: row.city ?? "",
  country: row.country ?? "",
  phone1: row.phone_1 ?? "",
  phone2: row.phone_2 ?? "",
  email: row.email ?? "",
  partner: row.partner ?? "",
  prestashopP1: row.prestashop_p1 ?? "",
  prestashopP2: row.prestashop_p2 ?? "",
  secondaryContact: row.secondary_contact,
  children: row.children ?? [],
  createdAt: row.created_at ?? undefined,
  updatedAt: row.updated_at ?? undefined,
});

const mapFamilyRecordToRow = (family: FamilyRecord): FamilyRowPayloadForSave => ({
  id_client: family.id,
  civility: family.civility,
  last_name: family.lastName,
  first_name: family.firstName,
  address: family.address,
  complement: family.complement,
  postal_code: family.postalCode,
  city: family.city,
  country: family.country,
  phone_1: family.phone1,
  phone_2: family.phone2,
  email: family.email,
  partner: family.partner,
  prestashop_p1: family.prestashopP1,
  prestashop_p2: family.prestashopP2,
  // Note: children et secondary_contact sont exclus car ces colonnes JSONB
  // peuvent ne pas exister dans toutes les installations de la table clients.
  // Pour les activer, ajoutez ces colonnes JSONB à votre table Supabase et
  // modifiez ce type pour les inclure.
});

// Services pour les familles
export const fetchFamilies = async (): Promise<FamilyRecord[]> => {
  const { data, error } = await supabase
    .from(FAMILY_TABLE)
    .select("*")
    .order("id_client", { ascending: true });

  console.log("[Supabase] fetchFamilies data:", data);
  console.log("[Supabase] fetchFamilies error:", error);

  if (error) {
    throw new Error(`Erreur Supabase (${FAMILY_TABLE}): ${error.message}`);
  }

  return (data ?? []).map(mapRowToFamilyRecord);
};

export const saveFamily = async (family: FamilyRecord): Promise<FamilyRecord> => {
  const idClient = family.id.trim();
  const timestamp = new Date().toISOString();
  const basePayload = mapFamilyRecordToRow({ ...family, id: idClient });

  // Vérifier si la famille existe déjà
  const { data: existingFamily, error: checkError } = await supabase
    .from(FAMILY_TABLE)
    .select("id")
    .eq("id_client", idClient)
    .single();

  let data, error;

  if (checkError && checkError.code !== 'PGRST116') {
    // Erreur autre que "pas trouvé"
    throw new Error(`Erreur Supabase (check family): ${checkError.message}`);
  }

  if (existingFamily) {
    // Mise à jour
    const result = await supabase
      .from(FAMILY_TABLE)
      .update({
        ...basePayload,
        updated_at: timestamp,
      })
      .eq("id_client", idClient)
      .select()
      .single();
    data = result.data;
    error = result.error;
  } else {
    // Insertion
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

  console.log("[Supabase] saveFamily data:", data);
  console.log("[Supabase] saveFamily error:", error);

  if (error) {
    throw new Error(`Erreur Supabase (save family): ${error.message}`);
  }

  return mapRowToFamilyRecord(data as FamilyRow);
};

export const deleteFamily = async (familyId: string): Promise<void> => {
  const idClient = familyId.trim();
  const { error } = await supabase
    .from(FAMILY_TABLE)
    .delete()
    .eq("id_client", idClient);

  console.log("[Supabase] deleteFamily error:", error);

  if (error) {
    throw new Error(`Erreur Supabase (delete family): ${error.message}`);
  }
};

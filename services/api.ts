import { supabase } from "@/lib/supabase-client";

const FAMILY_TABLE = "clients";
const CHILDREN_TABLE = "children";

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

type ChildRow = {
  id: string;
  client_id: string;
  last_name: string | null;
  first_name: string | null;
  birth_date: string | null;
  gender: string | null;
  allergies: string | null;
  diet: string | null;
  health_issues: string | null;
  instructions: string | null;
  transport_notes: string | null;
  friend: string | null;
  vacaf: string | null;
  created_at?: string;
  updated_at?: string;
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
  children?: ChildRow[];
  created_at?: string;
  updated_at?: string;
};
type FamilyRowPayload = Omit<FamilyRow, "id" | "created_at" | "updated_at" | "children">;

// Payload pour la sauvegarde (children gérés dans la table dédiée)
type FamilyRowPayloadForSave = FamilyRowPayload;

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

const defaultHealthState: HealthFormState = {
  allergies: "",
  diet: "",
  healthIssues: "",
  instructions: "",
  friend: "",
  vacaf: "",
  transportNotes: "",
};

const mapChildRowToChild = (row: ChildRow): Child => ({
  id: row.id,
  lastName: row.last_name ?? "",
  firstName: row.first_name ?? "",
  birthDate: row.birth_date ?? "",
  gender: row.gender === "F" || row.gender === "M" ? row.gender : "",
  health: {
    allergies: row.allergies ?? "",
    diet: row.diet ?? "",
    healthIssues: row.health_issues ?? "",
    instructions: row.instructions ?? "",
    transportNotes: row.transport_notes ?? "",
    friend: row.friend ?? "",
    vacaf: row.vacaf ?? "",
  },
});

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
  children: (row.children ?? []).map(mapChildRowToChild),
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
  secondary_contact: family.secondaryContact,
});

const generateChildId = () => {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return Math.random().toString(36).slice(2, 10);
};

const mapChildToRow = (clientId: string) => (child: Child): ChildRow => ({
  id: child.id || generateChildId(),
  client_id: clientId,
  last_name: child.lastName,
  first_name: child.firstName,
  birth_date: child.birthDate,
  gender: child.gender,
  allergies: child.health?.allergies ?? "",
  diet: child.health?.diet ?? "",
  health_issues: child.health?.healthIssues ?? "",
  instructions: child.health?.instructions ?? "",
  transport_notes: child.health?.transportNotes ?? "",
  friend: child.health?.friend ?? "",
  vacaf: child.health?.vacaf ?? "",
});

const syncChildren = async (
  clientId: string,
  children: Child[],
): Promise<ChildRow[]> => {
  const childRows = children.map(mapChildToRow(clientId));

  const { error: deleteError } = await supabase
    .from(CHILDREN_TABLE)
    .delete()
    .eq("client_id", clientId);

  if (deleteError) {
    throw new Error(`Erreur Supabase (sync children - delete): ${deleteError.message}`);
  }

  if (childRows.length === 0) {
    return [] as ChildRow[];
  }

  const { data, error: insertError } = await supabase
    .from(CHILDREN_TABLE)
    .insert(childRows)
    .select();

  if (insertError) {
    throw new Error(`Erreur Supabase (sync children - insert): ${insertError.message}`);
  }

  return data as ChildRow[];
};

// Services pour les familles
export const fetchFamilies = async (): Promise<FamilyRecord[]> => {
  const { data, error } = await supabase
    .from(FAMILY_TABLE)
    .select("*, children:children(*)")
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

  const syncedChildren = await syncChildren(idClient, children);

  return mapRowToFamilyRecord({ ...(data as FamilyRow), children: syncedChildren });
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

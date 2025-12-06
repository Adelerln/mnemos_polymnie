import { supabase } from "@/lib/supabase-client";

const FAMILY_TABLE = "families";
const CHILDREN_TABLE = "children";

// Types partagés avec le front (camelCase)
export type SecondaryContact = {
  civility?: string;
  adultId?: string | null;
  position?: number | null;
  canBeContacted?: boolean;
  lastName: string;
  firstName: string;
  role: string;
  phone: string;
  phone2?: string;
  address?: string;
  complement?: string;
  postalCode?: string;
  city?: string;
  country?: string;
  email: string;
  partner?: string;
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
  family_id: string;
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
  created_at?: string;
  updated_at?: string;
};

type FamilyRow = {
  id?: number;
  id_client: string;
  label: string | null;
  notes: string | null;
  email: string | null;
  family_adults?: Array<{
    is_primary: boolean;
    adult_id?: string;
    role?: string | null;
    can_be_contacted?: boolean | null;
    position?: number | null;
    adult: {
      civility: string | null;
      first_name: string | null;
      last_name: string | null;
      address: string | null;
      complement: string | null;
      postal_code: string | null;
      city: string | null;
      country: string | null;
      phone_1: string | null;
      phone_2: string | null;
      email: string | null;
      notes: string | null;
      partner: { name: string | null; id?: string | number | null } | null;
    } | null;
  }>;
  children?: ChildRow[];
  created_at?: string;
  updated_at?: string;
};
type FamilyRowPayload = Pick<FamilyRow, "id_client" | "label" | "notes" | "email">;

// Payload pour la sauvegarde (children gérés dans la table dédiée)
type FamilyRowPayloadForSave = FamilyRowPayload;

type UpsertPrimaryAdultInput = {
  familyRowId: number;
  familyIdClient: string;
  adultId?: string;
  civility: string;
  lastName: string;
  firstName: string;
  role?: string | null;
  address: string;
  complement: string;
  postalCode: string;
  city: string;
  country: string;
  phone1: string;
  phone2: string;
  email: string;
  partnerName: string;
};

export type UpsertSecondaryAdultInput = {
  familyRowId: number;
  familyIdClient: string;
  adultId?: string | null;
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
  partnerName: string;
  role: string | null;
  position?: number | null;
  canBeContacted?: boolean;
};

const resolvePartnerId = async (partnerName: string | null | undefined) => {
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

  if (existing?.id) {
    return existing.id as string | number;
  }

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

const upsertPrimaryAdult = async ({
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
}: UpsertPrimaryAdultInput): Promise<string> => {
  const partnerId = await resolvePartnerId(partnerName || null);

  let resultingAdultId = adultId ?? null;

  if (resultingAdultId) {
    const { error: adultUpdateError } = await supabase
      .from("adults")
      .update({
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
      })
      .eq("id", resultingAdultId);

    if (adultUpdateError) {
      throw new Error(`Erreur Supabase (update adult): ${adultUpdateError.message}`);
    }
  } else {
    const { data: newAdult, error: adultInsertError } = await supabase
      .from("adults")
      .insert({
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
      })
      .select("id")
      .single();

    if (adultInsertError) {
      throw new Error(`Erreur Supabase (create adult): ${adultInsertError.message}`);
    }

    resultingAdultId = newAdult?.id ?? null;
  }

  if (!resultingAdultId) {
    throw new Error("Erreur Supabase (adult): impossible de déterminer l'identifiant adulte.");
  }

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

  return String(resultingAdultId);
};

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
}: UpsertSecondaryAdultInput): Promise<string> => {
  const partnerId = await resolvePartnerId(partnerName || null);

  let resultingAdultId = adultId ?? null;

  if (resultingAdultId) {
    const { error: adultUpdateError } = await supabase
      .from("adults")
      .update({
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
      })
      .eq("id", resultingAdultId);

    if (adultUpdateError) {
      throw new Error(`Erreur Supabase (update adult): ${adultUpdateError.message}`);
    }
  } else {
    const { data: newAdult, error: adultInsertError } = await supabase
      .from("adults")
      .insert({
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
      })
      .select("id")
      .single();

    if (adultInsertError) {
      throw new Error(`Erreur Supabase (create adult): ${adultInsertError.message}`);
    }

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
      },
      { onConflict: "family_id,adult_id" },
    );

  if (linkError) {
    throw new Error(`Erreur Supabase (link secondary adult): ${linkError.message}`);
  }

  return String(resultingAdultId);
};
export type FamilyRecord = {
  /** Identifiant fonctionnel (alias de id_client) */
  id: string;
  /** Identifiant technique de la ligne */
  rowId?: number;
  primaryAdultId?: string | null;
  label: string;
  civility: string;
  lastName: string;
  firstName: string;
  primaryRole?: string | null;
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
  familyEmail?: string | null;
  notes?: string | null;
  secondaryAdults: Array<
    SecondaryContact & {
      adultId: string | null;
      role: string | null;
      position: number | null;
      canBeContacted: boolean;
      partner?: string;
    }
  >;
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

const pickPrimaryAdult = (row: FamilyRow) =>
  (row.family_adults ?? []).find((link) => link?.is_primary) ?? null;
const pickSecondaryAdult = (row: FamilyRow) =>
  (row.family_adults ?? []).find((link) => !link?.is_primary) ?? null;
const pickAllSecondaryAdults = (row: FamilyRow) =>
  (row.family_adults ?? []).filter((link) => !link?.is_primary);

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
  vacaf: "",
  },
});

const mapRowToFamilyRecord = (row: FamilyRow): FamilyRecord => {
  const primaryAdultLink = pickPrimaryAdult(row);
  const primaryAdult = primaryAdultLink?.adult ?? null;
  const secondaryAdult = pickSecondaryAdult(row);

  return {
    id: row.id_client,
    rowId: row.id,
    primaryAdultId: primaryAdultLink?.adult_id ?? null,
    primaryRole: primaryAdultLink?.role ?? "",
    label:
      row.label ??
      [primaryAdult?.first_name, primaryAdult?.last_name].filter(Boolean).join(" ").trim() ||
      row.id_client,
    civility: primaryAdult?.civility ?? "",
    lastName: primaryAdult?.last_name ?? "",
    firstName: primaryAdult?.first_name ?? "",
    address: primaryAdult?.address ?? "",
    complement: primaryAdult?.complement ?? "",
    postalCode: primaryAdult?.postal_code ?? "",
    city: primaryAdult?.city ?? "",
    country: primaryAdult?.country ?? "",
    phone1: primaryAdult?.phone_1 ?? "",
    phone2: primaryAdult?.phone_2 ?? "",
    email: primaryAdult?.email ?? "",
    partner: primaryAdult?.partner?.name ?? "",
    prestashopP1: "",
    prestashopP2: "",
    secondaryContact: secondaryAdult?.adult
      ? {
          lastName: secondaryAdult.adult.last_name ?? "",
          firstName: secondaryAdult.adult.first_name ?? "",
          role: secondaryAdult.role ?? "",
          phone: secondaryAdult.adult.phone_1 ?? "",
          phone2: secondaryAdult.adult.phone_2 ?? "",
          address: secondaryAdult.adult.address ?? "",
          complement: secondaryAdult.adult.complement ?? "",
          postalCode: secondaryAdult.adult.postal_code ?? "",
          city: secondaryAdult.adult.city ?? "",
          country: secondaryAdult.adult.country ?? "",
          email: secondaryAdult.adult.email ?? "",
        }
      : null,
    secondaryAdults: pickAllSecondaryAdults(row).map((link) => ({
      adultId: link.adult_id ?? null,
      role: link.role ?? null,
      position: link.position ?? null,
      canBeContacted: Boolean(link.can_be_contacted ?? true),
      civility: link.adult?.civility ?? "",
      lastName: link.adult?.last_name ?? "",
      firstName: link.adult?.first_name ?? "",
      address: link.adult?.address ?? "",
      complement: link.adult?.complement ?? "",
      postalCode: link.adult?.postal_code ?? "",
      city: link.adult?.city ?? "",
      country: link.adult?.country ?? "",
      phone: link.adult?.phone_1 ?? "",
      phone2: link.adult?.phone_2 ?? "",
      email: link.adult?.email ?? "",
      partner: link.adult?.partner?.name ?? "",
    })),
    familyEmail: row.email ?? null,
    notes: row.notes ?? null,
    children: (row.children ?? []).map(mapChildRowToChild),
    createdAt: row.created_at ?? undefined,
    updatedAt: row.updated_at ?? undefined,
  };
};

const mapFamilyRecordToRow = (family: FamilyRecord): FamilyRowPayloadForSave => ({
  id_client: family.id,
  label: family.label || family.id,
  notes: family.notes ?? null,
  email: family.familyEmail ?? null,
});

const generateChildId = () => {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return Math.random().toString(36).slice(2, 10);
};

const mapChildToRow = (familyId: string) => (child: Child): ChildRow => ({
  id: child.id || generateChildId(),
  family_id: familyId,
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
});

const syncChildren = async (
  familyId: string | number,
  children: Child[],
): Promise<ChildRow[]> => {
  const familyKey = String(familyId);
  const childRows = children.map(mapChildToRow(familyKey));
  const ids = childRows.map((child) => child.id);

  if (ids.length === 0) {
    const { error: deleteAllError } = await supabase
      .from(CHILDREN_TABLE)
      .delete()
      .eq("family_id", familyKey);
    if (deleteAllError) {
      throw new Error(`Erreur Supabase (sync children - delete all): ${deleteAllError.message}`);
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

// Services pour les familles
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

  const familyRowId = existingFamily?.id ?? (data as FamilyRow | null)?.id;

  if (familyRowId === undefined || familyRowId === null) {
    throw new Error("Erreur Supabase (save family): identifiant famille manquant pour les enfants.");
  }

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
        role: "AUTRE",
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
          partner: family.partner ? { name: family.partner } : null,
        },
      },
    ],
    children: syncedChildren,
  });
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

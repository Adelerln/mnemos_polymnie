import { supabase } from "@/lib/supabase-client";

export type InscriptionRecord = {
  id?: number;
  idClient: string;
  childFirstName: string;
  childLastName: string;
  childId?: string;
  childBirthDate: string;
  childGender: string;
  numInscription: string;
  referenceSejour: string;
  nomSejour: string;
  lieuSejour: string;
  theme: string;
  villeDepart: string;
  villeRetour: string;
  periodeSejour: string;
  dateEntree: string;
  dateSortie: string;
  assurance: string;
  partenaire: string;
  createdAt?: string;
  updatedAt?: string;
};

type InscriptionRow = {
  id?: number;
  id_client: string | null;
  child_first_name: string | null;
  child_last_name: string | null;
  child_birth_date: string | null;
  child_gender: string | null;
  num_inscription: string | null;
  reference_sejour: string | null;
  nom_sejour: string | null;
  lieu_sejour: string | null;
  theme: string | null;
  ville_depart: string | null;
  ville_retour: string | null;
  periode_sejour: string | null;
  date_entree: string | null;
  date_sortie: string | null;
  assurance: string | null;
  partenaire: string | null;
  created_at?: string;
  updated_at?: string;
};

const mapRowToRecord = (row: InscriptionRow): InscriptionRecord => ({
  id: row.id,
  idClient: row.id_client ?? "",
  childFirstName: row.child_first_name ?? "",
  childLastName: row.child_last_name ?? "",
  childId: undefined,
  childBirthDate: row.child_birth_date ?? "",
  childGender: row.child_gender ?? "",
  numInscription: row.num_inscription ?? "",
  referenceSejour: row.reference_sejour ?? "",
  nomSejour: row.nom_sejour ?? "",
  lieuSejour: row.lieu_sejour ?? "",
  theme: row.theme ?? "",
  villeDepart: row.ville_depart ?? "",
  villeRetour: row.ville_retour ?? "",
  periodeSejour: row.periode_sejour ?? "",
  dateEntree: row.date_entree ?? "",
  dateSortie: row.date_sortie ?? "",
  assurance: row.assurance ?? "",
  partenaire: row.partenaire ?? "",
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

const mapRecordToRow = (
  record: InscriptionRecord,
): Omit<InscriptionRow, "id" | "created_at" | "updated_at"> => ({
  id_client: record.idClient,
  child_first_name: record.childFirstName,
  child_last_name: record.childLastName,
  child_birth_date: record.childBirthDate || null,
  child_gender: record.childGender,
  num_inscription: record.numInscription,
  reference_sejour: record.referenceSejour,
  nom_sejour: record.nomSejour,
  lieu_sejour: record.lieuSejour,
  theme: record.theme,
  ville_depart: record.villeDepart,
  ville_retour: record.villeRetour,
  periode_sejour: record.periodeSejour,
  date_entree: record.dateEntree || null,
  date_sortie: record.dateSortie || null,
  assurance: record.assurance,
  partenaire: record.partenaire,
});

export const fetchInscriptionById = async (
  inscriptionId: number,
): Promise<InscriptionRecord | null> => {
  const { data, error } = await supabase
    .from("inscriptions")
    .select("*")
    .eq("id", inscriptionId)
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      return null;
    }
    throw new Error(`Erreur Supabase (inscriptions.fetchById): ${error.message}`);
  }

  return data ? mapRowToRecord(data as InscriptionRow) : null;
};

export const saveInscription = async (
  inscription: InscriptionRecord,
): Promise<InscriptionRecord> => {
  const payload = mapRecordToRow(inscription);
  const timestamp = new Date().toISOString();

  if (inscription.id) {
    const { data, error } = await supabase
      .from("inscriptions")
      .update({
        ...payload,
        updated_at: timestamp,
      })
      .eq("id", inscription.id)
      .select()
      .single();

    if (error) {
      throw new Error(
        `Erreur Supabase (inscriptions.update): ${error.message}`,
      );
    }

    return mapRowToRecord(data as InscriptionRow);
  }

  const { data, error } = await supabase
    .from("inscriptions")
    .insert({
      ...payload,
      created_at: timestamp,
      updated_at: timestamp,
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Erreur Supabase (inscriptions.insert): ${error.message}`);
  }

  return mapRowToRecord(data as InscriptionRow);
};

type InscriptionFilters = {
  idClient?: string;
  childFirstName?: string;
  childLastName?: string;
  childBirthDate?: string;
  childGender?: string;
};

export const fetchInscriptions = async (
  filters: InscriptionFilters = {},
): Promise<InscriptionRecord[]> => {
  let query = supabase
    .from("inscriptions")
    .select("*")
    .order("created_at", { ascending: false });

  if (filters.idClient) {
    query = query.eq("id_client", filters.idClient.trim());
  }
  if (filters.childFirstName) {
    query = query.ilike("child_first_name", `${filters.childFirstName}%`);
  }
  if (filters.childLastName) {
    query = query.ilike("child_last_name", `${filters.childLastName}%`);
  }
  if (filters.childBirthDate) {
    query = query.eq("child_birth_date", filters.childBirthDate);
  }
  if (filters.childGender) {
    query = query.eq("child_gender", filters.childGender);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(`Erreur Supabase (inscriptions.fetch): ${error.message}`);
  }

  return (data as InscriptionRow[]).map(mapRowToRecord);
};

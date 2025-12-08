"use client";

import { useEffect, useMemo, useState, type ChangeEvent } from "react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { Pencil, Trash2 } from "lucide-react";

import { formatFrenchPhoneNumber } from "@/lib/phone";
import { supabase } from "@/lib/supabase-client";

type CentrePayload = {
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

type ContactRow = {
  id: number;
  centre_id: number;
  civility: string | null;
  last_name: string;
  first_name: string;
  role: string | null;
  phone_1: string | null;
  phone_2: string | null;
  email: string | null;
};

const createEmptyCentre = (): CentrePayload => ({
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

const mapCentreRowToPayload = (row: Record<string, any>): CentrePayload => ({
  id: row.id ?? null,
  name: row.name ?? "",
  is_active: row.is_active ?? true,
  address_street: row.address_street ?? "",
  address_extra: row.address_extra ?? "",
  postal_code: row.postal_code ?? "",
  city: row.city ?? "",
  phone_landline: row.phone_landline ?? "",
  generic_email: row.generic_email ?? "",
  ddcs_number: row.ddcs_number ?? "",
  gps_latitude: row.gps_latitude !== null && row.gps_latitude !== undefined ? String(row.gps_latitude) : "",
  gps_longitude:
    row.gps_longitude !== null && row.gps_longitude !== undefined ? String(row.gps_longitude) : "",
  commission_pv_date: row.commission_pv_date ?? "",
  commission_expiry_date: row.commission_expiry_date ?? "",
});

type ContactForm = {
  id?: number | null;
  civility: string;
  last_name: string;
  first_name: string;
  role: string;
  phone_1: string;
  phone_2: string;
  email: string;
};

const createEmptyContact = (): ContactForm => ({
  id: null,
  civility: "",
  last_name: "",
  first_name: "",
  role: "",
  phone_1: "",
  phone_2: "",
  email: "",
});

export default function CentreDetailPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const centreIdParam = params?.id;
  const isCreation = centreIdParam === "new" || !centreIdParam;

  const [centre, setCentre] = useState<CentrePayload>(() => createEmptyCentre());
  const [contacts, setContacts] = useState<ContactRow[]>([]);
  const [loadingCentre, setLoadingCentre] = useState(false);
  const [loadingContacts, setLoadingContacts] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [contactModalOpen, setContactModalOpen] = useState(false);
  const [contactForm, setContactForm] = useState<ContactForm>(() => createEmptyContact());

  useEffect(() => {
    const loadCentre = async () => {
      if (isCreation) {
        setCentre(createEmptyCentre());
        setContacts([]);
        return;
      }
      setLoadingCentre(true);
      setError(null);
      const { data, error: fetchError } = await supabase
        .from("centres")
        .select("*")
        .eq("id", Number(centreIdParam))
        .single();

      if (fetchError) {
        setError(`Erreur lors du chargement du centre : ${fetchError.message}`);
        setCentre(createEmptyCentre());
      } else if (data) {
        setCentre(mapCentreRowToPayload(data));
      }
      setLoadingCentre(false);
    };

    loadCentre();
  }, [centreIdParam, isCreation]);

  useEffect(() => {
    const loadContacts = async () => {
      if (isCreation || !centreIdParam) {
        setContacts([]);
        return;
      }
      setLoadingContacts(true);
      const { data, error: fetchError } = await supabase
        .from("contacts_centres")
        .select("*")
        .eq("centre_id", Number(centreIdParam))
        .order("last_name", { ascending: true });

      if (fetchError) {
        setError(`Erreur lors du chargement des contacts : ${fetchError.message}`);
        setContacts([]);
      } else {
        setContacts((data as ContactRow[]) ?? []);
      }
      setLoadingContacts(false);
    };

    loadContacts();
  }, [centreIdParam, isCreation]);

  const handleCentreChange =
    (field: keyof CentrePayload) =>
    (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const value = event.target.type === "checkbox" ? (event.target as HTMLInputElement).checked : event.target.value;
      setCentre((prev) => ({ ...prev, [field]: value }));
    };

  const handleSaveCentre = async () => {
    setSaving(true);
    setError(null);
    setSuccess(null);
    const payload = {
      name: centre.name.trim(),
      is_active: centre.is_active,
      address_street: centre.address_street || null,
      address_extra: centre.address_extra || null,
      postal_code: centre.postal_code || null,
      city: centre.city || null,
      phone_landline: centre.phone_landline || null,
      generic_email: centre.generic_email || null,
      ddcs_number: centre.ddcs_number || null,
      gps_latitude: centre.gps_latitude ? Number(centre.gps_latitude) : null,
      gps_longitude: centre.gps_longitude ? Number(centre.gps_longitude) : null,
      commission_pv_date: centre.commission_pv_date || null,
      commission_expiry_date: centre.commission_expiry_date || null,
      modified_at: new Date().toISOString(),
    };

    const request = centre.id
      ? supabase.from("centres").update(payload).eq("id", centre.id).select("*").single()
      : supabase.from("centres").insert(payload).select("*").single();

    const { data, error: saveError } = await request;

    if (saveError) {
      setError(`Erreur lors de l'enregistrement du centre : ${saveError.message}`);
    } else if (data) {
      const mapped = mapCentreRowToPayload(data);
      setCentre(mapped);
      setSuccess("Centre enregistré.");
      if (!centre.id && mapped.id) {
        router.replace(`/centres/${mapped.id}`);
      }
    }
    setSaving(false);
  };

  const openContactModal = (contact?: ContactRow) => {
    if (!centre.id) {
      setError("Enregistrez le centre avant d'ajouter un contact.");
      return;
    }
    if (contact) {
      setContactForm({
        id: contact.id,
        civility: contact.civility ?? "",
        last_name: contact.last_name ?? "",
        first_name: contact.first_name ?? "",
        role: contact.role ?? "",
        phone_1: contact.phone_1 ?? "",
        phone_2: contact.phone_2 ?? "",
        email: contact.email ?? "",
      });
    } else {
      setContactForm(createEmptyContact());
    }
    setContactModalOpen(true);
  };

  const handleContactChange =
    (field: keyof ContactForm) =>
    (event: ChangeEvent<HTMLInputElement>) => {
      const rawValue = event.target.value;
      const value =
        field === "phone_1" || field === "phone_2" ? formatFrenchPhoneNumber(rawValue) : rawValue;
      setContactForm((prev) => ({ ...prev, [field]: value }));
    };

  const refreshContacts = async (centreId: number) => {
    const { data, error: fetchError } = await supabase
      .from("contacts_centres")
      .select("*")
      .eq("centre_id", centreId)
      .order("last_name", { ascending: true });

    if (fetchError) {
      setError(`Erreur lors du rechargement des contacts : ${fetchError.message}`);
      return;
    }
    setContacts((data as ContactRow[]) ?? []);
  };

  const handleSaveContact = async () => {
    if (!centre.id) {
      setError("Enregistrez le centre avant d'ajouter un contact.");
      return;
    }
    if (!contactForm.last_name.trim() || !contactForm.first_name.trim()) {
      setError("Merci de renseigner au minimum le nom et le prénom du contact.");
      return;
    }

    const payload = {
      centre_id: centre.id,
      civility: contactForm.civility || null,
      last_name: contactForm.last_name.trim(),
      first_name: contactForm.first_name.trim(),
      role: contactForm.role || null,
      phone_1: contactForm.phone_1 || null,
      phone_2: contactForm.phone_2 || null,
      email: contactForm.email || null,
    };

    const request = contactForm.id
      ? supabase.from("contacts_centres").update(payload).eq("id", contactForm.id).select("*").single()
      : supabase.from("contacts_centres").insert(payload).select("*").single();

    const { error: saveError } = await request;

    if (saveError) {
      setError(`Erreur lors de l'enregistrement du contact : ${saveError.message}`);
      return;
    }

    await refreshContacts(centre.id);
    setContactModalOpen(false);
    setContactForm(createEmptyContact());
    setError(null);
  };

  const handleDeleteContact = async (id: number) => {
    const { error: deleteError } = await supabase.from("contacts_centres").delete().eq("id", id);
    if (deleteError) {
      setError(`Erreur lors de la suppression du contact : ${deleteError.message}`);
      return;
    }
    if (centre.id) {
      await refreshContacts(centre.id);
    }
  };

  const pageTitle = useMemo(() => (centre.name ? centre.name : isCreation ? "Nouveau centre" : "Centre"), [centre.name, isCreation]);

  return (
    <div className="min-h-screen bg-[#dde1e7] py-10 text-[#1f2330]">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 md:px-8">
        <header className="rounded-2xl border border-[#c9ccd5] bg-white/90 px-6 py-5 shadow-lg">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h1 className="text-3xl font-semibold tracking-tight text-[#1f2330]">{pageTitle}</h1>
              <p className="mt-1 text-sm text-[#5c606b]">Fiche centre et contacts associés.</p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <Link
                href="/centres"
                className="inline-flex items-center justify-center rounded-md border border-[#ccd0d8] bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-[#2b2f36] transition hover:bg-[#f7f8fb]"
              >
                Retour à la liste
              </Link>
              <button
                type="button"
                onClick={handleSaveCentre}
                disabled={saving}
                className="inline-flex items-center justify-center rounded-md border border-[#b96d3c] bg-[#c77845] px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-white transition hover:bg-[#b45b12] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving ? "Enregistrement…" : "Enregistrer"}
              </button>
            </div>
          </div>
          {error ? <p className="mt-2 text-sm text-[#b42318]">{error}</p> : null}
          {success ? <p className="mt-2 text-sm text-[#027a48]">{success}</p> : null}
        </header>

        <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
          <div className="space-y-4">
            <section className="rounded-2xl border border-[#d0d4dc] bg-white p-6 shadow-md">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-[#2b2f36]">
                  Informations générales
                </h2>
                <label className="inline-flex items-center gap-2 text-sm text-[#2b2f36]">
                  <input
                    type="checkbox"
                    checked={centre.is_active}
                    onChange={handleCentreChange("is_active")}
                    className="h-4 w-4 rounded border-[#c9ccd5] text-[#c77845] focus:ring-[#c77845]"
                  />
                  En activité
                </label>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-[0.14em] text-[#5c606b]">
                    Nom du centre
                  </label>
                  <input
                    type="text"
                    value={centre.name}
                    onChange={handleCentreChange("name")}
                    className="w-full rounded-lg border border-[#d4d7df] px-3 py-2 text-sm text-[#1f2330] focus:border-[#7f8696] focus:outline-none"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-[0.14em] text-[#5c606b]">
                    N° DDCS ouverture
                  </label>
                  <input
                    type="text"
                    value={centre.ddcs_number}
                    onChange={handleCentreChange("ddcs_number")}
                    className="w-full rounded-lg border border-[#d4d7df] px-3 py-2 text-sm text-[#1f2330] focus:border-[#7f8696] focus:outline-none"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-[0.14em] text-[#5c606b]">
                    Téléphone fixe
                  </label>
                  <input
                    type="text"
                    value={centre.phone_landline}
                    onChange={(event) =>
                      handleCentreChange("phone_landline")({
                        ...event,
                        target: {
                          ...event.target,
                          value: formatFrenchPhoneNumber(event.target.value),
                        },
                      } as ChangeEvent<HTMLInputElement>)
                    }
                    className="w-full rounded-lg border border-[#d4d7df] px-3 py-2 text-sm text-[#1f2330] focus:border-[#7f8696] focus:outline-none"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-[0.14em] text-[#5c606b]">
                    Mail générique
                  </label>
                  <input
                    type="email"
                    value={centre.generic_email}
                    onChange={handleCentreChange("generic_email")}
                    className="w-full rounded-lg border border-[#d4d7df] px-3 py-2 text-sm text-[#1f2330] focus:border-[#7f8696] focus:outline-none"
                  />
                </div>
              </div>
            </section>

            <section className="rounded-2xl border border-[#d0d4dc] bg-white p-6 shadow-md">
              <h2 className="mb-4 text-sm font-semibold uppercase tracking-[0.18em] text-[#2b2f36]">
                Adresse du centre
              </h2>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2 md:col-span-2">
                  <label className="text-xs font-semibold uppercase tracking-[0.14em] text-[#5c606b]">
                    Adresse
                  </label>
                  <input
                    type="text"
                    value={centre.address_street}
                    onChange={handleCentreChange("address_street")}
                    className="w-full rounded-lg border border-[#d4d7df] px-3 py-2 text-sm text-[#1f2330] focus:border-[#7f8696] focus:outline-none"
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className="text-xs font-semibold uppercase tracking-[0.14em] text-[#5c606b]">
                    Complément
                  </label>
                  <input
                    type="text"
                    value={centre.address_extra}
                    onChange={handleCentreChange("address_extra")}
                    className="w-full rounded-lg border border-[#d4d7df] px-3 py-2 text-sm text-[#1f2330] focus:border-[#7f8696] focus:outline-none"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-[0.14em] text-[#5c606b]">
                    Code postal
                  </label>
                  <input
                    type="text"
                    value={centre.postal_code}
                    onChange={handleCentreChange("postal_code")}
                    className="w-full rounded-lg border border-[#d4d7df] px-3 py-2 text-sm text-[#1f2330] focus:border-[#7f8696] focus:outline-none"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-[0.14em] text-[#5c606b]">
                    Ville
                  </label>
                  <input
                    type="text"
                    value={centre.city}
                    onChange={handleCentreChange("city")}
                    className="w-full rounded-lg border border-[#d4d7df] px-3 py-2 text-sm text-[#1f2330] focus:border-[#7f8696] focus:outline-none"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-[0.14em] text-[#5c606b]">
                    Latitude
                  </label>
                  <input
                    type="text"
                    value={centre.gps_latitude}
                    onChange={handleCentreChange("gps_latitude")}
                    className="w-full rounded-lg border border-[#d4d7df] px-3 py-2 text-sm text-[#1f2330] focus:border-[#7f8696] focus:outline-none"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-[0.14em] text-[#5c606b]">
                    Longitude
                  </label>
                  <input
                    type="text"
                    value={centre.gps_longitude}
                    onChange={handleCentreChange("gps_longitude")}
                    className="w-full rounded-lg border border-[#d4d7df] px-3 py-2 text-sm text-[#1f2330] focus:border-[#7f8696] focus:outline-none"
                  />
                </div>
              </div>
            </section>

            <section className="rounded-2xl border border-[#d0d4dc] bg-white p-6 shadow-md">
              <h2 className="mb-4 text-sm font-semibold uppercase tracking-[0.18em] text-[#2b2f36]">
                Commission de sécurité
              </h2>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-[0.14em] text-[#5c606b]">
                    Date PV commission
                  </label>
                  <input
                    type="date"
                    value={centre.commission_pv_date || ""}
                    onChange={handleCentreChange("commission_pv_date")}
                    className="w-full rounded-lg border border-[#d4d7df] px-3 py-2 text-sm text-[#1f2330] focus:border-[#7f8696] focus:outline-none"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-[0.14em] text-[#5c606b]">
                    Date de péremption
                  </label>
                  <input
                    type="date"
                    value={centre.commission_expiry_date || ""}
                    onChange={handleCentreChange("commission_expiry_date")}
                    className="w-full rounded-lg border border-[#d4d7df] px-3 py-2 text-sm text-[#1f2330] focus:border-[#7f8696] focus:outline-none"
                  />
                </div>
              </div>
            </section>
          </div>

          <div className="space-y-4">
            <section className="rounded-2xl border border-[#d0d4dc] bg-white p-6 shadow-md">
              <div className="mb-4 flex items-center justify-between gap-3">
                <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-[#2b2f36]">
                  Contacts du centre
                </h2>
                <button
                  type="button"
                  onClick={() => openContactModal()}
                  disabled={!centre.id}
                  className="inline-flex items-center justify-center rounded-md border border-[#ccd0d8] bg-white px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-[#2b2f36] transition hover:bg-[#f7f8fb] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Ajouter un contact
                </button>
              </div>

              {loadingContacts ? (
                <p className="text-sm text-[#5c606b]">Chargement des contacts…</p>
              ) : contacts.length === 0 ? (
                <p className="text-sm text-[#5c606b]">Aucun contact pour ce centre.</p>
              ) : (
                <div className="space-y-3">
                  {contacts.map((contact) => (
                    <div
                      key={contact.id}
                      className="rounded-xl border border-[#e4e7ef] bg-[#f9fafb] px-4 py-3 shadow-sm"
                    >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="text-sm font-semibold text-[#1f2330]">
                              {[contact.civility, contact.first_name, contact.last_name].filter(Boolean).join(" ")}
                            </p>
                            {contact.role ? (
                            <p className="text-xs uppercase tracking-[0.12em] text-[#5c606b]">
                              {contact.role}
                            </p>
                          ) : null}
                          <p className="mt-1 text-sm text-[#2b2f36]">
                            {formatFrenchPhoneNumber(contact.phone_1 ?? "") || "—"}{" "}
                            {contact.phone_2 ? ` / ${formatFrenchPhoneNumber(contact.phone_2)}` : ""}
                          </p>
                          {contact.email ? (
                            <p className="text-sm text-[#2b2f36]">{contact.email}</p>
                          ) : null}
                        </div>
                        <div className="flex flex-col gap-2">
                          <button
                            type="button"
                            className="inline-flex items-center justify-center rounded-full p-2 text-[#c77845] hover:text-[#b45b12]"
                            onClick={() => openContactModal(contact)}
                            aria-label="Modifier le contact"
                          >
                            <Pencil className="h-4 w-4" strokeWidth={2.2} />
                          </button>
                          <button
                            type="button"
                            className="inline-flex items-center justify-center rounded-full p-2 text-[#b42318] hover:text-[#7f1d1d]"
                            onClick={() => handleDeleteContact(contact.id)}
                            aria-label="Supprimer le contact"
                          >
                            <Trash2 className="h-4 w-4" strokeWidth={2.2} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>
        </div>
      </div>

      {contactModalOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-xl rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#e5e7eb] px-6 py-4">
              <h3 className="text-lg font-semibold text-[#1f2330]">
                {contactForm.id ? "Modifier le contact" : "Ajouter un contact"}
              </h3>
              <button
                type="button"
                onClick={() => setContactModalOpen(false)}
                className="text-sm font-semibold text-[#5c606b] hover:text-[#1f2330]"
              >
                Fermer
              </button>
            </div>
            <div className="space-y-4 px-6 py-4">
              <div className="grid gap-3 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-[0.12em] text-[#5c606b]">
                    Civilité
                  </label>
                  <input
                    type="text"
                    value={contactForm.civility}
                    onChange={handleContactChange("civility")}
                    className="w-full rounded-lg border border-[#d4d7df] px-3 py-2 text-sm text-[#1f2330] focus:border-[#7f8696] focus:outline-none"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-[0.12em] text-[#5c606b]">
                    Fonction
                  </label>
                  <input
                    type="text"
                    value={contactForm.role}
                    onChange={handleContactChange("role")}
                    className="w-full rounded-lg border border-[#d4d7df] px-3 py-2 text-sm text-[#1f2330] focus:border-[#7f8696] focus:outline-none"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-[0.12em] text-[#5c606b]">
                    Nom de famille
                  </label>
                  <input
                    type="text"
                    value={contactForm.last_name}
                    onChange={handleContactChange("last_name")}
                    className="w-full rounded-lg border border-[#d4d7df] px-3 py-2 text-sm text-[#1f2330] focus:border-[#7f8696] focus:outline-none"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-[0.12em] text-[#5c606b]">
                    Prénom
                  </label>
                  <input
                    type="text"
                    value={contactForm.first_name}
                    onChange={handleContactChange("first_name")}
                    className="w-full rounded-lg border border-[#d4d7df] px-3 py-2 text-sm text-[#1f2330] focus:border-[#7f8696] focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-[0.12em] text-[#5c606b]">
                    Téléphone 1
                  </label>
                  <input
                    type="text"
                    value={contactForm.phone_1}
                    onChange={handleContactChange("phone_1")}
                    className="w-full rounded-lg border border-[#d4d7df] px-3 py-2 text-sm text-[#1f2330] focus:border-[#7f8696] focus:outline-none"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-[0.12em] text-[#5c606b]">
                    Téléphone 2
                  </label>
                  <input
                    type="text"
                    value={contactForm.phone_2}
                    onChange={handleContactChange("phone_2")}
                    className="w-full rounded-lg border border-[#d4d7df] px-3 py-2 text-sm text-[#1f2330] focus:border-[#7f8696] focus:outline-none"
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className="text-xs font-semibold uppercase tracking-[0.12em] text-[#5c606b]">
                    Mail
                  </label>
                  <input
                    type="email"
                    value={contactForm.email}
                    onChange={handleContactChange("email")}
                    className="w-full rounded-lg border border-[#d4d7df] px-3 py-2 text-sm text-[#1f2330] focus:border-[#7f8696] focus:outline-none"
                  />
                </div>
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 border-t border-[#e5e7eb] px-6 py-4">
              <button
                type="button"
                className="inline-flex items-center justify-center rounded-md border border-[#ccd0d8] bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-[#2b2f36] transition hover:bg-[#f7f8fb]"
                onClick={() => setContactModalOpen(false)}
              >
                Annuler
              </button>
              <button
                type="button"
                className="inline-flex items-center justify-center rounded-md border border-[#b96d3c] bg-[#c77845] px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-white transition hover:bg-[#b45b12]"
                onClick={handleSaveContact}
              >
                Enregistrer
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

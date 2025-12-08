"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState, type ChangeEvent } from "react";
import { AlertTriangle, ArrowLeftCircle, PlusCircle, Save, Trash2 } from "lucide-react";

import { formatFrenchPhoneNumber } from "@/lib/phone";
import { supabase } from "@/lib/supabase-client";

type CentreListItem = {
  id: number;
  name: string;
  is_active: boolean | null;
  city: string | null;
  postal_code: string | null;
  phone_landline: string | null;
  commission_expiry_date: string | null;
};

type CentreDetail = {
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

type CentreForm = {
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

type ContactRow = {
  id: number;
  civility: string | null;
  last_name: string;
  first_name: string;
  role: string | null;
  phone_1: string | null;
  phone_2: string | null;
  email: string | null;
};

type ContactForm = {
  civility: string;
  last_name: string;
  first_name: string;
  role: string;
  phone_1: string;
  phone_2: string;
  email: string;
};

export default function CentresPage() {
  const router = useRouter();
  const [centres, setCentres] = useState<CentreListItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [filters, setFilters] = useState({
    name: "",
    city: "",
    postalCode: "",
    phone: "",
  });
  const [selectedCentreId, setSelectedCentreId] = useState<number | null>(null);
  const [selectedCentre, setSelectedCentre] = useState<CentreDetail | null>(null);
  const [form, setForm] = useState<CentreForm | null>(null);
  const [contacts, setContacts] = useState<ContactRow[]>([]);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [contactModalOpen, setContactModalOpen] = useState(false);
  const [contactSaving, setContactSaving] = useState(false);
  const [contactError, setContactError] = useState<string | null>(null);
  const [contactForm, setContactForm] = useState<ContactForm>({
    civility: "",
    last_name: "",
    first_name: "",
    role: "",
    phone_1: "",
    phone_2: "",
    email: "",
  });

  const createEmptyForm = (): CentreForm => ({
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

  const normalizeText = (value: string) =>
    value ? value.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase() : "";

  useEffect(() => {
    const fetchCentres = async () => {
      setLoading(true);
      setError(null);
      const { data, error: fetchError } = await supabase
        .from("centres")
        .select("id, name, is_active, city, postal_code, phone_landline, commission_expiry_date")
        .order("name", { ascending: true });

      if (fetchError) {
        setError(`Erreur lors du chargement des centres : ${fetchError.message}`);
        setCentres([]);
      } else {
        setCentres((data as CentreListItem[]) ?? []);
      }
      setLoading(false);
    };

    fetchCentres();
  }, []);

  useEffect(() => {
    if (!selectedCentreId) {
      setSelectedCentre(null);
      setForm(null);
      setContacts([]);
      setIsEditing(false);
      return;
    }

    const fetchDetail = async () => {
      setDetailLoading(true);
      setDetailError(null);
      const { data, error: centreError } = await supabase
        .from("centres")
        .select(
          "id, name, is_active, city, postal_code, phone_landline, commission_expiry_date, address_street, address_extra, generic_email, ddcs_number, gps_latitude, gps_longitude, commission_pv_date",
        )
        .eq("id", selectedCentreId)
        .maybeSingle();

      if (centreError) {
        setDetailError(`Erreur centre : ${centreError.message}`);
        setSelectedCentre(null);
        setForm(null);
        setIsEditing(false);
      } else {
        const detail = (data as CentreDetail) ?? null;
        setSelectedCentre(detail);
        setForm(
          detail
            ? {
                name: detail.name ?? "",
                is_active: detail.is_active !== false,
                city: detail.city ?? "",
                postal_code: detail.postal_code ?? "",
                phone_landline: detail.phone_landline ?? "",
                commission_expiry_date: detail.commission_expiry_date ?? "",
                address_street: detail.address_street ?? "",
                address_extra: detail.address_extra ?? "",
                generic_email: detail.generic_email ?? "",
                ddcs_number: detail.ddcs_number ?? "",
                gps_latitude: detail.gps_latitude ?? "",
                gps_longitude: detail.gps_longitude ?? "",
                commission_pv_date: detail.commission_pv_date ?? "",
              }
            : null,
        );
        setDirty(false);
        setIsEditing(false);
      }

      const { data: contactData, error: contactError } = await supabase
        .from("contacts_centres")
        .select("id, civility, last_name, first_name, role, phone_1, phone_2, email")
        .eq("centre_id", selectedCentreId)
        .order("last_name", { ascending: true });

      if (contactError) {
        setDetailError((prev) => prev ?? `Erreur contacts : ${contactError.message}`);
        setContacts([]);
      } else {
        setContacts((contactData as ContactRow[]) ?? []);
      }

      setDetailLoading(false);
    };

    fetchDetail();
  }, [selectedCentreId]);

  useEffect(() => {
    const beforeUnload = (event: BeforeUnloadEvent) => {
      if (dirty) {
        event.preventDefault();
        event.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", beforeUnload);
    return () => window.removeEventListener("beforeunload", beforeUnload);
  }, [dirty]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setIsSearchOpen((open) => !open);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const formatDate = (value: string | null) => {
    if (!value) return "";
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return value;
    return parsed.toLocaleDateString("fr-FR");
  };
  const formatPhone = (value: string | null) => (value ? formatFrenchPhoneNumber(value) : "—");

  const baseInputClasses =
    "w-full rounded-lg border border-[#d4d7df] px-3 py-2 text-sm text-[#1f2330] focus:outline-none";
  const activeInputClasses = `${baseInputClasses} bg-white focus:border-[#c77845]`;
  const inactiveInputClasses = `${baseInputClasses} bg-[#f5f6f8] text-[#1f2330]`;

  const handleFormChange =
    (field: keyof CentreForm) =>
    (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      if (!form) return;
      const isCheckbox = event.target instanceof HTMLInputElement && event.target.type === "checkbox";
      let value: string | boolean = isCheckbox ? (event.target as HTMLInputElement).checked : event.target.value;
      if (field === "phone_landline") {
        value = formatFrenchPhoneNumber(String(value));
      }
      setForm((prev) => (prev ? { ...prev, [field]: value } : prev));
      setDirty(true);
      setIsEditing(true);
    };

  const handleResetForm = () => {
    if (selectedCentre) {
      setForm({
        name: selectedCentre.name ?? "",
        is_active: selectedCentre.is_active !== false,
        city: selectedCentre.city ?? "",
        postal_code: selectedCentre.postal_code ?? "",
        phone_landline: selectedCentre.phone_landline ?? "",
        commission_expiry_date: selectedCentre.commission_expiry_date ?? "",
        address_street: selectedCentre.address_street ?? "",
        address_extra: selectedCentre.address_extra ?? "",
        generic_email: selectedCentre.generic_email ?? "",
        ddcs_number: selectedCentre.ddcs_number ?? "",
        gps_latitude: selectedCentre.gps_latitude ?? "",
        gps_longitude: selectedCentre.gps_longitude ?? "",
        commission_pv_date: selectedCentre.commission_pv_date ?? "",
      });
    } else {
      setForm(createEmptyForm());
    }
    setDirty(false);
    setIsEditing(false);
  };

  const handleAddNew = () => {
    if (dirty) {
      alert("Enregistrez ou annulez les modifications avant de créer un nouveau centre.");
      return;
    }
    setSelectedCentreId(null);
    setSelectedCentre(null);
    setContacts([]);
    setForm(createEmptyForm());
    setDirty(true);
    setIsEditing(true);
  };

  const handleDeleteCentre = async () => {
    if (!selectedCentre?.id) return;
    if (!confirm("Supprimer ce centre ?")) return;
    const { error: deleteError } = await supabase.from("centres").delete().eq("id", selectedCentre.id);
    if (deleteError) {
      setDetailError(`Erreur lors de la suppression : ${deleteError.message}`);
      return;
    }
    setCentres((prev) => prev.filter((c) => c.id !== selectedCentre.id));
    setSelectedCentreId(null);
    setSelectedCentre(null);
    setContacts([]);
    setForm(null);
    setDirty(false);
    setIsEditing(false);
  };

  const handleSaveForm = async () => {
    if (!form) return;
    setSaving(true);
    setDetailError(null);
    const payload = {
      name: form.name.trim(),
      is_active: form.is_active,
      city: form.city || null,
      postal_code: form.postal_code || null,
      phone_landline: form.phone_landline || null,
      commission_expiry_date: form.commission_expiry_date || null,
      address_street: form.address_street || null,
      address_extra: form.address_extra || null,
      generic_email: form.generic_email || null,
      ddcs_number: form.ddcs_number || null,
      gps_latitude: form.gps_latitude ? Number(form.gps_latitude) : null,
      gps_longitude: form.gps_longitude ? Number(form.gps_longitude) : null,
      commission_pv_date: form.commission_pv_date || null,
      modified_at: new Date().toISOString(),
    };

    const request = selectedCentre?.id
      ? supabase
          .from("centres")
          .update(payload)
          .eq("id", selectedCentre.id)
          .select(
            "id, name, is_active, city, postal_code, phone_landline, commission_expiry_date, address_street, address_extra, generic_email, ddcs_number, gps_latitude, gps_longitude, commission_pv_date",
          )
          .maybeSingle()
      : supabase
          .from("centres")
          .insert(payload)
          .select(
            "id, name, is_active, city, postal_code, phone_landline, commission_expiry_date, address_street, address_extra, generic_email, ddcs_number, gps_latitude, gps_longitude, commission_pv_date",
          )
          .maybeSingle();

    const { data, error: updateError } = await request;

    if (updateError) {
      setDetailError(`Erreur lors de l'enregistrement : ${updateError.message}`);
      setSaving(false);
      return;
    }

    const updated = (data as CentreDetail) ?? null;
    if (updated?.id) {
      setSelectedCentreId(updated.id);
    }
    setSelectedCentre(updated);
    setForm(
      updated
        ? {
            name: updated.name ?? "",
            is_active: updated.is_active !== false,
            city: updated.city ?? "",
            postal_code: updated.postal_code ?? "",
            phone_landline: updated.phone_landline ?? "",
            commission_expiry_date: updated.commission_expiry_date ?? "",
            address_street: updated.address_street ?? "",
            address_extra: updated.address_extra ?? "",
            generic_email: updated.generic_email ?? "",
            ddcs_number: updated.ddcs_number ?? "",
            gps_latitude: updated.gps_latitude ?? "",
            gps_longitude: updated.gps_longitude ?? "",
            commission_pv_date: updated.commission_pv_date ?? "",
          }
        : null,
    );
    setCentres((prev) => {
      if (!updated) return prev;
      const exists = prev.some((c) => c.id === updated.id);
      if (exists) {
        return prev.map((c) => (c.id === updated.id ? { ...c, ...updated } : c));
      }
      return [...prev, updated];
    });
    setDirty(false);
    setIsEditing(false);
    setSaving(false);
  };

  const filteredCentres = useMemo(() => {
    const termName = normalizeText(filters.name.trim());
    const termCity = normalizeText(filters.city.trim());
    const termPostal = normalizeText(filters.postalCode.trim());
    const termPhone = filters.phone.replace(/\D/g, "");

    return centres.filter((centre) => {
      const matchesName = !termName || normalizeText(centre.name).includes(termName);
      const matchesCity = !termCity || normalizeText(centre.city ?? "").includes(termCity);
      const matchesPostal = !termPostal || normalizeText(centre.postal_code ?? "").includes(termPostal);
      const matchesPhone =
        !termPhone ||
        (centre.phone_landline ? centre.phone_landline.replace(/\D/g, "").includes(termPhone) : false);

      return matchesName && matchesCity && matchesPostal && matchesPhone;
    });
  }, [centres, filters]);

  return (
    <div className="min-h-screen bg-[#dde1e7] py-10 text-[#1f2330]">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 md:px-8">
        <header className="rounded-2xl border border-[#c9ccd5] bg-[#f6e8de] px-6 py-5 shadow-lg text-[#1f2330]">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h1 className="text-3xl font-semibold tracking-tight">Centres</h1>
              <p className="mt-1 text-sm text-[#4d5562]">
                Recherchez un centre puis ouvrez sa fiche détaillée.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => setIsSearchOpen((open) => !open)}
                className="inline-flex items-center gap-2 rounded-md border border-[#c7a486] bg-white/60 px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-[#3b2f28] transition hover:bg-white"
              >
                {isSearchOpen ? "Fermer la recherche" : "Ouvrir la recherche"}
                <span className="rounded bg-white px-2 py-0.5 text-[10px] font-semibold text-[#3b2f28]">⌘K</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  if (dirty) {
                    alert("Enregistrez ou annulez les modifications avant de créer un nouveau centre.");
                    return;
                  }
                  setSelectedCentreId(null);
                  setSelectedCentre(null);
                  setContacts([]);
                  setForm(createEmptyForm());
                  setDirty(true);
                  setIsEditing(true);
                }}
                className="inline-flex items-center gap-2 rounded-md border border-[#b96d3c] bg-[#c77845] px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-white transition hover:bg-[#b45b12]"
              >
                Nouveau centre
              </button>
            </div>
          </div>
          <div className="mt-2 text-sm text-[#4d5562]">
            {loading
              ? "Chargement en cours…"
              : filteredCentres.length > 1
                ? `${filteredCentres.length} centres`
                : `${filteredCentres.length} centre`}
          </div>
          {error ? <p className="mt-2 text-sm text-[#b42318]">{error}</p> : null}
        </header>

        <section className="rounded-2xl border border-[#d0d4dc] bg-white shadow-xl">
          <div className="flex items-center justify-between border-b border-[#e8ebf1] px-6 py-4">
            <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-[#2b2f36]">Centres</h2>
            <span className="text-sm text-[#5c606b]">
              {filteredCentres.length} résultat{filteredCentres.length > 1 ? "s" : ""}
            </span>
          </div>
          {isSearchOpen ? (
            <div className="mx-6 mt-4 mb-2 grid gap-3 rounded-xl border border-[#e3cfc1] bg-white/70 p-4 text-sm text-[#1f2330]">
              <div className="grid gap-3 md:grid-cols-4">
                <input
                  className="rounded border border-[#e3cfc1] bg-white px-3 py-2 text-sm text-[#1f2330] placeholder:text-[#8c8f99] focus:border-[#c77845] focus:outline-none"
                  placeholder="Nom du centre"
                  value={filters.name}
                  onChange={(e) => setFilters((prev) => ({ ...prev, name: e.target.value }))}
                />
                <input
                  className="rounded border border-[#e3cfc1] bg-white px-3 py-2 text-sm text-[#1f2330] placeholder:text-[#8c8f99] focus:border-[#c77845] focus:outline-none"
                  placeholder="Ville"
                  value={filters.city}
                  onChange={(e) => setFilters((prev) => ({ ...prev, city: e.target.value }))}
                />
                <input
                  className="rounded border border-[#e3cfc1] bg-white px-3 py-2 text-sm text-[#1f2330] placeholder:text-[#8c8f99] focus:border-[#c77845] focus:outline-none"
                  placeholder="Code postal"
                  value={filters.postalCode}
                  onChange={(e) => setFilters((prev) => ({ ...prev, postalCode: e.target.value }))}
                />
                <input
                  className="rounded border border-[#e3cfc1] bg-white px-3 py-2 text-sm text-[#1f2330] placeholder:text-[#8c8f99] focus:border-[#c77845] focus:outline-none"
                  placeholder="Téléphone"
                  value={filters.phone}
                  onChange={(e) => setFilters((prev) => ({ ...prev, phone: e.target.value }))}
                />
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => setFilters({ name: "", city: "", postalCode: "", phone: "" })}
                  className="inline-flex items-center justify-center rounded-md border border-[#e3cfc1] bg-white px-3 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-[#3b2f28] transition hover:bg-[#f9efe6]"
                >
                  Réinitialiser
                </button>
              </div>
            </div>
          ) : null}
          <div
            className="max-h-[260px] overflow-y-auto overscroll-y-contain touch-pan-y sm:max-h-[280px]"
            style={{ WebkitOverflowScrolling: "touch" }}
          >
            <table className="w-full border-collapse text-sm text-[#2b2f36]">
              <thead className="sticky top-0 z-10 bg-[#f3f5f8] text-xs uppercase tracking-[0.14em] text-[#5c606b] shadow">
                <tr>
                  <th className="px-4 py-3 text-left">Nom du centre</th>
                  <th className="px-4 py-3 text-left">En activité ?</th>
                  <th className="px-4 py-3 text-left">Ville</th>
                  <th className="px-4 py-3 text-left">Code postal</th>
                  <th className="px-4 py-3 text-left">Téléphone fixe</th>
                  <th className="px-4 py-3 text-left">Péremption commission</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td className="px-4 py-4 text-center text-sm text-[#5c606b]" colSpan={6}>
                      Chargement…
                    </td>
                  </tr>
                ) : filteredCentres.length === 0 ? (
                  <tr>
                    <td className="px-4 py-6 text-center text-sm text-[#5c606b]" colSpan={6}>
                      Aucun centre pour le moment.
                    </td>
                  </tr>
                ) : (
                  filteredCentres.map((centre) => (
                    <tr
                      key={centre.id}
                      className="cursor-pointer border-t border-[#eceff3] transition hover:bg-[#f7f8fb]"
                      onClick={() => {
                        if (dirty) {
                          alert("Enregistrez ou annulez les modifications avant de changer de centre.");
                          return;
                        }
                        setSelectedCentreId(centre.id);
                      }}
                    >
                      <td className="px-4 py-3 font-semibold text-[#1f2330]">{centre.name}</td>
                      <td className="px-4 py-3">
                        {centre.is_active === false ? (
                          <span className="rounded-full bg-[#fef2f2] px-2 py-1 text-xs font-semibold text-[#b42318]">
                            Non
                          </span>
                        ) : (
                          <span className="rounded-full bg-[#ecfdf3] px-2 py-1 text-xs font-semibold text-[#027a48]">
                            Oui
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3">{centre.city || "—"}</td>
                      <td className="px-4 py-3">{centre.postal_code || "—"}</td>
                      <td className="px-4 py-3">{formatPhone(centre.phone_landline)}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span>{formatDate(centre.commission_expiry_date)}</span>
                          {centre.commission_expiry_date &&
                          !Number.isNaN(new Date(centre.commission_expiry_date).getTime()) &&
                          new Date(centre.commission_expiry_date) < new Date() ? (
                            <span
                              className="flex h-6 w-6 items-center justify-center rounded-full bg-[#fee2e2] shadow-sm ring-1 ring-[#f8b4b4]"
                              title="Commission périmée"
                            >
                              <AlertTriangle className="h-4 w-4 text-[#c2410c]" />
                            </span>
                          ) : null}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>

        <section className="rounded-2xl border border-[#d0d4dc] bg-white shadow-xl">
          <div className="flex items-center justify-between border-b border-[#e8ebf1] px-6 py-4">
            <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-[#2b2f36]">
              Informations Centres
            </h2>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleAddNew}
                className="flex h-8 w-8 items-center justify-center rounded-full border border-[#b96d3c] text-[#b96d3c] transition hover:bg-[#f8ede5]"
                title="Ajouter"
              >
                <PlusCircle className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                onClick={() => {
                  if (!selectedCentre?.id) return;
                  if (!confirm("Supprimer ce centre ?")) return;
                  handleDeleteCentre();
                }}
                disabled={!selectedCentre?.id}
                className="flex h-8 w-8 items-center justify-center rounded-full border border-[#b96d3c] text-[#b96d3c] transition hover:bg-[#f8ede5] disabled:cursor-not-allowed disabled:opacity-50"
                title="Supprimer"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                onClick={handleSaveForm}
                disabled={saving || !isEditing}
                className="flex h-8 w-8 items-center justify-center rounded-full border border-[#b96d3c] text-[#b96d3c] transition hover:bg-[#f8ede5] disabled:cursor-not-allowed disabled:opacity-50"
                title="Enregistrer"
              >
                <Save className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                onClick={handleResetForm}
                className="flex h-8 w-8 items-center justify-center rounded-full border border-[#b96d3c] text-[#b96d3c] transition hover:bg-[#f8ede5]"
                title="Annuler les modifications"
              >
                <ArrowLeftCircle className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
          <div className="px-6 py-5">
            {detailLoading ? (
              <p className="text-sm text-[#5c606b]">Chargement…</p>
            ) : detailError ? (
              <p className="text-sm text-[#b42318]">{detailError}</p>
            ) : !form ? (
              <p className="text-sm text-[#5c606b]">Sélectionnez un centre dans la liste ou créez-en un nouveau.</p>
            ) : (
              <div className="mt-2 grid gap-4 rounded-xl border border-[#e4e7ef] bg-[#f9fafb] p-4 shadow-sm lg:grid-cols-[2fr_1fr]">
                <div className="space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="space-y-1">
                      <label className="text-xs font-semibold uppercase tracking-[0.12em] text-[#5c606b]">
                        Nom du centre
                      </label>
                      <input
                        className={isEditing ? activeInputClasses : inactiveInputClasses}
                        value={form.name}
                        onChange={handleFormChange("name")}
                        onFocus={() => setIsEditing(true)}
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] ${
                          form.is_active ? "bg-[#ecfdf3] text-[#027a48]" : "bg-[#fef2f2] text-[#b42318]"
                        }`}
                      >
                        {form.is_active ? "Actif" : "Inactif"}
                      </span>
                      <label className="inline-flex items-center gap-2 text-sm text-[#2b2f36]">
                        <input
                          type="checkbox"
                          checked={form.is_active}
                          onChange={handleFormChange("is_active")}
                          className="h-4 w-4 rounded border-[#c9ccd5] text-[#c77845] focus:ring-[#c77845]"
                          onFocus={() => setIsEditing(true)}
                        />
                        En activité
                      </label>
                    </div>
                  </div>

                  <div className="grid gap-3 md:grid-cols-2">
                    <div className="space-y-2">
                      <label className="text-xs font-semibold uppercase tracking-[0.12em] text-[#5c606b]">
                        Adresse
                      </label>
                      <input
                        className={isEditing ? activeInputClasses : inactiveInputClasses}
                        value={form.address_street}
                        onChange={handleFormChange("address_street")}
                        onFocus={() => setIsEditing(true)}
                      />
                      <input
                        className={isEditing ? activeInputClasses : inactiveInputClasses}
                        value={form.address_extra}
                        onChange={handleFormChange("address_extra")}
                        placeholder="Complément"
                        onFocus={() => setIsEditing(true)}
                      />
                      <div className="grid grid-cols-[1fr,2fr] gap-3">
                        <input
                          className={isEditing ? activeInputClasses : inactiveInputClasses}
                          value={form.postal_code}
                          onChange={handleFormChange("postal_code")}
                          placeholder="Code postal"
                          onFocus={() => setIsEditing(true)}
                        />
                        <input
                          className={isEditing ? activeInputClasses : inactiveInputClasses}
                          value={form.city}
                          onChange={handleFormChange("city")}
                          placeholder="Ville"
                          onFocus={() => setIsEditing(true)}
                        />
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="space-y-1">
                        <label className="text-xs font-semibold uppercase tracking-[0.12em] text-[#5c606b]">
                          Téléphone fixe
                        </label>
                        <input
                          className={isEditing ? activeInputClasses : inactiveInputClasses}
                          value={form.phone_landline}
                          onChange={handleFormChange("phone_landline")}
                          onFocus={() => setIsEditing(true)}
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-semibold uppercase tracking-[0.12em] text-[#5c606b]">
                          Mail générique
                        </label>
                        <input
                          className={isEditing ? activeInputClasses : inactiveInputClasses}
                          value={form.generic_email}
                          onChange={handleFormChange("generic_email")}
                          onFocus={() => setIsEditing(true)}
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-semibold uppercase tracking-[0.12em] text-[#5c606b]">
                          N° DDCS
                        </label>
                        <input
                          className={isEditing ? activeInputClasses : inactiveInputClasses}
                          value={form.ddcs_number}
                          onChange={handleFormChange("ddcs_number")}
                          onFocus={() => setIsEditing(true)}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid gap-3 md:grid-cols-2">
                    <div className="space-y-1">
                      <label className="text-xs font-semibold uppercase tracking-[0.12em] text-[#5c606b]">
                        Commission (PV)
                      </label>
                      <input
                        type="date"
                        className={isEditing ? activeInputClasses : inactiveInputClasses}
                        value={form.commission_pv_date}
                        onChange={handleFormChange("commission_pv_date")}
                        onFocus={() => setIsEditing(true)}
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-semibold uppercase tracking-[0.12em] text-[#5c606b]">
                        Péremption commission
                      </label>
                      <input
                        type="date"
                        className={isEditing ? activeInputClasses : inactiveInputClasses}
                        value={form.commission_expiry_date}
                        onChange={handleFormChange("commission_expiry_date")}
                        onFocus={() => setIsEditing(true)}
                      />
                    </div>
                  </div>

                  <div className="grid gap-3 md:grid-cols-2">
                    <div className="space-y-1">
                      <label className="text-xs font-semibold uppercase tracking-[0.12em] text-[#5c606b]">
                        Latitude
                      </label>
                      <input
                        className={isEditing ? activeInputClasses : inactiveInputClasses}
                        value={form.gps_latitude}
                        onChange={handleFormChange("gps_latitude")}
                        onFocus={() => setIsEditing(true)}
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-semibold uppercase tracking-[0.12em] text-[#5c606b]">
                        Longitude
                      </label>
                      <input
                        className={isEditing ? activeInputClasses : inactiveInputClasses}
                        value={form.gps_longitude}
                        onChange={handleFormChange("gps_longitude")}
                        onFocus={() => setIsEditing(true)}
                      />
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-3" />
                </div>

                <div className="space-y-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#5c606b]">
                    Contacts du centre
                  </p>
                  {selectedCentre?.id ? (
                    <button
                      type="button"
                      onClick={() => router.push(`/centres/${selectedCentre.id}`)}
                      className="inline-flex items-center justify-center rounded-md border border-[#ccd0d8] bg-white px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.12em] text-[#2b2f36] transition hover:bg-[#f7f8fb]"
                    >
                      Ajouter un contact
                    </button>
                  ) : (
                    <p className="text-sm text-[#5c606b]">Enregistrez le centre pour ajouter des contacts.</p>
                  )}
                  {selectedCentre?.id ? (
                    contacts.length === 0 ? (
                      <p className="text-sm text-[#5c606b]">Aucun contact pour ce centre.</p>
                    ) : (
                      <div className="space-y-3">
                        {contacts.map((contact) => (
                          <div
                            key={contact.id}
                            className="rounded-lg border border-[#e4e7ef] bg-white px-3 py-2 text-sm text-[#2b2f36] shadow-sm"
                          >
                            <p className="font-semibold">
                              {[contact.civility, contact.first_name, contact.last_name].filter(Boolean).join(" ")}
                            </p>
                            {contact.role ? (
                              <p className="text-xs uppercase tracking-[0.12em] text-[#5c606b]">{contact.role}</p>
                            ) : null}
                            <p>{contact.phone_1 ? formatPhone(contact.phone_1) : "—"}</p>
                            {contact.email ? <p>{contact.email}</p> : null}
                          </div>
                        ))}
                      </div>
                    )
                  ) : (
                    <p className="text-sm text-[#5c606b]">Enregistrez le centre pour ajouter des contacts.</p>
                  )}
                </div>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

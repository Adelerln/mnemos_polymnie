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
    "w-full rounded-2xl border border-[#CFE5FF] px-4 py-2.5 text-sm text-[#204991] focus:outline-none transition";
  const activeInputClasses = `${baseInputClasses} bg-white focus:border-[#B3D2FF]`;
  const inactiveInputClasses = `${baseInputClasses} bg-white/70 text-[#204991]/80`;

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
    <div className="min-h-screen bg-white py-12 text-[#204991]">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-5 md:px-10">
        <header className="rounded-3xl border border-[#CFE5FF] bg-white/95 px-8 py-7 text-[#204991] shadow-[0_25px_60px_rgba(83,15,43,0.05)]">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.5em]">Centres</p>
              <h1 className="mt-2 text-3xl font-semibold tracking-tight">Gestion des centres</h1>
              <p className="mt-2 text-sm text-[#204991]">Recherchez un centre puis ouvrez sa fiche détaillée.</p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => setIsSearchOpen((open) => !open)}
                className="inline-flex items-center gap-3 rounded-full border border-[#CFE5FF] bg-white/70 px-5 py-2 text-sm font-medium uppercase tracking-[0.2em] text-[#204991] transition hover:border-[#B3D2FF] hover:bg-[#B3D2FF]"
              >
                {isSearchOpen ? "FERMER LA RECHERCHE" : "OUVRIR LA RECHERCHE"}
                <span className="rounded-full bg-[#CFE5FF] px-2 py-0.5 text-[10px] font-semibold text-[#204991]">
                  ⌘K
                </span>
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
                className="inline-flex items-center gap-2 rounded-full border border-transparent bg-[#CFE5FF] px-5 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#204991] transition hover:bg-[#B3D2FF]"
              >
                Nouveau centre
              </button>
            </div>
          </div>
          <div className="mt-3 flex items-center gap-2 text-sm text-[#204991]">
            <span className="inline-flex h-1 w-8 rounded-full bg-[#CFE5FF]" aria-hidden="true" />
            {loading
              ? "Chargement en cours…"
              : filteredCentres.length > 1
                ? `${filteredCentres.length} centres`
                : `${filteredCentres.length} centre`}
          </div>
          {error ? <p className="mt-2 text-sm font-semibold text-[#c2410c]">{error}</p> : null}
        </header>

        <section className="overflow-hidden rounded-3xl border border-[#CFE5FF] bg-white/95 shadow-[0_30px_70px_rgba(83,15,43,0.04)]">
          <div className="flex items-center justify-between border-b border-[#CFE5FF] bg-white/80 px-6 py-4 text-sm">
            <h2 className="text-xs font-semibold uppercase tracking-[0.3em] text-[#204991]">Centres</h2>
            <span className="text-sm text-[#204991]">
              {filteredCentres.length} résultat{filteredCentres.length > 1 ? "s" : ""}
            </span>
          </div>
          {isSearchOpen ? (
            <div className="mx-6 mt-4 mb-2 grid gap-3 rounded-2xl border border-[#CFE5FF] bg-[#CFE5FF] p-5 text-sm text-[#204991]">
              <div className="grid gap-3 md:grid-cols-4">
                <input
                  className="rounded-2xl border border-[#CFE5FF] bg-white px-4 py-2.5 text-sm text-[#204991] placeholder:text-[#204991] focus:border-[#B3D2FF] focus:outline-none"
                  placeholder="Nom du centre"
                  value={filters.name}
                  onChange={(e) => setFilters((prev) => ({ ...prev, name: e.target.value }))}
                />
                <input
                  className="rounded-2xl border border-[#CFE5FF] bg-white px-4 py-2.5 text-sm text-[#204991] placeholder:text-[#204991] focus:border-[#B3D2FF] focus:outline-none"
                  placeholder="Ville"
                  value={filters.city}
                  onChange={(e) => setFilters((prev) => ({ ...prev, city: e.target.value }))}
                />
                <input
                  className="rounded-2xl border border-[#CFE5FF] bg-white px-4 py-2.5 text-sm text-[#204991] placeholder:text-[#204991] focus:border-[#B3D2FF] focus:outline-none"
                  placeholder="Code postal"
                  value={filters.postalCode}
                  onChange={(e) => setFilters((prev) => ({ ...prev, postalCode: e.target.value }))}
                />
                <input
                  className="rounded-2xl border border-[#CFE5FF] bg-white px-4 py-2.5 text-sm text-[#204991] placeholder:text-[#204991] focus:border-[#B3D2FF] focus:outline-none"
                  placeholder="Téléphone"
                  value={filters.phone}
                  onChange={(e) => setFilters((prev) => ({ ...prev, phone: e.target.value }))}
                />
              </div>
              <div className="flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em]">
                <button
                  type="button"
                  onClick={() => setFilters({ name: "", city: "", postalCode: "", phone: "" })}
                  className="inline-flex items-center justify-center rounded-full border border-[#CFE5FF] bg-white px-4 py-2 text-[#204991] transition hover:bg-[#B3D2FF]"
                >
                  Réinitialiser
                </button>
              </div>
            </div>
          ) : null}
          <div className="max-h-[280px] overflow-y-auto overscroll-y-contain touch-pan-y" style={{ WebkitOverflowScrolling: "touch" }}>
            <table className="w-full border-collapse text-sm text-[#204991]">
              <thead className="sticky top-0 z-10 border-b border-[#CFE5FF] bg-white text-left text-[11px] font-semibold uppercase tracking-[0.3em] text-[#204991]">
                <tr>
                  <th className="px-5 py-3 text-left">Nom du centre</th>
                  <th className="px-5 py-3 text-left">En activité ?</th>
                  <th className="px-5 py-3 text-left">Ville</th>
                  <th className="px-5 py-3 text-left">Code postal</th>
                  <th className="px-5 py-3 text-left">Téléphone fixe</th>
                  <th className="px-5 py-3 text-left">Péremption commission</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td className="px-5 py-5 text-center text-sm text-[#204991]" colSpan={6}>
                      Chargement…
                    </td>
                  </tr>
                ) : filteredCentres.length === 0 ? (
                  <tr>
                    <td className="px-5 py-6 text-center text-sm text-[#204991]" colSpan={6}>
                      Aucun centre pour le moment.
                    </td>
                  </tr>
                ) : (
                  filteredCentres.map((centre) => (
                    <tr
                      key={centre.id}
                      className="border-b border-[#CFE5FF] transition hover:bg-[#B3D2FF]/40"
                      onClick={() => {
                        if (dirty) {
                          alert("Enregistrez ou annulez les modifications avant de changer de centre.");
                          return;
                        }
                        setSelectedCentreId(centre.id);
                      }}
                    >
                      <td className="px-5 py-3 font-semibold">{centre.name}</td>
                      <td className="px-5 py-3">
                        {centre.is_active === false ? (
                          <span className="rounded-full bg-[#fee2e2] px-2 py-1 text-xs font-semibold text-[#c2410c]">
                            Non
                          </span>
                        ) : (
                          <span className="rounded-full bg-[#CFE5FF] px-2 py-1 text-xs font-semibold text-[#204991]">
                            Oui
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-3">{centre.city || "—"}</td>
                      <td className="px-5 py-3">{centre.postal_code || "—"}</td>
                      <td className="px-5 py-3">{formatPhone(centre.phone_landline)}</td>
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-2">
                          <span>{formatDate(centre.commission_expiry_date)}</span>
                          {centre.commission_expiry_date &&
                          !Number.isNaN(new Date(centre.commission_expiry_date).getTime()) &&
                          new Date(centre.commission_expiry_date) < new Date() ? (
                            <span
                              className="flex h-6 w-6 items-center justify-center rounded-full bg-[#FDE5E6] shadow-sm ring-1 ring-[#F8B4B4]"
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

        <section className="space-y-6 rounded-3xl border border-[#CFE5FF] bg-white p-8 text-[#204991] shadow-[0_30px_70px_rgba(83,15,43,0.03)]">
          <div className="flex items-center justify-between border-b border-[#CFE5FF]/60 pb-4">
            <h2 className="text-xs font-semibold uppercase tracking-[0.3em] text-[#204991]">Informations centres</h2>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleAddNew}
                className="flex h-8 w-8 items-center justify-center rounded-full border border-[#CFE5FF] text-sm text-[#204991] transition hover:bg-[#B3D2FF]"
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
                className="flex h-8 w-8 items-center justify-center rounded-full border border-[#CFE5FF] text-sm text-[#204991] transition hover:bg-[#B3D2FF] disabled:cursor-not-allowed disabled:opacity-50"
                title="Supprimer"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                onClick={handleSaveForm}
                disabled={saving || !isEditing}
                className="flex h-8 w-8 items-center justify-center rounded-full border border-[#CFE5FF] text-sm text-[#204991] transition hover:bg-[#B3D2FF] disabled:cursor-not-allowed disabled:opacity-50"
                title="Enregistrer"
              >
                <Save className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                onClick={handleResetForm}
                className="flex h-8 w-8 items-center justify-center rounded-full border border-[#CFE5FF] text-sm text-[#204991] transition hover:bg-[#B3D2FF]"
                title="Annuler les modifications"
              >
                <ArrowLeftCircle className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
          <div>
            {detailLoading ? (
              <p className="text-sm text-[#204991]/80">Chargement…</p>
            ) : detailError ? (
              <p className="text-sm font-semibold text-[#c2410c]">{detailError}</p>
            ) : !form ? (
              <p className="text-sm text-[#204991]/80">Sélectionnez un centre dans la liste ou créez-en un nouveau.</p>
            ) : (
              <div className="mt-2 grid gap-5 rounded-2xl border border-[#CFE5FF] bg-[#CFE5FF] p-6 shadow-[0_20px_50px_rgba(83,15,43,0.04)] lg:grid-cols-[2fr_1fr]">
                <div className="space-y-5 text-sm">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="space-y-1">
                      <label className="text-xs font-semibold uppercase tracking-[0.25em] text-[#204991]">
                        Nom du centre
                      </label>
                      <input
                        className={isEditing ? activeInputClasses : inactiveInputClasses}
                        value={form.name}
                        onChange={handleFormChange("name")}
                        onFocus={() => setIsEditing(true)}
                      />
                    </div>
                    <div className="flex items-center gap-2 text-[#204991]">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.25em] ${
                          form.is_active ? "bg-white text-[#204991]" : "bg-white text-[#c2410c]"
                        }`}
                      >
                        {form.is_active ? "Actif" : "Inactif"}
                      </span>
                      <label className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em]">
                        <input
                          type="checkbox"
                          checked={form.is_active}
                          onChange={handleFormChange("is_active")}
                          className="size-4 accent-[#CFE5FF]"
                          onFocus={() => setIsEditing(true)}
                        />
                        En activité
                      </label>
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <label className="text-xs font-semibold uppercase tracking-[0.25em] text-[#204991]">
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
                      {[
                        { label: "Téléphone fixe", field: "phone_landline" as const },
                        { label: "Mail générique", field: "generic_email" as const },
                        { label: "N° DDCS", field: "ddcs_number" as const },
                      ].map(({ label, field }) => (
                        <div className="space-y-1" key={field}>
                          <label className="text-xs font-semibold uppercase tracking-[0.25em] text-[#204991]">
                            {label}
                          </label>
                          <input
                            className={isEditing ? activeInputClasses : inactiveInputClasses}
                            value={form[field]}
                            onChange={handleFormChange(field)}
                            onFocus={() => setIsEditing(true)}
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    {[
                      { label: "Commission (PV)", field: "commission_pv_date" as const },
                      { label: "Péremption commission", field: "commission_expiry_date" as const },
                    ].map(({ label, field }) => (
                      <div className="space-y-1" key={field}>
                        <label className="text-xs font-semibold uppercase tracking-[0.25em] text-[#204991]">
                          {label}
                        </label>
                        <input
                          type="date"
                          className={isEditing ? activeInputClasses : inactiveInputClasses}
                          value={form[field]}
                          onChange={handleFormChange(field)}
                          onFocus={() => setIsEditing(true)}
                        />
                      </div>
                    ))}
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    {[
                      { label: "Latitude", field: "gps_latitude" as const },
                      { label: "Longitude", field: "gps_longitude" as const },
                    ].map(({ label, field }) => (
                      <div className="space-y-1" key={field}>
                        <label className="text-xs font-semibold uppercase tracking-[0.25em] text-[#204991]">
                          {label}
                        </label>
                        <input
                          className={isEditing ? activeInputClasses : inactiveInputClasses}
                          value={form[field]}
                          onChange={handleFormChange(field)}
                          onFocus={() => setIsEditing(true)}
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#204991]">
                    Contacts du centre
                  </p>
                  {selectedCentre?.id ? (
                    <button
                      type="button"
                      onClick={() => router.push(`/centres/${selectedCentre.id}`)}
                      className="inline-flex items-center justify-center rounded-full border border-[#CFE5FF] bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-[#204991] transition hover:bg-[#B3D2FF]"
                    >
                      Ajouter un contact
                    </button>
                  ) : (
                    <p className="text-sm text-[#204991]/80">Enregistrez le centre pour ajouter des contacts.</p>
                  )}
                  {selectedCentre?.id ? (
                    contacts.length === 0 ? (
                      <p className="text-sm text-[#204991]/80">Aucun contact pour ce centre.</p>
                    ) : (
                      <div className="space-y-3">
                        {contacts.map((contact) => (
                          <div
                            key={contact.id}
                            className="rounded-2xl border border-[#CFE5FF] bg-white px-4 py-3 text-sm text-[#204991] shadow-sm"
                          >
                            <p className="font-semibold">
                              {[contact.civility, contact.first_name, contact.last_name].filter(Boolean).join(" ")}
                            </p>
                            {contact.role ? (
                              <p className="text-xs uppercase tracking-[0.25em] text-[#204991]/70">{contact.role}</p>
                            ) : null}
                            <p>{contact.phone_1 ? formatPhone(contact.phone_1) : "—"}</p>
                            {contact.email ? <p>{contact.email}</p> : null}
                          </div>
                        ))}
                      </div>
                    )
                  ) : (
                    <p className="text-sm text-[#204991]/80">Enregistrez le centre pour ajouter des contacts.</p>
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

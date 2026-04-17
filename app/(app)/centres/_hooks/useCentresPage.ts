"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState, type ChangeEvent } from "react";

import { formatFrenchPhoneNumber } from "@/lib/phone";
import { supabase } from "@/lib/supabase-client";
import type {
  CentreListItem,
  CentreDetail,
  CentreForm,
  ContactRow,
  ContactForm,
} from "@/types/centre";

import { createEmptyForm, normalizeText } from "../_lib/helpers";

export function useCentresPage() {
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
  const [selectedCentre, setSelectedCentre] = useState<CentreDetail | null>(
    null,
  );
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

  // ── Fetch centres list ──────────────────────────────────────────────
  useEffect(() => {
    const fetchCentres = async () => {
      setLoading(true);
      setError(null);
      const { data, error: fetchError } = await supabase
        .from("centres")
        .select(
          "id, name, is_active, city, postal_code, phone_landline, commission_expiry_date",
        )
        .order("name", { ascending: true });

      if (fetchError) {
        setError(
          `Erreur lors du chargement des centres : ${fetchError.message}`,
        );
        setCentres([]);
      } else {
        setCentres((data as CentreListItem[]) ?? []);
      }
      setLoading(false);
    };

    fetchCentres();
  }, []);

  // ── Fetch centre detail + contacts ──────────────────────────────────
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
                commission_expiry_date:
                  detail.commission_expiry_date ?? "",
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
        .select(
          "id, civility, last_name, first_name, role, phone_1, phone_2, email",
        )
        .eq("centre_id", selectedCentreId)
        .order("last_name", { ascending: true });

      if (contactError) {
        setDetailError(
          (prev) => prev ?? `Erreur contacts : ${contactError.message}`,
        );
        setContacts([]);
      } else {
        setContacts((contactData as ContactRow[]) ?? []);
      }

      setDetailLoading(false);
    };

    fetchDetail();
  }, [selectedCentreId]);

  // ── Warn before unload ──────────────────────────────────────────────
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

  // ── ⌘K keyboard shortcut ───────────────────────────────────────────
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (
        (event.metaKey || event.ctrlKey) &&
        event.key.toLowerCase() === "k"
      ) {
        event.preventDefault();
        setIsSearchOpen((open) => !open);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  // ── Handlers ────────────────────────────────────────────────────────
  const handleFormChange =
    (field: keyof CentreForm) =>
    (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      if (!form) return;
      const isCheckbox =
        event.target instanceof HTMLInputElement &&
        event.target.type === "checkbox";
      let value: string | boolean = isCheckbox
        ? (event.target as HTMLInputElement).checked
        : event.target.value;
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
        commission_expiry_date:
          selectedCentre.commission_expiry_date ?? "",
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
      alert(
        "Enregistrez ou annulez les modifications avant de créer un nouveau centre.",
      );
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
    const { error: deleteError } = await supabase
      .from("centres")
      .delete()
      .eq("id", selectedCentre.id);
    if (deleteError) {
      setDetailError(
        `Erreur lors de la suppression : ${deleteError.message}`,
      );
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
      gps_longitude: form.gps_longitude
        ? Number(form.gps_longitude)
        : null,
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
      setDetailError(
        `Erreur lors de l'enregistrement : ${updateError.message}`,
      );
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
            commission_expiry_date:
              updated.commission_expiry_date ?? "",
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
        return prev.map((c) =>
          c.id === updated.id ? { ...c, ...updated } : c,
        );
      }
      return [...prev, updated];
    });
    setDirty(false);
    setIsEditing(false);
    setSaving(false);
  };

  const selectCentre = (id: number) => {
    if (dirty) {
      alert(
        "Enregistrez ou annulez les modifications avant de changer de centre.",
      );
      return;
    }
    setSelectedCentreId(id);
  };

  const toggleSearch = () => setIsSearchOpen((open) => !open);

  const resetFilters = () =>
    setFilters({ name: "", city: "", postalCode: "", phone: "" });

  const handleFilterChange =
    (field: keyof typeof filters) =>
    (event: ChangeEvent<HTMLInputElement>) => {
      setFilters((prev) => ({ ...prev, [field]: event.target.value }));
    };

  // ── Computed ─────────────────────────────────────────────────────────
  const filteredCentres = useMemo(() => {
    const termName = normalizeText(filters.name.trim());
    const termCity = normalizeText(filters.city.trim());
    const termPostal = normalizeText(filters.postalCode.trim());
    const termPhone = filters.phone.replace(/\D/g, "");

    return centres.filter((centre) => {
      const matchesName =
        !termName || normalizeText(centre.name).includes(termName);
      const matchesCity =
        !termCity ||
        normalizeText(centre.city ?? "").includes(termCity);
      const matchesPostal =
        !termPostal ||
        normalizeText(centre.postal_code ?? "").includes(termPostal);
      const matchesPhone =
        !termPhone ||
        (centre.phone_landline
          ? centre.phone_landline.replace(/\D/g, "").includes(termPhone)
          : false);

      return matchesName && matchesCity && matchesPostal && matchesPhone;
    });
  }, [centres, filters]);

  return {
    router,
    // List
    centres,
    loading,
    error,
    filteredCentres,
    // Search
    isSearchOpen,
    filters,
    toggleSearch,
    resetFilters,
    handleFilterChange,
    // Selection
    selectedCentre,
    selectCentre,
    // Detail
    detailLoading,
    detailError,
    // Form
    form,
    saving,
    dirty,
    isEditing,
    setIsEditing,
    handleFormChange,
    handleResetForm,
    handleAddNew,
    handleDeleteCentre,
    handleSaveForm,
    // Contacts
    contacts,
    contactModalOpen,
    setContactModalOpen,
    contactSaving,
    contactError,
    contactForm,
    setContactForm,
  };
}

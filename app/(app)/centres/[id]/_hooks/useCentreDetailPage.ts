"use client";

import { useEffect, useMemo, useState, type ChangeEvent } from "react";
import { useRouter, useParams } from "next/navigation";

import { formatFrenchPhoneNumber } from "@/lib/phone";
import { supabase } from "@/lib/supabase-client";
import type { CentrePayload, ContactRow, ContactForm } from "@/types/centre";

import {
  createEmptyCentre,
  mapCentreRowToPayload,
  createEmptyContact,
} from "../_lib/helpers";

export function useCentreDetailPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const centreIdParam = params?.id;
  const isCreation = centreIdParam === "new" || !centreIdParam;

  const [centre, setCentre] = useState<CentrePayload>(() =>
    createEmptyCentre(),
  );
  const [contacts, setContacts] = useState<ContactRow[]>([]);
  const [loadingCentre, setLoadingCentre] = useState(false);
  const [loadingContacts, setLoadingContacts] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [contactModalOpen, setContactModalOpen] = useState(false);
  const [contactForm, setContactForm] = useState<ContactForm>(() =>
    createEmptyContact(),
  );

  // ── Load centre ─────────────────────────────────────────────────────
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
        setError(
          `Erreur lors du chargement du centre : ${fetchError.message}`,
        );
        setCentre(createEmptyCentre());
      } else if (data) {
        setCentre(mapCentreRowToPayload(data));
      }
      setLoadingCentre(false);
    };

    loadCentre();
  }, [centreIdParam, isCreation]);

  // ── Load contacts ───────────────────────────────────────────────────
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
        setError(
          `Erreur lors du chargement des contacts : ${fetchError.message}`,
        );
        setContacts([]);
      } else {
        setContacts((data as ContactRow[]) ?? []);
      }
      setLoadingContacts(false);
    };

    loadContacts();
  }, [centreIdParam, isCreation]);

  // ── Handlers ────────────────────────────────────────────────────────
  const handleCentreChange =
    (field: keyof CentrePayload) =>
    (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const value =
        event.target.type === "checkbox"
          ? (event.target as HTMLInputElement).checked
          : event.target.value;
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
      gps_latitude: centre.gps_latitude
        ? Number(centre.gps_latitude)
        : null,
      gps_longitude: centre.gps_longitude
        ? Number(centre.gps_longitude)
        : null,
      commission_pv_date: centre.commission_pv_date || null,
      commission_expiry_date: centre.commission_expiry_date || null,
      modified_at: new Date().toISOString(),
    };

    const request = centre.id
      ? supabase
          .from("centres")
          .update(payload)
          .eq("id", centre.id)
          .select("*")
          .single()
      : supabase.from("centres").insert(payload).select("*").single();

    const { data, error: saveError } = await request;

    if (saveError) {
      setError(
        `Erreur lors de l'enregistrement du centre : ${saveError.message}`,
      );
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
        field === "phone_1" || field === "phone_2"
          ? formatFrenchPhoneNumber(rawValue)
          : rawValue;
      setContactForm((prev) => ({ ...prev, [field]: value }));
    };

  const refreshContacts = async (centreId: number) => {
    const { data, error: fetchError } = await supabase
      .from("contacts_centres")
      .select("*")
      .eq("centre_id", centreId)
      .order("last_name", { ascending: true });

    if (fetchError) {
      setError(
        `Erreur lors du rechargement des contacts : ${fetchError.message}`,
      );
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
      setError(
        "Merci de renseigner au minimum le nom et le prénom du contact.",
      );
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
      ? supabase
          .from("contacts_centres")
          .update(payload)
          .eq("id", contactForm.id)
          .select("*")
          .single()
      : supabase
          .from("contacts_centres")
          .insert(payload)
          .select("*")
          .single();

    const { error: saveError } = await request;

    if (saveError) {
      setError(
        `Erreur lors de l'enregistrement du contact : ${saveError.message}`,
      );
      return;
    }

    await refreshContacts(centre.id);
    setContactModalOpen(false);
    setContactForm(createEmptyContact());
    setError(null);
  };

  const handleDeleteContact = async (id: number) => {
    const { error: deleteError } = await supabase
      .from("contacts_centres")
      .delete()
      .eq("id", id);
    if (deleteError) {
      setError(
        `Erreur lors de la suppression du contact : ${deleteError.message}`,
      );
      return;
    }
    if (centre.id) {
      await refreshContacts(centre.id);
    }
  };

  // ── Computed ─────────────────────────────────────────────────────────
  const pageTitle = useMemo(
    () =>
      centre.name ? centre.name : isCreation ? "Nouveau centre" : "Centre",
    [centre.name, isCreation],
  );

  return {
    // Centre
    centre,
    loadingCentre,
    saving,
    error,
    success,
    handleCentreChange,
    handleSaveCentre,
    pageTitle,
    // Contacts
    contacts,
    loadingContacts,
    contactModalOpen,
    setContactModalOpen,
    contactForm,
    openContactModal,
    handleContactChange,
    handleSaveContact,
    handleDeleteContact,
  };
}

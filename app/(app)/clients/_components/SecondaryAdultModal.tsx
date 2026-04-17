"use client";

import { type ChangeEvent, useState, useEffect } from "react";
import type { SecondaryContact } from "@/lib/mappers";
import type { AddressSuggestion } from "../_lib/types";
import { CIVILITY_OPTIONS } from "../_lib/constants";
import {
  createEmptySecondaryContact,
  formatPhoneFR,
  normalizePostalCode,
} from "../_lib/helpers";
import { useAddressLookup } from "../_hooks/useAddressLookup";

type SecondaryAdultModalProps = {
  isOpen: boolean;
  initialData: SecondaryContact | null;
  onClose: () => void;
  onSave: (adult: SecondaryContact) => Promise<void>;
  onRemove: () => void;
};

export function SecondaryAdultModal({
  isOpen,
  initialData,
  onClose,
  onSave,
  onRemove,
}: SecondaryAdultModalProps) {
  const [adultForm, setAdultForm] = useState<SecondaryContact>(createEmptySecondaryContact);
  const [error, setError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const address = useAddressLookup();

  useEffect(() => {
    if (isOpen) {
      setAdultForm(
        initialData
          ? { ...createEmptySecondaryContact(), ...initialData, phone: initialData.phone ?? "", phone2: initialData.phone2 ?? "", postalCode: initialData.postalCode ?? "" }
          : createEmptySecondaryContact(),
      );
      setError(null);
      setFeedback(null);
      address.setQuery(initialData?.address ?? "");
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  const handleChange =
    (field: keyof SecondaryContact) =>
    (event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      let value = event.target.value;
      if (field === "phone" || field === "phone2") value = formatPhoneFR(value);
      if (field === "postalCode") value = normalizePostalCode(value);
      setAdultForm((prev) => ({ ...prev, [field]: value }));
    };

  const handleAddressInput = (event: ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setAdultForm((prev) => ({ ...prev, address: value }));
    address.setQuery(value);
  };

  const handleSelectSuggestion = (s: AddressSuggestion) => {
    setAdultForm((prev) => ({
      ...prev,
      address: s.address || s.label,
      city: s.city || prev.city,
      postalCode: s.postcode || prev.postalCode,
      country: prev.country || "France",
    }));
    address.clear();
  };

  const handleSave = async () => {
    if (!adultForm.lastName.trim() || !adultForm.firstName.trim()) {
      setError("Nom et prenom sont requis pour ajouter un adulte.");
      return;
    }
    try {
      setError(null);
      setFeedback(null);
      await onSave(adultForm);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Impossible d'enregistrer l'adulte secondaire.",
      );
    }
  };

  const inputClass =
    "rounded border border-white/20 bg-white/90 px-3 py-2 text-app-heading focus:border-centres-cta focus:outline-none";
  const labelClass =
    "text-xs font-semibold uppercase tracking-[0.14em] text-[#f0f1f5]";

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-neutral-950/70 px-4 py-10 backdrop-blur">
      <div className="relative w-full max-w-3xl rounded-2xl border border-app-body bg-app-body p-6 shadow-2xl md:p-7 lg:p-8 max-h-[85vh] overflow-y-auto">
        <button
          type="button"
          className="absolute right-5 top-5 text-sm font-semibold uppercase tracking-[0.16em] text-app-border transition hover:text-white"
          onClick={onClose}
        >
          Fermer
        </button>
        <header className="mb-4 text-center">
          <h3 className="text-lg font-semibold uppercase tracking-[0.2em] text-white">
            Autre adulte
          </h3>
          <p className="mt-1 text-sm text-app-border">
            Renseignez les informations du responsable secondaire.
          </p>
        </header>

        {error ? (
          <p className="mb-3 rounded-md border border-rose-300 bg-rose-100/80 px-3 py-2 text-sm font-semibold text-rose-800">
            {error}
          </p>
        ) : null}
        {feedback ? (
          <p className="mb-3 rounded-md border border-emerald-300 bg-emerald-100/80 px-3 py-2 text-sm font-semibold text-emerald-800">
            {feedback}
          </p>
        ) : null}

        <div className="grid gap-4 text-sm text-[#e5e8f0] md:grid-cols-2">
          <label className="flex flex-col gap-1">
            <span className={labelClass}>Civilita</span>
            <select
              className={`max-w-[140px] ${inputClass}`}
              value={adultForm.civility ?? ""}
              onChange={handleChange("civility")}
            >
              {CIVILITY_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option || "Salectionner"}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1">
            <span className={labelClass}>Nom</span>
            <input className={inputClass} value={adultForm.lastName} onChange={handleChange("lastName")} placeholder="Nom" />
          </label>
          <label className="flex flex-col gap-1">
            <span className={labelClass}>prenom</span>
            <input className={inputClass} value={adultForm.firstName} onChange={handleChange("firstName")} placeholder="prenom" />
          </label>
          <label className="flex flex-col gap-1 md:col-span-2">
            <span className={labelClass}>Rale dans la famille</span>
            <input
              className={inputClass}
              value={adultForm.role}
              onChange={handleChange("role")}
              list="secondary-role-suggestions"
              placeholder="Mere, Pere, Tuteur lagal..."
            />
            <datalist id="secondary-role-suggestions">
              <option value="Mere" />
              <option value="Pere" />
              <option value="Famille d'accueil" />
              <option value="aducateur" />
              <option value="Assistante sociale" />
              <option value="Tuteur lagal" />
              <option value="Autre" />
            </datalist>
          </label>

          {/* Adresse avec autocomplétion */}
          <label className="flex flex-col gap-1 md:col-span-2">
            <span className={labelClass}>Adresse</span>
            <input className={inputClass} value={adultForm.address} onChange={handleAddressInput} placeholder="NAo et rue" />
            {address.error ? <p className="mt-1 text-xs font-semibold text-amber-200">{address.error}</p> : null}
            {address.isLoading ? <p className="mt-1 text-xs text-[#e5e8f0]">Recherche d&apos;adresses...</p> : null}
            {address.suggestions.length > 0 ? (
              <div className="mt-2 space-y-2">
                <div className="rounded-lg border border-white/30 bg-white/90 text-app-heading shadow-lg">
                  <ul className="divide-y divide-app-border">
                    {address.suggestions.map((s, i) => (
                      <li
                        key={`${s.label}-${i}`}
                        className="cursor-pointer px-3 py-2 text-sm hover:bg-app-page-bg"
                        onClick={() => handleSelectSuggestion(s)}
                      >
                        <p className="font-semibold text-app-heading">{s.label}</p>
                        <p className="text-xs text-app-label">{s.postcode} {s.city}</p>
                      </li>
                    ))}
                  </ul>
                </div>
                <button
                  type="button"
                  className="text-xs font-semibold uppercase tracking-[0.12em] text-centres-cta-hover transition hover:text-centres-cta-hover"
                  onClick={address.clear}
                >
                  Utiliser l&apos;adresse saisie
                </button>
              </div>
            ) : null}
          </label>

          <label className="flex flex-col gap-1 md:col-span-2">
            <span className={labelClass}>Complament</span>
            <input className={inputClass} value={adultForm.complement} onChange={handleChange("complement")} placeholder="Batiment, atage..." />
          </label>
          <label className="flex flex-col gap-1">
            <span className={labelClass}>Code postal</span>
            <input className={inputClass} value={adultForm.postalCode} onChange={handleChange("postalCode")} placeholder="75017" />
          </label>
          <label className="flex flex-col gap-1">
            <span className={labelClass}>Ville</span>
            <input className={inputClass} value={adultForm.city} onChange={handleChange("city")} placeholder="Paris" />
          </label>
          <label className="flex flex-col gap-1 md:col-span-2">
            <span className={labelClass}>Pays</span>
            <input className={inputClass} value={adultForm.country} onChange={handleChange("country")} placeholder="France" />
          </label>
          <label className="flex flex-col gap-1">
            <span className={labelClass}>Telephone</span>
            <input className={inputClass} value={adultForm.phone} onChange={handleChange("phone")} placeholder="07 00 00 00 00" />
          </label>
          <label className="flex flex-col gap-1">
            <span className={labelClass}>Telephone 2</span>
            <input className={inputClass} value={adultForm.phone2} onChange={handleChange("phone2")} placeholder="07 00 00 00 00" />
          </label>
          <label className="flex flex-col gap-1">
            <span className={labelClass}>Email</span>
            <input className={inputClass} value={adultForm.email} onChange={handleChange("email")} placeholder="Perent@example.com" />
          </label>
          <label className="flex flex-col gap-1 md:col-span-2">
            <span className={labelClass}>Partenaire</span>
            <input className={inputClass} value={adultForm.partner ?? ""} onChange={handleChange("partner")} placeholder="Nom du partenaire" />
          </label>
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-end gap-2">
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-md border border-[#505664] bg-transparent px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-app-border transition hover:bg-[#3a3f4c]"
            onClick={onClose}
          >
            Fermer
          </button>
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-md border border-centres-cta bg-centres-cta px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-white transition hover:bg-centres-cta-hover"
            onClick={handleSave}
          >
            Enregistrer
          </button>
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-md border border-[#c7433c] bg-[#d65a52] px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-white transition hover:bg-[#b9403a]"
            onClick={onRemove}
          >
            Retirer le Perent 2
          </button>
        </div>
      </div>
    </div>
  );
}

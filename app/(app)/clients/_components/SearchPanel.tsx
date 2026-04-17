"use client";

import { type ChangeEvent, type KeyboardEvent, type RefObject } from "react";
import type { SearchFilters } from "../_lib/helpers";

type SearchPanelProps = {
  filters: SearchFilters;
  onFilterChange: (field: keyof SearchFilters) => (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  onKeyDown: (e: KeyboardEvent<HTMLInputElement | HTMLSelectElement>) => void;
  onClose: () => void;
  onReset: () => void;
  primaryRef: RefObject<HTMLInputElement | null>;
  lastUsedRef: RefObject<HTMLInputElement | HTMLSelectElement | null>;
};

const inputClass =
  "rounded-2xl border border-familles-border bg-white/80 px-4 py-2.5 text-sm text-app-heading placeholder:text-familles-input-focus focus:border-familles-input-focus focus:outline-none";
const labelClass =
  "text-xs font-semibold uppercase tracking-[0.25em] text-familles-accent";

export function SearchPanel({
  filters,
  onFilterChange,
  onKeyDown,
  onClose,
  onReset,
  primaryRef,
  lastUsedRef,
}: SearchPanelProps) {
  const trackFocus = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => {
    (lastUsedRef as React.MutableRefObject<HTMLInputElement | HTMLSelectElement | null>).current = e.currentTarget;
  };

  return (
    <div className="mt-5 grid gap-4 rounded-2xl border border-familles-border bg-familles-bg p-5 text-sm text-app-heading shadow-[0_20px_50px_rgba(83,15,43,0.04)]">
      <div className="grid gap-4 lg:grid-cols-3">
        <label className="flex flex-col gap-2">
          <span className={labelClass}>Nom</span>
          <input className={inputClass} ref={primaryRef} value={filters.lastName} onChange={onFilterChange("lastName")} onKeyDown={onKeyDown} onFocus={trackFocus} />
        </label>
        <label className="flex flex-col gap-2">
          <span className={labelClass}>Prénom</span>
          <input className={inputClass} value={filters.firstName} onChange={onFilterChange("firstName")} onKeyDown={onKeyDown} onFocus={trackFocus} />
        </label>
        <label className="flex flex-col gap-2">
          <span className={labelClass}>Adresse</span>
          <input className={inputClass} value={filters.address} onChange={onFilterChange("address")} onKeyDown={onKeyDown} onFocus={trackFocus} />
        </label>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <label className="flex flex-col gap-2">
          <span className={labelClass}>Email</span>
          <input className={inputClass} value={filters.email} onChange={onFilterChange("email")} onKeyDown={onKeyDown} onFocus={trackFocus} inputMode="email" />
        </label>
        <label className="flex flex-col gap-2">
          <span className={labelClass}>Téléphone 1</span>
          <input className={inputClass} value={filters.phone1} onChange={onFilterChange("phone1")} onKeyDown={onKeyDown} onFocus={trackFocus} inputMode="tel" />
        </label>
        <label className="flex flex-col gap-2">
          <span className={labelClass}>Téléphone 2</span>
          <input className={inputClass} value={filters.phone2} onChange={onFilterChange("phone2")} onKeyDown={onKeyDown} onFocus={trackFocus} inputMode="tel" />
        </label>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <label className="flex flex-col gap-2">
          <span className={labelClass}>Code postal</span>
          <input className={inputClass} value={filters.postalCode} onChange={onFilterChange("postalCode")} onKeyDown={onKeyDown} onFocus={trackFocus} inputMode="numeric" maxLength={10} />
        </label>
        <label className="flex flex-col gap-2">
          <span className={labelClass}>Ville</span>
          <input className={inputClass} value={filters.city} onChange={onFilterChange("city")} onKeyDown={onKeyDown} onFocus={trackFocus} />
        </label>
        <label className="flex flex-col gap-2">
          <span className={labelClass}>Pays</span>
          <input className={inputClass} value={filters.country} onChange={onFilterChange("country")} onKeyDown={onKeyDown} onFocus={trackFocus} />
        </label>
      </div>

      <div className="grid gap-4 md:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <label className="flex flex-col gap-2">
          <span className={labelClass}>Partenaire principal</span>
          <input className={inputClass} value={filters.partner} onChange={onFilterChange("partner")} onKeyDown={onKeyDown} onFocus={trackFocus} />
        </label>
        <div />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <label className="flex flex-col gap-2">
          <span className={labelClass}>Nom de l&apos;enfant</span>
          <input className={inputClass} value={filters.childLastName} onChange={onFilterChange("childLastName")} onKeyDown={onKeyDown} onFocus={trackFocus} />
        </label>
        <label className="flex flex-col gap-2">
          <span className={labelClass}>Prénom de l&apos;enfant</span>
          <input className={inputClass} value={filters.childFirstName} onChange={onFilterChange("childFirstName")} onKeyDown={onKeyDown} onFocus={trackFocus} />
        </label>
        <label className="flex flex-col gap-2">
          <span className={labelClass}>Date de naissance (enfant)</span>
          <input type="date" className={inputClass} value={filters.childBirthDate} onChange={onFilterChange("childBirthDate")} onKeyDown={onKeyDown} onFocus={trackFocus} />
        </label>
      </div>

      <div className="flex flex-wrap items-center gap-3 text-xs font-medium uppercase tracking-[0.18em] text-familles-accent">
        <button
          type="button"
          onClick={onClose}
          className="inline-flex items-center justify-center rounded-full border border-transparent bg-familles-surface px-4 py-2 text-app-body transition hover:bg-familles-surface"
        >
          Fermer
        </button>
        <button
          type="button"
          onClick={onReset}
          className="inline-flex items-center justify-center rounded-full border border-familles-border bg-white px-4 py-2 text-app-body transition hover:bg-familles-bg"
        >
          Réinitialiser
        </button>
      </div>
    </div>
  );
}

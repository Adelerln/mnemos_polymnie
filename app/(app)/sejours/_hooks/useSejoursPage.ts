"use client";

import {
  useEffect,
  useState,
  type ChangeEvent,
  type FormEvent,
} from "react";
import type { SejourFormState } from "@/types/sejour";

import { createEmptySejour } from "../_lib/helpers";

export function useSejoursPage() {
  const [filters, setFilters] = useState({
    annee: "",
    centre: "",
    saison: "",
    reference: "",
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [isSearchPanelOpen, setIsSearchPanelOpen] = useState(false);
  const [form, setForm] = useState<SejourFormState>(() => createEmptySejour());
  const [sejourList] = useState<
    Array<{
      id: number;
      reference: string;
      centre: string;
      annee: string;
      periode: string;
    }>
  >([]);

  const assuranceRows: Array<{
    id: number;
    name: string;
    value: string;
    unit: string;
  }> = [];
  const artisticOptions: Array<{
    id: number;
    sejour: string;
    option: string;
    price: string;
  }> = [];
  const entryDates: Array<{ id: number; date: string }> = [];
  const exitDates: Array<{ id: number; date: string }> = [];
  const departureCities: Array<{
    id: number;
    city: string;
    price: string;
  }> = [];
  const returnCities: Array<{
    id: number;
    city: string;
    price: string;
  }> = [];
  const sejourPeriods: Array<{
    id: number;
    period: string;
    prestashop: string;
  }> = [];
  const partnerPricing: Array<{
    id: number;
    name: string;
    base: string;
    transport: string;
  }> = [];
  const taskCategories: Array<{
    id: number;
    category: string;
    tasks: string;
    daysBefore: string;
  }> = [];
  const staffMembers: Array<{
    id: number;
    name: string;
    firstName: string;
    role: string;
  }> = [];

  const handleFilterChange =
    (field: keyof typeof filters) =>
    (event: ChangeEvent<HTMLInputElement>) => {
      const value = event.target.value;
      setFilters((prev) => ({
        ...prev,
        [field]: value,
      }));
    };

  const handleFormChange =
    (field: keyof SejourFormState) =>
    (event: ChangeEvent<HTMLInputElement>) => {
      const value =
        field === "archive" || field === "sansPiqueNique"
          ? (event.target as HTMLInputElement).checked
          : event.target.value;

      setForm((prev) => ({
        ...prev,
        [field]:
          field === "archive" || field === "sansPiqueNique"
            ? Boolean(value)
            : (value as string),
      }));
    };

  const handleReset = () => {
    setFilters({ annee: "", centre: "", saison: "", reference: "" });
    setForm(createEmptySejour());
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    // TODO: connect to Supabase
  };

  const toggleSearchPanel = () => {
    setIsSearchPanelOpen((open) => !open);
  };

  const closeSearchPanel = () => {
    setIsSearchPanelOpen(false);
  };

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (
        (event.metaKey || event.ctrlKey) &&
        event.key.toLowerCase() === "k"
      ) {
        event.preventDefault();
        setIsSearchPanelOpen((open) => !open);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const filteredSejours = sejourList.filter((item) => {
    const term = searchTerm.trim().toLowerCase();
    const matchesFilters =
      (!filters.annee ||
        item.annee.toLowerCase().includes(filters.annee.toLowerCase())) &&
      (!filters.centre ||
        item.centre.toLowerCase().includes(filters.centre.toLowerCase())) &&
      (!filters.saison ||
        item.periode.toLowerCase().includes(filters.saison.toLowerCase())) &&
      (!filters.reference ||
        item.reference
          .toLowerCase()
          .includes(filters.reference.toLowerCase()));
    if (!matchesFilters) return false;
    if (!term) return true;
    return (
      item.reference.toLowerCase().includes(term) ||
      item.centre.toLowerCase().includes(term) ||
      item.annee.toLowerCase().includes(term) ||
      item.periode.toLowerCase().includes(term)
    );
  });

  return {
    // Search
    filters,
    isSearchPanelOpen,
    handleFilterChange,
    toggleSearchPanel,
    closeSearchPanel,
    handleReset,
    filteredSejours,

    // Form
    form,
    handleFormChange,
    handleSubmit,

    // Data lists
    sejourList,
    assuranceRows,
    artisticOptions,
    entryDates,
    exitDates,
    departureCities,
    returnCities,
    sejourPeriods,
    partnerPricing,
    taskCategories,
    staffMembers,
  };
}

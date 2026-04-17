import { useEffect, useState } from "react";
import type { AddressSuggestion } from "../_lib/types";

/** Hook réutilisable pour l'autocomplétion d'adresse (api-adresse.data.gouv.fr) */
export function useAddressLookup() {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const trimmed = query.trim();
    if (trimmed.length < 3) {
      setSuggestions([]);
      setError(null);
      return;
    }

    const controller = new AbortController();
    setIsLoading(true);
    setError(null);

    const timer = setTimeout(async () => {
      try {
        const response = await fetch(
          `https://api-adresse.data.gouv.fr/search/?q=${encodeURIComponent(trimmed)}&limit=5`,
          { signal: controller.signal },
        );
        if (!response.ok) throw new Error("Adresse API indisponible");
        const data = (await response.json()) as {
          features: Array<{
            properties: { label: string; name: string; city: string; postcode: string };
          }>;
        };
        if (!controller.signal.aborted) {
          setSuggestions(
            data.features?.map((item) => ({
              label: item.properties.label,
              address: item.properties.name,
              city: item.properties.city,
              postcode: item.properties.postcode,
            })) ?? [],
          );
        }
      } catch (err) {
        if (controller.signal.aborted) return;
        setError(
          err instanceof Error ? err.message : "Erreur lors de la récupération des adresses.",
        );
        setSuggestions([]);
      } finally {
        if (!controller.signal.aborted) setIsLoading(false);
      }
    }, 300);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [query]);

  const clear = () => {
    setSuggestions([]);
    setQuery("");
    setIsLoading(false);
    setError(null);
  };

  return { query, setQuery, suggestions, isLoading, error, clear };
}

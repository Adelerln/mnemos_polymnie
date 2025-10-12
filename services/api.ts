import type { Famille } from "@/types/famille";

// Placeholder functions to prepare for future data integrations.
export const fetchFamilles = async (): Promise<Famille[]> => {
  // TODO: Replace with real API call.
  return Promise.resolve([]);
};

export const fetchFeatureStats = async () => {
  return Promise.resolve({
    familles: 0,
    partenaires: 0,
    sejours: 0,
  });
};

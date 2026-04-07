// Setup global Vitest — s'exécute avant chaque fichier de test
// Ajoute les matchers jest-dom (toBeInTheDocument, toHaveTextContent, etc.)
// et le cleanup automatique de Testing Library après chaque test

import { afterEach } from "vitest";
import { cleanup } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";

// Nettoyage automatique du DOM après chaque test (unmount des composants React)
afterEach(() => {
  cleanup();
});

// Setup global Vitest — s'exécute avant chaque fichier de test
// Emplacement pour les configurations communes (mocks globaux, cleanup, etc.)

import { afterEach } from "vitest";

// Nettoyage automatique du DOM après chaque test (utile avec Testing Library)
afterEach(() => {
  document.body.innerHTML = "";
});

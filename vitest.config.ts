/// <reference types="vitest" />
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";

// Configuration Vitest — tests unitaires et d'intégration
export default defineConfig({
  plugins: [react()],
  test: {
    // Environnement jsdom pour simuler le DOM dans les tests React
    environment: "jsdom",
    // Pattern de fichiers de test
    include: ["**/*.{test,spec}.{ts,tsx}"],
    // Exclure node_modules et .next
    exclude: ["node_modules", ".next"],
    // Fichier de setup global (ex: cleanup automatique après chaque test)
    setupFiles: ["./vitest.setup.ts"],
  },
  resolve: {
    // Résolution de l'alias @/* cohérente avec tsconfig.json
    alias: {
      "@": path.resolve(__dirname, "."),
    },
  },
});

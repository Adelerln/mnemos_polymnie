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
    // Tests unitaires et d'intégration dans __tests__/
    include: ["__tests__/**/*.{test,spec}.{ts,tsx}"],
    // Exclure node_modules, .next et les tests E2E (gérés par Playwright)
    exclude: ["node_modules", ".next", "__tests__/e2e"],
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

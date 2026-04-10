import { defineConfig, devices } from "@playwright/test";

// Configuration Playwright — tests E2E (end-to-end)
// Lance un vrai navigateur Chromium pour tester l'application comme un utilisateur
export default defineConfig({
  // Dossier contenant les tests E2E
  testDir: "./__tests__/e2e",
  // Timeout par test (30s par défaut)
  timeout: 30_000,
  // Répertoire des résultats (screenshots, traces, etc.)
  outputDir: "./__tests__/e2e/results",
  // Retry 1 fois en CI pour fiabiliser les tests instables
  retries: process.env.CI ? 1 : 0,
  // Reporter console + HTML en CI
  reporter: process.env.CI ? [["list"], ["html", { open: "never" }]] : "list",

  use: {
    // URL de base — le serveur Next.js local
    baseURL: "http://localhost:3000",
    // Capture une trace en cas d'échec (utile pour debug)
    trace: "on-first-retry",
    // Screenshot en cas d'échec
    screenshot: "only-on-failure",
  },

  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],

  // Démarre automatiquement le serveur Next.js avant les tests E2E
  webServer: {
    command: "npm run dev",
    url: "http://localhost:3000",
    // Réutiliser un serveur déjà lancé (évite de relancer en dev)
    reuseExistingServer: !process.env.CI,
    // Timeout de démarrage du serveur (60s)
    timeout: 60_000,
  },
});

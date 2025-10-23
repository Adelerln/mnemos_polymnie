## Mnemos SaaS

Interface Next.js inspirée du menu Mnemos pour piloter l’organisation des colonies de vacances.

### Stack
- Next.js 15 (App Router) & TypeScript
- Tailwind CSS v4 + shadcn/ui
- Framer Motion pour les animations
- Lucide React pour les icônes
- Zod (préparé pour la validation)

### Lancer le projet
```bash
npm install
npm run dev
```

### Architecture principale
```
app/                 # Routing Next.js (App Router)
components/
  layout/            # Header, Navbar, Footer, Sidebar
  ui/                # Composants shadcn/ui (Button, Card, Modal…)
  features/          # Grilles & cartes métiers (Familles, etc.)
features/            # Modules métier (placeholder pour la logique future)
hooks/               # Hooks personnalisés (ex: useResponsiveGrid)
lib/                 # Constantes & utilitaires (cn, données mockées)
services/            # Intégrations API (stubs)
styles/              # Tailwind & styles globaux
types/               # Types partagés (famille, navigation, etc.)
```

### Scripts
- `npm run dev` – serveur de développement
- `npm run build` – build de production
- `npm run start` – serveur Next.js en production
- `npm run lint` – linting ESLint

### Prochaines étapes suggérées
- Brancher un backend (Supabase, API REST, etc.)
- Ajouter l’authentification & la gestion des rôles
- Compléter les modules des routes (`/familles`, `/partenaires`, …)
- Ecrire des tests (Playwright, Vitest ou Jest) selon les besoins

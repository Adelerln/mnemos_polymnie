# Planning MVP — Mnémos Polymnie

> Créé le 24 mars 2026 — Mis à jour le 26 mars 2026
> Basé sur l'audit complet du code, du schéma Supabase et des documents Bugfix et MVP must-haves

---

## Résumé exécutif

Le MVP de Polymnie couvre : **Site vitrine avec produits + Tunnel de vente + Espace client + Logiciel de gestion** (familles, inscriptions, séjours, centres, partenaires, facturation, paiements).

**État actuel estimé : ~23% du MVP réalisé.**

| Domaine | Avancement | Constat |
|---------|:----------:|---------|
| Auth (login, signup, reset-password) | ~70% | Formulaires fonctionnels, flux complet mais middleware bloque signup |
| Familles / Clients (CRUD, enfants, adultes) | ~60% | Page 800+ lignes fonctionnelle, recherche doublons, fiche sanitaire partielle |
| Centres de vacances (CRUD, contacts) | ~50% | Pages liste + détail fonctionnelles, requêtes Supabase directes (pas de service) |
| Layout (Navbar, Sidebar, Header, Footer) | ~80% | Structure en place, navigation fonctionnelle |
| Séjours | ~10% | Formulaire UI existe mais **pas de table en BDD**, pas connecté |
| Partenaires | ~5% | Table `partners` existe, **aucune page fonctionnelle** |
| Facturation & Paiements | ~2% | Webhook Stripe existe mais logique vide, aucune table factures/paiements |
| Site vitrine & Tunnel de vente | **0%** | Rien : pas de pages produits, pas de panier, pas de tunnel d'achat |
| Administration & Rôles | ~3% | Type `UserRole` défini, 3 pages stubs vides, aucun stockage/vérification de rôles |
| Sécurité (RLS, middleware, headers, rate limiting) | ~5% | Middleware bloque l'auth, 8/9 tables sans RLS, aucun rate limiting |
| Tests & CI/CD | **0%** | 0 fichier test, 0 framework, 0 pipeline — aucune protection contre les régressions |
| Architecture & Qualité du code | ~10% | Pages de 800+ lignes, services monolithiques, 3 stratégies CSS mélangées |

**Travail restant identifié : ~140 jours** (fondations + workflow Git + refactoring + admin + features + finitions).

---

## Vue d'ensemble des phases

| Phase | Nom | Durée | Semaines (1 dev) |
|:-----:|-----|:-----:|:----------------:|
| **1** | Sécurité & Fondations BDD | **15.5 j** | S1 – S3 |
| **2** | Workflow Git & Gouvernance du code | **3 j** | S4 |
| **3** | Tests & CI/CD | **7 j** | S5 – S6 |
| **4** | Refactoring Architecture | **19 j** | S6 – S10 |
| **5** | Consolider l'existant | **15 j** | S11 – S14 |
| **6** | Administration & Rôles | **8.5 j** | S14 – S16 |
| **7** | Modules métier (Séjours, Partenaires, Facturation) | **31 j** | S16 – S22 |
| **8** | Site vitrine & Tunnel de vente | **21 j** | S22 – S26 |
| **9** | Finitions, Qualité & Audit final | **19 j** | S26 – S29 |
| | **TOTAL** | **~140 j** | **~29 semaines** |

---

# Phase 1 — Sécurité & Fondations BDD

> **Priorité : CRITIQUE — Tout le reste en dépend**
> **17 tâches — ~15.5 jours — Semaines 1 à 3**

### 1.0 Audit BDD — État réel constaté (Supabase)

> Résultats de l'audit complet du schéma, des policies RLS, des indexes, triggers, fonctions, enums, séquences et storage buckets.

**Tables existantes (9)** : `families`, `adults`, `family_adults`, `children`, `centres`, `contacts_centres`, `partners`, `identifications`, `allowed_emails`

**Alignement code ↔ BDD** : Les colonnes des 9 tables correspondent à ce que le code attend. Pas de mismatch critique.

| Constat | Détail | Gravité |
|---------|--------|---------|
| **RLS quasi-absent** | **1 seule policy** sur `identifications` (INSERT pour authenticated + check `allowed_emails`). Les 8 autres tables (families, adults, children, centres…) n'ont **aucune policy RLS** → toutes les données accessibles à tout utilisateur authentifié. | 🔴 Critique |
| **`allowed_emails` inutilisée par le code** | La table existe et est référencée dans la policy RLS de `identifications`, mais le code d'inscription (`AuthForm.tsx`, `signup/route.ts`) ne la consulte jamais. L'allowlist n'est donc pas appliquée côté application. | 🟠 Élevé |
| **`children.id` = text, `children.birth_date` = text** | La PK est un `text` au lieu de `bigint` (pas d'auto-incrementation, ID généré côté client = risque de collision). La date de naissance stockée en `text` empêche le tri chronologique et les calculs d'âge en SQL. | 🟠 Élevé |
| **Tables manquantes** | `inscriptions` (code prêt mais protégé par feature flag), `projects` + `project_edit_log` (routes API sans protection = erreur 500), `user_profiles` + `clients` (protégés par feature flags, fallback gracieux). | 🔴 Critique pour `projects` |
| **Triggers doublon** | `trg_clients_updated` et `trg_clients_updated_at` sur `families` (BEFORE UPDATE) — probablement un doublon à nettoyer. Seul `set_clients_updated_at` semble nécessaire. | 🟡 Mineur |
| **Indexes** | Bons sur `families` (id_client, email, user_id), `identifications` (created_at, user_id, email), `family_adults` (unique family_id+adult_id). **Manquants** : `children.family_id`, `contacts_centres.centre_id`, `adults.email`. | 🟡 Moyen |
| **Enum `partner_type`** | Valeurs : CSE, ASSOCIATION, AUTRE. Le code (`services/api.ts`) ne semble pas exploiter ce champ typé. | ℹ️ Info |
| **Séquences** | Fonctionnelles. `clients_id_seq` (last: 7), `adults_id_seq` (last: 36), `family_adults_id_seq` (last: 76) — données de test présentes. | ✅ OK |
| **Nommage hérité** | Les séquences et indexes utilisent l'ancien nom `clients` : `clients_pkey`, `clients_id_client_key`, `idx_clients_*`, `clients_id_seq`. La table a été renommée en `families` mais les indexes/séquences gardent l'ancien nom. Pas bloquant mais confus. | 🟡 Mineur |
| **`centres.created_by` / `modified_by` jamais peuplés** | Colonnes d'audit présentes dans le schéma mais le code ne les remplit jamais. | 🟡 Mineur |
| **Storage buckets** | **Aucun bucket configuré**. La route `projects/delete` tente de supprimer des assets dans un bucket dynamique → échouera. | 🟡 Info (bloqué par table `projects` manquante aussi) |
| **Aucune RPC function** | Pas de fonctions personnalisées côté BDD (uniquement les 2 triggers `set_*_updated_at`). | ✅ Normal |
| **Aucun Realtime** | Pas d'abonnement Supabase Realtime dans le code. | ✅ Normal |

---

### 1.1 Tâches

| # | Tâche | Détail | Durée | Statut |
|---|-------|--------|:-----:|--------|
| 1.1 | **🔴 Corriger le middleware auth** | Le middleware bloque `/api/auth/signup` et `/api/auth/reset-password` (routes publiques). Ajouter des exceptions pour que les utilisateurs puissent s'inscrire et réinitialiser leur mot de passe. | 0.5 j | ❌ CRITIQUE |
| 1.2 | **🔴 Supprimer le fallback NEXT_PUBLIC_ pour la Service Role Key** | `lib/supabase-admin.ts` utilise `NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY` en fallback. Si quelqu'un configure cette variable, la clé admin serait exposée côté navigateur = compromission totale de la BDD. Supprimer ce fallback. | 0.5 j | ❌ CRITIQUE |
| 1.3 | **Créer les tables manquantes** | Les 9 tables métier principales existent déjà. Il manque 3 tables référencées dans le code :<br>- `inscriptions` — CRUD prêt dans `services/inscriptions.ts`, protégé par feature flag. 20+ colonnes.<br>- `projects` — routes API `generate` et `delete` appellent cette table sans protection → erreur 500.<br>- `project_edit_log` — audit log, échoue silencieusement.<br><br>Tables optionnelles : `user_profiles` et `clients` (feature flags). Décision : créer ou supprimer le code. | 1.5 j | 🟡 9/12 existent |
| 1.4 | **Corriger les types de colonnes** | `children.id` = `text` (PK côté client = risque collision). `children.birth_date` = `text` (empêche calculs d'âge SQL).<br>Migration : `children.id` → `bigint GENERATED ALWAYS AS IDENTITY`, `children.birth_date` → `date`.<br>⚠️ Migration destructive — copie d'abord. | 1 j | ❌ |
| 1.5 | **🔴 Activer le RLS sur toutes les tables** | Seule `identifications` a une policy. Les 8 autres tables n'ont aucune policy → violation RGPD.<br>Policies à créer :<br>- `families` : CRUD WHERE `user_id = auth.uid()`<br>- `adults` : via `family_adults` → `families.user_id`<br>- `children` : via `family_id` → `families.user_id`<br>- `family_adults` : via `family_id` → `families.user_id`<br>- `centres` : lecture tous, écriture admins<br>- `contacts_centres` : via `centre_id`<br>- `partners` : lecture tous, écriture admins<br>- `allowed_emails` : service role uniquement | 2.5 j | ❌ 1/9 tables |
| 1.6 | **Intégrer `allowed_emails` dans le signup** | La table existe mais le code d'inscription ne la consulte pas. Vérifier l'email avant `createUser` dans `signup/route.ts`. | 0.5 j | ❌ |
| 1.7 | **Ajouter les indexes manquants** | `children.family_id`, `contacts_centres.centre_id`, `adults(lower(email))`, `adults.partner_id` | 0.5 j | 🟡 4 manquants |
| 1.8 | **Nettoyer triggers et nommage hérité** | Supprimer le trigger doublon sur `families`. Optionnel : renommer `clients_*` → `families_*`. | 0.25 j | 🟡 |
| 1.9 | **Headers de sécurité** | `next.config.ts` vide. Ajouter : X-Content-Type-Options, X-Frame-Options, X-XSS-Protection, HSTS. | 0.5 j | ❌ |
| 1.10 | **Rate limiting routes publiques** | Protéger `/api/auth/signup` et `/api/auth/reset-password` contre spam/DoS. Le signup fait `listUsers` paginé = opération coûteuse. | 1 j | ❌ |
| 1.11 | **Validation Zod** | Zod installé mais non utilisé. Créer les schémas pour chaque formulaire et route API. | 2 j | ❌ |
| 1.12 | **Messages d'erreur génériques en prod** | Les routes API renvoient les messages Supabase bruts → exposition de la structure BDD. Messages génériques côté client, logs côté serveur. | 0.5 j | ❌ |
| 1.13 | **Centraliser les types** | Déplacer les types inline (de `services/api.ts`) vers `types/` | 1 j | 🟡 Partiel |
| 1.14 | **Error boundaries React** | Ajouter des error boundaries pour une UX résiliente | 0.5 j | ❌ |
| 1.15 | **Migrations Supabase** | Supabase CLI `supabase db diff` / `supabase migration`. Dumper le schéma actuel comme base, versionner les changements. | 1 j | ❌ |
| 1.16 | **Stocker les rôles utilisateur** | Le type `UserRole` (`"admin" \| "encadrant" \| "direction"`) existe mais n'est jamais persisté. Créer une table `user_roles` :<br>`user_id uuid PK REFERENCES auth.users(id)`, `role text NOT NULL DEFAULT 'encadrant' CHECK (...)`, `created_at timestamptz`.<br>+ RLS : SELECT pour authenticated, INSERT/UPDATE/DELETE pour admin. | 0.5 j | ❌ |
| 1.17 | **Middleware RBAC + helper `getUserRole()`** | Le middleware ne vérifie que l'auth, pas le rôle. Ajouter :<br>- `lib/auth/get-user-role.ts` : query `user_roles` côté serveur<br>- Middleware : routes `/direction`, `/parametres`, `/personnel` → rôle `admin` ou `direction` requis<br>- Composant `<RoleGuard role="admin">`<br>- Exposer `role` dans `AuthProvider` et `useAuth()` | 1 j | ❌ |

---

# Phase 2 — Workflow Git & Gouvernance du code

> **Priorité : CRITIQUE — Sans workflow Git structuré, le travail d'équipe est risqué et non traçable**
> **8 tâches — ~3 jours — Semaine 4**

### 2.0 Audit Git — État réel constaté

| Catégorie | État actuel |
|-----------|-------------|
| Branches | **1 seule** (`main`) — pas de `develop`, ni `feature/*`, ni `fix/*` |
| Commits | **101** — messages souvent non descriptifs, micro-commits |
| Pull Requests | **0** — tout est pushé directement sur `main` |
| Issues GitHub | **0** — bugs et améliorations listés dans un fichier `bugfix.txt` local |
| Tags / Releases | **0** — aucun point de repère versionné |
| Branch protection | **Aucune règle** — n'importe qui peut push sur `main` sans review |
| Conventional Commits | **Non adopté** — pas de format standard pour les messages |
| CI/CD | **Inexistant** — le dossier `.github/` n'existe pas |
| Contributeurs | **5** (Adèle 26, Myriam 43, Jeanne 19, Tim 5, Vercel bot 1) |

**Conséquence** : aucune traçabilité, aucune review de code, risque élevé de régressions et de conflits sur `main`.

### 2.1 Tâches

| # | Tâche | Détail | Durée | Statut |
|---|-------|--------|:-----:|--------|
| 2.1 | **Définir et documenter le Git flow** | Branches : `main` (production), `develop` (intégration), `feature/*` (nouvelles fonctionnalités), `fix/*` (corrections). Documenter le workflow dans `CONTRIBUTING.md` : créer une branche → développer → PR vers `develop` → review → merge. | 0.25 j | ❌ |
| 2.2 | **Activer la protection de branche sur `main`** | GitHub Settings → Branch protection rules sur `main` :<br>- ✅ Require a pull request before merging (1 review minimum)<br>- ✅ Require status checks to pass (CI lint + build + test)<br>- ✅ Require branches to be up to date before merging<br>- ✅ Do not allow bypassing the above settings | 0.25 j | ❌ |
| 2.3 | **Installer Conventional Commits (commitlint + husky)** | `npm install -D @commitlint/cli @commitlint/config-conventional husky`. Initialiser husky : `npx husky init`. Créer le hook `.husky/commit-msg` qui exécute `npx commitlint --edit $1`. | 0.25 j | ❌ |
| 2.4 | **Configurer commitlint** | Créer `.commitlintrc.json` avec `extends: ["@commitlint/config-conventional"]`. Types autorisés : `feat`, `fix`, `refactor`, `docs`, `style`, `test`, `ci`, `chore`, `perf`. Scopes suggérés : `auth`, `families`, `centres`, `inscriptions`, `sejours`, `ui`, `api`, `db`. | 0.25 j | ❌ |
| 2.5 | **Créer les templates d'issues GitHub** | `.github/ISSUE_TEMPLATE/bug_report.md` (label 🐛, reproduction, comportement attendu, captures). `.github/ISSUE_TEMPLATE/feature_request.md` (label ✨, description, acceptance criteria). `.github/ISSUE_TEMPLATE/refactoring.md` (label 🔧, zone, justification). | 0.25 j | ❌ |
| 2.6 | **🔴 Créer les issues GitHub depuis `bugfix.txt`** | Convertir les ~30 bugs et améliorations identifiés en issues GitHub avec labels :<br>- **Adèle** (~12 issues) : tooltips boutons, rollover CTA, padding/espacements, cursor:pointer, border-radius, shadows, taille inputs, couleur accent, modal sanitaire, bouton retirer<br>- **Jeanne** (~2 issues) : direction design pastel, placement inscrits mineurs<br>- **Mymo** (~10 issues) : transitions, typographie DM Sans, taille police min 16px, espacements icônes, cohérence style pages, logo, animation flèche<br>- **Mise à jour 23/11** (~5 issues) : cards transport, logo Mon Compte, icône paramètres, bouton déconnexion, charte graphique globale + sous-chartes (Clients #F5DBE3, Inscriptions #F5D4FF, Séjours #BBFAF4) | 1 j | ❌ |
| 2.7 | **Créer `CONTRIBUTING.md`** | Guide pour l'équipe : Git flow, nommage branches (`feature/NOM-description`, `fix/NOM-description`), format des commits (Conventional Commits), process de PR (description, screenshots si UI, lien issue), règles de review. | 0.25 j | ❌ |
| 2.8 | **Tag `v0.1.0` — Point de départ** | Créer le tag `v0.1.0` sur l'état actuel avant les phases de refactoring. Sert de point de rollback si besoin. `git tag -a v0.1.0 -m "État initial avant refonte MVP"`. | 0.25 j | ❌ |

> **Après la Phase 2** : tout commit respecte le format conventionnel, tout changement passe par une PR reviewée, `main` est protégée, et les bugs connus sont traçables dans GitHub Issues.

---

# Phase 3 — Tests & CI/CD

> **Priorité : CRITIQUE — Tester l'existant avant de développer du nouveau code**
> **8 tâches — ~7 jours — Semaines 5 à 6**

### 3.0 Audit de l'existant

| Catégorie | État actuel |
|-----------|-------------|
| Fichiers de test (`*.test.*`, `*.spec.*`) | **0** |
| Framework de test (Vitest, Jest, Playwright…) | **Aucun installé** |
| Dépendances de test (`@testing-library/*`, `jsdom`…) | **0** |
| Script `test` dans `package.json` | **Absent** (seuls `dev`, `build`, `start`, `lint`) |
| Config test (`vitest.config.*`, `jest.config.*`) | **Aucune** |
| Pipeline CI/CD (`.github/workflows/`) | **Inexistant** — le dossier `.github/` n'existe pas |
| Tests manuels | **1 seul** : `test-supabase-integration.js` (script Node.js, console.log, non automatisable) |

**Conséquence** : aucune protection contre les régressions. Chaque modification peut casser silencieusement des fonctionnalités.

### 3.1 Tâches

| # | Tâche | Détail | Durée | Statut |
|---|-------|--------|:-----:|--------|
| 3.1 | **Installer Vitest + configuration** | Installer `vitest`, `@vitejs/plugin-react`, `jsdom`, `@testing-library/react`, `@testing-library/jest-dom`, `@testing-library/user-event`. Créer `vitest.config.ts` (environment jsdom, alias `@/`). Ajouter scripts `test`, `test:watch`, `test:coverage`. | 0.5 j | ❌ |
| 3.2 | **Installer Playwright (E2E)** | `@playwright/test` + `playwright install chromium`. Créer `playwright.config.ts` (baseURL localhost:3000, webServer next dev). Script `test:e2e`. | 0.5 j | ❌ |
| 3.3 | **Pipeline CI GitHub Actions** | `.github/workflows/ci.yml` sur push/PR : checkout → setup Node → `npm ci` → `npm run lint` → `npm run build` → `npm run test` → upload couverture. E2E Playwright ajouté en Phase 9. | 0.5 j | ❌ |
| 3.4 | **Tests des services existants** | Tests unitaires : `services/api.ts` (mapping, resolvePartnerId, fetchFamilies, saveFamily…), `services/inscriptions.ts`, `lib/phone.ts`, `lib/utils.ts`. Mocks Supabase. | 2 j | ❌ |
| 3.5 | **Tests des routes API** | `signup/route.ts` (validation, rejet emails, erreurs), `reset-password/route.ts`, `projects/generate/route.ts` (auth requise), `projects/delete/route.ts` (protection user_id). Mocks Supabase. | 1.5 j | ❌ |
| 3.6 | **Tests des composants critiques** | `AuthForm.tsx` (rendu, soumission, validation), `Button.tsx`, `Modal.tsx` (rendu, props), `Navbar.tsx` (navigation, liens actifs). | 1.5 j | ❌ |
| 3.7 | **Migrer `test-supabase-integration.js`** | Convertir en `__tests__/integration/supabase-crud.test.ts` avec `describe`/`it`/`expect`. Supprimer l'ancien. | 0.5 j | 🟡 Script manuel |
| 3.8 | **Structure de dossiers de test** | `__tests__/unit/{services,lib,components}`, `__tests__/integration/{api,supabase}`, `__tests__/e2e/` (Phase 9). Fichier `setup.ts` global. | 0.25 j | ❌ |

> **Après la Phase 3** : chaque push déclenche automatiquement lint + build + tests unitaires. Toute régression est détectée immédiatement.

---

# Phase 4 — Refactoring Architecture

> **Priorité : HAUTE — Sans cette réorganisation, chaque nouvelle feature aggrave la dette technique**
> **28 tâches — ~19 jours — Semaines 6 à 10**

### 4.0 Diagnostic

| Problème | État actuel | État cible |
|----------|-------------|------------|
| Fichiers à la racine | **19** (.md, .txt, .sql, .mjs…) | **10** (configs uniquement, docs dans `docs/`) |
| Plus gros fichier | `services/api.ts` = **832 lignes** | Max **~150-200 lignes** par fichier |
| Plus grosse page | `clients/page.tsx` = **800+ lignes** | Page ~20 lignes (Server Component qui délègue) |
| Dossiers dans `components/` | **5** (ui, layout, auth, dashboard, features) | **10** (+ families, inscriptions, centres, sejours, landing) |
| Fichiers dans `services/` | **2** (api.ts + inscriptions.ts) | **8** (1 par domaine métier) |
| Fichiers dans `types/` | **2** (index.ts + famille.ts) | **9** (1 par domaine + barrel export) |
| Stratégies CSS | **3 mélangées** (Tailwind, CSS Modules, @apply) | **1 seule** (Tailwind inline) |
| Composants `"use client"` inutiles | **~6** | **0** |
| Pages doublon | `familles/` + `clients/`, `inscription/` + `inscriptions/` | **0 doublon** |
| Dossiers vides | `features/` (contient `export {}`) | **0** |
| Migrations SQL | **1 fichier** (`create_mnemos_table.sql`) | **Dossier versionné** `supabase/migrations/` |

---

### 4A. Réorganiser la racine du projet

| # | Tâche | Détail | Durée | Statut |
|---|-------|--------|:-----:|--------|
| 4A.1 | **Créer `docs/` et y déplacer la documentation** | `ANALYSE_PROJET.md`, `PLANNING_MVP.md`, `INSTALLATION.md`, `QUICK_START.md`, `SUPABASE_SETUP.md`, `Brouillon.txt` → `docs/`. Garder à la racine uniquement `README.md` + configs. | 0.25 j | ❌ |
| 4A.2 | **Créer `supabase/migrations/`** | Remplacer `create_mnemos_table.sql` par migrations versionnées. | 0.25 j | ❌ |
| 4A.3 | **Créer `.env.example`** | Template des variables d'environnement sans secrets. | 0.25 j | ❌ |
| 4A.4 | **Supprimer `features/index.ts`** | Dossier vide (`export {}`). | 0 j | ❌ |
| 4A.5 | **Déplacer `bugfix.txt`** | → `docs/bugfix.txt`. | 0 j | ❌ |

### 4B. Groupes de routes Next.js

| # | Tâche | Détail | Durée | Statut |
|---|-------|--------|:-----:|--------|
| 4B.1 | **Créer le groupe `(auth)/`** | Regrouper `login/`, `signup/`, `reset-password/` dans `app/(auth)/`. Layout sans Navbar/Sidebar. | 0.5 j | ❌ |
| 4B.2 | **Créer le groupe `(app)/` avec layout commun** | Toutes les pages authentifiées dans `app/(app)/`. Layout avec Navbar + Sidebar. | 1 j | ❌ |
| 4B.3 | **Supprimer les pages doublon** | `familles/` (placeholder) → supprimer. `inscription/` (singulier) → supprimer. Garder `clients/` et `inscriptions/`. | 0.25 j | ❌ |

### 4C. Découper les pages monolithiques

| # | Tâche | Détail | Durée | Statut |
|---|-------|--------|:-----:|--------|
| 4C.1 | **Découper `app/clients/page.tsx`** | **800+ lignes** → `FamilyList.tsx`, `FamilyForm.tsx`, `ChildrenTable.tsx`, `HealthModal.tsx`. Page = Server Component ~20 lignes. | 2 j | ❌ |
| 4C.2 | **Découper `app/fiche/page.tsx`** | **500+ lignes** → `InscriptionForm.tsx`, `FinancialSummary.tsx`, `OptionsSelector.tsx`, `ReductionsTable.tsx`. | 1.5 j | ❌ |
| 4C.3 | **Découper `app/centres/[id]/page.tsx`** | **350+ lignes** → `CentreDetailForm.tsx`, `ContactsManager.tsx`. | 1 j | ❌ |
| 4C.4 | **Découper `app/homepage/page.tsx`** | **250+ lignes**. Alléger la logique d'affichage. | 0.5 j | 🟡 |
| 4C.5 | **Découper `app/sejours/page.tsx`** | **200+ lignes** → `SejourForm.tsx`. | 0.5 j | ❌ |

### 4D. Séparation Client / Server Components

| # | Tâche | Détail | Durée | Statut |
|---|-------|--------|:-----:|--------|
| 4D.1 | **Auditer les `"use client"` inutiles** | 6 composants (`Button`, `IconButton`, `Modal`, `FeatureSection`, `FeatureTile`, `LandingTileGrid`) ont `"use client"` sans hook React. Supprimer = moins de JS au navigateur. | 0.5 j | ❌ |
| 4D.2 | **Convertir les pages en Server Components** | Pattern actuel : `"use client"` + `useEffect` + `fetch`. Cible : page Server Component charge données côté serveur, passe les props au composant client. Appliquer sur : Clients, Centres, Inscriptions, Fiche, Dashboard. | 2 j | ❌ |
| 4D.3 | **Créer un hook `useFetch` ou adopter React Query** | Remplacer le pattern copié-collé `useState` + `useEffect` + `try/catch` + `setLoading` par un hook réutilisable ou `@tanstack/react-query`. | 1 j | ❌ |

### 4E. Réorganisation des services

| # | Tâche | Détail | Durée | Statut |
|---|-------|--------|:-----:|--------|
| 4E.1 | **Découper `services/api.ts` (832 lignes)** | → `services/families.ts` (CRUD), `services/adults.ts` (CRUD + doublons), `lib/mappers.ts` (mapping snake_case↔camelCase). | 1.5 j | ❌ |
| 4E.2 | **Créer les services manquants** | `services/centres.ts`, `services/sejours.ts` (squelette), `services/partenaires.ts` (squelette). Migrer les requêtes Supabase directes depuis les pages. | 1 j | ❌ |

### 4F. Réorganisation des composants

| # | Tâche | Détail | Durée | Statut |
|---|-------|--------|:-----:|--------|
| 4F.1 | **Déplacer `AuthProvider.tsx`** | Racine `components/` → `components/auth/AuthProvider.tsx`. | 0.25 j | ❌ |
| 4F.2 | **Déplacer `ParentsGrid.tsx` + `.module.css`** | → `components/families/ParentsGrid.tsx`. | 0.25 j | ❌ |
| 4F.3 | **Éclater `components/features/`** | Landing → `components/landing/`. `FamilleCard.tsx` → `components/families/`. | 0.5 j | ❌ |
| 4F.4 | **Créer les composants UI manquants** | `Input.tsx`, `Select.tsx`, `DataTable.tsx`, `SearchBar.tsx`, `ConfirmDialog.tsx` dans `components/ui/`. | 1.5 j | ❌ |

### 4G. Réorganisation `lib/` et `config/`

| # | Tâche | Détail | Durée | Statut |
|---|-------|--------|:-----:|--------|
| 4G.1 | **Regrouper les clients Supabase** | `lib/supabase-client.ts`, `-server.ts`, `-admin.ts` → `lib/supabase/{client,server,admin}.ts`. | 0.25 j | ❌ |
| 4G.2 | **Séparer `lib/constants.ts`** | → `config/navigation.ts` (navItems) + `config/landing-data.ts` (featureCategories). | 0.25 j | ❌ |
| 4G.3 | **Créer `lib/validators.ts`** | Schémas Zod partagés (email, password, téléphone). | 0.25 j | ❌ |

### 4H. Stratégie CSS cohérente

| # | Tâche | Détail | Durée | Statut |
|---|-------|--------|:-----:|--------|
| 4H.1 | **Migrer vers Tailwind inline** | Convertir `ParentsGrid.module.css` en classes Tailwind. Supprimer le `.module.css`. | 0.5 j | ❌ |
| 4H.2 | **Charte graphique en variables CSS** | Ajouter dans `globals.css` : `--color-clients: #F5DBE3`, `--color-inscriptions: #F5D4FF`, `--color-sejours: #BBFAF4`, etc. | 0.5 j | ❌ |

### 4I. Organisation des types

| # | Tâche | Détail | Durée | Statut |
|---|-------|--------|:-----:|--------|
| 4I.1 | **Centraliser TOUS les types métier** | Types dispersés dans `services/api.ts` (130+ lignes), `services/inscriptions.ts`, `types/famille.ts`, `types/index.ts`. Regrouper en 1 fichier par domaine :<br>`types/family.ts`, `types/inscription.ts`, `types/centre.ts`, `types/sejour.ts`, `types/partenaire.ts`, `types/facture.ts` (Phase 7), `types/auth.ts`, `types/navigation.ts`, `types/index.ts` (barrel). | 1 j | ❌ |

---

### Récapitulatif Phase 4

| Sous-phase | Tâches | Durée |
|------------|--------|:-----:|
| 4A. Racine du projet | 4A.1 – 4A.5 | **0.5 j** |
| 4B. Route Groups | 4B.1 – 4B.3 | **1.75 j** |
| 4C. Pages monolithiques | 4C.1 – 4C.5 | **5.5 j** |
| 4D. Client/Server Components | 4D.1 – 4D.3 | **3.5 j** |
| 4E. Services | 4E.1 – 4E.2 | **2.5 j** |
| 4F. Composants | 4F.1 – 4F.4 | **2.5 j** |
| 4G. lib/ et config/ | 4G.1 – 4G.3 | **0.75 j** |
| 4H. CSS | 4H.1 – 4H.2 | **1 j** |
| 4I. Types | 4I.1 | **1 j** |
| **Total Phase 4** | **28 tâches** | **~19 j** |

---

### Structure cible après Phase 4

> ✅ = existe déjà — ← = à déplacer/renommer — 🆕 = à créer

```
mnemos_polymnie/
│
├── .gitignore                            ✅
├── .env.example                          🆕 template sans secrets
├── next.config.ts                        ✅ (+ headers sécurité Phase 1)
├── middleware.ts                         ✅ (+ exceptions auth + RBAC Phase 1)
├── package.json                          ✅
├── tsconfig.json                         ✅
├── eslint.config.mjs                     ✅
├── postcss.config.mjs                    ✅
├── components.json                       ✅
├── README.md                             ✅
│
├── docs/                                 🆕 documentation regroupée
│   ├── ANALYSE_PROJET.md                    ← ex-racine
│   ├── PLANNING_MVP.md                      ← ex-racine
│   ├── INSTALLATION.md                      ← ex-racine
│   ├── QUICK_START.md                       ← ex-racine
│   ├── SUPABASE_SETUP.md                    ← ex-racine
│   ├── Brouillon.txt                        ← ex-racine
│   └── bugfix.txt                           ← ex-racine
│
├── supabase/                             🆕 migrations versionnées
│   └── migrations/
│       ├── 001_create_families.sql
│       ├── 002_create_adults.sql
│       ├── ...
│       └── 009_enable_rls_policies.sql
│
├── app/
│   ├── layout.tsx                        ✅ Server Component — layout racine
│   ├── page.tsx                          ✅ Server Component — landing "/"
│   │
│   ├── (auth)/                           🆕 groupe — layout sans nav
│   │   ├── layout.tsx                    🆕
│   │   ├── login/page.tsx                ← ex-app/login/
│   │   ├── signup/page.tsx               ← ex-app/signup/
│   │   └── reset-password/page.tsx       ← ex-app/reset-password/
│   │
│   ├── (app)/                            🆕 groupe — layout avec Navbar + Sidebar
│   │   ├── layout.tsx                    🆕
│   │   ├── dashboard/page.tsx            ← Server Component
│   │   ├── homepage/page.tsx             ← Server Component
│   │   ├── clients/page.tsx              ← Server Component
│   │   ├── inscriptions/page.tsx         ← Server Component
│   │   ├── fiche/page.tsx                ← Server Component
│   │   ├── centres/
│   │   │   ├── page.tsx                  ←
│   │   │   ├── new/page.tsx              ←
│   │   │   └── [id]/page.tsx             ←
│   │   ├── sejours/page.tsx              ←
│   │   ├── partenaires/page.tsx          🔲 stub → Phase 7
│   │   ├── prestations/page.tsx          🔲 stub
│   │   ├── convocation/page.tsx          🔲 stub (v2)
│   │   ├── transports/page.tsx           🔲 stub (v3)
│   │   ├── personnel/page.tsx            🔲 stub → Phase 6
│   │   ├── direction/page.tsx            🔲 stub → Phase 6
│   │   ├── parametres/page.tsx           🔲 stub → Phase 6
│   │   ├── contact/page.tsx              ✅
│   │   ├── documentation/page.tsx        ✅
│   │   ├── mentions-legales/page.tsx     ✅
│   │   └── rgpd/page.tsx                 ✅
│   │
│   └── api/
│       ├── auth/signup/route.ts          ✅
│       ├── auth/reset-password/route.ts  ✅
│       ├── projects/generate/route.ts    ✅
│       ├── projects/delete/route.ts      ✅
│       └── stripe/webhook/route.ts       ✅
│
├── components/
│   ├── ui/                               ✅ + 🆕 (Input, Select, DataTable, SearchBar, ConfirmDialog)
│   │   ├── Button.tsx                       ← SANS "use client"
│   │   ├── Card.tsx                      ✅
│   │   ├── IconButton.tsx                   ← SANS "use client"
│   │   ├── Modal.tsx                        ← SANS "use client"
│   │   └── index.ts                      ✅
│   ├── layout/                           ✅
│   │   ├── Header.tsx, Footer.tsx, Navbar.tsx, Sidebar.tsx, SiteHeader.tsx
│   │   └── index.ts
│   ├── auth/                             ✅ + ←
│   │   ├── AuthProvider.tsx                 ← depuis racine components/
│   │   └── AuthForm.tsx                  ✅
│   ├── landing/                          🆕 ex-"features/"
│   │   ├── FeatureSection.tsx, FeatureTile.tsx, LandingTileGrid.tsx
│   │   └── index.ts
│   ├── dashboard/                        ✅ + 🆕 (StatsCards, ActivityFeed)
│   ├── families/                         🆕 (FamilyList, FamilyForm, ParentsGrid, ChildrenTable, HealthModal, FamilleCard)
│   ├── inscriptions/                     🆕 (InscriptionsList, InscriptionForm, OptionsSelector, FinancialSummary, ReductionsTable)
│   ├── centres/                          🆕 (CentresList, CentreForm, CentreDetail, ContactsManager)
│   ├── sejours/                          🆕 (SejourForm, SejoursList)
│   └── partenaires/                      🆕 Phase 7 (PartenairesList, PartenaireForm)
│
├── services/                             1 par domaine
│   ├── families.ts                       🆕 ex-api.ts
│   ├── adults.ts                         🆕 ex-api.ts
│   ├── inscriptions.ts                   ✅
│   ├── centres.ts                        🆕
│   ├── sejours.ts                        🆕 squelette
│   ├── partenaires.ts                    🆕 squelette (Phase 7)
│   ├── factures.ts                       🆕 (Phase 7)
│   └── paiements.ts                      🆕 (Phase 7)
│
├── lib/
│   ├── supabase/                         🆕 regroupé
│   │   ├── client.ts, server.ts, admin.ts
│   ├── stripe.ts                         ✅
│   ├── utils.ts                          ✅
│   ├── mappers.ts                        🆕 ex-api.ts
│   ├── phone.ts                          ✅
│   ├── icon-map.ts                       ✅
│   └── validators.ts                     🆕 Zod
│
├── config/                               🆕
│   ├── navigation.ts                        ← ex-lib/constants.ts
│   └── landing-data.ts                      ← ex-lib/constants.ts
│
├── types/                                1 par domaine
│   ├── family.ts, inscription.ts, centre.ts, sejour.ts, partenaire.ts
│   ├── facture.ts (Phase 7), auth.ts, navigation.ts
│   └── index.ts                          barrel export
│
├── hooks/
│   ├── useAuth.ts                       ✅
│   ├── useFetch.ts                      🆕
│   ├── useProjectLogger.ts              ✅
│   └── useResponsiveGrid.ts             ✅
│
├── styles/
│   └── globals.css                      ✅ (+ variables charte)
│
├── public/
│   ├── icons/                            ✅
│   └── images/                           🆕
│
└── __tests__/                            🆕 (Phase 3)
    ├── unit/{services,lib,components}
    ├── integration/{api,supabase}
    └── e2e/ (Phase 9)
```

### Fichiers supprimés lors de la Phase 4

| Fichier | Raison |
|---------|--------|
| `app/familles/page.tsx` | Doublon de `app/clients/` |
| `app/inscription/page.tsx` | Doublon de `app/inscriptions/` |
| `features/index.ts` | Dossier vide (`export {}`) |
| `components/ParentsGrid.tsx` | Déplacé → `components/families/` |
| `components/ParentsGrid.module.css` | Migré vers Tailwind |
| `components/AuthProvider.tsx` | Déplacé → `components/auth/` |
| `components/features/` (tout) | Éclaté entre `landing/` et `families/` |
| `services/api.ts` | Découpé en `families.ts` + `adults.ts` + `lib/mappers.ts` |
| `types/famille.ts` | Remplacé par `types/family.ts` |
| `lib/constants.ts` | Découpé en `config/navigation.ts` + `config/landing-data.ts` |
| `lib/supabase-client.ts` | Déplacé → `lib/supabase/client.ts` |
| `lib/supabase-server.ts` | Déplacé → `lib/supabase/server.ts` |
| `lib/supabase-admin.ts` | Déplacé → `lib/supabase/admin.ts` |
| `create_mnemos_table.sql` | Remplacé par `supabase/migrations/` |

---

# Phase 5 — Consolider l'existant

> **Priorité : HAUTE — Stabiliser ce qui fonctionne déjà**
> **6 tâches — ~15 jours — Semaines 11 à 14**

| # | Tâche | Détail | Durée | Statut |
|---|-------|--------|:-----:|--------|
| 5.1 | **Familles / Clients** | Finaliser le CRUD complet, recherche doublons adultes, validation champs obligatoires (civilité, nom, prénom, adresse, CP, ville, pays, tel, mail), Parent 1 + Parent 2 indépendants, table enfants avec infos sanitaires. | 3 j | ✅ 90% |
| 5.2 | **Enfants — Fiche sanitaire** | Modal/fenêtre flottante : régime alimentaire, allergies, difficultés de santé, recommandations, ami(e) de, conduite à tenir. | 2 j | 🟡 Partiel |
| 5.3 | **Centres de vacances** | Extraire requêtes Supabase vers `services/centres.ts`, coordonnées + commission de sécurité, page détail `/centres/[id]`. | 2 j | 🟡 70% |
| 5.4 | **Inscriptions — Liste** | Stabiliser la recherche et le filtrage, connecter aux données réelles. | 1 j | 🟡 85% |
| 5.5 | **Fiche Inscription** | Compléter le formulaire (mode d'inscription, lien partenaire case XP, options séjour, auto-remplissage dates, numéro auto-incrémenté). | 5 j | 🟡 60% |
| 5.6 | **Dashboard — Données réelles** | Remplacer les données mock par des requêtes Supabase (familles, inscriptions, séjours, etc.). | 1.5 j | 🟡 Mock |

---

# Phase 6 — Administration & Gestion des rôles

> **Priorité : HAUTE — Sans administration, impossible de contrôler qui accède à quoi**
> **5 tâches — ~8.5 jours — Semaines 14 à 16**

### 6.0 Audit de l'existant

| Élément | État actuel |
|---------|-------------|
| Pages admin (`direction/`, `parametres/`, `personnel/`) | **3 stubs vides** (~11 lignes chacun, "À venir…") |
| Type `UserRole` | ✅ Défini : `"admin" \| "encadrant" \| "direction"` |
| Stockage des rôles | ❌ Jamais persisté (ni en BDD, ni en metadata) |
| Vérification des rôles | ❌ Absent du middleware, des pages, des API |
| Navigation conditionnelle | ❌ "Gestion Direction" et "Personnel" visibles par **tous** |
| Gestion des utilisateurs | ❌ Aucun CRUD admin, aucune interface d'attribution de rôles |
| `allowed_emails` | Table existe mais signup l'ignore — potentiel système d'invitation |

### 6.1 Tâches

| # | Tâche | Détail | Durée | Statut |
|---|-------|--------|:-----:|--------|
| 6.1 | **Navigation conditionnelle par rôle** | Filtrer les `navItems` selon le rôle retourné par `useAuth()` (enrichi en Phase 1.17). Seuls les `admin` et `direction` voient Direction, Personnel, Paramètres. | 0.5 j | ❌ |
| 6.2 | **Page Paramètres — Gestion des utilisateurs** | Remplacer le stub. Liste des utilisateurs (via `supabaseAdmin`), attribuer/modifier rôles (`user_roles`), inviter via `allowed_emails` + lien/email, désactiver/réactiver un compte. | 3 j | ❌ |
| 6.3 | **Page Paramètres — Configuration organisme** | Deuxième onglet : régimes alimentaires, types de contrats, périodes de saisie, nom/logo/coordonnées de l'organisme. Table `organisation_settings`. | 2 j | ❌ |
| 6.4 | **Page Direction — Dashboard admin** | KPIs globaux (familles, inscriptions, remplissage séjours, CA), dernières inscriptions, alertes (séjours pleins, paiements en retard), accès rapide admin. Même requêtes que dashboard utilisateur sans filtre `user_id`. | 2 j | ❌ |
| 6.5 | **Page Personnel — Stub fonctionnel** | Liste du personnel (nom, rôle, email, statut). CRUD basique. Le détail (contrats, comptabilité) reste en v2. | 1 j | ❌ |

---

# Phase 7 — Modules métier (cœur MVP)

> **Priorité : HAUTE — Fonctionnalités indispensables du MVP**
> **16 tâches — ~31 jours — Semaines 16 à 22**

### 7A. Module Séjours (~8 jours)

| # | Tâche | Détail | Durée |
|---|-------|--------|:-----:|
| 7A.1 | **Table `sejours` en BDD** | Référence, lieu, thème, nom, dates, périodes, prix public, capacité, lien centre | 1 j |
| 7A.2 | **Table `sejour_options`** | Options liées : assurance, dates, transports, noms, prix | 1 j |
| 7A.3 | **Service séjours** | CRUD + filtrage par ref, période, thème, archivage | 2 j |
| 7A.4 | **Page Séjours** | Connecter le formulaire existant au backend | 3 j |
| 7A.5 | **Lien Séjour ↔ Centre** | Association séjour à un centre de vacances | 0.5 j |

### 7B. Module Partenaires (~8 jours)

| # | Tâche | Détail | Durée |
|---|-------|--------|:-----:|
| 7B.1 | **Table `partners` complète** | Coordonnées, prix spécifiques séjours, prix transports | 1 j |
| 7B.2 | **Table `partner_prices`** | Prix partenaire par séjour / transport | 1 j |
| 7B.3 | **Service partenaires** | CRUD + recherche | 1.5 j |
| 7B.4 | **Page Partenaires** | Liste, détail, édition, suppression | 3 j |
| 7B.5 | **Lien Partenaire ↔ Inscription** | Cas XP : prix partenaire vs prix public, prises en charge | 1 j |

### 7C. Module Facturation & Paiements (~16 jours)

| # | Tâche | Détail | Durée |
|---|-------|--------|:-----:|
| 7C.1 | **Tables `factures` et `paiements`** | Factures liées à inscription/partenaire/famille, paiements avec affectation | 1.5 j |
| 7C.2 | **Récap financier inscription** | Calcul auto : séjour + transport + assurance − réductions + suppléments − PEC | 3 j |
| 7C.3 | **Réductions / Suppléments / PEC** | Tables + UI ajout/suppression dynamique par inscription | 3 j |
| 7C.4 | **Facturer famille ou partenaire** | Génération de facture pour les éléments affectés | 3 j |
| 7C.5 | **Enregistrement paiement** | Saisie avec affectation à une ou plusieurs factures | 2 j |
| 7C.6 | **Intégration Stripe** | Connecter le webhook existant à la logique de paiement CB | 3 j |

---

# Phase 8 — Site vitrine & Tunnel de vente

> **Priorité : HAUTE — Composante MVP côté client final**
> **5 tâches — ~21 jours — Semaines 22 à 26**

| # | Tâche | Détail | Durée |
|---|-------|--------|:-----:|
| 8.1 | **Pages produits (séjours)** | Photos, description (séjour/programme/hébergement), menus déroulants options, bouton "S'inscrire" | 5 j |
| 8.2 | **Compte Client (espace famille)** | Création de compte, mineurs rattachés, réservations, documents, fiche modifiable | 5 j |
| 8.3 | **Tunnel de vente** | Panier → Récapitulatif → Paiement CB (Stripe Checkout) | 5 j |
| 8.4 | **Options de paiement** | CB, CB en 3 fois, ANCV/ANCV Connect (selon organisme) | 3 j |
| 8.5 | **Espace client post-achat** | Réservations effectuées, solde restant, documents financiers/séjours | 3 j |

---

# Phase 9 — Finitions, Qualité & Audit final

> **Priorité : MOYENNE — Nécessaire avant mise en production**
> **7 tâches — ~19 jours — Semaines 26 à 29**

| # | Tâche | Détail | Durée |
|---|-------|--------|:-----:|
| 9.1 | **Charte graphique** | Appliquer les palettes (Clients #F5DBE3, Inscriptions #F5D4FF, Séjours #BBFAF4, etc.) | 3 j |
| 9.2 | **Corrections UI/UX (bugfix.txt)** | Alignements, rollover, border-radius, curseur pointer, icônes title, taille police min 16px, espacements | 4 j |
| 9.3 | **Responsive** | Vérifier toutes les pages sur mobile/tablette/desktop | 2 j |
| 9.4 | **Accessibilité** | Labels, aria, title sur tous les boutons/icônes, contraste suffisant | 2 j |
| 9.5 | **Pages légales** | RGPD, Mentions légales (contenu réel) | 1 j |
| 9.6 | **Audit de sécurité final** | OWASP Top 10 : injection SQL/XSS, CSRF, CORS, RLS en conditions réelles, policies Supabase, pas de secret dans `NEXT_PUBLIC_`, `npm audit`, webhooks Stripe en test | 3 j |
| 9.7 | **Tests E2E Playwright dans le pipeline CI** | Scénarios E2E critiques : inscription famille → ajout enfant → inscription séjour → paiement. Ajouter Playwright au workflow `ci.yml` avec BDD de test Supabase. | 4 j |

---

# Récapitulatif

| Phase | Nom | Tâches | Durée | Prérequis |
|:-----:|-----|:------:|:-----:|-----------|
| **1** | Sécurité & Fondations BDD | 17 | **15.5 j** | — |
| **2** | Workflow Git & Gouvernance du code | 8 | **3 j** | Phase 1 |
| **3** | Tests & CI/CD | 8 | **7 j** | Phase 2 |
| **4** | Refactoring Architecture | 28 | **19 j** | Phase 3 |
| **5** | Consolider l'existant | 6 | **15 j** | Phase 4 |
| **6** | Administration & Rôles | 5 | **8.5 j** | Phase 5 |
| **7** | Modules métier | 16 | **31 j** | Phase 4 |
| **8** | Site vitrine & Tunnel de vente | 5 | **21 j** | Phase 7 |
| **9** | Finitions & Audit final | 7 | **19 j** | Phase 8 |
| | **TOTAL** | **100** | **~140 j** | |

---

## Diagramme de dépendances

```
Phase 1 (Sécurité & Fondations)
  │
  ▼
Phase 2 (Workflow Git & Gouvernance)
  │
  ▼
Phase 3 (Tests & CI/CD)
  │
  ▼
Phase 4 (Refactoring Architecture)
  ├──→ Phase 5 (Consolider existant)
  │         │
  │         ▼
  │    Phase 6 (Administration)  ──────┐
  │                                     │
  ├──→ Phase 7A (Séjours)           ──┤
  ├──→ Phase 7B (Partenaires)       ──┤
  │                                    │
  │         ┌──────────────────────────┘
  │         ▼
  │    Phase 7C (Facturation)
  │         │
  │         ▼
  │    Phase 8 (Site vitrine)
  │         │
  │         ▼
  └──→ Phase 9 (Finitions + E2E)
```

**Avec parallélisation** (2-3 devs : Phase 5 + 7A + 7B en parallèle) :

| Période | Travaux | Durée |
|---------|---------|:-----:|
| Semaines 1-3 | Phase 1 — Sécurité & Fondations BDD | 15.5 j |
| Semaine 4 | Phase 2 — Workflow Git & Gouvernance du code | 3 j |
| Semaines 5-6 | Phase 3 — Tests & CI/CD | 7 j |
| Semaines 6-10 | Phase 4 — Refactoring Architecture | 19 j |
| Semaines 11-13 | Phase 5 + Phase 7A + Phase 7B (en parallèle) | 15 j |
| Semaines 13-14 | Phase 6 — Administration & Rôles | 8.5 j |
| Semaines 15-17 | Phase 7C — Facturation & Paiements | 16 j |
| Semaines 18-22 | Phase 8 — Site vitrine & Tunnel | 21 j |
| Semaines 22-26 | Phase 9 — Finitions & Audit final | 19 j |

**Durée totale optimisée (2-3 devs) : ~26 semaines (~6.5 mois)**
**Durée totale 1 dev seul : ~29 semaines (~7.5 mois)**

---

## Ce qui est exclu du MVP (v2 / v3)

| Module | Version cible |
|--------|:------------:|
| Personnel — Fiches, contrats CEE/CDD, comptabilité | **v2** |
| Module Transports complet (tronçons, arrêts, encadrants, SNCF) | **v3** |
| Convocations Aller/Retour | **v2** |
| Base de recrutement / CV | **v2** |
| Module documents (génération Word, fusion) | **v2** |
| Chatbot d'aide | **v3** |
| Vidéo de présentation | **v3** |
| Repos compensateurs | **v2** |
| Calendrier / Budget / Numéros utiles | **v2** |

---

## Risques identifiés

| Risque | Impact | Mitigation |
|--------|--------|------------|
| Middleware bloque signup/reset-password | 🔴 Bloquant | Phase 1.1 — correction immédiate |
| Service Role Key exposable via NEXT_PUBLIC_ | 🔴 Bloquant | Phase 1.2 — supprimer le fallback |
| **RLS absent sur 8 tables / 9** (violation RGPD) | 🔴 Critique | Phase 1.5 — ~15 policies à créer |
| **Table `projects` manquante = erreur 500** | 🔴 Bloquant | Phase 1.3 — créer ou supprimer les routes |
| **Aucune infrastructure de test** (0 fichier, 0 framework, 0 CI/CD) | 🔴 Critique | Phase 3 — Vitest + Playwright + GitHub Actions |
| **Aucun workflow Git** (0 PR, 0 branches, 0 protection, 0 issues) | 🔴 Critique | Phase 2 — Git flow + branch protection + conventional commits |
| **`allowed_emails` ignorée** par le signup | 🟠 Élevé | Phase 1.6 — allowlist non appliquée |
| **`children.id` = text** (collision) | 🟠 Élevé | Phase 1.4 — migration vers bigint |
| **`children.birth_date` = text** | 🟠 Élevé | Phase 1.4 — migration vers date |
| Table `inscriptions` manquante (feature flag protège) | 🟠 Élevé | Phase 1.3 |
| **Aucun système de rôles** (`UserRole` défini mais jamais stocké/vérifié) | 🟠 Élevé | Phase 1.16-1.17 + Phase 6 |
| **Pages admin accessibles à tous** | 🟠 Élevé | Phase 1.17 + Phase 6.1 |
| Aucun rate limiting routes publiques | 🟠 Élevé | Phase 1.10 |
| Messages d'erreur exposent la structure BDD | 🟠 Élevé | Phase 1.12 |
| Pages monolithiques (800+ lignes) | 🟠 Élevé | Phase 4C |
| Pas de séparation Client/Server components | 🟠 Élevé | Phase 4D |
| Services monolithiques (`api.ts` = 832 lignes) | 🟠 Élevé | Phase 4E |
| CSS incohérent (3 approches mélangées) | 🟡 Moyen | Phase 4H |
| **4 indexes manquants** | 🟡 Moyen | Phase 1.7 |
| Trigger doublon sur `families` | 🟡 Mineur | Phase 1.8 |
| Pas de headers de sécurité | 🟡 Moyen | Phase 1.9 |
| Complexité calcul financier | 🟠 Élevé | Spécifier les règles avant dev (Phase 7C) |
| Intégration Stripe en conditions réelles | 🟠 Élevé | Stripe Test Mode + webhook local |
| 1 seul dev = goulot d'étranglement | 🟡 Moyen | Prioriser les chemins critiques |
| UX incohérente (cf. bugfix.txt) | 🟡 Moyen | Phase 9 |

---

## Calendrier recommandé (1 dev)

```
Semaine 1     → 1.1-1.2  (🔴 Fix middleware + Fix service role key)
              → 1.3-1.4  (Tables manquantes + Types colonnes children)
Semaine 2     → 1.5-1.6  (🔴 RLS 15 policies + Intégrer allowed_emails)
              → 1.7-1.8  (Indexes manquants + Nettoyage triggers)
Semaine 3     → 1.9-1.12 (Headers sécurité + Rate limiting + Zod + Messages erreur)
              → 1.13-1.17 (Types centralisés + Error boundaries + Migrations + Rôles + RBAC)

Semaine 4     → 2.1-2.8  (🔴 Git flow + Branch protection + Conventional Commits + Issues GitHub + Tag v0.1.0)

Semaine 5     → 3.1-3.3  (Vitest + Playwright + Pipeline CI)
              → 3.4      (Tests services existants)
Semaine 6     → 3.5-3.8  (Tests routes API + composants + migration script + structure)

Semaine 6-7   → 4A + 4B  (Racine + Route Groups + suppressions doublons)
Semaine 7-8   → 4C.1-4C.2 (Découper clients 800 lignes + fiche 500 lignes)
              → 4C.3-4C.5 (Découper centres + homepage + séjours)
Semaine 8-9   → 4D       (Audit "use client" + Server Components + hook useFetch)
              → 4E       (Découper api.ts 832 lignes + services manquants)
Semaine 9-10  → 4F       (Réorganiser composants + créer UI manquants)
              → 4G + 4H + 4I (lib + config + CSS + types)

Semaine 11    → 5.1-5.2  (Familles + Enfants sanitaire)
Semaine 12    → 5.3-5.4  (Centres + Inscriptions liste)
Semaine 13-14 → 5.5-5.6  (Fiche inscription complète + Dashboard)

Semaine 14-16 → 6.1-6.5  (Navigation conditionnelle + Paramètres + Direction + Personnel)

Semaine 16    → 7A       (Module Séjours)
Semaine 17-18 → 7A suite + 7B (Partenaires)
Semaine 19-22 → 7C       (Facturation & Paiements)

Semaine 22-25 → 8.1-8.5  (Site vitrine + Tunnel de vente)
Semaine 25-26 → 8 suite

Semaine 26    → 9.1-9.2  (Charte graphique + Corrections UI/UX)
Semaine 27    → 9.3-9.5  (Responsive + Accessibilité + Pages légales)
Semaine 28-29 → 9.6-9.7  (Audit sécurité final + Tests E2E Playwright) + Go/No-Go
```

---

*Document de planning vivant — à mettre à jour au fil de l'avancement.*

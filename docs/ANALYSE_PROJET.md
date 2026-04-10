# Analyse du projet Mnémos Polymnie

> Document généré le 23 mars 2026

---

## 1. Contexte

**Polymnie** est une plateforme SaaS développée pour l'organisation **Mnémos**, destinée à la **gestion de colonies de vacances** pour enfants. L'application couvre l'ensemble du cycle de gestion : familles, inscriptions, séjours, centres d'accueil, personnel, transports, partenaires et facturation.

Le projet est conçu comme une application web moderne, mono-repo, utilisant Next.js 15 avec App Router et Supabase comme backend-as-a-service.

---

## 2. Stack technique

| Couche | Technologies |
|--------|-------------|
| **Framework** | Next.js 15 (App Router) + Turbopack |
| **Langage** | TypeScript 5 |
| **UI** | React 19.1, Tailwind CSS v4, shadcn/ui (Radix UI) |
| **Animations** | Framer Motion |
| **Icônes** | Lucide React |
| **Validation** | Zod |
| **Base de données** | Supabase (PostgreSQL) |
| **Authentification** | Supabase Auth (email/mot de passe) |
| **Paiement** | Stripe v16 |
| **Bundler dev** | Turbopack |
| **Linting** | ESLint |
| **Styling** | Tailwind CSS v4 + PostCSS, variables CSS oklch, dark mode |
| **Polices** | Geist Sans / Geist Mono |

### Variables d'environnement requises

```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
STRIPE_SECRET_KEY
STRIPE_WEBHOOK_SECRET
```

---

## 3. Architecture du projet

```
├── app/                    # Pages et routes API (App Router)
│   ├── api/                # Endpoints REST (auth, projects, stripe)
│   ├── [pages]/            # Pages métier (centres, clients, inscriptions…)
│   ├── layout.tsx          # Layout racine (AuthProvider, fonts, Navbar, Footer)
│   └── page.tsx            # Page d'accueil / landing
├── components/             # Composants réutilisables
│   ├── auth/               # Formulaire d'authentification
│   ├── dashboard/          # Dashboard et données mock
│   ├── features/           # Tuiles, grilles, cartes métier
│   ├── layout/             # Header, Footer, Navbar, Sidebar
│   └── ui/                 # Composants UI génériques (Button, Card, Modal…)
├── features/               # Index des fonctionnalités
├── hooks/                  # Hooks custom (useAuth, useProjectLogger, useResponsiveGrid)
├── lib/                    # Utilitaires, clients Supabase, Stripe, constantes
├── services/               # Services API (familles, inscriptions)
├── styles/                 # CSS global (Tailwind)
├── types/                  # Types TypeScript (famille, index)
└── public/                 # Assets statiques (icônes)
```

---

## 4. Base de données

Le schéma SQL (`create_mnemos_table.sql`) définit les tables principales :

| Table | Rôle |
|-------|------|
| `mnemos` | Fiches familles/clients avec données enfants et contacts (JSONB) |
| `families` | Structure familiale relationnelle |
| `adults` | Contacts / responsables légaux |
| `inscriptions` | Inscriptions d'enfants aux séjours |
| `centres` | Lieux d'accueil / centres de vacances |
| `partners` | Organismes de financement |
| `projects` | Projets utilisateur |
| `project_edit_log` | Journal d'audit des modifications |
| `user_profiles` | Profils utilisateur (optionnel) |
| `identifications` | Table d'identification complémentaire |

> **Note :** Le Row Level Security (RLS) est actuellement **désactivé** pour faciliter le développement/test.

---

## 5. Authentification et autorisation

### Flux d'authentification
1. Inscription via email/mot de passe (Supabase Auth, auto-confirm activé pour le dev)
2. Le middleware protège les routes `/dashboard` et `/api`
3. Validation de session côté serveur
4. `AuthProvider` synchronise l'état d'authentification côté client
5. Résolution automatique user → `mnemos_id`

### Rôles définis (non encore implémentés)
- **Admin** : accès complet
- **Encadrant** : accès staff
- **Direction** : accès gestion

---

## 6. Routes API

| Endpoint | Méthode | Description |
|----------|---------|-------------|
| `/api/auth/signup` | POST | Création de compte (email/mot de passe) |
| `/api/auth/reset-password` | POST | Réinitialisation du mot de passe |
| `/api/projects/generate` | POST | Création de projet (authentifié) |
| `/api/projects/delete` | DELETE | Suppression de projet + assets (authentifié) |
| `/api/stripe/webhook` | POST | Réception des événements Stripe |

---

## 7. Fonctionnalités – État d'avancement

### Pages pleinement implémentées

| Page | Route | Description |
|------|-------|-------------|
| **Accueil / Landing** | `/` | Page d'accueil avec redirection login/signup |
| **Connexion** | `/login` | Formulaire de connexion |
| **Inscription** | `/signup` | Formulaire de création de compte |
| **Réinitialisation MdP** | `/reset-password` | Réinitialisation par email |
| **Dashboard** | `/dashboard` | Tableau de bord avec stats et activité (données mock) |
| **Clients / Familles** | `/clients` | Gestion complète : CRUD parents/enfants, recherche, filtrage, adresses |
| **Centres** | `/centres` | Liste des centres, détail, gestion des contacts |
| **Inscriptions** | `/inscriptions` | Recherche et filtrage des inscriptions |
| **Fiche** | `/fiche` | Édition détaillée d'une inscription |
| **Homepage menu** | `/homepage` | Interface en cartes de navigation |
| **Contact** | `/contact` | Formulaire de contact et support |
| **Documentation** | `/documentation` | Guides et onboarding |

### Pages partiellement implémentées

| Page | Route | Notes |
|------|-------|-------|
| **Séjours** | `/sejours` | Formulaire volumineux présent, pas de backend connecté |

### Pages stub (placeholder uniquement)

| Page | Route |
|------|-------|
| Familles | `/familles` |
| Partenaires | `/partenaires` |
| Transports | `/transports` |
| Prestations | `/prestations` |
| Convocations | `/convocation` |
| Direction | `/direction` |
| Personnel | `/personnel` |
| Paramètres | `/parametres` |
| RGPD | `/rgpd` |
| Mentions légales | `/mentions-legales` |

---

## 8. Composants et hooks

### Composants principaux

| Composant | Rôle |
|-----------|------|
| `AuthProvider` | Contexte React pour l'état d'auth + gestion de session |
| `AuthForm` | Formulaire login/signup réutilisable |
| `Dashboard` | Tableau de bord avec graphiques et données mock |
| `ParentsGrid` | Éditeur dynamique de parents/tuteurs |
| `FamilleCard` | Carte famille dans la grille |
| `Header / SiteHeader / Navbar / Footer / Sidebar` | Composants de layout |
| `Button / Card / Modal / IconButton` | Composants UI (shadcn/ui) |
| `FeatureSection / FeatureTile / LandingTileGrid` | Composants landing page |

### Hooks custom

| Hook | Rôle |
|------|------|
| `useAuth()` | Accès à l'utilisateur courant et à la session |
| `useProjectLogger()` | Journalisation des modifications en base (avant/après) |
| `useResponsiveGrid()` | Génération de classes Tailwind responsive pour les grilles |

### Services

| Service | Rôle |
|---------|------|
| `api.ts` | CRUD familles + détection de doublons adultes |
| `inscriptions.ts` | CRUD inscriptions avec filtrage |

---

## 9. Design system

- **Palette** : Tons neutres (gris) avec accents orange, émeraude, rose, bleu ciel
- **Typographie** : Geist Sans / Geist Mono
- **Rayon de bordure** : 0.625rem par défaut
- **Cartes** : Coins arrondis (32px), ombres marquées
- **Responsive** : Breakpoints base, sm, md, lg, xl
- **Mode sombre** : Supporté via variables CSS en espace de couleur oklch

---

## 10. Taux de complétion estimé

| Domaine | Avancement | Détail |
|---------|:----------:|--------|
| Authentification | 95% | Email/mot de passe fonctionnel, RLS désactivé |
| Gestion des familles | 90% | CRUD complet, opérations multi-tables |
| Inscriptions | 85% | CRUD de base + filtrage |
| UI / Composants | 80% | shadcn/ui en place, dashboard avec données mock |
| Base de données | 60% | Tables principales présentes, ajouts nécessaires |
| Intégration Stripe | 40% | Infrastructure webhook uniquement, pas de logique métier |
| Sécurité (RLS) | 20% | Policies non implémentées, RLS désactivé |
| Pages fonctionnelles | 30% | Beaucoup de pages sont des stubs |

### Estimation globale : **~55%** du projet réalisé

---

## 11. Points d'attention et recommandations

### Sécurité
- **Activer le RLS** sur Supabase et définir les policies par table
- Implémenter le contrôle d'accès basé sur les rôles (RBAC)
- Sécuriser les endpoints API avec vérification de permissions

### Fonctionnel
- Connecter le backend aux pages stub (séjours, partenaires, transports, etc.)
- Créer les tables manquantes pour les modules non encore développés
- Brancher Stripe sur un flow de facturation réel (abonnements, paiement séjours)
- Implémenter un système de notifications (email, in-app)

### Technique
- Ajouter des tests (unitaires, intégration, E2E)
- Remplacer les données mock du dashboard par des données réelles
- Implémenter l'upload de fichiers (Supabase Storage)
- Compléter les pages légales (RGPD, mentions légales)

---

## 12. Commandes de développement

```bash
npm run dev      # Serveur de développement (Turbopack)
npm run build    # Build de production
npm run start    # Servir la version de production
npm run lint     # Vérification ESLint
```

---

*Ce document reflète l'état du projet au 23 mars 2026.*

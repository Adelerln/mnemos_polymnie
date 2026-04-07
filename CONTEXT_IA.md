# Contexte IA — Découpage des branches

## Principe

- **Pas de branche par issue** : on découpe par **module métier**.
- Les tâches transversales (outils, CI, structure) se font **directement sur `develop`**.
- Chaque branche module contient le code, les tests, les types et la refacto liés à ce module.
- Chaque branche module part de `develop` une fois le socle commun en place.

---

## Découpage des branches

### `develop` (direct — socle commun)

| Issue | Titre |
|-------|-------|
| #22 | Installer les outils (Jest/Vitest, Testing Library…) |
| #23 | Créer le pipeline CI |
| #25 | Organiser les dossiers |
| #26 | Ranger la racine |
| #33 | Centraliser les types |

### `familles`

Code + tests + types du module familles.

| Issue | Titre |
|-------|-------|
| #8 | Revoir la base des Children |
| #24 | Écrire les premiers tests (partie familles) |

### `auth`

Code + tests auth et sécurité.

| Issue | Titre |
|-------|-------|
| #15 | Ajouter des en-têtes de sécurité |
| #16 | Limiter les abus sur les formulaires publics |
| #17 | Vérifier les données envoyées par les utilisateurs |
| #18 | Masquer les erreurs techniques |
| #19 | Mettre en place les rôles utilisateur |
| #21 | Gestion des erreurs d'affichage |
| #24 | Écrire les premiers tests (partie auth) |

### `bdd`

Modèle de données, tables et migrations.

| Issue | Titre |
|-------|-------|
| #2 | Revoir le modèle de BDD |
| #3 | Ajouter base inscriptions + bases d'options reliées |
| #4 | Ajouter base Centres |
| #5 | Créer et Ajouter base de séjours |
| #6 | Créer une sous-table des contacts partenaires |
| #7 | Revoir la base Partners |
| #20 | Mettre en place les migrations |

### `sejours`

Code + tests du module séjours.

### `inscriptions`

Code + tests du module inscriptions.

### `partenaires`

Code + tests du module partenaires.

### `refacto`

Nettoyage transversal du code.

| Issue | Titre |
|-------|-------|
| #27 | Découper les fichiers trop gros |
| #28 | Organiser les pages par groupe |
| #29 | Découper les services |
| #30 | Optimiser serveur vs navigateur |
| #31 | Réorganiser les composants |
| #32 | Unifier le CSS |

---

## Ordre recommandé

1. **`develop`** — Installer le socle (outils, CI, structure)
2. **`bdd`** — Poser le modèle de données
3. **`auth`** — Sécuriser l'app
4. **`familles`**, `sejours`, `inscriptions`, `partenaires` — Modules métier (parallélisables)
5. **`refacto`** — Nettoyage final

---

## Stack technique

| Élément | Techno |
|---------|--------|
| Framework | **Next.js** (App Router) |
| Langage | **TypeScript** |
| BDD / Auth | **Supabase** (PostgreSQL) |
| CSS | **Tailwind CSS** uniquement |
| Validation | **Zod** |
| Tests | **Vitest** + **Testing Library** (+ Playwright pour E2E) |
| CI | **GitHub Actions** |
| Hébergement | Vercel (prévu) |

---

## Règles impératives pour l'IA

Ces règles s'appliquent à **chaque intervention** sur le code, sans exception.

### 1. Ne pas recoder ce qui existe

- Avant de créer un fichier ou une fonction, **vérifier** si un équivalent existe déjà dans le projet.
- Réutiliser les services (`services/`), utilitaires (`lib/`) et composants (`components/`) existants.
- Ne jamais dupliquer de la logique — principe **DRY** (Don't Repeat Yourself).

### 2. Commenter le code

- Commenter le **pourquoi**, pas le quoi. Le code doit être lisible par lui-même.
- Chaque fonction complexe, chaque décision d'architecture, chaque piège à éviter doit avoir un commentaire.
- Bon : `// Format attendu par Supabase : snake_case, conversion ici`
- Mauvais : `// on incrémente i` ou pas de commentaire du tout.

### 3. Écrire des tests

- Une fois les dossiers de tests en place (`__tests__/unit/`, `__tests__/integration/`, `__tests__/e2e/`), **chaque nouvelle fonctionnalité doit être accompagnée de tests**.
- Tests unitaires pour la logique métier et les utilitaires.
- Tests d'intégration pour les routes API.
- Nommer les fichiers de test : `[nom-du-fichier].test.ts`.

### 4. Commits clairs et fréquents

- **Plusieurs commits** par développement, pas un seul commit géant.
- Format **Conventional Commits** obligatoire :
  - `feat:` nouvelle fonctionnalité
  - `fix:` correction de bug
  - `refactor:` réorganisation sans changement de comportement
  - `test:` ajout ou modification de tests
  - `docs:` documentation
  - `chore:` maintenance (dépendances, config)
- Chaque commit doit être **atomique** : un commit = un changement logique.
- Message clair et en français ou anglais, cohérent sur la branche.

### 5. Planifier les gros développements

- Pour tout développement touchant plusieurs fichiers ou créant un nouveau module :
  1. **Générer un fichier plan** (`PLAN_[module].md`) avec : objectif, fichiers concernés, sous-tâches numérotées.
  2. **Implémenter étape par étape**, un prompt = une sous-tâche.
  3. **Valider chaque étape** avant de passer à la suivante.
- Le fichier plan sert de **contexte persistant** pour l'IA entre les prompts.

### 6. Gestion des erreurs

- Toujours prévoir `try/catch` sur les appels Supabase et les routes API.
- Messages simples côté utilisateur, détails techniques dans `console.error` côté serveur.
- Ne jamais exposer les erreurs brutes de la BDD à l'utilisateur.

### 7. Conventions de code

| Élément | Convention | Exemple |
|---------|-----------|---------|
| Variables / fonctions | `camelCase` | `familyLabel`, `fetchChildren()` |
| Composants React | `PascalCase` | `FamilyCard`, `HealthForm` |
| Constantes | `UPPER_SNAKE_CASE` | `FAMILY_TABLE`, `MAX_RETRIES` |
| Fichiers | `kebab-case` | `phone.ts`, `families.ts` |
| Colonnes BDD | `snake_case` | `first_name`, `birth_date` |

### 8. Structure des fichiers

- **~200 lignes max** par fichier — au-delà, découper.
- **1 composant exporté** par fichier React.
- **1 domaine** par service (`services/families.ts`, `services/centres.ts`…).
- **1 fichier de types** par domaine dans `types/`.
- CSS : **Tailwind uniquement**, pas de CSS Modules ni de `@apply`.

### 9. Sécurité

- Ne jamais exposer la `service_role_key` côté client.
- Toujours valider les données côté serveur avec **Zod** avant traitement.
- Vérifier l'authentification et les rôles dans le middleware et les routes API.
- Appliquer le principe du moindre privilège (RLS Supabase).

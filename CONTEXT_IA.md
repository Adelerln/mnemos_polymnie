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

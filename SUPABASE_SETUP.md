# Configuration Supabase pour la page Clients

## 🎯 Objectif
Configurer Supabase pour que le formulaire de la page clients sauvegarde correctement les données dans la table `mnemos`.

## 📋 Étapes de configuration

### 1. Créer la table mnemos
Exécuter le script SQL dans votre interface Supabase :

```sql
-- Exécuter create_mnemos_table.sql dans Supabase SQL Editor
```

### 2. Configurer les variables d'environnement
Créer un fichier `.env.local` à la racine du projet :

```env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 3. Tester l'intégration
```bash
# Installer les dépendances si nécessaire
npm install @supabase/supabase-js

# Tester l'intégration
node test-supabase-integration.js
```

### 4. Tester l'interface utilisateur
1. Aller sur `http://localhost:3000/clients`
2. Remplir le formulaire avec des données de test
3. Cliquer sur "Enregistrer la fiche"
4. Vérifier que les données apparaissent dans le tableau
5. Vérifier dans Supabase que les données sont bien enregistrées

## 🔧 Structure de la table mnemos

La table contient les colonnes suivantes :

| Colonne | Type | Description |
|---------|------|-------------|
| `id` | SERIAL PRIMARY KEY | Identifiant unique auto-incrémenté |
| `id_client` | TEXT | Identifiant client (ex: "001", "002") |
| `civility` | TEXT | Civilité (M, Mme, M et Mme, Famille) |
| `last_name` | TEXT | Nom de famille |
| `first_name` | TEXT | Prénom |
| `address` | TEXT | Adresse |
| `complement` | TEXT | Complément d'adresse |
| `postal_code` | TEXT | Code postal |
| `city` | TEXT | Ville |
| `country` | TEXT | Pays |
| `phone_1` | TEXT | Téléphone principal |
| `phone_2` | TEXT | Téléphone secondaire |
| `email` | TEXT | Email |
| `partner` | TEXT | Partenaire principal |
| `prestashop_p1` | TEXT | ID Prestashop P1 |
| `prestashop_p2` | TEXT | ID Prestashop P2 |
| `secondary_contact` | JSONB | Contact secondaire (JSON) |
| `children` | JSONB | Enfants (JSON) |
| `created_at` | TIMESTAMPTZ | Date de création |
| `updated_at` | TIMESTAMPTZ | Date de mise à jour |

## 🚨 Résolution de problèmes

### Erreur de connexion
- Vérifier les variables d'environnement
- Vérifier que l'URL et la clé Supabase sont correctes

### Erreur de table
- Vérifier que la table `mnemos` existe
- Vérifier que RLS est désactivé (pour les tests)

### Erreur de données
- Vérifier que les champs JSON sont correctement formatés
- Vérifier que les timestamps sont correctement générés

## ✅ Critères de succès
- [ ] La table `mnemos` existe avec toutes les colonnes
- [ ] Les variables d'environnement sont configurées
- [ ] Le formulaire sauvegarde les données
- [ ] Les données apparaissent dans le tableau
- [ ] Les données sont persistées en base
- [ ] Les opérations CRUD fonctionnent
- [ ] Les timestamps sont correctement gérés

## 🔄 Fonctionnalités implémentées

### Côté client
- ✅ Chargement automatique des familles au montage
- ✅ Sauvegarde asynchrone avec gestion d'erreurs
- ✅ États de chargement (`isLoading`, `isSaving`)
- ✅ Boutons désactivés pendant la sauvegarde
- ✅ Messages de feedback pour l'utilisateur

### Côté serveur
- ✅ Service API avec fonctions CRUD
- ✅ Gestion des erreurs Supabase
- ✅ Logique insert/update automatique
- ✅ Support des données JSON (contacts, enfants)

### Base de données
- ✅ Table `mnemos` avec toutes les colonnes
- ✅ Index sur `id_client` pour les performances
- ✅ RLS désactivé pour les tests
- ✅ Support des timestamps automatiques

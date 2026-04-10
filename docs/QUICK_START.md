# 🚀 Guide de démarrage rapide

## ⚡ Configuration Supabase (OBLIGATOIRE)

Votre application nécessite Supabase pour fonctionner. Suivez ces étapes :

### 1. Créer un projet Supabase

1. Allez sur [https://supabase.com](https://supabase.com)
2. Créez un compte (gratuit) ou connectez-vous
3. Créez un nouveau projet
4. Attendez que le projet soit prêt (2-3 minutes)

### 2. Récupérer vos credentials

1. Dans votre projet Supabase, allez dans **Settings** > **API**
2. Vous trouverez :
   - **Project URL** → C'est votre `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** key → C'est votre `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role** key (optionnel) → C'est votre `SUPABASE_SERVICE_ROLE_KEY`

### 3. Configurer les variables d'environnement

Le fichier `.env.local` a été créé pour vous. Ouvrez-le et remplacez les valeurs :

```env
NEXT_PUBLIC_SUPABASE_URL=https://votre-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=votre-anon-key-ici
```

**Exemple :**
```env
NEXT_PUBLIC_SUPABASE_URL=https://abcdefghijklmnop.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 4. Créer la table dans Supabase

1. Dans Supabase, allez dans **SQL Editor**
2. Ouvrez le fichier `create_mnemos_table.sql` de ce projet
3. Copiez-collez le contenu dans l'éditeur SQL
4. Exécutez la requête

### 5. Redémarrer le serveur de développement

Après avoir configuré `.env.local`, redémarrez votre serveur :

```bash
# Arrêtez le serveur (Ctrl+C)
# Puis relancez-le
npm run dev
```

## ✅ Vérification

Si tout est bien configuré, vous devriez voir :
- ✅ Le serveur démarre sans erreur
- ✅ L'application s'affiche sur http://localhost:3000
- ✅ Plus d'erreur concernant les variables Supabase

## 🆘 Problèmes courants

### Erreur : "Missing Supabase environment variables"
- ✅ Vérifiez que `.env.local` existe à la racine du projet
- ✅ Vérifiez que les variables commencent bien par `NEXT_PUBLIC_`
- ✅ Redémarrez le serveur après modification de `.env.local`

### Erreur de connexion à Supabase
- ✅ Vérifiez que l'URL et la clé sont correctes (sans espaces)
- ✅ Vérifiez que votre projet Supabase est actif

### La table n'existe pas
- ✅ Exécutez le script SQL `create_mnemos_table.sql` dans Supabase

## 📚 Documentation

- [Documentation Supabase](https://supabase.com/docs)
- [Guide de configuration détaillé](./SUPABASE_SETUP.md)



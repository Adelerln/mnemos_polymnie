# Guide d'installation - Next.js

## Étape 1 : Installer Node.js

Pour coder en Next.js, vous devez d'abord installer Node.js (qui inclut npm).

### Option A : Installation via le site officiel (Recommandé)

1. **Téléchargez Node.js LTS** depuis : https://nodejs.org/
   - Choisissez la version **LTS (Long Term Support)**
   - Téléchargez le fichier `.pkg` pour macOS

2. **Installez Node.js** :
   - Double-cliquez sur le fichier `.pkg` téléchargé
   - Suivez l'assistant d'installation
   - Acceptez les conditions et installez

3. **Vérifiez l'installation** :
   ```bash
   node --version
   npm --version
   ```
   Vous devriez voir des numéros de version (ex: v20.x.x et 10.x.x)

4. **Redémarrez votre terminal** ou exécutez :
   ```bash
   source ~/.zshrc
   ```

### Option B : Installation via Homebrew (si vous avez Homebrew)

```bash
brew install node
```

## Étape 2 : Installer les dépendances du projet

Une fois Node.js installé, dans le dossier du projet :

```bash
npm install
```

Cette commande installera toutes les dépendances nécessaires (Next.js, React, TypeScript, Tailwind CSS, etc.)

## Étape 3 : Lancer le serveur de développement

```bash
npm run dev
```

Le projet sera accessible sur : **http://localhost:3000**

## Commandes utiles

- `npm run dev` - Lance le serveur de développement avec Turbopack
- `npm run build` - Compile le projet pour la production
- `npm run start` - Lance le serveur de production
- `npm run lint` - Vérifie le code avec ESLint

## Besoin d'aide ?

Si vous rencontrez des problèmes :
1. Vérifiez que Node.js est bien installé : `node --version`
2. Vérifiez que vous êtes dans le bon dossier : `pwd`
3. Supprimez `node_modules` et `package-lock.json` puis réinstallez : 
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```



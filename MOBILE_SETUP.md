# 📱 Configuration Application Mobile Native

Ce guide vous explique comment compiler et déployer l'application sur iOS et Android avec **Capacitor**.

## ✅ Configuration actuelle

L'application est **déjà configurée** pour Capacitor avec :
- ✅ Capacitor Core installé
- ✅ Plugins iOS et Android installés
- ✅ Scanner de code-barres natif (`@capacitor-community/barcode-scanner`)
- ✅ Configuration `capacitor.config.ts` prête
- ✅ Hot-reload depuis le sandbox Lovable

## 🚀 Étapes de déploiement mobile

### 1️⃣ Exporter le projet vers GitHub

1. Dans Lovable, cliquez sur le bouton **GitHub** en haut à droite
2. Cliquez sur **"Connect to GitHub"** si ce n'est pas déjà fait
3. Autorisez l'application Lovable sur GitHub
4. Créez un nouveau repository ou connectez-en un existant

### 2️⃣ Cloner le projet localement

```bash
git clone https://github.com/votre-username/votre-repo.git
cd votre-repo
```

### 3️⃣ Installer les dépendances

```bash
npm install
```

### 4️⃣ Ajouter les plateformes natives

**Pour Android :**
```bash
npx cap add android
```

**Pour iOS :**
```bash
npx cap add ios
```

> ⚠️ **Note :** Pour iOS, vous devez utiliser un Mac avec Xcode installé.

### 5️⃣ Compiler le projet

```bash
npm run build
```

### 6️⃣ Synchroniser avec les plateformes natives

```bash
npx cap sync
```

Cette commande copie le build web vers les projets natifs Android/iOS.

### 7️⃣ Lancer l'application

**Sur Android :**
```bash
npx cap run android
```

**Sur iOS :**
```bash
npx cap run ios
```

Ou ouvrez les projets dans les IDE natifs :

**Android Studio :**
```bash
npx cap open android
```

**Xcode :**
```bash
npx cap open ios
```

## 🔄 Workflow de développement

### Mode développement avec hot-reload

L'application est configurée pour se connecter au sandbox Lovable en développement :

```typescript
// capacitor.config.ts
server: {
  url: 'https://a6c8b0b1-067c-4a0e-83e7-10906529be00.lovableproject.com?forceHideBadge=true',
  cleartext: true
}
```

Cela signifie que :
- ✅ Vous voyez les changements en temps réel depuis Lovable
- ✅ Pas besoin de rebuild à chaque modification
- ✅ Parfait pour tester les fonctionnalités natives (caméra, etc.)

### Mode production

Pour une version production sans le serveur de développement :

1. Commentez la section `server` dans `capacitor.config.ts`
2. Recompilez : `npm run build`
3. Resynchronisez : `npx cap sync`

## 📸 Fonctionnalités natives disponibles

### Scanner de code-barres

Le scanner utilise `@capacitor-community/barcode-scanner` qui :
- ✅ Accède à la caméra native du téléphone
- ✅ Scan en temps réel des codes EAN-13, EAN-8, UPC
- ✅ Détection automatique rapide
- ✅ Permissions gérées automatiquement

### Workflow du scanner

1. **Produit trouvé dans la base** → Redirection vers la fiche produit
2. **Produit trouvé sur OpenFoodFacts** → Page d'ajout avec données pré-remplies
3. **Produit introuvable** → Page d'ajout avec code-barres uniquement

## 🔧 Dépendances principales

```json
{
  "@capacitor/core": "^7.4.4",
  "@capacitor/cli": "^7.4.4",
  "@capacitor/ios": "^7.4.4",
  "@capacitor/android": "^7.4.4",
  "@capacitor-community/barcode-scanner": "^4.0.1"
}
```

## 📝 Configuration des permissions

### Android (`android/app/src/main/AndroidManifest.xml`)

```xml
<uses-permission android:name="android.permission.CAMERA" />
```

### iOS (`ios/App/App/Info.plist`)

```xml
<key>NSCameraUsageDescription</key>
<string>Nous avons besoin d'accéder à votre caméra pour scanner les codes-barres des produits cosmétiques.</string>
```

Ces permissions sont ajoutées automatiquement par Capacitor lors du `npx cap add`.

## 🐛 Résolution de problèmes

### La caméra ne fonctionne pas

1. Vérifiez que les permissions sont bien configurées
2. Testez sur un appareil physique (l'émulateur peut ne pas avoir de caméra)
3. Vérifiez que le scanner est bien activé sur une plateforme native

### Hot-reload ne fonctionne pas

1. Vérifiez que l'URL dans `capacitor.config.ts` est correcte
2. Assurez-vous que votre appareil/émulateur peut accéder à internet
3. Vérifiez les logs dans Android Studio ou Xcode

### Erreur de build

```bash
# Nettoyer et reconstruire
npm run build
npx cap sync
```

## 📦 Publication sur les stores

### Google Play Store (Android)

1. Générez un keystore pour signer l'app
2. Configurez le build en mode release
3. Créez un compte développeur Google Play (25$ unique)
4. Suivez le guide : https://capacitorjs.com/docs/android/deploying-to-google-play

### Apple App Store (iOS)

1. Créez un compte Apple Developer (99$/an)
2. Configurez les certificats et profils de provisioning
3. Archivez l'app dans Xcode
4. Suivez le guide : https://capacitorjs.com/docs/ios/deploying-to-app-store

## 🔗 Ressources utiles

- [Documentation Capacitor](https://capacitorjs.com/docs)
- [Plugin Barcode Scanner](https://github.com/capacitor-community/barcode-scanner)
- [Guide Android](https://capacitorjs.com/docs/android)
- [Guide iOS](https://capacitorjs.com/docs/ios)

## 💡 Conseils

- Testez toujours sur un appareil physique pour les fonctionnalités natives
- Utilisez le hot-reload pendant le développement pour gagner du temps
- Commitez régulièrement sur GitHub pour synchroniser avec Lovable
- Documentez les permissions nécessaires pour votre équipe

---

**Besoin d'aide ?** Consultez la [documentation Lovable](https://docs.lovable.dev) ou rejoignez le [Discord Lovable](https://discord.gg/lovable).

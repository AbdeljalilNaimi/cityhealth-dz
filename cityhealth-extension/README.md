# 🏥 CityHealth Companion — Extension Chrome

Extension Chrome compagnon de la plateforme **CityHealth** pour un accès rapide au triage IA, à la recherche de professionnels de santé et aux alertes SOS don de sang.

---

## ✨ Fonctionnalités

- **🩸 Carte d'urgence santé** — Affichage rapide du groupe sanguin, allergies, conditions chroniques et contact d'urgence (synchronisé avec votre compte CityHealth).
- **🔍 Recherche rapide** — Trouvez un professionnel de santé directement depuis le popup.
- **🤖 Triage IA** — Accès direct à l'assistant médical intelligent.
- **🔔 Alertes SOS don de sang** — Notifications en temps réel des urgences de don de sang, avec historique des 5 dernières alertes.
- **⚙️ Préférences de notifications** — Son, heures calmes, fréquence et filtre par urgence.

---

## 📦 Prérequis

- [Node.js](https://nodejs.org/) >= 18
- [npm](https://www.npmjs.com/) ou [bun](https://bun.sh/)
- Google Chrome (ou navigateur basé sur Chromium)

---

## 🚀 Installation & Build

```bash
# 1. Accéder au dossier de l'extension
cd cityhealth-extension

# 2. Installer les dépendances
npm install

# 3. Compiler l'extension
npm run build
```

Cela génère un dossier `dist/` contenant tous les fichiers prêts à être chargés dans Chrome.

---

## 🧩 Charger l'extension dans Chrome

1. Ouvrez Chrome et allez dans `chrome://extensions/`
2. Activez le **Mode développeur** (en haut à droite)
3. Cliquez sur **Charger l'extension non empaquetée**
4. Sélectionnez le dossier `cityhealth-extension/dist/`
5. L'extension apparaît dans la barre d'outils ✅

---

## 🔧 Développement

```bash
# Lancer le serveur de développement (pour le popup uniquement)
npm run dev
```

> **Note :** Le mode dev sert le popup via Vite. Pour tester l'extension complète (background script, notifications), il faut faire un `npm run build` et recharger dans Chrome.

### Structure du projet

```
cityhealth-extension/
├── dist/                  # Build généré (ne pas commiter)
├── public/icons/          # Icônes de l'extension (16, 48, 128px)
├── src/
│   ├── Popup.tsx          # Interface principale du popup
│   ├── OptionsPage.tsx    # Page de préférences notifications
│   ├── background.ts      # Service worker (alertes SOS temps réel)
│   ├── supabaseClient.ts  # Client Supabase pour l'extension
│   ├── main.tsx           # Point d'entrée du popup
│   └── options-main.tsx   # Point d'entrée de la page d'options
├── index.html             # HTML du popup
├── options.html           # HTML de la page d'options
├── manifest.json          # Manifest Chrome v3
├── vite.config.ts         # Config Vite (popup + options)
├── vite.background.config.ts  # Config Vite (service worker)
└── package.json
```

---

## ⚙️ Configuration

L'extension se connecte automatiquement au backend CityHealth. Aucune clé API supplémentaire n'est requise côté utilisateur.

Pour modifier l'URL de l'application principale, éditez la constante `APP_URL` dans `src/Popup.tsx`.

---

## 📝 Utilisation

1. **Connectez-vous** avec vos identifiants CityHealth
2. **Consultez votre carte d'urgence** (groupe sanguin, allergies…)
3. **Recherchez** un professionnel de santé
4. **Recevez des alertes SOS** de don de sang en temps réel
5. **Personnalisez** vos notifications via l'icône ⚙️ → Options

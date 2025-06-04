# Plan Panda 🐼 - Todo PWA

Ein modernes, cloud-synchronisiertes Task-Management System mit dem süßen Plan Panda als Maskottchen!

## 🚀 Features

### ✅ Implementiert
- **Multi-User Authentifizierung** (Google + Email/Password)
- **Echtzeit-Synchronisation** mit Firebase Firestore
- **Progressive Web App (PWA)** - Installierbar auf allen Geräten
- **Drag & Drop** Aufgaben-Sortierung
- **Prioritäts-System** (Niedrig, Medium, Hoch)
- **Listen-Management** mit Sharing-Funktionen
- **Vollständige Icon-Suite** für alle Plattformen
- **Responsive Design** für Mobile + Desktop
- **Offline-Fähigkeiten** durch Service Worker

### 📱 PWA Features
- Installierbar auf iOS, Android & Desktop
- Offline-Funktionalität
- Native App-Gefühl
- Push-Benachrichtigungen (vorbereitet)

### 🔧 Technologie-Stack
- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS
- **Backend**: Firebase (Auth + Firestore)
- **PWA**: Service Worker + Web App Manifest
- **Icons**: Vollständige Favicon + PWA Icon Suite

## 🎨 Plan Panda Icons

Alle Icons sind optimiert für:
- **Favicon**: `favicon.ico`, `favicon-16x16.png`, `favicon-32x32.png`
- **PWA**: `icon-192.png`, `icon-512.png`
- **iOS**: `apple-touch-icon.png`
- **Android**: `android-chrome-192x192.png`, `android-chrome-512x512.png`

## 🚀 Deployment

### Netlify (empfohlen)
```bash
# Build the app
npm run build

# Deploy to Netlify
# - Verbinde dein GitHub Repository
# - Build Command: npm run build
# - Publish Directory: dist
```

### Firebase Environment Variables
Erstelle eine `.env` Datei:
```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

## 🐼 Über Plan Panda

Plan Panda macht Produktivität süß! Mit dem freundlichen Panda-Maskottchen und dem grünen Häkchen wird Task-Management zum Vergnügen.

### Design-Philosophie
- **Einfach**: Intuitive Bedienung ohne Lernkurve
- **Süß**: Plan Panda macht Aufgaben angenehmer
- **Effizient**: Fokus auf Produktivität ohne Ablenkung
- **Modern**: Neueste Web-Technologien für beste Performance

## 📝 Lizenz

MIT License - siehe [LICENSE.txt](LICENSE.txt)

---

Entwickelt mit ❤️ und 🐼 für bessere Produktivität!

## Getting Started

### Prerequisites

- Node.js (v16 or later)
- npm or yarn

### Installation

1. Clone the repository

   ```bash
   git clone https://github.com/your-username/tasky-pwa.git
   cd tasky-pwa
   ```

2. Install dependencies

   ```bash
   npm install
   # or
   yarn
   ```

3. Start the development server

   ```bash
   npm run dev
   # or
   yarn dev
   ```

4. Open your browser and navigate to `http://localhost:5173`

### Building for Production

```bash
npm run build
# or
yarn build
```

This will create a production-ready build in the `dist` directory.

## PWA Features

- **Offline Support**: Works without an internet connection
- **Installable**: Can be installed on your device's home screen
- **Fast**: Loads quickly, even on slow networks
- **Reliable**: Automatically caches assets for faster loading

## Technologies Used

- [React](https://reactjs.org/) - A JavaScript library for building user interfaces
- [TypeScript](https://www.typescriptlang.org/) - Typed JavaScript
- [Vite](https://vitejs.dev/) - Next Generation Frontend Tooling
- [Tailwind CSS](https://tailwindcss.com/) - A utility-first CSS framework
- [React Router](https://reactrouter.com/) - Declarative routing for React
- [idb](https://github.com/jakearchibald/idb) - A tiny library that mostly mirrors the IndexedDB API
- [date-fns](https://date-fns.org/) - Modern JavaScript date utility library

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE.txt) file for details.
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default tseslint.config({
  plugins: {
    // Add the react-x and react-dom plugins
    'react-x': reactX,
    'react-dom': reactDom,
  },
  rules: {
    // other rules...
    // Enable its recommended typescript rules
    ...reactX.configs['recommended-typescript'].rules,
    ...reactDom.configs.recommended.rules,
  },
})
```
# todo

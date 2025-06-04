# Microsoft To-Do Style PWA

Ein modernes, reaktionsfähiges To-Do-Management-System, inspiriert von Microsoft To-Do, entwickelt mit React, TypeScript und Vite.

## ✨ Features

### 🔥 **KOMPLETT IMPLEMENTIERT:**
- ✅ **Firebase Authentication** (Google + Email/Password)
- ✅ **Real-time Firestore Database** 
- ✅ **List Sharing System** mit Email-Einladungen
- ✅ **In-App Notifications** - Sofortige Benachrichtigungen für Einladungen
- ✅ **Real-time Task Counts** - Live Updates der Task-Anzahl
- ✅ **Responsive Design** - Perfekt auf Desktop & Mobile
- ✅ **PWA Ready** - Installierbar als App
- ✅ **Netlify Deployment** - Live im Web

### 🎯 **Microsoft To-Do Features:**
- **Mein Tag** - Heute fällige Aufgaben
- **Listen Management** - Erstellen, Bearbeiten, Löschen
- **Task Management** - Vollständige CRUD-Operationen
- **Kategorien & Listen** - Organisierte Struktur
- **Dark Theme** - Moderne UI

### 🔔 **In-App Invitation System:**
- **Notification Bell** mit roter Badge
- **InvitationsModal** mit Annehmen/Ablehnen
- **Real-time Updates** zwischen Usern
- **Sofortige Liste-Navigation** nach Annahme

## 🚀 Live Demo

**🌐 https://todoopwa.netlify.app**

## 💻 Technologie-Stack

- **Frontend:** React 18 + TypeScript + Vite
- **Styling:** TailwindCSS
- **Backend:** Firebase (Auth + Firestore)
- **Deployment:** Netlify
- **PWA:** Service Worker + Manifest

## 🎉 Status: **DONE LIKE DINNER!** 

Das komplette Microsoft To-Do System ist **funktional** und **produktionsbereit**! 🚀

---

*Entwickelt mit ❤️ - Alle Features implementiert und getestet*

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

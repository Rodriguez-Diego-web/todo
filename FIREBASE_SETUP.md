# 🔥 Firebase Setup für Todo-PWA

## 1. Firebase Projekt erstellen

1. Gehe zu [Firebase Console](https://console.firebase.google.com/)
2. Klicke auf "Projekt hinzufügen"
3. Gib einen Projektnamen ein (z.B. "todo-pwa-[deinname]")
4. Deaktiviere Google Analytics (nicht nötig für dieses Projekt)
5. Klicke auf "Projekt erstellen"

## 2. Web-App hinzufügen

1. Klicke auf das Web-Icon (`</>`) im Firebase-Dashboard
2. Gib einen App-Namen ein (z.B. "Todo PWA")
3. **Aktiviere "Firebase Hosting für diese App einrichten"** ✅
4. Klicke auf "App registrieren"
5. **Kopiere die Firebase-Konfiguration** (wichtig!)

## 3. Authentication einrichten

1. Gehe zu "Authentication" → "Get started"
2. Klicke auf "Sign-in method"
3. Aktiviere diese Anbieter:
   - **E-Mail/Passwort** ✅
   - **Google** ✅ (Domain autorisieren!)

### Google OAuth Setup:
- Klicke auf Google → Bearbeiten
- Aktiviere den Anbieter
- Wähle deine Support-E-Mail
- Füge deine Domain hinzu (später auch deine Netlify-Domain)

## 4. Firestore Database einrichten

1. Gehe zu "Firestore Database" → "Datenbank erstellen"
2. **Wähle "Testmodus starten"** (für 30 Tage öffentlich)
3. Wähle eine Region (am besten Europe)
4. Klicke auf "Fertig"

### Sicherheitsregeln später anpassen:
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users können nur ihre eigenen Daten lesen/schreiben
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Listen - Benutzer können eigene Listen und geteilte Listen lesen
    match /lists/{listId} {
      allow read, write: if request.auth != null && 
        (resource.data.createdBy == request.auth.uid ||
         resource.data.sharedWith.hasAny([request.auth.uid]));
      allow create: if request.auth != null;
    }
    
    // Tasks - Nur für Listen mit Berechtigung
    match /tasks/{taskId} {
      allow read, write: if request.auth != null && 
        (resource.data.createdBy == request.auth.uid ||
         get(/databases/$(database)/documents/lists/$(resource.data.listId)).data.sharedWith.hasAny([request.auth.uid]) ||
         get(/databases/$(database)/documents/lists/$(resource.data.listId)).data.createdBy == request.auth.uid);
      allow create: if request.auth != null;
    }
    
    // Einladungen
    match /invitations/{invitationId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null;
      allow update: if request.auth != null && 
        resource.data.inviteeEmail == request.auth.token.email;
    }
    
    // List Permissions
    match /listPermissions/{docId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null;
    }
  }
}
```

## 5. Environment Variables einrichten

Erstelle eine `.env` Datei im Projektordner mit deiner Firebase-Konfiguration:

```env
# Firebase Configuration (aus Schritt 2)
VITE_FIREBASE_API_KEY=AIzaSy...
VITE_FIREBASE_AUTH_DOMAIN=dein-projekt.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=dein-projekt-id
VITE_FIREBASE_STORAGE_BUCKET=dein-projekt.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abcdef...
```

## 6. App testen

```bash
npm run dev
```

Die App sollte jetzt:
- ✅ Authentication Modal zeigen
- ✅ Google Login funktionieren
- ✅ E-Mail/Passwort Registrierung funktionieren
- ✅ Daten in Firestore speichern

## 7. Netlify Deployment

1. **Build erstellen:**
   ```bash
   npm run build
   ```

2. **Netlify Setup:**
   - Gehe zu [netlify.com](https://netlify.com)
   - Verbinde dein GitHub Repository
   - Build Command: `npm run build`
   - Publish Directory: `dist`

3. **Environment Variables in Netlify:**
   - Gehe zu Site Settings → Environment Variables
   - Füge alle VITE_FIREBASE_* Variablen hinzu

4. **Firebase Auth Domain Update:**
   - Gehe zu Firebase Authentication → Settings
   - Füge deine Netlify-Domain zu den autorisierten Domains hinzu

## 🚀 Live Features

Nach dem Setup hast du:
- ✅ **Multi-User Authentication**
- ✅ **Realtime Synchronisation**
- ✅ **Liste teilen** (über E-Mail-Einladungen)
- ✅ **Offline-Support** (PWA)
- ✅ **Live Deployment**

## 🔧 Nächste Schritte

1. **E-Mail-Einladungen**: Firebase Functions für E-Mail-Versand
2. **Push-Notifications**: Firebase Cloud Messaging
3. **Advanced Sharing**: QR-Codes, Links
4. **Collaboration**: Live-Cursors, Kommentare

Brauchst du Hilfe bei einem der Schritte? 🤔 
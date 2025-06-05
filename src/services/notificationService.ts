import { db } from '../config/firebase';
import { doc, updateDoc, getDoc } from 'firebase/firestore';

// Erweiterte Navigator-Schnittstelle für Badge-API
interface ExtendedNavigator {
  setAppBadge?: (count: number) => Promise<void>;
  clearAppBadge?: () => Promise<void>;
}

class NotificationService {
  private readonly _isSupported: boolean;

  constructor() {
    this._isSupported = 'Notification' in window && 'serviceWorker' in navigator;
  }

  /**
   * Prüft, ob Benachrichtigungen unterstützt werden
   */
  get isSupported(): boolean {
    return this._isSupported;
  }

  /**
   * Gibt den aktuellen Benachrichtigungsstatus zurück
   */
  get permission(): NotificationPermission | null {
    return this._isSupported ? Notification.permission : null;
  }

  /**
   * Fordert Berechtigung für Benachrichtigungen an
   */
  async requestPermission(): Promise<boolean> {
    if (!this._isSupported) return false;

    // Wenn bereits berechtigt, nichts tun
    if (Notification.permission === 'granted') return true;
    
    // Wenn bereits abgelehnt, nichts tun
    if (Notification.permission === 'denied') return false;

    try {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    } catch (error) {
      console.error('Fehler beim Anfordern der Benachrichtigungsberechtigung:', error);
      return false;
    }
  }

  /**
   * Sendet eine Benachrichtigung
   */
  async showNotification(title: string, options: NotificationOptions = {}): Promise<boolean> {
    if (!this._isSupported || Notification.permission !== 'granted') return false;

    try {
      // Standard-Optionen setzen
      const defaultOptions: NotificationOptions = {
        icon: '/logo.png',
        badge: '/favicon-32x32.png',
        silent: false,
        requireInteraction: false,
        ...options
      };

      // Service Worker-Registrierung abrufen
      const registration = await navigator.serviceWorker.ready;
      
      // Benachrichtigung anzeigen
      await registration.showNotification(title, defaultOptions);
      
      // Badge-Anzeige (falls unterstützt)
      await this.updateBadge(1);
      
      return true;
    } catch (error) {
      console.error('Fehler beim Anzeigen der Benachrichtigung:', error);
      return false;
    }
  }

  /**
   * Aktualisiert den Badge-Zähler
   */
  async updateBadge(count: number): Promise<boolean> {
    const nav = navigator as unknown as ExtendedNavigator;
    
    if (!nav.setAppBadge) return false;

    try {
      if (count > 0) {
        await nav.setAppBadge(count);
      } else if (nav.clearAppBadge) {
        await nav.clearAppBadge();
      }
      return true;
    } catch (error) {
      console.warn('Badge-API nicht unterstützt:', error);
      return false;
    }
  }

  /**
   * Löscht den Badge-Zähler
   */
  async clearBadge(): Promise<boolean> {
    const nav = navigator as unknown as ExtendedNavigator;
    
    if (!nav.clearAppBadge) return false;

    try {
      await nav.clearAppBadge();
      return true;
    } catch (error) {
      console.warn('Badge-API nicht unterstützt:', error);
      return false;
    }
  }

  /**
   * Speichert die Notification-Einstellungen des Benutzers
   */
  async saveUserNotificationSettings(userId: string, enabled: boolean): Promise<void> {
    const userRef = doc(db, 'users', userId);
    
    try {
      // Prüfen, ob das Dokument existiert
      const userDoc = await getDoc(userRef);
      if (userDoc.exists()) {
        await updateDoc(userRef, {
          notificationsEnabled: enabled,
          notificationSettings: {
            taskReminders: enabled,
            invitations: enabled,
            listUpdates: enabled,
            updatedAt: new Date()
          }
        });
      }
    } catch (error) {
      console.error('Fehler beim Speichern der Benachrichtigungseinstellungen:', error);
      throw error;
    }
  }
}

export const notificationService = new NotificationService(); 
import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { notificationService } from '../services/notificationService';

interface NotificationSettingsProps {
  isOpen: boolean;
  onClose: () => void;
}

export function NotificationSettings({ isOpen, onClose }: NotificationSettingsProps) {
  const { currentUser, userProfile } = useAuth();
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [taskReminders, setTaskReminders] = useState(true);
  const [invitations, setInvitations] = useState(true);
  const [listUpdates, setListUpdates] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [permissionStatus, setPermissionStatus] = useState<NotificationPermission | null>(null);

  // Initialisierung
  useEffect(() => {
    if (isOpen) {
      setPermissionStatus(notificationService.permission);
      
      // Vorhandene Einstellungen laden
      if (userProfile?.notificationSettings) {
        setNotificationsEnabled(!!userProfile.notificationsEnabled);
        setTaskReminders(!!userProfile.notificationSettings.taskReminders);
        setInvitations(!!userProfile.notificationSettings.invitations);
        setListUpdates(!!userProfile.notificationSettings.listUpdates);
      }
    }
  }, [isOpen, userProfile]);

  // Benachrichtigungsberechtigung anfordern
  const handleRequestPermission = async () => {
    setIsLoading(true);
    try {
      const granted = await notificationService.requestPermission();
      setPermissionStatus(Notification.permission);
      setNotificationsEnabled(granted);
      
      if (granted) {
        // Test-Benachrichtigung senden
        await notificationService.showNotification('Benachrichtigungen aktiviert', {
          body: 'Du wirst nun über wichtige Ereignisse informiert.'
        });
      }
      
      // Einstellungen speichern, wenn der Benutzer angemeldet ist
      if (currentUser) {
        await saveSettings(granted);
      }
    } catch (error) {
      console.error('Fehler beim Anfordern der Berechtigung:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Einstellungen speichern
  const saveSettings = async (enabled = notificationsEnabled) => {
    if (!currentUser) return;
    
    setIsLoading(true);
    try {
      await notificationService.saveUserNotificationSettings(currentUser.uid, enabled);
      
      // Test-Benachrichtigung, wenn Einstellungen geändert werden
      if (enabled && permissionStatus === 'granted') {
        await notificationService.showNotification('Einstellungen gespeichert', {
          body: 'Deine Benachrichtigungseinstellungen wurden aktualisiert.'
        });
      }
    } catch (error) {
      console.error('Fehler beim Speichern der Einstellungen:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-theme-primary rounded-lg w-full max-w-md border border-theme-primary">
        <div className="flex items-center justify-between p-6 border-b border-theme-primary">
          <h3 className="text-lg font-semibold text-theme-primary">
            Benachrichtigungseinstellungen
          </h3>
          <button 
            onClick={onClose}
            className="p-1 hover:bg-theme-secondary rounded"
          >
            <svg className="w-5 h-5 text-theme-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="p-6 space-y-6">
          {/* Benachrichtigungsstatus */}
          <div className="bg-theme-secondary bg-opacity-20 p-4 rounded-lg">
            <div className="flex items-center gap-3 mb-2">
              <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-3-3V9a5 5 0 00-10 0v5l-3 3h5m6 0v1a3 3 0 01-6 0v-1m6 0H9" />
              </svg>
              <h4 className="text-lg font-medium text-theme-primary">Benachrichtigungen</h4>
            </div>
            
            {permissionStatus === 'granted' ? (
              <p className="text-sm text-green-500">
                Benachrichtigungen sind aktiviert.
              </p>
            ) : permissionStatus === 'denied' ? (
              <div>
                <p className="text-sm text-red-500 mb-2">
                  Benachrichtigungen sind blockiert. Bitte aktiviere sie in deinen Browsereinstellungen.
                </p>
                <a 
                  href="https://support.google.com/chrome/answer/3220216"
                  target="_blank"
                  rel="noopener noreferrer" 
                  className="text-xs text-blue-500 hover:underline"
                >
                  Wie aktiviere ich Benachrichtigungen?
                </a>
              </div>
            ) : (
              <div>
                <p className="text-sm text-theme-secondary mb-3">
                  Aktiviere Benachrichtigungen, um über neue Aufgaben, Einladungen und Erinnerungen informiert zu werden.
                </p>
                <button
                  onClick={handleRequestPermission}
                  disabled={isLoading}
                  className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition-colors text-sm"
                >
                  {isLoading ? 'Wird aktiviert...' : 'Benachrichtigungen aktivieren'}
                </button>
              </div>
            )}
          </div>
          
          {/* Einstellungen (nur anzeigen, wenn Benachrichtigungen aktiviert sind) */}
          {permissionStatus === 'granted' && (
            <>
              <div className="border-t border-theme-primary pt-4">
                <h4 className="text-sm font-medium text-theme-primary mb-4">
                  Benachrichtigungseinstellungen
                </h4>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <label htmlFor="all-notifications" className="text-theme-primary">
                      Alle Benachrichtigungen
                    </label>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        id="all-notifications"
                        type="checkbox" 
                        checked={notificationsEnabled}
                        onChange={(e) => {
                          setNotificationsEnabled(e.target.checked);
                          saveSettings(e.target.checked);
                        }}
                        className="sr-only peer" 
                      />
                      <div className="w-11 h-6 bg-gray-700 peer-focus:ring-2 peer-focus:ring-blue-600 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <label htmlFor="task-reminders" className="text-theme-primary">
                      Aufgabenerinnerungen
                    </label>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        id="task-reminders"
                        type="checkbox" 
                        checked={taskReminders && notificationsEnabled}
                        onChange={(e) => setTaskReminders(e.target.checked)}
                        disabled={!notificationsEnabled}
                        className="sr-only peer" 
                      />
                      <div className={`w-11 h-6 bg-gray-700 peer-focus:ring-2 peer-focus:ring-blue-600 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600 ${!notificationsEnabled ? 'opacity-50' : ''}`}></div>
                    </label>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <label htmlFor="invitations" className="text-theme-primary">
                      Neue Einladungen
                    </label>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        id="invitations"
                        type="checkbox" 
                        checked={invitations && notificationsEnabled}
                        onChange={(e) => setInvitations(e.target.checked)}
                        disabled={!notificationsEnabled}
                        className="sr-only peer" 
                      />
                      <div className={`w-11 h-6 bg-gray-700 peer-focus:ring-2 peer-focus:ring-blue-600 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600 ${!notificationsEnabled ? 'opacity-50' : ''}`}></div>
                    </label>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <label htmlFor="list-updates" className="text-theme-primary">
                      Listenaktualisierungen
                    </label>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        id="list-updates"
                        type="checkbox" 
                        checked={listUpdates && notificationsEnabled}
                        onChange={(e) => setListUpdates(e.target.checked)}
                        disabled={!notificationsEnabled}
                        className="sr-only peer" 
                      />
                      <div className={`w-11 h-6 bg-gray-700 peer-focus:ring-2 peer-focus:ring-blue-600 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600 ${!notificationsEnabled ? 'opacity-50' : ''}`}></div>
                    </label>
                  </div>
                </div>
              </div>
              
              <div className="pt-4">
                <button
                  onClick={() => saveSettings()}
                  disabled={isLoading}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition-colors"
                >
                  {isLoading ? 'Speichern...' : 'Einstellungen speichern'}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
} 
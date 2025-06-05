import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ProfileModal({ isOpen, onClose }: ProfileModalProps) {
  const { currentUser, userProfile, updateUserProfile } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [profilePicture, setProfilePicture] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Initialisiere das Formular mit den aktuellen Benutzerdetails
  useEffect(() => {
    if (userProfile) {
      setName(userProfile.name || '');
      setEmail(currentUser?.email || '');
      setProfilePicture(userProfile.avatar || null);
    }
  }, [userProfile, currentUser]);

  // Generiere Initialen aus dem Namen
  const generateInitials = (fullName: string) => {
    return fullName
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentUser) return;
    
    setIsLoading(true);
    setError(null);
    setSuccess(false);
    
    try {
      const initials = generateInitials(name);
      
      await updateUserProfile({
        name,
        initials,
        avatar: profilePicture || undefined
      });
      
      setSuccess(true);
      setTimeout(() => {
        onClose();
        setSuccess(false);
      }, 1500);
    } catch (err) {
      setError('Fehler beim Aktualisieren des Profils.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleGoogleProfileImport = async () => {
    if (!currentUser?.providerData.some(p => p.providerId === 'google.com')) {
      setError('Du bist nicht mit Google angemeldet.');
      return;
    }
    
    setIsLoading(true);
    try {
      // Abrufen der Benutzerdaten von Firebase Auth
      const googleUser = currentUser.providerData.find(p => p.providerId === 'google.com');
      if (googleUser) {
        if (googleUser.displayName) setName(googleUser.displayName);
        if (googleUser.photoURL) setProfilePicture(googleUser.photoURL);
      }
    } catch (err) {
      setError('Fehler beim Importieren der Google-Daten.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-theme-primary rounded-lg w-full max-w-md border border-theme-primary overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-theme-primary">
          <h3 className="text-lg font-semibold text-theme-primary">
            Profil bearbeiten
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
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Profilbild / Initialen */}
          <div className="flex flex-col items-center mb-6">
            {profilePicture ? (
              <img 
                src={profilePicture} 
                alt="Profilbild" 
                className="w-24 h-24 rounded-full object-cover mb-2"
              />
            ) : (
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#0078d4] to-[#4cc2ff] flex items-center justify-center text-white font-bold text-2xl mb-2">
                {generateInitials(name || 'U')}
              </div>
            )}
            
            {currentUser?.providerData.some(p => p.providerId === 'google.com') && (
              <button
                type="button"
                onClick={handleGoogleProfileImport}
                className="text-xs text-blue-500 hover:underline mt-2"
                disabled={isLoading}
              >
                Google-Profil importieren
              </button>
            )}
          </div>
          
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-theme-secondary mb-2">
              Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="ms-input"
              placeholder="Dein Name"
              required
            />
          </div>
          
          {/* E-Mail (nur Anzeige) */}
          <div>
            <label className="block text-sm font-medium text-theme-secondary mb-2">
              E-Mail
            </label>
            <input
              type="email"
              value={email}
              readOnly
              className="ms-input opacity-70"
              disabled
            />
            <p className="text-xs text-theme-secondary mt-1">
              Die E-Mail-Adresse kann nicht geändert werden.
            </p>
          </div>
          
          {/* Status-Meldungen */}
          {error && (
            <div className="bg-red-900/20 text-red-400 p-3 rounded-lg text-sm">
              {error}
            </div>
          )}
          
          {success && (
            <div className="bg-green-900/20 text-green-400 p-3 rounded-lg text-sm">
              Profil erfolgreich aktualisiert!
            </div>
          )}
          
          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 ms-button-secondary"
              disabled={isLoading}
            >
              Abbrechen
            </button>
            <button 
              type="submit"
              disabled={isLoading}
              className="flex-1 ms-button-primary"
            >
              {isLoading ? 'Speichern...' : 'Speichern'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 
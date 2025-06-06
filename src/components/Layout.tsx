import { useState, useEffect } from 'react';
import { Outlet, useLocation, useParams, useNavigate } from 'react-router-dom';
import { ListSidebar } from './ListSidebar';
import { useAuth } from '../contexts/AuthContext';
import { InvitationsModal } from './InvitationsModal';
import { SearchModal } from './SearchModal';
import { ProfileModal } from './ProfileModal';
import { NotificationSettings } from './NotificationSettings';
import { useInvitations } from '../hooks/useInvitations';
import { useSplashScreens } from '../hooks/useSplashScreens';
import { useLists } from '../hooks/useLists';
import { getListColor } from '../config/colors';
import { useTheme } from '../hooks/useTheme';

export function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [invitationsOpen, setInvitationsOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const { userProfile, signOut } = useAuth();
  const { invitations } = useInvitations();
  const { resetSplashScreens } = useSplashScreens();
  const location = useLocation();
  const { listId } = useParams();
  const navigate = useNavigate();
  const { lists } = useLists();
  const { isDarkMode } = useTheme();
  
  // Keyboard shortcut for search (Cmd/Ctrl + K)
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key === 'k') {
        event.preventDefault();
        setSearchOpen(true);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleShowOnboarding = () => {
    resetSplashScreens();
    // Reload the page to show onboarding again
    window.location.reload();
  };

  const NotificationBell = () => (
    <button
      onClick={() => setInvitationsOpen(true)}
      className="relative p-2 hover:bg-theme-secondary rounded-lg transition-colors"
      title="Einladungen"
    >
      <svg className="w-5 h-5 text-theme-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-3-3V9a5 5 0 00-10 0v5l-3 3h5m6 0v1a3 3 0 01-6 0v-1m6 0H9" />
        </svg>
      {invitations.length > 0 && (
        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
          {invitations.length}
        </span>
      )}
    </button>
  );

  const SearchButton = () => (
    <button
      onClick={() => setSearchOpen(true)}
      className="p-2 hover:bg-theme-secondary rounded-lg transition-colors"
      title="Suchen (⌘K / Ctrl+K)"
    >
      <svg className="w-5 h-5 text-theme-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
    </button>
  );
  
  const ShareButton = () => {
    // Nur anzeigen, wenn wir auf einer Listenseite sind
    if (!listId) return null;
    
    return (
      <button
        onClick={() => navigate(`/list/${listId}?share=true`)}
        className="p-2 hover:bg-theme-secondary rounded-lg transition-colors"
        title="Personen einladen"
      >
        <svg className="w-5 h-5 text-theme-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      </button>
    );
  };
  
  // Bestimme die aktuelle Seite basierend auf dem Pfad
  const currentPage = location.pathname === '/' ? 'home' : 
                      location.pathname.startsWith('/list/') ? 'list' : null;
  
  // Finde den aktuellen Listenamen, wenn wir auf einer Listenseite sind
  const currentList = lists.find(list => list.id === listId);
  const pageTitle = currentPage === 'home' ? 'Startseite' : 
                   currentPage === 'list' && currentList ? currentList.name : '';
  
  return (
    <div className="h-full bg-theme-primary flex flex-col md:flex-row">
      {/* Mobile header */}
      <header className="md:hidden bg-theme-primary border-b border-theme-primary px-4 pb-4 pt-[calc(1rem+env(safe-area-inset-top))] flex items-center justify-between sticky top-0 z-30 shadow-lg">
        <button 
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 rounded-lg hover:bg-theme-secondary transition-colors"
          aria-label="Toggle menu"
        >
          <svg className="w-5 h-5 text-theme-primary" viewBox="0 0 24 24" fill="currentColor">
            <path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z" />
          </svg>
        </button>
        <h1 className="text-lg font-semibold text-theme-primary">Plan Panda</h1>
        <div className="flex items-center gap-2">
          <SearchButton />
          <ShareButton />
        </div>
      </header>
      
      {/* Sidebar - Mobile */}
      <div className={`fixed inset-0 z-40 md:hidden ${sidebarOpen ? 'block' : 'hidden'}`}>
        <div 
          className="fixed inset-0 bg-black bg-opacity-50"
          onClick={() => setSidebarOpen(false)}
        ></div>
        <div className="fixed inset-y-0 left-0 w-80 bg-theme-primary shadow-2xl transform transition-transform duration-300 ease-in-out flex flex-col pt-safe-top">
          {/* User Profile */}
          <div className="ms-user-profile justify-between flex-shrink-0">
            <div className="ms-user-avatar">
              {userProfile?.initials || 'U'}
            </div>
            <div className="flex items-center gap-2">
              <SearchButton />
              <NotificationBell />
              <button
                onClick={handleSignOut}
                className="p-2 hover:bg-theme-secondary rounded-lg transition-colors"
                title="Abmelden"
              >
                <svg className="w-5 h-5 text-theme-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-6 0v-1m6 0H9" />
                </svg>
              </button>
            </div>
          </div>
          
          {/* Content area with lists and buttons */}
          <div className="flex flex-col flex-1 overflow-hidden">
            {/* Lists section with scrolling */}
            <div className="overflow-y-auto flex-1">
              <div className="px-4 py-2">
                <h2 className="text-xs font-semibold text-theme-secondary uppercase tracking-wider">Meine Listen</h2>
                </div>
            
              <ListSidebar onNavigate={() => setSidebarOpen(false)} />
            </div>
            
            {/* Settings/Actions - fixed section */}
            <div className="flex-shrink-0 border-t border-theme-primary">
              <button
                onClick={handleShowOnboarding}
                className="w-full flex items-center gap-3 px-4 py-3 text-theme-secondary hover:text-theme-primary hover:bg-theme-secondary rounded-lg transition-colors text-sm"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Onboarding anzeigen
              </button>
              
              <button
                onClick={() => setProfileOpen(true)}
                className="w-full flex items-center gap-3 px-4 py-3 text-theme-secondary hover:text-theme-primary hover:bg-theme-secondary rounded-lg transition-colors text-sm"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Profil bearbeiten
              </button>
              
              <button
                onClick={() => setNotificationsOpen(true)}
                className="w-full flex items-center gap-3 px-4 py-3 text-theme-secondary hover:text-theme-primary hover:bg-theme-secondary rounded-lg transition-colors text-sm"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-3-3V9a5 5 0 00-10 0v5l-3 3h5m6 0v1a3 3 0 01-6 0v-1m6 0H9" />
                </svg>
                Benachrichtigungen
              </button>
            </div>
          </div>
          
          {/* Logo - fixed at bottom */}
          <div className="flex-shrink-0 border-t border-theme-primary">
            <div className="flex justify-center p-4">
              <img 
                src={isDarkMode ? '/logoweiss.png' : '/logoschwarz.png'} 
                alt="Plan Panda Logo" 
                className="h-20"
              />
            </div>
          </div>
        </div>
      </div>
      
      {/* Sidebar - Desktop */}
      <div className="hidden md:flex md:w-80 bg-theme-primary border-r border-theme-primary flex-col shadow-lg">
        {/* User Profile */}
        <div className="ms-user-profile justify-between flex-shrink-0">
          <div className="ms-user-avatar">
            {userProfile?.initials || 'U'}
          </div>
          <div className="flex items-center gap-2">
            <SearchButton />
            <NotificationBell />
            <button
              onClick={handleSignOut}
              className="p-2 hover:bg-theme-secondary rounded-lg transition-colors"
              title="Abmelden"
            >
              <svg className="w-5 h-5 text-theme-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          </div>
        </div>
        
        {/* Content area with lists and buttons */}
        <div className="flex flex-col flex-1 overflow-hidden">
          {/* Lists section with scrolling */}
          <div className="overflow-y-auto flex-1">
            <div className="px-4 py-2">
              <h2 className="text-xs font-semibold text-theme-secondary uppercase tracking-wider">Meine Listen</h2>
            </div>
            
            <ListSidebar onNavigate={() => setSidebarOpen(false)} />
          </div>
          
          {/* Settings/Actions - fixed section */}
          <div className="flex-shrink-0 border-t border-theme-primary">
            <button
              onClick={handleShowOnboarding}
              className="w-full flex items-center gap-3 px-4 py-3 text-theme-secondary hover:text-theme-primary hover:bg-theme-secondary rounded-lg transition-colors text-sm"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Onboarding anzeigen
            </button>
            
            <button
              onClick={() => setProfileOpen(true)}
              className="w-full flex items-center gap-3 px-4 py-3 text-theme-secondary hover:text-theme-primary hover:bg-theme-secondary rounded-lg transition-colors text-sm"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              Profil bearbeiten
            </button>
            
            <button
              onClick={() => setNotificationsOpen(true)}
              className="w-full flex items-center gap-3 px-4 py-3 text-theme-secondary hover:text-theme-primary hover:bg-theme-secondary rounded-lg transition-colors text-sm"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-3-3V9a5 5 0 00-10 0v5l-3 3h5m6 0v1a3 3 0 01-6 0v-1m6 0H9" />
              </svg>
              Benachrichtigungen
            </button>
          </div>
              </div>
        
        {/* Logo - fixed at bottom */}
        <div className="flex-shrink-0 border-t border-theme-primary">
          <div className="flex justify-center p-4">
            <img 
              src={isDarkMode ? '/logoweiss.png' : '/logoschwarz.png'} 
              alt="Plan Panda Logo" 
              className="h-20"
            />
          </div>
        </div>
      </div>
      
      {/* Main content */}
      <main className="flex-1 flex flex-col min-h-0">
        {/* Page Indicator Bar */}
        <div className="bg-theme-secondary p-4 border-b border-theme-primary flex items-center relative">
          {currentPage && (
            <div 
              className="page-indicator h-full absolute left-0 top-0"
              style={{ 
                height: '100%',
                backgroundColor: currentPage === 'list' && currentList?.color 
                  ? getListColor(currentList.color).value 
                  : '#3b82f6',
                width: '4px'
              }}
            />
          )}
          <h1 className="text-xl font-semibold text-theme-primary ml-3">{pageTitle}</h1>
        </div>
        
        <Outlet />
      </main>

      {/* Modals */}
      <InvitationsModal 
        isOpen={invitationsOpen} 
        onClose={() => setInvitationsOpen(false)} 
      />
      
      <SearchModal
        isOpen={searchOpen}
        onClose={() => setSearchOpen(false)}
      />
      
      <ProfileModal 
        isOpen={profileOpen}
        onClose={() => setProfileOpen(false)}
      />

      <NotificationSettings
        isOpen={notificationsOpen}
        onClose={() => setNotificationsOpen(false)}
      />
    </div>
  );
}

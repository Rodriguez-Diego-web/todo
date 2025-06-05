import { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { ListSidebar } from './ListSidebar';
import { useAuth } from '../contexts/AuthContext';
import { InvitationsModal } from './InvitationsModal';
import { SearchModal } from './SearchModal';
import { useInvitations } from '../hooks/useInvitations';
import { useSplashScreens } from '../hooks/useSplashScreens';
import React from 'react';

export function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [invitationsOpen, setInvitationsOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const { userProfile, signOut } = useAuth();
  const { invitations } = useInvitations();
  const { resetSplashScreens } = useSplashScreens();
  
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
      className="relative p-2 hover:bg-gray-800 rounded-lg transition-colors"
      title="Einladungen"
    >
      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
      className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
      title="Suchen (⌘K / Ctrl+K)"
    >
      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
    </button>
  );
  
  return (
    <div className="h-full bg-black flex flex-col md:flex-row">
      {/* Mobile header */}
      <header className="md:hidden bg-black border-b border-gray-800 px-4 pb-4 pt-[calc(1rem+env(safe-area-inset-top))] flex items-center justify-between sticky top-0 z-30 shadow-lg">
        <button 
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 rounded-lg hover:bg-gray-800 transition-colors"
          aria-label="Toggle menu"
        >
          <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
            <path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z" />
          </svg>
        </button>
        <h1 className="text-lg font-semibold text-white">Plan Panda</h1>
        <div className="flex items-center gap-2">
          <SearchButton />
          <NotificationBell />
          <button
            onClick={handleSignOut}
            className="p-2 rounded-lg hover:bg-gray-800 transition-colors"
            title="Abmelden"
          >
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </button>
        </div>
      </header>
      
      {/* Sidebar - Mobile */}
      <div className={`fixed inset-0 z-40 md:hidden ${sidebarOpen ? 'block' : 'hidden'}`}>
        <div 
          className="fixed inset-0 bg-black bg-opacity-50"
          onClick={() => setSidebarOpen(false)}
        ></div>
        <div className="fixed inset-y-0 left-0 w-80 bg-black shadow-2xl transform transition-transform duration-300 ease-in-out flex flex-col pt-safe-top">
          {/* User Profile */}
          <div className="ms-user-profile">
            <div className="ms-user-avatar">
              {userProfile?.initials || 'U'}
            </div>
            <div className="flex-1">
              <h3 className="font-medium text-white">{userProfile?.name || 'User'}</h3>
            </div>
            <div className="flex items-center gap-2">
              <SearchButton />
              <NotificationBell />
              <button
                onClick={handleSignOut}
                className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
                title="Abmelden"
              >
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </button>
            </div>
          </div>
          
          {/* Lists */}
          <nav className="flex-1 overflow-y-auto py-2">
            <div className="px-4 py-2">
              <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Meine Listen</h2>
            </div>
            
            <ListSidebar onNavigate={() => setSidebarOpen(false)} />
            
            {/* Settings/Actions */}
            <div className="mt-auto pt-4 border-t border-gray-800">
              <button
                onClick={handleShowOnboarding}
                className="w-full flex items-center gap-3 px-4 py-3 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors text-sm"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Onboarding anzeigen
              </button>
            </div>
          </nav>
        </div>
      </div>
      
      {/* Sidebar - Desktop */}
      <div className="hidden md:flex md:w-80 bg-black border-r border-gray-800 flex-col shadow-lg">
        {/* User Profile */}
        <div className="ms-user-profile">
          <div className="ms-user-avatar">
            {userProfile?.initials || 'U'}
          </div>
          <div className="flex-1">
            <h3 className="font-medium text-white">{userProfile?.name || 'User'}</h3>
          </div>
          <div className="flex items-center gap-2">
            <SearchButton />
            <NotificationBell />
            <button
              onClick={handleSignOut}
              className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
              title="Abmelden"
            >
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          </div>
        </div>
        
        {/* Lists */}
        <nav className="flex-1 overflow-y-auto py-2">
          <div className="px-4 py-2">
            <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Meine Listen</h2>
          </div>
          
          <ListSidebar onNavigate={() => setSidebarOpen(false)} />
          
          {/* Settings/Actions */}
          <div className="mt-auto pt-4 border-t border-gray-800">
            <button
              onClick={handleShowOnboarding}
              className="w-full flex items-center gap-3 px-4 py-3 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors text-sm"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Onboarding anzeigen
            </button>
          </div>
        </nav>
      </div>
      
      {/* Main content */}
      <main className="flex-1 flex flex-col min-h-0">
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
    </div>
  );
}

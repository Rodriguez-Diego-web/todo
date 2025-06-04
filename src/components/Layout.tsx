import { useState } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { ListSidebar } from './ListSidebar';
import { useAuth } from '../contexts/AuthContext';
import { InvitationsModal } from './InvitationsModal';
import { useInvitations } from '../hooks/useInvitations';
import React from 'react';

export function Layout() {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [invitationsOpen, setInvitationsOpen] = useState(false);
  const { userProfile, signOut } = useAuth();
  const { invitations } = useInvitations();
  
  const defaultCategories = [
    { id: 'today', name: 'Mein Tag', icon: 'sun', path: '/', count: 0 },
    { id: 'important', name: 'Wichtig', icon: 'star', path: '/important', count: 0 },
  ];

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const getIcon = (iconName: string) => {
    const icons: Record<string, React.JSX.Element> = {
      sun: (
        <svg className="ms-list-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ),
      star: (
        <svg className="ms-list-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
        </svg>
      ),
    };
    return icons[iconName] || icons.sun;
  };

  const NotificationBell = () => (
    <button
      onClick={() => setInvitationsOpen(true)}
      className="relative p-2 hover:bg-[#404040] rounded-lg transition-colors"
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
  
  return (
    <div className="min-h-screen bg-[#1f1f1f] flex flex-col md:flex-row">
      {/* Mobile header */}
      <header className="md:hidden bg-[#2d2d2d] border-b border-[#404040] p-4 flex items-center justify-between sticky top-0 z-30 shadow-lg">
        <button 
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 rounded-lg hover:bg-[#404040] transition-colors"
          aria-label="Toggle menu"
        >
          <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
            <path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z" />
          </svg>
        </button>
        <h1 className="text-lg font-semibold text-white">To Do</h1>
        <div className="flex items-center gap-2">
          <NotificationBell />
          <button
            onClick={handleSignOut}
            className="p-2 rounded-lg hover:bg-[#404040] transition-colors"
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
        <div className="fixed inset-y-0 left-0 w-80 bg-[#2d2d2d] shadow-2xl transform transition-transform duration-300 ease-in-out flex flex-col">
          {/* User Profile */}
          <div className="ms-user-profile">
            <div className="ms-user-avatar">
              {userProfile?.initials || 'U'}
            </div>
            <div className="flex-1">
              <h3 className="font-medium text-white">{userProfile?.name || 'User'}</h3>
            </div>
            <div className="flex items-center gap-2">
              <NotificationBell />
              <button
                onClick={handleSignOut}
                className="p-2 hover:bg-[#404040] rounded-lg transition-colors"
                title="Abmelden"
              >
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </button>
            </div>
          </div>
          
          {/* Categories */}
          <nav className="flex-1 overflow-y-auto py-2">
            {defaultCategories.map((category) => (
              <Link
                key={category.id}
                to={category.path}
                onClick={() => setSidebarOpen(false)}
                className={`ms-sidebar-category ${location.pathname === category.path ? 'active' : ''}`}
              >
                <div className="flex items-center flex-1">
                  {getIcon(category.icon)}
                  <span>{category.name}</span>
                </div>
                {category.count > 0 && (
                  <span className="ms-count-badge">{category.count}</span>
                )}
              </Link>
            ))}
            
            <div className="border-t border-[#404040] mt-4 pt-4">
              <ListSidebar onNavigate={() => setSidebarOpen(false)} />
            </div>
          </nav>
        </div>
      </div>
      
      {/* Sidebar - Desktop */}
      <div className="hidden md:flex md:w-80 bg-[#2d2d2d] border-r border-[#404040] flex-col shadow-lg">
        {/* User Profile */}
        <div className="ms-user-profile">
          <div className="ms-user-avatar">
            {userProfile?.initials || 'U'}
          </div>
          <div className="flex-1">
            <h3 className="font-medium text-white">{userProfile?.name || 'User'}</h3>
          </div>
          <div className="flex items-center gap-2">
            <NotificationBell />
            <button
              onClick={handleSignOut}
              className="p-2 hover:bg-[#404040] rounded-lg transition-colors"
              title="Abmelden"
            >
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          </div>
        </div>
        
        {/* Categories */}
        <nav className="flex-1 overflow-y-auto py-2">
          {defaultCategories.map((category) => (
            <Link
              key={category.id}
              to={category.path}
              className={`ms-sidebar-category ${location.pathname === category.path ? 'active' : ''}`}
            >
              <div className="flex items-center flex-1">
                {getIcon(category.icon)}
                <span>{category.name}</span>
              </div>
              {category.count > 0 && (
                <span className="ms-count-badge">{category.count}</span>
              )}
            </Link>
          ))}
          
          <div className="border-t border-[#404040] mt-4 pt-4">
            <ListSidebar />
          </div>
        </nav>
      </div>
      
      {/* Main content */}
      <main className="flex-1 flex flex-col min-h-0">
        <Outlet />
      </main>

      {/* Invitations Modal */}
      <InvitationsModal 
        isOpen={invitationsOpen} 
        onClose={() => setInvitationsOpen(false)} 
      />
    </div>
  );
}

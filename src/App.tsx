import { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { useAuth } from './contexts/AuthContext';
import { AuthModal } from './components/AuthModal';
import { Layout } from './components/Layout';
import { ListPage } from './pages/ListPage';
import { SplashScreens } from './components/SplashScreens';
import { useSplashScreens } from './hooks/useSplashScreens';
import { useLists } from './hooks/useLists';
import './index.css';

function AppContent() {
  const { currentUser, loading } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const { showSplashScreens, completeSplashScreens } = useSplashScreens();
  const { lists } = useLists();

  useEffect(() => {
    if (!loading && !currentUser) {
      setShowAuthModal(true);
    }
  }, [currentUser, loading]);

  // Prevent iOS magnifying glass
  useEffect(() => {
    const preventMagnifyingGlass = (e: TouchEvent) => {
      // This helps prevent the magnifying glass on iOS
      if (e.touches.length > 1) {
        e.preventDefault();
      }
    };

    // Add the event listener to the document
    document.addEventListener('touchstart', preventMagnifyingGlass, { passive: false });

    return () => {
      document.removeEventListener('touchstart', preventMagnifyingGlass);
    };
  }, []);

  // Show splash screens for new users
  if (!loading && currentUser && showSplashScreens) {
    return <SplashScreens onComplete={completeSplashScreens} />;
  }

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-black">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Laden...</p>
        </div>
      </div>
    );
  }

  // Default route redirect
  const DefaultRoute = () => {
    if (lists.length > 0) {
      return <Navigate to={`/list/${lists[0].id}`} replace />;
    }
    return (
      <div className="p-4 md:p-8 w-full">
        <div className="text-center py-16">
          <svg className="w-20 h-20 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <h3 className="text-xl font-medium text-white mb-2">Willkommen bei Plan Panda!</h3>
          <p className="text-gray-400 max-w-md mx-auto mb-6">
            Erstellen Sie Ihre erste Liste, um loszulegen.
          </p>
        </div>
      </div>
    );
  };

  return (
    <>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<DefaultRoute />} />
          <Route path="list/:listId" element={<ListPage />} />
        </Route>
      </Routes>
      
      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
    </>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
}

export default App;

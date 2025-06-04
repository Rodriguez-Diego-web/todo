import { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { initDB } from './db';
import { Layout } from './components/Layout';
import { Today } from './pages/Today';
import { ListPage } from './pages/ListPage';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { AuthModal } from './components/AuthModal';
import './index.css';

function AppContent() {
  const { currentUser, loading } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);

  useEffect(() => {
    // Initialize IndexedDB when the app loads (for offline fallback)
    initDB().catch(console.error);
  }, []);

  useEffect(() => {
    // Show auth modal if user is not authenticated and not loading
    if (!loading && !currentUser) {
      setShowAuthModal(true);
    } else {
      setShowAuthModal(false);
    }
  }, [currentUser, loading]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#1f1f1f] flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-white">Lädt...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#1f1f1f]">
      <Router>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Today />} />
            <Route path="list/:listId" element={<ListPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </Router>
      
      <AuthModal 
        isOpen={showAuthModal} 
        onClose={() => setShowAuthModal(false)} 
      />
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;

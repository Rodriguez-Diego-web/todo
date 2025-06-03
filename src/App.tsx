import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { initDB } from './db';
import { Layout } from './components/Layout';
import { Today } from './pages/Today';
import { ListPage } from './pages/ListPage';
import './index.css';

function App() {
  useEffect(() => {
    // Initialize IndexedDB when the app loads
    initDB().catch(console.error);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Router>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Today />} />
            <Route path="list/:listId" element={<ListPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </Router>
    </div>
  );
}

export default App;

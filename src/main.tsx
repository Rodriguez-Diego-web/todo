import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { register } from './serviceWorker';
import './index.css';
import App from './App';

// Register service worker
if (process.env.NODE_ENV === 'production') {
  register();
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);

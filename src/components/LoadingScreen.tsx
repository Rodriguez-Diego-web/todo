import logoWeiss from '../assets/logoweiss.png';
import { useTheme } from '../hooks/useTheme';

export function LoadingScreen() {
  const { isDarkMode } = useTheme();
  
  return (
    <div className="h-screen flex flex-col items-center justify-center">
      <div className="relative">
        <img 
          src={logoWeiss} 
          alt="Plan Panda Logo" 
          className={`w-32 h-32 object-contain ${!isDarkMode ? 'filter invert' : ''}`}
        />
        <div className={`absolute inset-0 opacity-0 animate-pulse ${isDarkMode ? 'bg-black' : 'bg-white'}`}></div>
      </div>
      
      <div className="mt-8 relative">
        <div className="h-1 w-48 bg-gray-800 rounded-full overflow-hidden">
          <div className="h-full bg-blue-500 rounded-full animate-progress"></div>
        </div>
      </div>
      
      <p className="mt-4">Wird geladen...</p>
    </div>
  );
}

// CSS Animation wird in index.css definiert 
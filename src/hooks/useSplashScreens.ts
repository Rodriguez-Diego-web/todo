import { useState, useEffect } from 'react';

export function useSplashScreens() {
  const [showSplashScreens, setShowSplashScreens] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user has seen splash screens before
    const hasSeenSplashScreens = localStorage.getItem('plan-panda-splash-seen');
    
    if (!hasSeenSplashScreens) {
      setShowSplashScreens(true);
    }
    
    setIsLoading(false);
  }, []);

  const completeSplashScreens = () => {
    localStorage.setItem('plan-panda-splash-seen', 'true');
    setShowSplashScreens(false);
  };

  const resetSplashScreens = () => {
    localStorage.removeItem('plan-panda-splash-seen');
    setShowSplashScreens(true);
  };

  return {
    showSplashScreens,
    isLoading,
    completeSplashScreens,
    resetSplashScreens
  };
} 
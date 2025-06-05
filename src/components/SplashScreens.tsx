import { useState } from 'react';
import logoWeiss from '../assets/logoweiss.png';

interface SplashScreensProps {
  onComplete: () => void;
}

export function SplashScreens({ onComplete }: SplashScreensProps) {
  const [currentScreen, setCurrentScreen] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  const screens = [
    {
      title: "Aufgaben abhaken",
      subtitle: "Erledige deine Todos effizient",
      image: "/splash-1.png"
    },
    {
      title: "Kalender & Planung", 
      subtitle: "Plane deinen Tag intelligent",
      image: "/splash-2.png"
    },
    {
      title: "Motivation & Fokus",
      subtitle: "Bleibe produktiv mit Plan Panda",
      image: "/splash-3.png"
    }
  ];

  // Minimum swipe distance (in px)
  const minSwipeDistance = 50;

  const nextScreen = () => {
    if (currentScreen < screens.length - 1) {
      setCurrentScreen(currentScreen + 1);
    } else {
      handleComplete();
    }
  };

  const prevScreen = () => {
    if (currentScreen > 0) {
      setCurrentScreen(currentScreen - 1);
    }
  };

  const handleComplete = () => {
    setIsVisible(false);
    setTimeout(() => {
      onComplete();
    }, 300);
  };

  const skipAll = () => {
    handleComplete();
  };

  // Touch handlers for swipe functionality
  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe) {
      nextScreen();
    } else if (isRightSwipe) {
      prevScreen();
    }
  };

  const currentScreenData = screens[currentScreen];

  return (
    <div className={`fixed inset-0 z-50 transition-opacity duration-300 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
      {/* Black Background */}
      <div className="absolute inset-0 bg-black" />
      
      {/* Content */}
      <div 
        className="relative z-10 flex flex-col min-h-screen text-white"
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        {/* Skip Button */}
        <div className="absolute top-8 right-8 z-20">
          <button 
            onClick={skipAll}
            className="text-gray-400 hover:text-white text-sm font-medium transition-all duration-200 hover:scale-105 active:scale-95"
          >
            Überspringen
          </button>
        </div>

        {/* Main Content - Centered */}
        <div className="flex-1 flex flex-col items-center justify-center px-6">
          {/* Image */}
          <div className="mb-8 transition-transform duration-300 ease-out">
            <img 
              src={currentScreenData.image}
              alt={currentScreenData.title}
              className="max-w-[380px] max-h-[380px] w-full h-auto object-contain"
              onError={(e) => {
                // Fallback if image doesn't exist
                const target = e.target as HTMLImageElement;
                target.src = "data:image/svg+xml,%3Csvg width='280' height='280' xmlns='http://www.w3.org/2000/svg'%3E%3Crect width='280' height='280' fill='%23333'/%3E%3Ctext x='140' y='140' text-anchor='middle' dominant-baseline='middle' font-size='60'%3E🐼%3C/text%3E%3C/svg%3E";
              }}
            />
          </div>

          {/* Text Content */}
          <div className="text-center space-y-4 max-w-sm">
            <h1 className="text-2xl font-bold text-white transition-all duration-300">
              {currentScreenData.title}
            </h1>
            <p className="text-gray-300 text-lg leading-relaxed">
              {currentScreenData.subtitle}
            </p>
          </div>
        </div>

        {/* Bottom Navigation */}
        <div className="pb-12 px-6">
          {/* Progress Dots */}
          <div className="flex justify-center space-x-2 mb-8">
            {screens.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentScreen(index)}
                className={`h-2 rounded-full transition-all duration-300 ${
                  index === currentScreen 
                    ? 'bg-white w-8' 
                    : 'bg-gray-600 hover:bg-gray-400 w-2'
                }`}
              />
            ))}
          </div>

          {/* Navigation Buttons */}
          <div className="flex justify-between items-center">
            <button
              onClick={prevScreen}
              disabled={currentScreen === 0}
              className={`px-6 py-3 text-white transition-all duration-200 ${
                currentScreen === 0 
                  ? 'invisible' 
                  : 'hover:bg-gray-800 rounded-lg hover:scale-105 active:scale-95'
              }`}
            >
              Zurück
            </button>

            <button
              onClick={nextScreen}
              className="px-8 py-3 bg-white text-black rounded-lg font-medium transition-all duration-200 hover:bg-gray-200 hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl"
            >
              {currentScreen === screens.length - 1 ? 'Starten' : 'Weiter'}
            </button>
          </div>

          {/* Swipe Hint */}
          <div className="text-center mt-6">
            <p className="text-gray-500 text-xs">
              ← Wischen zum Navigieren →
            </p>
          </div>
        </div>

        {/* Plan Panda Branding */}
        <div className="absolute bottom-16 left-1/2 transform -translate-x-1/2">
          <img 
            src={logoWeiss}  
            alt="Plan Panda Logo"
            className="w-24 h-24 object-contain opacity-90"
            onError={(e) => {
              console.error("Logo konnte nicht geladen werden");
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
            }}
          />
        </div>
      </div>
    </div>
  );
} 
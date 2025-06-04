import { useState } from 'react';

interface SplashScreensProps {
  onComplete: () => void;
}

export function SplashScreens({ onComplete }: SplashScreensProps) {
  const [currentScreen, setCurrentScreen] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

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

  const currentScreenData = screens[currentScreen];

  return (
    <div className={`fixed inset-0 z-50 transition-opacity duration-300 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
      {/* Black Background */}
      <div className="absolute inset-0 bg-black" />
      
      {/* Content */}
      <div className="relative z-10 flex flex-col min-h-screen text-white">
        {/* Skip Button */}
        <div className="absolute top-8 right-8 z-20">
          <button 
            onClick={skipAll}
            className="text-gray-400 hover:text-white text-sm font-medium transition-colors"
          >
            Überspringen
          </button>
        </div>

        {/* Main Content - Centered */}
        <div className="flex-1 flex flex-col items-center justify-center px-6">
          {/* Image */}
          <div className="mb-8">
            <img 
              src={currentScreenData.image}
              alt={currentScreenData.title}
              className="max-w-[280px] max-h-[280px] w-full h-auto object-contain"
              onError={(e) => {
                // Fallback if image doesn't exist
                const target = e.target as HTMLImageElement;
                target.src = "data:image/svg+xml,%3Csvg width='280' height='280' xmlns='http://www.w3.org/2000/svg'%3E%3Crect width='280' height='280' fill='%23333'/%3E%3Ctext x='140' y='140' text-anchor='middle' dominant-baseline='middle' font-size='60'%3E🐼%3C/text%3E%3C/svg%3E";
              }}
            />
          </div>

          {/* Text Content */}
          <div className="text-center space-y-4 max-w-sm">
            <h1 className="text-2xl font-bold text-white">
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
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  index === currentScreen 
                    ? 'bg-white w-8' 
                    : 'bg-gray-600 hover:bg-gray-400'
                }`}
              />
            ))}
          </div>

          {/* Navigation Buttons */}
          <div className="flex justify-between items-center">
            <button
              onClick={prevScreen}
              disabled={currentScreen === 0}
              className={`px-6 py-3 text-white transition-all duration-300 ${
                currentScreen === 0 
                  ? 'invisible' 
                  : 'hover:bg-gray-800 rounded-lg'
              }`}
            >
              Zurück
            </button>

            <button
              onClick={nextScreen}
              className="px-8 py-3 bg-white text-black rounded-lg font-medium hover:bg-gray-200 transition-all duration-300"
            >
              {currentScreen === screens.length - 1 ? 'Starten' : 'Weiter'}
            </button>
          </div>
        </div>

        {/* Plan Panda Branding */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
          <div className="flex items-center space-x-2 text-gray-500 text-sm">
            <span>🐼</span>
            <span>Plan Panda</span>
          </div>
        </div>
      </div>
    </div>
  );
} 
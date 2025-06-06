import { useEffect, useRef, useState } from 'react';

interface PullToRefreshProps {
  onRefresh: () => Promise<void>;
  children: React.ReactNode;
  pullDistance?: number;
  resistance?: number;
}

export function PullToRefresh({
  onRefresh,
  children,
  pullDistance = 80,
  resistance = 2.5
}: PullToRefreshProps) {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pullStart, setPullStart] = useState(0);
  const [pullMove, setPullMove] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let startY = 0;
    let currentY = 0;

    const handleTouchStart = (e: TouchEvent) => {
      // Nur am Anfang der Seite Pull-to-Refresh aktivieren
      if (window.scrollY === 0) {
        startY = e.touches[0].clientY;
        currentY = startY;
        setPullStart(startY);
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (startY === 0) return;

      currentY = e.touches[0].clientY;
      const pull = currentY - startY;

      // Nur nach unten ziehen erlauben
      if (pull > 0) {
        e.preventDefault();
        setPullMove(pull / resistance);
      }
    };

    const handleTouchEnd = async () => {
      if (pullMove > pullDistance) {
        setIsRefreshing(true);
        try {
          await onRefresh();
        } finally {
          setIsRefreshing(false);
        }
      }
      setPullStart(0);
      setPullMove(0);
    };

    container.addEventListener('touchstart', handleTouchStart, { passive: false });
    container.addEventListener('touchmove', handleTouchMove, { passive: false });
    container.addEventListener('touchend', handleTouchEnd);

    return () => {
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchmove', handleTouchMove);
      container.removeEventListener('touchend', handleTouchEnd);
    };
  }, [onRefresh, pullDistance, resistance, pullMove]);

  return (
    <div ref={containerRef} className="relative min-h-full">
      {/* Pull indicator */}
      <div
        className="absolute left-0 right-0 flex items-center justify-center transition-transform duration-200"
        style={{
          top: -60,
          transform: `translateY(${pullMove}px)`,
          opacity: pullMove / pullDistance
        }}
      >
        <div className="flex flex-col items-center">
          <div className={`w-8 h-8 border-4 border-theme-primary border-t-transparent rounded-full ${isRefreshing ? 'animate-spin' : ''}`} />
          <span className="mt-2 text-sm text-theme-secondary">
            {isRefreshing ? 'Aktualisiere...' : 'Ziehen zum Aktualisieren'}
          </span>
        </div>
      </div>

      {/* Content */}
      <div
        style={{
          transform: `translateY(${pullMove}px)`,
          transition: pullStart === 0 ? 'transform 0.3s ease-out' : 'none'
        }}
      >
        {children}
      </div>
    </div>
  );
} 
import { useEffect, useRef, useState } from 'react';

interface PullToRefreshOptions {
  onRefresh: () => Promise<void>;
  pullDistance?: number;
  refreshThreshold?: number;
}

export function usePullToRefresh({
  onRefresh,
  pullDistance = 100,
  refreshThreshold = 70,
}: PullToRefreshOptions) {
  const [isPulling, setIsPulling] = useState(false);
  const [pullProgress, setPullProgress] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const startY = useRef(0);
  const currentY = useRef(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollPositionOnTouchStart = useRef(0);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleTouchStart = (e: TouchEvent) => {
      // Only enable pull-to-refresh when at the top of the container
      scrollPositionOnTouchStart.current = window.scrollY;
      if (window.scrollY > 0) return;

      startY.current = e.touches[0].clientY;
      currentY.current = startY.current;
      setIsPulling(true);
      setPullProgress(0);
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!isPulling) return;
      
      // If user has scrolled down, cancel pull-to-refresh
      if (window.scrollY > scrollPositionOnTouchStart.current) {
        setIsPulling(false);
        setPullProgress(0);
        return;
      }

      currentY.current = e.touches[0].clientY;
      const pullLength = Math.max(0, currentY.current - startY.current);
      
      // Calculate pull progress as a percentage (0-100)
      const progress = Math.min(100, (pullLength / pullDistance) * 100);
      setPullProgress(progress);

      // Prevent overscrolling
      if (pullLength > 5 && window.scrollY <= 0) {
        e.preventDefault();
      }
    };

    const handleTouchEnd = async () => {
      if (!isPulling) return;
      
      const pullLength = Math.max(0, currentY.current - startY.current);
      
      if (pullLength >= refreshThreshold) {
        // Trigger refresh
        setIsRefreshing(true);
        try {
          await onRefresh();
        } catch (error) {
          console.error('Refresh failed:', error);
        } finally {
          setIsRefreshing(false);
        }
      }
      
      setIsPulling(false);
      setPullProgress(0);
    };

    container.addEventListener('touchstart', handleTouchStart, { passive: true });
    container.addEventListener('touchmove', handleTouchMove, { passive: false });
    container.addEventListener('touchend', handleTouchEnd);

    return () => {
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchmove', handleTouchMove);
      container.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isPulling, onRefresh, pullDistance, refreshThreshold]);

  return {
    containerRef,
    pullProgress,
    isPulling,
    isRefreshing,
  };
} 
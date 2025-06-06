import { usePullToRefresh } from '../hooks/usePullToRefresh';
import type { ReactNode } from 'react';

interface PullToRefreshProps {
  onRefresh: () => Promise<void>;
  children: ReactNode;
  pullDistance?: number;
  refreshThreshold?: number;
}

export function PullToRefresh({
  onRefresh,
  children,
  pullDistance = 100,
  refreshThreshold = 70,
}: PullToRefreshProps) {
  const { containerRef, pullProgress, isPulling, isRefreshing } = usePullToRefresh({
    onRefresh,
    pullDistance,
    refreshThreshold,
  });

  return (
    <div className="relative h-full w-full" ref={containerRef}>
      {/* Pull indicator */}
      <div
        className={`absolute left-0 right-0 flex justify-center transition-transform duration-200 z-10 ${
          isPulling || isRefreshing ? 'opacity-100' : 'opacity-0'
        }`}
        style={{
          transform: isPulling
            ? `translateY(${Math.min(pullProgress * 0.8, 80)}px)`
            : isRefreshing
            ? 'translateY(40px)'
            : 'translateY(0)',
        }}
      >
        <div className="bg-theme-secondary/30 backdrop-blur-sm p-2 rounded-full flex items-center justify-center">
          {isRefreshing ? (
            <svg
              className="animate-spin h-6 w-6 text-white"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
          ) : (
            <svg
              className={`h-6 w-6 text-white transition-transform duration-300 ${
                pullProgress > 80 ? 'rotate-180' : ''
              }`}
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M19 14l-7 7m0 0l-7-7m7 7V3"
              />
            </svg>
          )}
        </div>
      </div>

      {/* Content */}
      <div
        className="w-full transition-transform"
        style={{
          transform: isPulling
            ? `translateY(${Math.min(pullProgress * 0.6, 60)}px)`
            : 'translateY(0)',
        }}
      >
        {children}
      </div>
    </div>
  );
} 
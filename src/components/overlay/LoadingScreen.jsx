/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║  LoadingScreen.jsx — Cinematic loading screen                ║
 * ╚══════════════════════════════════════════════════════════════╝
 *
 * Shows while 3D assets load. Auto-hides when isLoaded becomes true.
 * Progress bar tracks the faked loading animation.
 */

import { useEffect, useRef } from 'react';
import useStore from '../../store/useStore';
import { SITE } from '../../data/portfolio';

export default function LoadingScreen() {
  const isLoaded = useStore((s) => s.isLoaded);
  const setLoadingProgress = useStore((s) => s.setLoadingProgress);
  const progress = useStore((s) => s.loadingProgress);
  const intervalRef = useRef(null);

  // Simulate loading progress (the 3D scene doesn't expose granular progress)
  useEffect(() => {
    let p = 0;
    intervalRef.current = setInterval(() => {
      // Fast initially, slows down near 100
      p += (100 - p) * 0.08;
      if (p > 95) p = 95; // Hold at 95% until scene is truly ready
      setLoadingProgress(Math.round(p));
    }, 100);

    return () => clearInterval(intervalRef.current);
  }, [setLoadingProgress]);

  // Jump to 100% when scene is loaded
  useEffect(() => {
    if (isLoaded) {
      clearInterval(intervalRef.current);
      setLoadingProgress(100);
    }
  }, [isLoaded, setLoadingProgress]);

  return (
    <div className={`loading-screen ${isLoaded ? 'loaded' : ''}`} id="loading-screen">
      <div className="ls-content">
        <div className="ls-logo">⬡</div>
        <div className="ls-title">{SITE.shortTitle}</div>
        <div className="ls-bar">
          <div className="ls-bar-fill" style={{ width: `${progress}%` }} />
        </div>
        <div className="ls-hint">Preparing your space…</div>
      </div>
    </div>
  );
}
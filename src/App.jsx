/**
 * ╔═════════════════════════════════════════════════╗
 * ║  App.jsx — Root application component           ║
 * ╚═════════════════════════════════════════════════╝
 *
 * This renders:
 *   1. LoadingScreen (shown until 3D scene is ready)
 *   2. Canvas with all 3D content (SceneController)
 *   3. HTML overlays (HUD, InfoPanel, PortfolioOverlay)
 *
 * HOW TO EDIT:
 *   - Canvas settings (FOV, DPR) are configured below
 *   - All overlay components are imported and always rendered
 *   - No mode switching — everything is always accessible
 */

import { Suspense, useState, useCallback } from 'react';
import { Canvas } from '@react-three/fiber';
import useStore from './store/useStore';
import SceneController from './components/SceneController';
import LoadingScreen from './components/overlay/LoadingScreen';
import Overlay from './components/overlay/Overlay';
import InfoPanel from './components/ui/InfoPanel';
import PortfolioOverlay from './components/portfolio/PortfolioOverlay';

export default function App() {
  const qualityLevel = useStore((s) => s.qualityLevel);
  const hoveredObject = useStore((s) => s.hoveredObject);

  // Portfolio panel open/close state
  const [portfolioOpen, setPortfolioOpen] = useState(false);
  const openPortfolio = useCallback(() => setPortfolioOpen(true), []);
  const closePortfolio = useCallback(() => setPortfolioOpen(false), []);

  // Cap DPR based on quality level and actual device DPR
  const maxDpr = Math.min(2, window.devicePixelRatio || 1);
  const dpr =
    qualityLevel === 'low' ? [1, 1] :
    qualityLevel === 'medium' ? [1, 1.5] :
    [1, maxDpr];

  return (
    <>
      {/* Loading screen — auto-hides when scene is ready */}
      <LoadingScreen onEnter={openPortfolio} />

      {/* Main container */}
      <div
        className={`app-root ${hoveredObject ? 'cursor-pointer' : ''}`}
        style={{ width: '100%', height: '100%' }}
      >
        {/* ── 3D Canvas ── */}
        <Canvas
          shadows={qualityLevel !== 'low'}
          dpr={dpr}
          camera={{ fov: 65, near: 0.1, far: 1000, position: [0, 1.7, 2] }}
          gl={{
            antialias: qualityLevel !== 'low',
            powerPreference: 'high-performance',
            stencil: false,
          }}
          id="main-canvas"
        >
          <Suspense fallback={null}>
            <SceneController />
          </Suspense>
        </Canvas>

        {/* ── HTML Overlays (always rendered, always accessible) ── */}
        <InfoPanel />
        <Overlay onOpenPortfolio={openPortfolio} />

        {/* Interaction hint — visible when hovering a 3D object */}
        {hoveredObject && (
          <div className="interact-prompt">
            <span className="interact-text">Click to inspect</span>
          </div>
        )}
      </div>

      {/* ── Portfolio Overlay (slide-in panel) ── */}
      <PortfolioOverlay isOpen={portfolioOpen} onClose={closePortfolio} />
    </>
  );
}

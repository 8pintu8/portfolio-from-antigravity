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

import { Suspense, useState, useCallback, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import * as THREE from 'three';
import useStore from './store/useStore';
import SceneController from './components/SceneController';
import LoadingScreen from './components/overlay/LoadingScreen';
import Overlay from './components/overlay/Overlay';
import InfoPanel from './components/ui/InfoPanel';
import PortfolioOverlay from './components/portfolio/PortfolioOverlay';

export default function App() {
  const qualityLevel = useStore((s) => s.qualityLevel);
  const hoveredObject = useStore((s) => s.hoveredObject);
  const activeObject = useStore((s) => s.activeObject);
  const clearActiveObject = useStore((s) => s.clearActiveObject);
  
  // Portfolio panel state from store
  const portfolioOpen = useStore((s) => s.portfolioOpen);
  const setPortfolioOpen = useStore((s) => s.setPortfolioOpen);
  const setActivePortfolioTab = useStore((s) => s.setActivePortfolioTab);

  const openPortfolio = useCallback(() => setPortfolioOpen(true), [setPortfolioOpen]);
  const closePortfolio = useCallback(() => setPortfolioOpen(false), [setPortfolioOpen]);

  // Listen for 3D trigger clicks
  useEffect(() => {
    if (activeObject?.isPortfolioSection) {
      setActivePortfolioTab(activeObject.sectionId);
      setPortfolioOpen(true);
      clearActiveObject(); // We intercepted it, don't show the InfoPanel
    }
  }, [activeObject, setActivePortfolioTab, setPortfolioOpen, clearActiveObject]);

  // Do NOT change dpr or gl properties dynamically as it completely rebuilds the WebGL context and freezes the site.
  const maxDpr = Math.min(2, window.devicePixelRatio || 1);

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
          shadows={{ type: THREE.PCFShadowMap }}
          dpr={[1, maxDpr]}
          camera={{ fov: 65, near: 0.1, far: 1000, position: [0, 1.7, 2] }}
          gl={{
            antialias: true,
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

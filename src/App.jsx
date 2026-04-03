import { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import useStore from './store/useStore';
import SceneController from './components/SceneController';
import LoadingScreen from './components/overlay/LoadingScreen';
import Overlay from './components/overlay/Overlay';
import InfoPanel from './components/ui/InfoPanel';

export default function App() {
  const isLoaded = useStore((s) => s.isLoaded);
  const qualityLevel = useStore((s) => s.qualityLevel);
  const hoveredObject = useStore((s) => s.hoveredObject);

  const dpr = qualityLevel === 'low' ? [1, 1] : qualityLevel === 'medium' ? [1, 1.5] : [1, 2];

  return (
    <>
      <LoadingScreen />

      {/* Custom cursor styling via className on body-level div */}
      <div
        className={`app-root ${hoveredObject ? 'cursor-pointer' : ''}`}
        style={{ width: '100%', height: '100%' }}
      >
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

        {/* HTML Overlays — always accessible, no mode gating */}
        <InfoPanel />
        <Overlay />

        {/* Interaction hint */}
        {hoveredObject && (
          <div className="interact-prompt">
            <span className="interact-text">Click to inspect</span>
          </div>
        )}
      </div>
    </>
  );
}

/**
 * ╔═══════════════════════════════════════════════════════════════╗
 * ║  WeatherEffects.jsx — Rain, snow, and other weather particles ║
 * ╚═══════════════════════════════════════════════════════════════╝
 *
 * HOW IT WORKS:
 *   Uses a FIXED-SIZE particle buffer (MAX_PARTICLES) that never resizes.
 *   When weather changes, we show/hide particles by count, not by recreating arrays.
 *   This prevents the THREE.WebGLAttributes buffer resize crash.
 *
 * HOW TO EDIT:
 *   - Change MAX_PARTICLES for more/fewer particles (higher = heavier GPU usage)
 *   - Change SPREAD_X / SPREAD_Z for particle area coverage
 *   - Change fall speeds in the useFrame loop
 */

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import useStore from '../../store/useStore';
import { getWeatherSceneParams } from '../../utils/weather';

// Fixed max particle count — buffer is allocated once and never resized
const MAX_PARTICLES = 3000;
const SPREAD_X = 30;
const SPREAD_Z = 30;
const MAX_HEIGHT = 15;

export default function WeatherEffects() {
  const weather = useStore((s) => s.weather);
  const qualityLevel = useStore((s) => s.qualityLevel);
  const pointsRef = useRef();

  const sceneParams = useMemo(() => getWeatherSceneParams(weather), [weather]);

  // How many of the MAX_PARTICLES to actually animate this frame
  const activeCount = useMemo(() => {
    if (!sceneParams.particleType) return 0;
    const scale = qualityLevel === 'low' ? 0.25 : qualityLevel === 'medium' ? 0.5 : 1;
    return Math.min(Math.floor(sceneParams.particleCount * scale), MAX_PARTICLES);
  }, [sceneParams, qualityLevel]);

  // Pre-allocate a FIXED buffer — never changes size
  const positions = useMemo(() => {
    const arr = new Float32Array(MAX_PARTICLES * 3);
    for (let i = 0; i < MAX_PARTICLES; i++) {
      arr[i * 3]     = (Math.random() - 0.5) * SPREAD_X;
      arr[i * 3 + 1] = Math.random() * MAX_HEIGHT;
      arr[i * 3 + 2] = (Math.random() - 0.5) * SPREAD_Z;
    }
    return arr;
  }, []); // Never recreated — this is the key fix

  // Animate active particles, leave excess offscreen
  useFrame((_, delta) => {
    if (!pointsRef.current || activeCount === 0) return;

    const pos = pointsRef.current.geometry.attributes.position.array;
    const isSnow = sceneParams.particleType === 'snow';
    const fallSpeed = isSnow ? 1.5 : 12;
    const drift = sceneParams.windStrength * 2;

    for (let i = 0; i < activeCount; i++) {
      pos[i * 3 + 1] -= fallSpeed * delta;   // Fall down
      pos[i * 3]     += drift * delta;        // Wind drift

      // Reset when below ground
      if (pos[i * 3 + 1] < -1) {
        pos[i * 3 + 1] = MAX_HEIGHT;
        pos[i * 3]     = (Math.random() - 0.5) * SPREAD_X;
        pos[i * 3 + 2] = (Math.random() - 0.5) * SPREAD_Z;
      }
    }

    // Push inactive particles far below (invisible)
    for (let i = activeCount; i < MAX_PARTICLES; i++) {
      pos[i * 3 + 1] = -100;
    }

    pointsRef.current.geometry.attributes.position.needsUpdate = true;
  });

  // Hide entirely when no weather particles needed
  if (!sceneParams.particleType) return null;

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={MAX_PARTICLES}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        color={sceneParams.particleType === 'snow' ? 0xFFFFFF : 0xAABBCC}
        size={sceneParams.particleType === 'snow' ? 0.06 : 0.02}
        transparent
        opacity={0.6}
        sizeAttenuation
        depthWrite={false}
      />
    </points>
  );
}

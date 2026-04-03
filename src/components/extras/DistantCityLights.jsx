import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import useStore from '../../store/useStore';

const LIGHT_COUNT = 80;

export default function DistantCityLights() {
  const isNight = useStore((s) => s.isNight);
  const timeOfDay = useStore((s) => s.timeOfDay);
  const pointsRef = useRef();

  // Only show from dusk onwards
  const visible = timeOfDay > 0.65 || timeOfDay < 0.3;

  const { positions, colors } = useMemo(() => {
    const pos = new Float32Array(LIGHT_COUNT * 3);
    const col = new Float32Array(LIGHT_COUNT * 3);

    for (let i = 0; i < LIGHT_COUNT; i++) {
      // Place along the far horizon
      const angle = (Math.random() - 0.5) * Math.PI * 0.6;
      const dist = 80 + Math.random() * 120;
      pos[i * 3] = Math.sin(angle) * dist;
      pos[i * 3 + 1] = -3 + Math.random() * 3;
      pos[i * 3 + 2] = -Math.cos(angle) * dist;

      // Warm white / orange / yellow tones
      const warmth = Math.random();
      col[i * 3] = 1.0;
      col[i * 3 + 1] = 0.7 + warmth * 0.3;
      col[i * 3 + 2] = 0.3 + warmth * 0.4;
    }
    return { positions: pos, colors: col };
  }, []);

  // Twinkle
  useFrame(({ clock }) => {
    if (!pointsRef.current || !visible) return;
    const t = clock.getElapsedTime();
    const opacity = 0.4 + Math.sin(t * 0.5) * 0.15;
    pointsRef.current.material.opacity = opacity;
  });

  if (!visible) return null;

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={LIGHT_COUNT} array={positions} itemSize={3} />
        <bufferAttribute attach="attributes-color" count={LIGHT_COUNT} array={colors} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial
        vertexColors
        size={0.5}
        transparent
        opacity={0.5}
        sizeAttenuation
        depthWrite={false}
      />
    </points>
  );
}

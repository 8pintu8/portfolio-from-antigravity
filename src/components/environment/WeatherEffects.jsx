import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import useStore from '../../store/useStore';
import { getWeatherSceneParams } from '../../utils/weather';

export default function WeatherEffects() {
  const weather = useStore((s) => s.weather);
  const qualityLevel = useStore((s) => s.qualityLevel);
  const pointsRef = useRef();

  const sceneParams = useMemo(() => getWeatherSceneParams(weather), [weather]);

  const maxParticles = useMemo(() => {
    if (!sceneParams.particleType) return 0;
    const scale = qualityLevel === 'low' ? 0.25 : qualityLevel === 'medium' ? 0.5 : 1;
    return Math.floor(sceneParams.particleCount * scale);
  }, [sceneParams, qualityLevel]);

  // Particle positions
  const positions = useMemo(() => {
    if (maxParticles === 0) return null;
    const arr = new Float32Array(maxParticles * 3);
    for (let i = 0; i < maxParticles; i++) {
      arr[i * 3] = (Math.random() - 0.5) * 30;     // X spread
      arr[i * 3 + 1] = Math.random() * 15;           // Y height
      arr[i * 3 + 2] = (Math.random() - 0.5) * 30;  // Z spread
    }
    return arr;
  }, [maxParticles]);

  // Animate particles
  useFrame((_, delta) => {
    if (!pointsRef.current || !positions) return;

    const pos = pointsRef.current.geometry.attributes.position.array;
    const isSnow = sceneParams.particleType === 'snow';
    const fallSpeed = isSnow ? 1.5 : 12;
    const drift = sceneParams.windStrength * 2;

    for (let i = 0; i < maxParticles; i++) {
      pos[i * 3 + 1] -= fallSpeed * delta; // fall
      pos[i * 3] += drift * delta;          // wind drift

      // Reset when below ground
      if (pos[i * 3 + 1] < -1) {
        pos[i * 3 + 1] = 15;
        pos[i * 3] = (Math.random() - 0.5) * 30;
        pos[i * 3 + 2] = (Math.random() - 0.5) * 30;
      }
    }
    pointsRef.current.geometry.attributes.position.needsUpdate = true;
  });

  if (maxParticles === 0) return null;

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={maxParticles}
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
      />
    </points>
  );
}

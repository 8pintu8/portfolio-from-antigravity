import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import useStore from '../../store/useStore';

const COUNT = 60;

export default function Fireflies() {
  const pointsRef = useRef();
  const isNight = useStore((s) => s.isNight);
  const timeOfDay = useStore((s) => s.timeOfDay);
  const qualityLevel = useStore((s) => s.qualityLevel);
  const reducedMotion = useStore((s) => s.reducedMotion);

  // Only visible dusk through dawn
  const visible = timeOfDay > 0.7 || timeOfDay < 0.3;

  const count = qualityLevel === 'low' ? 20 : qualityLevel === 'medium' ? 40 : COUNT;

  const { positions, randoms } = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const rand = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 14;
      pos[i * 3 + 1] = 0.3 + Math.random() * 2.5;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 12;
      rand[i] = Math.random() * Math.PI * 2;
    }
    return { positions: pos, randoms: rand };
  }, [count]);

  useFrame(({ clock }) => {
    if (!pointsRef.current || !visible || reducedMotion) return;
    const t = clock.getElapsedTime();
    const pos = pointsRef.current.geometry.attributes.position.array;

    for (let i = 0; i < count; i++) {
      const offset = randoms[i];
      pos[i * 3] += Math.sin(t * 0.5 + offset) * 0.003;
      pos[i * 3 + 1] += Math.cos(t * 0.7 + offset) * 0.002;
      pos[i * 3 + 2] += Math.sin(t * 0.3 + offset * 2) * 0.003;
    }
    pointsRef.current.geometry.attributes.position.needsUpdate = true;

    // Flicker opacity
    const flicker = 0.4 + Math.sin(t * 4) * 0.3;
    pointsRef.current.material.opacity = flicker;
  });

  if (!visible) return null;

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        color={0xFFE4A0}
        size={0.06}
        transparent
        opacity={0.6}
        sizeAttenuation
        depthWrite={false}
      />
    </points>
  );
}

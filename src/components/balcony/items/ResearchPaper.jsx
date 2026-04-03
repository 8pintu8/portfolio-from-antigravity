import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import useStore from '../../../store/useStore';

const PARTICLE_COUNT = 40;

export default function ResearchPaper() {
  const groupRef = useRef();
  const particlesRef = useRef();
  const reducedMotion = useStore((s) => s.reducedMotion);

  // Knowledge particles — small floating dots around the book
  const particlePositions = useMemo(() => {
    const arr = new Float32Array(PARTICLE_COUNT * 3);
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      arr[i * 3] = (Math.random() - 0.5) * 0.8;
      arr[i * 3 + 1] = Math.random() * 0.6;
      arr[i * 3 + 2] = (Math.random() - 0.5) * 0.8;
    }
    return arr;
  }, []);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (groupRef.current && !reducedMotion) {
      groupRef.current.rotation.y = Math.sin(t * 0.5) * 0.3;
    }
    if (particlesRef.current && !reducedMotion) {
      const positions = particlesRef.current.geometry.attributes.position.array;
      for (let i = 0; i < PARTICLE_COUNT; i++) {
        positions[i * 3 + 1] += Math.sin(t * 2 + i) * 0.001;
        if (positions[i * 3 + 1] > 0.8) positions[i * 3 + 1] = -0.1;
      }
      particlesRef.current.geometry.attributes.position.needsUpdate = true;
    }
  });

  return (
    <group ref={groupRef}>
      {/* Book / document shape */}
      <mesh castShadow position={[0, 0, 0]}>
        <boxGeometry args={[0.35, 0.04, 0.45]} />
        <meshPhysicalMaterial
          color={0xF5E6D3}
          roughness={0.6}
          metalness={0.0}
          clearcoat={0.3}
        />
      </mesh>

      {/* Cover accent line */}
      <mesh position={[0, 0.021, -0.05]}>
        <boxGeometry args={[0.25, 0.002, 0.01]} />
        <meshStandardMaterial color={0xA8FFD4} emissive={0xA8FFD4} emissiveIntensity={0.5} />
      </mesh>

      {/* Second page underneath */}
      <mesh position={[0.01, -0.02, 0.01]}>
        <boxGeometry args={[0.35, 0.03, 0.45]} />
        <meshStandardMaterial color={0xE8D5C0} roughness={0.7} />
      </mesh>

      {/* Knowledge particles */}
      <points ref={particlesRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={PARTICLE_COUNT}
            array={particlePositions}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial
          color={0xA8FFD4}
          size={0.015}
          transparent
          opacity={0.7}
          sizeAttenuation
        />
      </points>
    </group>
  );
}

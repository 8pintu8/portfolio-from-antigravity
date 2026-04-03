import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import useStore from '../../store/useStore';

export default function DisplayPedestal({ color = '#FF9F6B' }) {
  const ringRef = useRef();
  const glowRef = useRef();
  const reducedMotion = useStore((s) => s.reducedMotion);

  const colorInt = useMemo(() => new THREE.Color(color), [color]);

  useFrame(({ clock }) => {
    if (ringRef.current && !reducedMotion) {
      ringRef.current.rotation.y = clock.getElapsedTime() * 0.3;
    }
    if (glowRef.current) {
      const pulse = 0.3 + Math.sin(clock.getElapsedTime() * 2) * 0.15;
      glowRef.current.material.opacity = pulse;
    }
  });

  return (
    <group>
      {/* Pedestal base */}
      <mesh position={[0, 0.15, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.4, 0.45, 0.3, 24]} />
        <meshStandardMaterial color={0x1A1A1A} roughness={0.3} metalness={0.8} />
      </mesh>

      {/* Pedestal top surface */}
      <mesh position={[0, 0.31, 0]}>
        <cylinderGeometry args={[0.38, 0.38, 0.02, 24]} />
        <meshStandardMaterial color={0x2A2A2A} roughness={0.2} metalness={0.9} />
      </mesh>

      {/* Glowing ring at base */}
      <mesh ref={ringRef} position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.42, 0.48, 32]} />
        <meshStandardMaterial
          color={colorInt}
          emissive={colorInt}
          emissiveIntensity={0.8}
          transparent
          opacity={0.6}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Glow disc (subtle light pool) */}
      <mesh ref={glowRef} position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.7, 32]} />
        <meshBasicMaterial
          color={colorInt}
          transparent
          opacity={0.2}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  );
}

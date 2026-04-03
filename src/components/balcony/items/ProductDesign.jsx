import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export default function ProductDesign() {
  const groupRef = useRef();
  const innerRef = useRef();

  const iridescent = useMemo(() => new THREE.MeshPhysicalMaterial({
    color: 0xE8A87C,
    roughness: 0.15,
    metalness: 0.6,
    clearcoat: 1.0,
    clearcoatRoughness: 0.1,
    iridescence: 1.0,
    iridescenceIOR: 1.8,
  }), []);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (groupRef.current) groupRef.current.rotation.y = t * 0.4;
    if (innerRef.current) innerRef.current.rotation.x = t * 0.6;
  });

  return (
    <group ref={groupRef}>
      {/* Outer torus knot */}
      <mesh material={iridescent} castShadow>
        <torusKnotGeometry args={[0.28, 0.08, 80, 12, 2, 3]} />
      </mesh>
      {/* Inner cube */}
      <mesh ref={innerRef} castShadow>
        <boxGeometry args={[0.2, 0.2, 0.2]} />
        <meshPhysicalMaterial
          color={0xFF9F6B}
          roughness={0.1}
          metalness={0.4}
          emissive={0xFF9F6B}
          emissiveIntensity={0.3}
          transparent
          opacity={0.85}
        />
      </mesh>
    </group>
  );
}

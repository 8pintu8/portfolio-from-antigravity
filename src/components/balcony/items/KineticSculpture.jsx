import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export default function KineticSculpture() {
  const ring1 = useRef();
  const ring2 = useRef();
  const ring3 = useRef();
  const coreRef = useRef();

  const metalMat = new THREE.MeshStandardMaterial({
    color: 0x8BA8C4,
    roughness: 0.2,
    metalness: 0.9,
  });

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (ring1.current) ring1.current.rotation.x = t * 0.8;
    if (ring2.current) ring2.current.rotation.y = t * 1.1;
    if (ring3.current) ring3.current.rotation.z = t * 0.6;
    if (coreRef.current) {
      coreRef.current.rotation.y = t * 1.5;
      const pulse = 0.4 + Math.sin(t * 3) * 0.15;
      coreRef.current.material.emissiveIntensity = pulse;
    }
  });

  return (
    <group>
      {/* Outer ring */}
      <mesh ref={ring1} material={metalMat} castShadow>
        <torusGeometry args={[0.35, 0.02, 16, 48]} />
      </mesh>
      {/* Middle ring */}
      <mesh ref={ring2} material={metalMat} castShadow>
        <torusGeometry args={[0.26, 0.02, 16, 48]} />
      </mesh>
      {/* Inner ring */}
      <mesh ref={ring3} material={metalMat} castShadow>
        <torusGeometry args={[0.17, 0.015, 16, 48]} />
      </mesh>
      {/* Core sphere */}
      <mesh ref={coreRef} castShadow>
        <icosahedronGeometry args={[0.08, 1]} />
        <meshStandardMaterial
          color={0x6BC5FF}
          emissive={0x6BC5FF}
          emissiveIntensity={0.5}
          roughness={0.1}
          metalness={0.5}
        />
      </mesh>
    </group>
  );
}

/**
 * ╔═══════════════════════════════════════════════════════════════╗
 * ║  AboutModel.jsx — 3D model for the "About" section trigger   ║
 * ╚═══════════════════════════════════════════════════════════════╝
 *
 * A floating, faceted humanoid bust / portrait frame silhouette.
 * Warm gold color, gentle rotation. Clicking opens the About tab.
 */

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export default function AboutModel() {
  const groupRef = useRef();

  useFrame(({ clock }) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(clock.getElapsedTime() * 0.3) * 0.2;
    }
  });

  return (
    <group ref={groupRef}>
      {/* Portrait frame — an ornate rectangular border */}
      <mesh castShadow>
        <torusGeometry args={[0.28, 0.03, 8, 4]} />
        <meshStandardMaterial
          color={0xD4A574}
          roughness={0.3}
          metalness={0.7}
          emissive={0xD4A574}
          emissiveIntensity={0.15}
        />
      </mesh>

      {/* Inner face silhouette — stylized dodecahedron */}
      <mesh castShadow>
        <dodecahedronGeometry args={[0.18, 0]} />
        <meshPhysicalMaterial
          color={0xF5E6D3}
          roughness={0.2}
          metalness={0.3}
          clearcoat={0.8}
          emissive={0xD4A574}
          emissiveIntensity={0.1}
        />
      </mesh>

      {/* Floating info dots orbiting */}
      {[0, 1.2, 2.4, 3.6, 4.8].map((offset, i) => (
        <mesh key={i} position={[
          Math.sin(offset) * 0.38,
          Math.cos(offset) * 0.38,
          0
        ]}>
          <sphereGeometry args={[0.02, 6, 4]} />
          <meshStandardMaterial
            color={0xD4A574}
            emissive={0xD4A574}
            emissiveIntensity={0.8}
          />
        </mesh>
      ))}
    </group>
  );
}

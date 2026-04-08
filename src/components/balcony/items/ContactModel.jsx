/**
 * ╔════════════════════════════════════════════════════════════════╗
 * ║  ContactModel.jsx — 3D model for the "Contact" section        ║
 * ╚════════════════════════════════════════════════════════════════╝
 *
 * A stylized envelope / mail icon with floating signal waves.
 * Green/mint palette. Clicking opens the Contact tab.
 */

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export default function ContactModel() {
  const groupRef = useRef();
  const waveRef1 = useRef();
  const waveRef2 = useRef();

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(t * 0.35) * 0.2;
    }
    // Pulsing signal waves
    if (waveRef1.current) {
      const s1 = 1 + Math.sin(t * 2) * 0.15;
      waveRef1.current.scale.set(s1, s1, 1);
      waveRef1.current.material.opacity = 0.3 + Math.sin(t * 2) * 0.2;
    }
    if (waveRef2.current) {
      const s2 = 1 + Math.sin(t * 2 + 1) * 0.15;
      waveRef2.current.scale.set(s2, s2, 1);
      waveRef2.current.material.opacity = 0.2 + Math.sin(t * 2 + 1) * 0.15;
    }
  });

  return (
    <group ref={groupRef}>
      {/* Envelope body */}
      <mesh castShadow>
        <boxGeometry args={[0.35, 0.22, 0.04]} />
        <meshPhysicalMaterial
          color={0xF5F0EB}
          roughness={0.5}
          clearcoat={0.3}
        />
      </mesh>

      {/* Envelope flap (triangle) */}
      <mesh position={[0, 0.08, 0.02]} rotation={[0.3, 0, 0]}>
        <boxGeometry args={[0.34, 0.15, 0.005]} />
        <meshStandardMaterial color={0xE8DDD0} roughness={0.6} />
      </mesh>

      {/* Seal */}
      <mesh position={[0, -0.02, 0.025]}>
        <cylinderGeometry args={[0.04, 0.04, 0.01, 12]} rotation={[Math.PI / 2, 0, 0]} />
        <meshStandardMaterial
          color={0x6EE7B7}
          emissive={0x6EE7B7}
          emissiveIntensity={0.5}
          roughness={0.2}
          metalness={0.6}
        />
      </mesh>

      {/* Signal waves */}
      <mesh ref={waveRef1} position={[0.25, 0.12, 0]}>
        <torusGeometry args={[0.06, 0.005, 8, 16, Math.PI]} />
        <meshStandardMaterial
          color={0x6EE7B7}
          emissive={0x6EE7B7}
          emissiveIntensity={0.8}
          transparent
          opacity={0.4}
        />
      </mesh>
      <mesh ref={waveRef2} position={[0.3, 0.16, 0]}>
        <torusGeometry args={[0.08, 0.004, 8, 16, Math.PI]} />
        <meshStandardMaterial
          color={0x6EE7B7}
          emissive={0x6EE7B7}
          emissiveIntensity={0.6}
          transparent
          opacity={0.3}
        />
      </mesh>
    </group>
  );
}

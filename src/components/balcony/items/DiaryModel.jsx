/**
 * ╔════════════════════════════════════════════════════════════════╗
 * ║  DiaryModel.jsx — 3D model for the "Diary" section trigger    ║
 * ╚════════════════════════════════════════════════════════════════╝
 *
 * An open notebook with floating pen and swirling ink particles.
 * Purple/violet palette. Clicking opens the Diary tab.
 */

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export default function DiaryModel() {
  const groupRef = useRef();
  const penRef = useRef();

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(t * 0.4) * 0.25;
    }
    if (penRef.current) {
      penRef.current.position.y = 0.12 + Math.sin(t * 2) * 0.03;
      penRef.current.rotation.z = Math.sin(t * 1.5) * 0.15;
    }
  });

  return (
    <group ref={groupRef}>
      {/* Open notebook — left page */}
      <mesh castShadow position={[-0.13, 0, 0]} rotation={[0, 0, 0.05]}>
        <boxGeometry args={[0.22, 0.015, 0.3]} />
        <meshPhysicalMaterial
          color={0xF5E6D3}
          roughness={0.6}
          clearcoat={0.2}
        />
      </mesh>

      {/* Open notebook — right page */}
      <mesh castShadow position={[0.13, 0, 0]} rotation={[0, 0, -0.05]}>
        <boxGeometry args={[0.22, 0.015, 0.3]} />
        <meshPhysicalMaterial
          color={0xFAF0E6}
          roughness={0.6}
          clearcoat={0.2}
        />
      </mesh>

      {/* Spine */}
      <mesh position={[0, -0.005, 0]}>
        <boxGeometry args={[0.04, 0.025, 0.31]} />
        <meshStandardMaterial color={0x6B3FA0} roughness={0.5} metalness={0.3} />
      </mesh>

      {/* Cover accent lines on pages (ink) */}
      {[-0.08, 0.02, 0.1].map((z, i) => (
        <mesh key={i} position={[-0.13, 0.009, z]}>
          <boxGeometry args={[0.14, 0.001, 0.008]} />
          <meshStandardMaterial color={0xC084FC} emissive={0xC084FC} emissiveIntensity={0.3} />
        </mesh>
      ))}

      {/* Floating pen */}
      <group ref={penRef} position={[0.18, 0.12, -0.05]} rotation={[0, 0, -0.4]}>
        <mesh>
          <cylinderGeometry args={[0.008, 0.008, 0.2, 6]} />
          <meshStandardMaterial color={0x2A1B3D} roughness={0.3} metalness={0.6} />
        </mesh>
        <mesh position={[0, -0.12, 0]}>
          <coneGeometry args={[0.008, 0.04, 6]} />
          <meshStandardMaterial color={0xC084FC} emissive={0xC084FC} emissiveIntensity={0.5} />
        </mesh>
      </group>
    </group>
  );
}

import { useMemo } from 'react';
import * as THREE from 'three';
import { theme } from '../../config/theme';

export default function BalconyStructure() {
  const stoneMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: 0x8B7D6B,
    roughness: 0.92,
    metalness: 0.02,
  }), []);

  const woodMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: 0x6B4E37,
    roughness: 0.85,
    metalness: 0.0,
  }), []);

  const darkWoodMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: 0x3D2B1F,
    roughness: 0.8,
    metalness: 0.05,
  }), []);

  const metalMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: 0x3A3A3A,
    roughness: 0.35,
    metalness: 0.85,
  }), []);

  const warmMetalMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: 0xB08D57,
    roughness: 0.4,
    metalness: 0.7,
  }), []);

  // Railing posts along the front and sides
  const railingPosts = useMemo(() => {
    const posts = [];
    // Front railing
    for (let x = -5.5; x <= 5.5; x += 1.8) {
      posts.push([x, 0, -3.5]);
    }
    // Side railings
    for (let z = -3.5; z <= 4.5; z += 1.8) {
      posts.push([-5.5, 0, z]);
      posts.push([5.5, 0, z]);
    }
    return posts;
  }, []);

  return (
    <group>
      {/* ═══════════════════════════════════════
          FLOOR — offset slightly up to prevent z-fighting
         ═══════════════════════════════════════ */}
      {/* Main stone floor */}
      <mesh receiveShadow position={[0, 0.02, 0.5]}>
        <boxGeometry args={[12, 0.15, 9]} />
        <meshStandardMaterial color={0x9B8B7B} roughness={0.88} metalness={0.02} />
      </mesh>

      {/* Floor tile accent lines */}
      {[-4, -2, 0, 2, 4].map((x, i) => (
        <mesh key={`tile-x-${i}`} position={[x, 0.105, 0.5]} receiveShadow>
          <boxGeometry args={[0.03, 0.01, 9]} />
          <meshStandardMaterial color={0x7A6B5B} roughness={0.7} />
        </mesh>
      ))}
      {[-2, 0, 2].map((z, i) => (
        <mesh key={`tile-z-${i}`} position={[0, 0.105, z]} receiveShadow>
          <boxGeometry args={[12, 0.01, 0.03]} />
          <meshStandardMaterial color={0x7A6B5B} roughness={0.7} />
        </mesh>
      ))}

      {/* Floor edge trim — decorative border along front edge */}
      <mesh position={[0, 0.05, -3.5]}>
        <boxGeometry args={[12.2, 0.12, 0.12]} />
        <meshStandardMaterial color={0x7A6B5B} roughness={0.8} />
      </mesh>

      {/* ═══════════════════════════════════════
          RAILING — wrought iron style (Tiny Glade)
         ═══════════════════════════════════════ */}
      {/* Railing posts */}
      {railingPosts.map((pos, i) => (
        <mesh key={`post-${i}`} position={[pos[0], 0.55, pos[1]]} castShadow material={metalMat}>
          <cylinderGeometry args={[0.025, 0.03, 1.1, 8]} />
        </mesh>
      ))}

      {/* Top rail — front */}
      <mesh position={[0, 1.1, -3.5]} material={warmMetalMat} castShadow>
        <boxGeometry args={[12, 0.06, 0.06]} />
      </mesh>
      {/* Mid rail — front */}
      <mesh position={[0, 0.6, -3.5]} material={metalMat}>
        <boxGeometry args={[12, 0.03, 0.03]} />
      </mesh>
      {/* Top rail — left */}
      <mesh position={[-5.5, 1.1, 0.5]} material={warmMetalMat} castShadow>
        <boxGeometry args={[0.06, 0.06, 9]} />
      </mesh>
      {/* Top rail — right */}
      <mesh position={[5.5, 1.1, 0.5]} material={warmMetalMat} castShadow>
        <boxGeometry args={[0.06, 0.06, 9]} />
      </mesh>

      {/* ═══════════════════════════════════════
          BACK WALL (the building the balcony is attached to)
         ═══════════════════════════════════════ */}
      <mesh position={[0, 2, 5]} receiveShadow castShadow>
        <boxGeometry args={[13, 5, 0.4]} />
        <meshStandardMaterial color={0xC4B5A0} roughness={0.9} metalness={0.0} />
      </mesh>

      {/* Window frame on back wall */}
      <mesh position={[-3, 2.5, 4.78]}>
        <boxGeometry args={[1.5, 2, 0.08]} />
        <meshStandardMaterial color={0x1A3045} roughness={0.3} metalness={0.1} />
      </mesh>
      {/* Window frame border — dark wood surround */}
      <mesh position={[-3, 2.5, 4.76]}>
        <boxGeometry args={[1.7, 2.2, 0.04]} />
        <meshStandardMaterial color={0x4A3828} roughness={0.7} />
      </mesh>

      {/* Second window */}
      <mesh position={[3, 2.5, 4.78]}>
        <boxGeometry args={[1.5, 2, 0.08]} />
        <meshStandardMaterial color={0x1A3045} roughness={0.3} metalness={0.1} />
      </mesh>
      <mesh position={[3, 2.5, 4.76]}>
        <boxGeometry args={[1.7, 2.2, 0.04]} />
        <meshStandardMaterial color={0x4A3828} roughness={0.7} />
      </mesh>

      {/* Door frame (center) */}
      <mesh position={[0, 1.8, 4.78]}>
        <boxGeometry args={[1.2, 2.8, 0.08]} />
        <meshStandardMaterial color={0x2A1F14} roughness={0.6} metalness={0.1} />
      </mesh>
      <mesh position={[0, 1.8, 4.75]}>
        <boxGeometry args={[1.4, 3.0, 0.04]} />
        <meshStandardMaterial color={0x5A4030} roughness={0.7} />
      </mesh>

      {/* ═══════════════════════════════════════
          CORNER PILLARS — sturdier, Tiny Glade style
         ═══════════════════════════════════════ */}
      {[[-5.5, -3.5], [5.5, -3.5], [-5.5, 4.8], [5.5, 4.8]].map(([x, z], i) => (
        <group key={`corner-${i}`}>
          <mesh position={[x, 1.2, z]} castShadow>
            <boxGeometry args={[0.25, 2.6, 0.25]} />
            <meshStandardMaterial color={0xA09080} roughness={0.85} />
          </mesh>
          {/* Cap */}
          <mesh position={[x, 2.55, z]}>
            <boxGeometry args={[0.35, 0.1, 0.35]} />
            <meshStandardMaterial color={0xB0A090} roughness={0.7} />
          </mesh>
        </group>
      ))}

      {/* ═══════════════════════════════════════
          UNDERSIDE — the building extends below
         ═══════════════════════════════════════ */}
      <mesh position={[0, -2.5, 0.5]}>
        <boxGeometry args={[12.5, 5, 9.5]} />
        <meshStandardMaterial color={0xB5A595} roughness={0.95} />
      </mesh>

      {/* Decorative arch under balcony */}
      <mesh position={[0, -0.3, -3.7]}>
        <boxGeometry args={[12.2, 0.4, 0.3]} />
        <meshStandardMaterial color={0x8A7A6A} roughness={0.8} />
      </mesh>
    </group>
  );
}

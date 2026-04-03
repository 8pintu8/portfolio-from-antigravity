/**
 * ╔════════════════════════════════════════════════════════════════╗
 * ║  CozyElements.jsx — Warm, lived-in balcony decorations         ║
 * ╚════════════════════════════════════════════════════════════════╝
 *
 * HOW TO EDIT:
 *   - Add/move plants: change PottedPlant position props
 *   - Move bench: change the position in the bench <group>
 *   - String lights: change bulbCount in StringLights component
 *   - Colors: all color hex values are inline for easy editing
 *
 * PERFORMANCE NOTE:
 *   String lights use emissive materials for all bulbs but only
 *   3 shared pointLights (not one per bulb). This saves draw calls.
 */

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import useStore from '../../store/useStore';

export default function CozyElements() {
  const timeOfDay = useStore((s) => s.timeOfDay);
  const showLights = timeOfDay > 0.65 || timeOfDay < 0.35;

  return (
    <group>
      {/* ═══════ STRING LIGHTS across the balcony ═══════ */}
      <StringLights showLights={showLights} />

      {/* ═══════ POTTED PLANTS ═══════ */}
      {/* Large statement plant — back wall */}
      <PottedPlant position={[0, 0.1, 3.5]} scale={1.2} />
      {/* Smaller plants along the railing */}
      <PottedPlant position={[-4.5, 0.1, -3]} scale={0.7} />
      <PottedPlant position={[4.5, 0.1, -3]} scale={0.7} />
      <PottedPlant position={[-5, 0.1, 1]} scale={0.6} />
      {/* Cascading vines along front railing */}
      <HangingVine position={[-2, 0.9, -3.5]} />
      <HangingVine position={[2, 0.9, -3.5]} />

      {/* ═══════ WOODEN BENCH with cushion ═══════ */}
      <group position={[-4, 0.1, 2.5]}>
        {/* Seat plank */}
        <mesh position={[0, 0.35, 0]} castShadow receiveShadow>
          <boxGeometry args={[1.5, 0.08, 0.55]} />
          <meshStandardMaterial color={0x6B4E37} roughness={0.8} />
        </mesh>
        {/* Legs */}
        {[[-0.6, -0.2], [-0.6, 0.2], [0.6, -0.2], [0.6, 0.2]].map(([x, z], i) => (
          <mesh key={i} position={[x, 0.17, z]}>
            <cylinderGeometry args={[0.03, 0.03, 0.35, 6]} />
            <meshStandardMaterial color={0x4A3428} roughness={0.7} />
          </mesh>
        ))}
        {/* Terracotta-colored cushion */}
        <mesh position={[0, 0.42, 0]} castShadow>
          <boxGeometry args={[1.3, 0.08, 0.45]} />
          <meshStandardMaterial color={0xC85A4A} roughness={0.95} />
        </mesh>
      </group>

      {/* ═══════ SIDE TABLE with lantern ═══════ */}
      <group position={[-1, 0.1, -0.5]}>
        {/* Round table top */}
        <mesh position={[0, 0.55, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[0.35, 0.35, 0.04, 16]} />
          <meshStandardMaterial color={0x5A3D2B} roughness={0.75} />
        </mesh>
        {/* Metal leg */}
        <mesh position={[0, 0.27, 0]}>
          <cylinderGeometry args={[0.04, 0.06, 0.55, 8]} />
          <meshStandardMaterial color={0x2A2A2A} roughness={0.4} metalness={0.7} />
        </mesh>
        {/* Lantern on table */}
        <Lantern position={[0.1, 0.6, 0.05]} showLight={showLights} />
      </group>

      {/* ═══════ FLOOR RUG (woven pattern) ═══════ */}
      <mesh position={[-2.5, 0.105, 0]} rotation={[-Math.PI / 2, 0, 0.15]} receiveShadow>
        <planeGeometry args={[2.5, 1.8]} />
        <meshStandardMaterial color={0x8B4513} roughness={0.98} side={THREE.DoubleSide} />
      </mesh>
      {/* Inner pattern stripe */}
      <mesh position={[-2.5, 0.107, 0]} rotation={[-Math.PI / 2, 0, 0.15]}>
        <planeGeometry args={[2, 1.3]} />
        <meshStandardMaterial color={0xA0522D} roughness={0.95} side={THREE.DoubleSide} />
      </mesh>

      {/* ═══════ BOOKSHELF (right side wall) ═══════ */}
      <group position={[4, 0.1, 0]} rotation={[0, -Math.PI / 2, 0]}>
        {/* Shelf frame */}
        <mesh position={[0, 0.7, 0]} castShadow>
          <boxGeometry args={[0.8, 1.4, 0.3]} />
          <meshStandardMaterial color={0x5A3D2B} roughness={0.8} />
        </mesh>
        {/* Books — each a different color */}
        {[0.25, 0.5, 0.75, 1.0].map((y, i) => (
          <mesh key={i} position={[(-0.2 + i * 0.12), y, 0.02]} castShadow>
            <boxGeometry args={[0.08, 0.18, 0.2]} />
            <meshStandardMaterial
              color={[0xA52A2A, 0x2E4057, 0x1B5E20, 0x6A1B9A][i]}
              roughness={0.85}
            />
          </mesh>
        ))}
      </group>

      {/* ═══════ RAILING LANTERNS ═══════ */}
      <Lantern position={[-5.2, 1.15, -3.5]} showLight={showLights} />
      <Lantern position={[5.2, 1.15, -3.5]} showLight={showLights} />
      <Lantern position={[0, 1.15, -3.5]} showLight={showLights} />
    </group>
  );
}

// ─────────────────────────────────────────
// STRING LIGHTS — catenary wire + emissive bulbs
// Uses only 3 pointLights (left, center, right) instead of 12
// ─────────────────────────────────────────
function StringLights({ showLights }) {
  const bulbCount = 12;
  const lightsRef = useRef();

  const bulbs = useMemo(() => {
    const arr = [];
    for (let i = 0; i < bulbCount; i++) {
      const t = i / (bulbCount - 1);
      const x = -4.5 + t * 9;
      const sag = -Math.sin(t * Math.PI) * 0.5; // Catenary sag
      arr.push({ x, y: 2.5 + sag, z: -1 });
    }
    return arr;
  }, []);

  return (
    <group ref={lightsRef}>
      {/* Wire segments connecting bulbs */}
      {bulbs.map((b, i) => {
        if (i === 0) return null;
        const prev = bulbs[i - 1];
        const midX = (b.x + prev.x) / 2;
        const midY = (b.y + prev.y) / 2;
        const dx = b.x - prev.x;
        const dy = b.y - prev.y;
        const len = Math.sqrt(dx * dx + dy * dy);
        const angle = Math.atan2(dy, dx);
        return (
          <mesh key={`wire-${i}`} position={[midX, midY, -1]} rotation={[0, 0, angle]}>
            <boxGeometry args={[len, 0.008, 0.008]} />
            <meshStandardMaterial color={0x2A2A2A} roughness={0.6} />
          </mesh>
        );
      })}

      {/* Bulbs — all emissive, but NO individual pointLights */}
      {bulbs.map((b, i) => (
        <mesh key={`bulb-${i}`} position={[b.x, b.y - 0.1, b.z]}>
          <sphereGeometry args={[0.04, 8, 6]} />
          <meshStandardMaterial
            color={0xFFE4B5}
            emissive={showLights ? 0xFFD090 : 0x000000}
            emissiveIntensity={showLights ? 1.5 : 0}
            transparent opacity={0.9}
          />
        </mesh>
      ))}

      {/* Three shared pointLights covering all bulbs — much cheaper */}
      {showLights && (
        <>
          <pointLight position={[-3, 2.1, -1]} color={0xFFE0B2} intensity={0.6} distance={5} decay={2} />
          <pointLight position={[0, 2.0, -1]}  color={0xFFE0B2} intensity={0.6} distance={5} decay={2} />
          <pointLight position={[3, 2.1, -1]}  color={0xFFE0B2} intensity={0.6} distance={5} decay={2} />
        </>
      )}
    </group>
  );
}

// ─────────────────────────────────────────
// POTTED PLANT — pot + soil + layered leaf spheres
// ─────────────────────────────────────────
function PottedPlant({ position, scale = 1 }) {
  return (
    <group position={position} scale={scale}>
      <mesh position={[0, 0.15, 0]} castShadow>
        <cylinderGeometry args={[0.18, 0.14, 0.3, 8]} />
        <meshStandardMaterial color={0x8B4513} roughness={0.9} />
      </mesh>
      <mesh position={[0, 0.3, 0]}>
        <cylinderGeometry args={[0.16, 0.16, 0.02, 8]} />
        <meshStandardMaterial color={0x3A2010} roughness={0.95} />
      </mesh>
      <mesh position={[0, 0.55, 0]} castShadow>
        <sphereGeometry args={[0.25, 8, 6]} />
        <meshStandardMaterial color={0x3A6B2A} roughness={0.9} />
      </mesh>
      <mesh position={[0.08, 0.7, 0.05]} castShadow>
        <sphereGeometry args={[0.18, 7, 5]} />
        <meshStandardMaterial color={0x4A8B3A} roughness={0.9} />
      </mesh>
      <mesh position={[-0.05, 0.65, -0.06]}>
        <sphereGeometry args={[0.15, 6, 5]} />
        <meshStandardMaterial color={0x2D5A20} roughness={0.9} />
      </mesh>
    </group>
  );
}

// ─────────────────────────────────────────
// HANGING VINE — cascading leaf blobs
// ─────────────────────────────────────────
function HangingVine({ position }) {
  return (
    <group position={position}>
      {[0, 0.15, 0.3, 0.45].map((offset, i) => (
        <mesh key={i} position={[offset * 0.5, -i * 0.15, 0.05]}>
          <sphereGeometry args={[0.06, 6, 4]} />
          <meshStandardMaterial color={0x2A5A1A} roughness={0.95} />
        </mesh>
      ))}
    </group>
  );
}

// ─────────────────────────────────────────
// LANTERN — metal frame + warm glass + optional light
// ─────────────────────────────────────────
function Lantern({ position, showLight = false }) {
  return (
    <group position={position}>
      <mesh castShadow>
        <boxGeometry args={[0.1, 0.15, 0.1]} />
        <meshStandardMaterial color={0x2A2A2A} roughness={0.4} metalness={0.7} />
      </mesh>
      <mesh>
        <boxGeometry args={[0.07, 0.1, 0.07]} />
        <meshStandardMaterial
          color={0xFFE4B5}
          emissive={showLight ? 0xFFD090 : 0x000000}
          emissiveIntensity={showLight ? 2 : 0}
          transparent opacity={0.6}
        />
      </mesh>
      <mesh position={[0, 0.1, 0]}>
        <coneGeometry args={[0.07, 0.06, 6]} />
        <meshStandardMaterial color={0x2A2A2A} roughness={0.4} metalness={0.7} />
      </mesh>
      {showLight && (
        <pointLight color={0xFFE0B2} intensity={0.6} distance={4} decay={2} />
      )}
    </group>
  );
}

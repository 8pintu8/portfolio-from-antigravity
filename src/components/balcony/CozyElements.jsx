import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import useStore from '../../store/useStore';
import { theme } from '../../config/theme';

/**
 * Cozy environment elements — string lights, plants, furniture, rugs, lanterns.
 * These make the balcony feel lived-in and warm, Tiny Glade style.
 */
export default function CozyElements() {
  const isNight = useStore((s) => s.isNight);
  const timeOfDay = useStore((s) => s.timeOfDay);
  const reducedMotion = useStore((s) => s.reducedMotion);

  const showLights = timeOfDay > 0.65 || timeOfDay < 0.35;

  return (
    <group>
      {/* ═══════ STRING LIGHTS across the balcony ═══════ */}
      <StringLights showLights={showLights} />

      {/* ═══════ PLANTS ═══════ */}
      {/* Large potted plant — center back */}
      <PottedPlant position={[0, 0.1, 3.5]} scale={1.2} />
      {/* Small plants along the railing */}
      <PottedPlant position={[-4.5, 0.1, -3]} scale={0.7} />
      <PottedPlant position={[4.5, 0.1, -3]} scale={0.7} />
      <PottedPlant position={[-5, 0.1, 1]} scale={0.6} />
      {/* Hanging vine on railing */}
      <HangingVine position={[-2, 0.9, -3.5]} />
      <HangingVine position={[2, 0.9, -3.5]} />

      {/* ═══════ WOODEN BENCH / SEAT ═══════ */}
      <group position={[-4, 0.1, 2.5]}>
        {/* Bench seat */}
        <mesh position={[0, 0.35, 0]} castShadow receiveShadow>
          <boxGeometry args={[1.5, 0.08, 0.55]} />
          <meshStandardMaterial color={0x6B4E37} roughness={0.8} />
        </mesh>
        {/* Bench legs */}
        {[[-0.6, -0.2], [-0.6, 0.2], [0.6, -0.2], [0.6, 0.2]].map(([x, z], i) => (
          <mesh key={i} position={[x, 0.17, z]}>
            <cylinderGeometry args={[0.03, 0.03, 0.35, 6]} />
            <meshStandardMaterial color={0x4A3428} roughness={0.7} />
          </mesh>
        ))}
        {/* Cushion on bench */}
        <mesh position={[0, 0.42, 0]} castShadow>
          <boxGeometry args={[1.3, 0.08, 0.45]} />
          <meshStandardMaterial color={0xC85A4A} roughness={0.95} />
        </mesh>
      </group>

      {/* ═══════ SMALL SIDE TABLE ═══════ */}
      <group position={[-1, 0.1, -0.5]}>
        {/* Table top */}
        <mesh position={[0, 0.55, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[0.35, 0.35, 0.04, 16]} />
          <meshStandardMaterial color={0x5A3D2B} roughness={0.75} />
        </mesh>
        {/* Table leg */}
        <mesh position={[0, 0.27, 0]}>
          <cylinderGeometry args={[0.04, 0.06, 0.55, 8]} />
          <meshStandardMaterial color={0x2A2A2A} roughness={0.4} metalness={0.7} />
        </mesh>
        {/* Lantern on table */}
        <Lantern position={[0.1, 0.6, 0.05]} showLight={showLights} />
      </group>

      {/* ═══════ FLOOR RUG ═══════ */}
      <mesh position={[-2.5, 0.105, 0]} rotation={[-Math.PI / 2, 0, 0.15]} receiveShadow>
        <planeGeometry args={[2.5, 1.8]} />
        <meshStandardMaterial color={0x8B4513} roughness={0.98} side={THREE.DoubleSide} />
      </mesh>
      {/* Rug inner pattern */}
      <mesh position={[-2.5, 0.107, 0]} rotation={[-Math.PI / 2, 0, 0.15]}>
        <planeGeometry args={[2, 1.3]} />
        <meshStandardMaterial color={0xA0522D} roughness={0.95} side={THREE.DoubleSide} />
      </mesh>

      {/* ═══════ BOOKSHELF against right side ═══════ */}
      <group position={[4, 0.1, 0]} rotation={[0, -Math.PI / 2, 0]}>
        {/* Shelf frame */}
        <mesh position={[0, 0.7, 0]} castShadow>
          <boxGeometry args={[0.8, 1.4, 0.3]} />
          <meshStandardMaterial color={0x5A3D2B} roughness={0.8} />
        </mesh>
        {/* Books */}
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

      {/* ═══════ LANTERNS along railing ═══════ */}
      <Lantern position={[-5.2, 1.15, -3.5]} showLight={showLights} />
      <Lantern position={[5.2, 1.15, -3.5]} showLight={showLights} />
      <Lantern position={[0, 1.15, -3.5]} showLight={showLights} />
    </group>
  );
}

function StringLights({ showLights }) {
  const bulbCount = 12;
  const lightsRef = useRef();

  const bulbs = useMemo(() => {
    const arr = [];
    for (let i = 0; i < bulbCount; i++) {
      const t = i / (bulbCount - 1);
      const x = -4.5 + t * 9;
      const sag = -Math.sin(t * Math.PI) * 0.5; // catenary sag
      const y = 2.5 + sag;
      arr.push({ x, y, z: -1 });
    }
    return arr;
  }, []);

  return (
    <group ref={lightsRef}>
      {/* Wire */}
      {bulbs.map((b, i) => {
        if (i === 0) return null;
        const prev = bulbs[i - 1];
        const midX = (b.x + prev.x) / 2;
        const midY = (b.y + prev.y) / 2;
        const midZ = (b.z + prev.z) / 2;
        const dx = b.x - prev.x;
        const dy = b.y - prev.y;
        const len = Math.sqrt(dx * dx + dy * dy);
        const angle = Math.atan2(dy, dx);
        return (
          <mesh key={`wire-${i}`} position={[midX, midY, midZ]} rotation={[0, 0, angle]}>
            <boxGeometry args={[len, 0.008, 0.008]} />
            <meshStandardMaterial color={0x2A2A2A} roughness={0.6} />
          </mesh>
        );
      })}

      {/* Bulbs */}
      {bulbs.map((b, i) => (
        <group key={`bulb-${i}`} position={[b.x, b.y - 0.1, b.z]}>
          <mesh>
            <sphereGeometry args={[0.04, 8, 6]} />
            <meshStandardMaterial
              color={0xFFE4B5}
              emissive={showLights ? 0xFFD090 : 0x000000}
              emissiveIntensity={showLights ? 1.5 : 0}
              transparent
              opacity={0.9}
            />
          </mesh>
          {showLights && (
            <pointLight
              color={0xFFE0B2}
              intensity={0.4}
              distance={3}
              decay={2}
            />
          )}
        </group>
      ))}
    </group>
  );
}

function PottedPlant({ position, scale = 1 }) {
  return (
    <group position={position} scale={scale}>
      {/* Pot */}
      <mesh position={[0, 0.15, 0]} castShadow>
        <cylinderGeometry args={[0.18, 0.14, 0.3, 8]} />
        <meshStandardMaterial color={0x8B4513} roughness={0.9} />
      </mesh>
      {/* Soil */}
      <mesh position={[0, 0.3, 0]}>
        <cylinderGeometry args={[0.16, 0.16, 0.02, 8]} />
        <meshStandardMaterial color={0x3A2010} roughness={0.95} />
      </mesh>
      {/* Leaves — layered spheres */}
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

function Lantern({ position, showLight = false }) {
  return (
    <group position={position}>
      {/* Body */}
      <mesh castShadow>
        <boxGeometry args={[0.1, 0.15, 0.1]} />
        <meshStandardMaterial color={0x2A2A2A} roughness={0.4} metalness={0.7} />
      </mesh>
      {/* Glass */}
      <mesh>
        <boxGeometry args={[0.07, 0.1, 0.07]} />
        <meshStandardMaterial
          color={0xFFE4B5}
          emissive={showLight ? 0xFFD090 : 0x000000}
          emissiveIntensity={showLight ? 2 : 0}
          transparent
          opacity={0.6}
        />
      </mesh>
      {/* Top */}
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

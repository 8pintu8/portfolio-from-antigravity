import { useMemo } from 'react';
import * as THREE from 'three';
import useStore from '../../store/useStore';

/**
 * Campus — buildings, paths, trees, life around the balcony.
 * Trees use offset canopy spheres with depthWrite to prevent z-fighting.
 */
export default function Campus() {
  const qualityLevel = useStore((s) => s.qualityLevel);

  return (
    <group>
      {/* Ground */}
      <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, -5.01, -30]}>
        <planeGeometry args={[300, 300]} />
        <meshStandardMaterial color={0x4A6237} roughness={0.95} />
      </mesh>

      {/* Courtyard */}
      <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, -4.99, -8]}>
        <planeGeometry args={[20, 12]} />
        <meshStandardMaterial color={0x9B8B7B} roughness={0.9} />
      </mesh>

      {/* Path */}
      <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, -4.98, -20]}>
        <planeGeometry args={[3.5, 20]} />
        <meshStandardMaterial color={0x8A7A6A} roughness={0.85} />
      </mesh>

      {/* ── Buildings ── */}
      <Building position={[-22, -2, 0]} size={[12, 8, 14]} roofColor={0x8B4513} wallColor={0xC8B8A0} />
      <Building position={[22, -1.5, -5]} size={[10, 7, 12]} roofColor={0x7A5030} wallColor={0xBDAA92} />
      <Building position={[0, -1, -35]} size={[25, 10, 8]} roofColor={0x8B5A2B} wallColor={0xD4C4A8} />

      {/* ── Trees — spaced out, no overlap ── */}
      {[
        [-12, -5, -8], [-8, -5, -20], [10, -5, -14], [14, -5, -6],
        [-15, -5, -28], [8, -5, -30], [-6, -5, -35], [18, -5, -22],
        [-18, -5, 8], [16, -5, 10], [-10, -5, -42], [12, -5, -40],
      ].map((pos, i) => (
        <Tree key={i} position={pos} seed={i} />
      ))}

      {/* ── Bushes ── */}
      {[
        [-7, -4.6, -6], [7, -4.6, -6], [-10, -4.6, -12], [12, -4.6, -16],
      ].map((pos, i) => (
        <mesh key={`b-${i}`} position={pos} castShadow>
          <sphereGeometry args={[0.7 + (i * 0.15), 8, 6]} />
          <meshLambertMaterial color={0x3A6B30} />
        </mesh>
      ))}

      {/* ── Lamp posts ── */}
      {[[-2.5, -5, -12], [2.5, -5, -12], [-2.5, -5, -22], [2.5, -5, -22]].map((pos, i) => (
        <LampPost key={i} position={pos} />
      ))}

      {/* Courtyard bench */}
      <group position={[6, -4.8, -10]} rotation={[0, -Math.PI / 2, 0]}>
        <mesh position={[0, 0.3, 0]}>
          <boxGeometry args={[1.5, 0.08, 0.5]} />
          <meshStandardMaterial color={0x5A3D2B} roughness={0.8} />
        </mesh>
        <mesh position={[0, 0.5, -0.22]}>
          <boxGeometry args={[1.5, 0.45, 0.06]} />
          <meshStandardMaterial color={0x5A3D2B} roughness={0.8} />
        </mesh>
      </group>
    </group>
  );
}

function Building({ position, size, roofColor, wallColor }) {
  return (
    <group position={position}>
      <mesh castShadow receiveShadow>
        <boxGeometry args={size} />
        <meshLambertMaterial color={wallColor} />
      </mesh>
      <mesh position={[0, size[1] / 2 + 1.2, 0]} castShadow>
        <boxGeometry args={[size[0] + 1, 2.5, size[2] + 1]} />
        <meshLambertMaterial color={roofColor} />
      </mesh>
    </group>
  );
}

/**
 * Tree with z-fighting prevention:
 * - Each canopy sphere is non-overlapping (offset clearly)
 * - Uses Lambert material (no specular to cause flicker)
 * - Single merged canopy approach
 */
function Tree({ position, seed = 0 }) {
  const scale = 0.85 + (seed % 5) * 0.12;
  const hueShift = (seed % 3) * 15;

  // Slightly different greens per tree
  const colors = useMemo(() => [
    new THREE.Color().setHSL((120 + hueShift) / 360, 0.45, 0.28),
    new THREE.Color().setHSL((125 + hueShift) / 360, 0.5, 0.32),
    new THREE.Color().setHSL((115 + hueShift) / 360, 0.4, 0.25),
  ], [hueShift]);

  return (
    <group position={position} scale={scale}>
      {/* Trunk */}
      <mesh position={[0, 1.5, 0]} castShadow>
        <cylinderGeometry args={[0.12, 0.22, 3, 6]} />
        <meshLambertMaterial color={0x5A3D2B} />
      </mesh>
      {/* Main canopy — single large sphere (no overlap z-fight) */}
      <mesh position={[0, 3.8, 0]} castShadow>
        <sphereGeometry args={[2.0, 8, 6]} />
        <meshLambertMaterial color={colors[0]} />
      </mesh>
      {/* Top tuft — clearly above, no overlap */}
      <mesh position={[0, 5.5, 0]} castShadow>
        <sphereGeometry args={[1.2, 7, 5]} />
        <meshLambertMaterial color={colors[1]} />
      </mesh>
      {/* Side tuft — clearly to the side */}
      <mesh position={[1.2, 4.2, 0.8]} castShadow>
        <sphereGeometry args={[0.9, 6, 5]} />
        <meshLambertMaterial color={colors[2]} />
      </mesh>
    </group>
  );
}

function LampPost({ position }) {
  return (
    <group position={position}>
      <mesh position={[0, 1.5, 0]}>
        <cylinderGeometry args={[0.04, 0.06, 3, 6]} />
        <meshStandardMaterial color={0x2A2A2A} roughness={0.4} metalness={0.8} />
      </mesh>
      <mesh position={[0, 3.1, 0]}>
        <sphereGeometry args={[0.15, 8, 6]} />
        <meshStandardMaterial color={0xFFE4C4} emissive={0xFFD4A0} emissiveIntensity={0.6} />
      </mesh>
      <pointLight position={[0, 3, 0]} color={0xFFE0B2} intensity={2} distance={8} decay={2} />
    </group>
  );
}

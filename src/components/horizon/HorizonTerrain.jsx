import { useMemo } from 'react';
import * as THREE from 'three';
import useStore from '../../store/useStore';
import { theme } from '../../config/theme';

// Simple 2D simplex-like noise for terrain displacement
function noise2D(x, z) {
  const n = Math.sin(x * 1.2 + z * 0.8) * 0.5
    + Math.sin(x * 0.3 - z * 1.7) * 0.25
    + Math.sin(x * 2.1 + z * 2.4) * 0.125;
  return n;
}

export default function HorizonTerrain() {
  const qualityLevel = useStore((s) => s.qualityLevel);
  const isNight = useStore((s) => s.isNight);

  const segments = qualityLevel === 'low' ? 40 : qualityLevel === 'medium' ? 80 : 120;

  const geometry = useMemo(() => {
    const geo = new THREE.PlaneGeometry(500, 500, segments, segments);
    const positions = geo.attributes.position.array;
    const colors = new Float32Array(positions.length);

    for (let i = 0; i < positions.length; i += 3) {
      const x = positions[i];
      const z = positions[i + 1]; // before rotation, Y is the "forward" axis

      // Height displacement
      const height = noise2D(x * 0.02, z * 0.02) * 8
        + noise2D(x * 0.005, z * 0.005) * 15;
      positions[i + 2] = height; // Z becomes up after rotation

      // Color gradient by distance (darker near, lighter far)
      const dist = Math.sqrt(x * x + z * z) / 250;
      const r = 0.12 + dist * 0.15;
      const g = 0.18 + dist * 0.2;
      const b = 0.1 + dist * 0.15;
      colors[i] = r;
      colors[i + 1] = g;
      colors[i + 2] = b;
    }

    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geo.computeVertexNormals();
    return geo;
  }, [segments]);

  return (
    <mesh
      geometry={geometry}
      rotation={[-Math.PI / 2, 0, 0]}
      position={[0, -5, -100]}
      receiveShadow
      raycast={() => null}
    >
      <meshStandardMaterial
        vertexColors
        roughness={0.95}
        metalness={0.0}
        side={THREE.FrontSide}
      />
    </mesh>
  );
}

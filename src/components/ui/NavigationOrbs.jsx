import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import * as THREE from 'three';
import useStore from '../../store/useStore';

export default function NavigationOrbs({ items }) {
  const hoveredObject = useStore((s) => s.hoveredObject);
  const reducedMotion = useStore((s) => s.reducedMotion);

  return (
    <group>
      {items.map((item) => (
        <Orb key={item.id} item={item} isHovered={hoveredObject === item.id} reducedMotion={reducedMotion} />
      ))}
    </group>
  );
}

function Orb({ item, isHovered, reducedMotion }) {
  const meshRef = useRef();
  const color = useMemo(() => new THREE.Color(item.color), [item.color]);

  useFrame(({ clock }) => {
    if (!meshRef.current) return;
    const t = clock.getElapsedTime();
    if (!reducedMotion) {
      meshRef.current.position.y = 2.2 + Math.sin(t * 2 + item.position[0]) * 0.1;
    }
    // Pulse emissive
    const pulse = isHovered ? 1.5 : 0.5 + Math.sin(t * 3) * 0.3;
    meshRef.current.material.emissiveIntensity = pulse;
  });

  return (
    <group position={[item.position[0], 0, item.position[2]]}>
      <mesh ref={meshRef} position={[0, 2.2, 0]}>
        <sphereGeometry args={[0.05, 16, 12]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.5}
          transparent
          opacity={0.8}
        />
      </mesh>

      {/* Label on hover */}
      {isHovered && (
        <Text
          position={[0, 2.5, 0]}
          fontSize={0.12}
          color={item.color}
          anchorX="center"
          anchorY="bottom"
          font="https://fonts.gstatic.com/s/inter/v18/UcCO3FwrK3iLTeHuS_nVMrMxCp50SjIw2boKoduKmMEVuLyfMZhrib2Bg-4.ttf"
        >
          {item.category}
        </Text>
      )}
    </group>
  );
}

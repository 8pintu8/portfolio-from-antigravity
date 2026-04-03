import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import useStore from '../../store/useStore';

const CLOUD_COUNT = 25;

export default function CloudLayer() {
  const cloudsRef = useRef();
  const qualityLevel = useStore((s) => s.qualityLevel);
  const weather = useStore((s) => s.weather);

  const count = useMemo(() => {
    let base = CLOUD_COUNT;
    if (weather.condition === 'clouds') base += 15;
    if (weather.condition === 'rain' || weather.condition === 'thunderstorm') base += 20;
    if (qualityLevel === 'low') base = Math.floor(base * 0.5);
    return base;
  }, [weather.condition, qualityLevel]);

  // Generate cloud positions
  const clouds = useMemo(() => {
    return Array.from({ length: count }, (_, i) => ({
      position: [
        (Math.random() - 0.5) * 200,
        15 + Math.random() * 20,
        -50 - Math.random() * 150,
      ],
      scale: 5 + Math.random() * 15,
      opacity: 0.15 + Math.random() * 0.25,
      speed: 0.1 + Math.random() * 0.3,
    }));
  }, [count]);

  useFrame((_, delta) => {
    if (!cloudsRef.current) return;
    cloudsRef.current.children.forEach((cloud, i) => {
      cloud.position.x += clouds[i].speed * delta;
      if (cloud.position.x > 120) cloud.position.x = -120;
    });
  });

  return (
    <group ref={cloudsRef}>
      {clouds.map((cloud, i) => (
        <mesh
          key={i}
          position={cloud.position}
          rotation={[-Math.PI / 2, 0, 0]}
          raycast={() => null}
        >
          <planeGeometry args={[cloud.scale, cloud.scale * 0.6]} />
          <meshBasicMaterial
            color={0xFFFFFF}
            transparent
            opacity={cloud.opacity}
            side={THREE.DoubleSide}
            depthWrite={false}
          />
        </mesh>
      ))}
    </group>
  );
}

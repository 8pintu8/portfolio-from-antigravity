import { useRef, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import useStore from '../../store/useStore';

export default function ShootingStars() {
  const isNight = useStore((s) => s.isNight);
  const [stars, setStars] = useState([]);
  const groupRef = useRef();

  // Spawn a shooting star occasionally at night
  useEffect(() => {
    if (!isNight) { setStars([]); return; }
    const interval = setInterval(() => {
      if (Math.random() > 0.6) {
        const id = Date.now();
        const star = {
          id,
          start: [
            (Math.random() - 0.5) * 200,
            50 + Math.random() * 30,
            -100 - Math.random() * 100,
          ],
          velocity: [
            (Math.random() - 0.5) * 80,
            -30 - Math.random() * 20,
            (Math.random() - 0.5) * 30,
          ],
          life: 0,
          maxLife: 1.5 + Math.random(),
        };
        setStars((prev) => [...prev.slice(-3), star]); // max 4 at once
      }
    }, 3000);
    return () => clearInterval(interval);
  }, [isNight]);

  useFrame((_, delta) => {
    setStars((prev) =>
      prev
        .map((s) => ({ ...s, life: s.life + delta }))
        .filter((s) => s.life < s.maxLife)
    );
  });

  if (!isNight || stars.length === 0) return null;

  return (
    <group ref={groupRef}>
      {stars.map((star) => {
        const progress = star.life / star.maxLife;
        const x = star.start[0] + star.velocity[0] * star.life;
        const y = star.start[1] + star.velocity[1] * star.life;
        const z = star.start[2] + star.velocity[2] * star.life;
        const opacity = 1 - progress;

        return (
          <mesh key={star.id} position={[x, y, z]}>
            <sphereGeometry args={[0.15, 6, 4]} />
            <meshBasicMaterial
              color={0xFFFFFF}
              transparent
              opacity={opacity * 0.8}
            />
          </mesh>
        );
      })}
    </group>
  );
}

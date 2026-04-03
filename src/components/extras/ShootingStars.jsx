// Improved ShootingStars.jsx
import { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import useStore from '../../store/useStore';

export default function ShootingStars() {
  const isNight = useStore((s) => s.isNight);
  const starsData = useRef([]); // Hold data in a ref, NOT state
  const groupRef = useRef();

  // Spawner
  useEffect(() => {
    if (!isNight) return;
    const interval = setInterval(() => {
      if (Math.random() > 0.6) {
        // Create a new mesh imperatively
        const mesh = new THREE.Mesh(
          new THREE.SphereGeometry(0.15, 6, 4),
          new THREE.MeshBasicMaterial({ color: 0xFFFFFF, transparent: true })
        );

        const star = {
          mesh,
          start: [(Math.random() - 0.5) * 200, 50 + Math.random() * 30, -100 - Math.random() * 100],
          velocity: [(Math.random() - 0.5) * 80, -30 - Math.random() * 20, (Math.random() - 0.5) * 30],
          life: 0,
          maxLife: 1.5 + Math.random(),
        };

        groupRef.current.add(mesh);
        starsData.current.push(star);
      }
    }, 3000);
    return () => clearInterval(interval);
  }, [isNight]);

  // Animator
  useFrame((_, delta) => {
    for (let i = starsData.current.length - 1; i >= 0; i--) {
      const star = starsData.current[i];
      star.life += delta;

      if (star.life >= star.maxLife) {
        // Cleanup dead stars
        groupRef.current.remove(star.mesh);
        star.mesh.geometry.dispose();
        star.mesh.material.dispose();
        starsData.current.splice(i, 1);
      } else {
        // Move live stars directly
        const progress = star.life / star.maxLife;
        star.mesh.position.set(
          star.start[0] + star.velocity[0] * star.life,
          star.start[1] + star.velocity[1] * star.life,
          star.start[2] + star.velocity[2] * star.life
        );
        star.mesh.material.opacity = (1 - progress) * 0.8;
      }
    }
  });

  if (!isNight) return null;
  return <group ref={groupRef} />;
}
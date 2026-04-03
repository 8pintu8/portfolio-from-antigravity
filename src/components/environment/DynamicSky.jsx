import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Sky, Stars } from '@react-three/drei';
import * as THREE from 'three';
import useStore from '../../store/useStore';

/**
 * Animated clouds built from instanced billboard sprites with soft circular textures.
 * No rectangles — we use a canvas-generated radial gradient as the cloud texture.
 */
function AnimatedClouds() {
  const groupRef = useRef();
  const weather = useStore((s) => s.weather);
  const qualityLevel = useStore((s) => s.qualityLevel);

  // Generate soft circular cloud texture
  const cloudTexture = useMemo(() => {
    const size = 128;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    const gradient = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
    gradient.addColorStop(0, 'rgba(255,255,255,0.8)');
    gradient.addColorStop(0.4, 'rgba(255,255,255,0.4)');
    gradient.addColorStop(0.7, 'rgba(255,255,255,0.1)');
    gradient.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, size, size);
    const tex = new THREE.CanvasTexture(canvas);
    tex.needsUpdate = true;
    return tex;
  }, []);

  // Cloud puffs — each cloud is a cluster of overlapping puffs
  const clouds = useMemo(() => {
    let count = 15;
    if (weather.condition === 'clouds') count = 30;
    if (weather.condition === 'rain' || weather.condition === 'thunderstorm') count = 40;
    if (weather.condition === 'fog') count = 20;
    if (qualityLevel === 'low') count = Math.floor(count * 0.5);

    return Array.from({ length: count }, (_, i) => {
      const angle = Math.random() * Math.PI * 2;
      const dist = 40 + Math.random() * 120;
      return {
        x: Math.sin(angle) * dist,
        y: 20 + Math.random() * 25,
        z: -30 + Math.cos(angle) * dist * 0.5,
        scale: 8 + Math.random() * 20,
        speed: 0.5 + Math.random() * 1.5,
        opacity: weather.condition === 'clear' ? 0.15 + Math.random() * 0.15 : 0.25 + Math.random() * 0.35,
      };
    });
  }, [weather.condition, qualityLevel]);

  // Animate drift
  useFrame((_, delta) => {
    if (!groupRef.current) return;
    groupRef.current.children.forEach((child, i) => {
      if (clouds[i]) {
        child.position.x += clouds[i].speed * delta;
        if (child.position.x > 160) child.position.x = -160;
      }
    });
  });

  return (
    <group ref={groupRef}>
      {clouds.map((c, i) => (
        <sprite key={i} position={[c.x, c.y, c.z]} scale={[c.scale, c.scale * 0.5, 1]}>
          <spriteMaterial
            map={cloudTexture}
            transparent
            opacity={c.opacity}
            depthWrite={false}
            fog={false}
          />
        </sprite>
      ))}
    </group>
  );
}

export default function DynamicSky() {
  const sunPosition = useStore((s) => s.sunPosition);
  const isNight = useStore((s) => s.isNight);
  const qualityLevel = useStore((s) => s.qualityLevel);
  const weather = useStore((s) => s.weather);

  const turbidity = useMemo(() => {
    let base = 6;
    if (weather.condition === 'clouds') base += 4;
    if (weather.condition === 'rain' || weather.condition === 'thunderstorm') base += 6;
    if (weather.condition === 'fog') base += 8;
    return base;
  }, [weather.condition]);

  const starsCount = qualityLevel === 'low' ? 1000 : qualityLevel === 'medium' ? 3000 : 5000;

  return (
    <>
      {!isNight && (
        <Sky
          sunPosition={sunPosition}
          turbidity={turbidity}
          rayleigh={3}
          mieCoefficient={0.025}
          mieDirectionalG={0.9}
        />
      )}

      {/* Animated sprite-based clouds — no rectangles, soft radial gradient */}
      <AnimatedClouds />

      <Stars
        radius={200}
        depth={80}
        count={starsCount}
        factor={isNight ? 6 : 1}
        saturation={0}
        fade
        speed={0.5}
      />
    </>
  );
}

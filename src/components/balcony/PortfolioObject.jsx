import { useRef, useCallback } from 'react';
import { useFrame } from '@react-three/fiber';
import { Float } from '@react-three/drei';
import * as THREE from 'three';
import useStore from '../../store/useStore';

export default function PortfolioObject({ item, children }) {
  const groupRef = useRef();
  const setActiveObject = useStore((s) => s.setActiveObject);
  const setHoveredObject = useStore((s) => s.setHoveredObject);
  const isDragging = useStore((s) => s.isDragging);
  const reducedMotion = useStore((s) => s.reducedMotion);
  const hoveredObject = useStore((s) => s.hoveredObject);
  const hovered = hoveredObject === item.id;

  const handleClick = useCallback((e) => {
    e.stopPropagation();
    // Don't trigger if user was dragging to look around
    if (isDragging) return;
    setActiveObject(item);
  }, [item, setActiveObject, isDragging]);

  const handlePointerOver = useCallback((e) => {
    e.stopPropagation();
    setHoveredObject(item.id);
    document.body.style.cursor = 'pointer';
  }, [item.id, setHoveredObject]);

  const handlePointerOut = useCallback(() => {
    setHoveredObject(null);
    document.body.style.cursor = 'default';
  }, [setHoveredObject]);

  useFrame(() => {
    if (!groupRef.current) return;
    const s = hovered ? 1.1 : 1;
    groupRef.current.scale.lerp(new THREE.Vector3(s, s, s), 0.08);
  });

  const floatConfig = reducedMotion
    ? { speed: 0, floatIntensity: 0, rotationIntensity: 0 }
    : { speed: 2, floatIntensity: 0.4, rotationIntensity: 0.15 };

  return (
    <Float {...floatConfig}>
      <group
        ref={groupRef}
        position={[0, 0.9, 0]}
        onClick={handleClick}
        onPointerOver={handlePointerOver}
        onPointerOut={handlePointerOut}
      >
        {children}
      </group>
    </Float>
  );
}

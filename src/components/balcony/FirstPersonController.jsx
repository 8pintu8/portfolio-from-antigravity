import { useRef, useEffect, useCallback } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import { PointerLockControls } from '@react-three/drei';
import * as THREE from 'three';
import useStore from '../../store/useStore';

// ── Walkable area (inside railing) ──
const BOUNDS = {
  minX: -5.2,
  maxX: 5.2,
  minZ: -3.0,
  maxZ: 4.2,
};

const WALK_SPEED = 3.2;
const RUN_SPEED = 5.5;
const CROUCH_SPEED = 1.6;
const EYE_HEIGHT = 1.7;
const CROUCH_HEIGHT = 1.05;
const HEAD_BOB_SPEED = 9;
const HEAD_BOB_AMOUNT = 0.02;
const RUN_BOB_AMOUNT = 0.04;

// ── Collision boxes: [centerX, centerZ, halfW, halfD] ──
// Keep these small and accurate to actual furniture
const COLLISION_BOXES = [
  // Portfolio pedestals (small cylinders)
  { x: -2.5, z: -1.5, hw: 0.45, hd: 0.45 },
  { x: 1.8,  z: -2.0, hw: 0.45, hd: 0.45 },
  { x: 3.5,  z: 1.5,  hw: 0.45, hd: 0.45 },
  // Bench (left side)
  { x: -4.0, z: 2.5,  hw: 0.8,  hd: 0.35 },
  // Side table
  { x: -1.0, z: -0.5, hw: 0.35, hd: 0.35 },
  // Bookshelf (right wall)
  { x: 4.2,  z: 0.0,  hw: 0.3,  hd: 0.45 },
  // Large plant pot (back center)
  { x: 0.0,  z: 3.8,  hw: 0.3,  hd: 0.3 },
];

function checkCollision(px, pz, radius = 0.3) {
  for (const b of COLLISION_BOXES) {
    const cx = Math.max(b.x - b.hw, Math.min(px, b.x + b.hw));
    const cz = Math.max(b.z - b.hd, Math.min(pz, b.z + b.hd));
    const dx = px - cx;
    const dz = pz - cz;
    if (dx * dx + dz * dz < radius * radius) return true;
  }
  return false;
}

export default function FirstPersonController() {
  const controlsRef = useRef();
  const keys = useRef({ w: false, a: false, s: false, d: false, shift: false });
  const crouching = useRef(false);
  const bobPhase = useRef(0);
  const eyeHeight = useRef(EYE_HEIGHT);

  const { camera, gl } = useThree();
  const setIsPointerLocked = useStore((s) => s.setIsPointerLocked);
  const reducedMotion = useStore((s) => s.reducedMotion);

  // Spawn position (clear of all collision boxes)
  useEffect(() => {
    camera.position.set(0, EYE_HEIGHT, 2);
  }, [camera]);

  // Key listeners
  useEffect(() => {
    const down = (e) => {
      switch (e.code) {
        case 'KeyW': case 'ArrowUp':    keys.current.w = true; break;
        case 'KeyS': case 'ArrowDown':  keys.current.s = true; break;
        case 'KeyA': case 'ArrowLeft':  keys.current.a = true; break;
        case 'KeyD': case 'ArrowRight': keys.current.d = true; break;
        case 'ShiftLeft': case 'ShiftRight': keys.current.shift = true; break;
        case 'KeyC': crouching.current = !crouching.current; break;
      }
    };
    const up = (e) => {
      switch (e.code) {
        case 'KeyW': case 'ArrowUp':    keys.current.w = false; break;
        case 'KeyS': case 'ArrowDown':  keys.current.s = false; break;
        case 'KeyA': case 'ArrowLeft':  keys.current.a = false; break;
        case 'KeyD': case 'ArrowRight': keys.current.d = false; break;
        case 'ShiftLeft': case 'ShiftRight': keys.current.shift = false; break;
      }
    };
    window.addEventListener('keydown', down);
    window.addEventListener('keyup', up);
    return () => { window.removeEventListener('keydown', down); window.removeEventListener('keyup', up); };
  }, []);

  const onLock = useCallback(() => setIsPointerLocked(true), [setIsPointerLocked]);
  const onUnlock = useCallback(() => setIsPointerLocked(false), [setIsPointerLocked]);

  // Movement loop
  useFrame((_, delta) => {
    if (!document.pointerLockElement) return;

    const k = keys.current;
    const isCrouch = crouching.current;
    const isRun = k.shift && !isCrouch;
    const moving = k.w || k.a || k.s || k.d;

    // Smooth height transition
    const targetH = isCrouch ? CROUCH_HEIGHT : EYE_HEIGHT;
    eyeHeight.current += (targetH - eyeHeight.current) * 0.1;

    const speed = isCrouch ? CROUCH_SPEED : isRun ? RUN_SPEED : WALK_SPEED;

    if (moving) {
      // Camera forward/right on XZ plane
      const fwd = new THREE.Vector3();
      camera.getWorldDirection(fwd);
      fwd.y = 0;
      fwd.normalize();
      const right = new THREE.Vector3().crossVectors(fwd, camera.up).normalize();

      // Input direction
      const move = new THREE.Vector3();
      if (k.w) move.add(fwd);
      if (k.s) move.sub(fwd);
      if (k.d) move.add(right);
      if (k.a) move.sub(right);
      move.normalize().multiplyScalar(speed * delta);

      const nx = camera.position.x + move.x;
      const nz = camera.position.z + move.z;
      const cx = THREE.MathUtils.clamp(nx, BOUNDS.minX, BOUNDS.maxX);
      const cz = THREE.MathUtils.clamp(nz, BOUNDS.minZ, BOUNDS.maxZ);

      // Wall-slide collision
      if (!checkCollision(cx, cz)) {
        camera.position.x = cx;
        camera.position.z = cz;
      } else if (!checkCollision(cx, camera.position.z)) {
        camera.position.x = cx;
      } else if (!checkCollision(camera.position.x, cz)) {
        camera.position.z = cz;
      }

      // Head bob
      if (!reducedMotion) {
        const amt = isRun ? RUN_BOB_AMOUNT : HEAD_BOB_AMOUNT;
        const spd = isRun ? HEAD_BOB_SPEED * 1.3 : HEAD_BOB_SPEED;
        bobPhase.current += delta * spd;
        camera.position.y = eyeHeight.current + Math.sin(bobPhase.current) * amt;
      } else {
        camera.position.y = eyeHeight.current;
      }
    } else {
      camera.position.y += (eyeHeight.current - camera.position.y) * 0.12;
      bobPhase.current = 0;
    }
  });

  return (
    <PointerLockControls
      ref={controlsRef}
      args={[camera, gl.domElement]}
      onLock={onLock}
      onUnlock={onUnlock}
    />
  );
}

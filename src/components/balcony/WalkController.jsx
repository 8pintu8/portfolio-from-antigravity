import { useRef, useEffect, useCallback } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import useStore from '../../store/useStore';

/*
 * Walk Controller — drag-to-look, WASD-to-move, cursor always visible.
 *
 * How it works:
 * - Left-click drag on canvas → rotates the camera (look around)
 * - Left-click without drag → R3F handles raycasting (click on objects)
 * - WASD / Arrow keys → walk relative to camera direction
 * - Shift → run, C → crouch toggle
 * - Cursor is ALWAYS visible. No pointer lock. No mode switching.
 */

const BOUNDS = { minX: -5.2, maxX: 5.2, minZ: -3.0, maxZ: 4.2 };
const WALK_SPEED = 3.2;
const RUN_SPEED = 5.5;
const CROUCH_SPEED = 1.6;
const EYE_HEIGHT = 1.7;
const CROUCH_HEIGHT = 1.05;
const LOOK_SPEED = 0.003;
const HEAD_BOB_SPEED = 9;
const HEAD_BOB_AMOUNT = 0.02;

// Collision boxes: { x, z, halfWidth, halfDepth }
const COLLIDERS = [
  { x: -2.5, z: -1.5, hw: 0.45, hd: 0.45 },
  { x: 1.8,  z: -2.0, hw: 0.45, hd: 0.45 },
  { x: 3.5,  z: 1.5,  hw: 0.45, hd: 0.45 },
  { x: -4.0, z: 2.5,  hw: 0.8,  hd: 0.35 },
  { x: -1.0, z: -0.5, hw: 0.35, hd: 0.35 },
  { x: 4.2,  z: 0.0,  hw: 0.3,  hd: 0.45 },
  { x: 0.0,  z: 3.8,  hw: 0.3,  hd: 0.3 },
];

function collides(px, pz, r = 0.3) {
  for (const b of COLLIDERS) {
    const cx = Math.max(b.x - b.hw, Math.min(px, b.x + b.hw));
    const cz = Math.max(b.z - b.hd, Math.min(pz, b.z + b.hd));
    const dx = px - cx, dz = pz - cz;
    if (dx * dx + dz * dz < r * r) return true;
  }
  return false;
}

export default function WalkController() {
  const { camera, gl } = useThree();
  const euler = useRef(new THREE.Euler(0, 0, 0, 'YXZ'));
  const keys = useRef({});
  const crouching = useRef(false);
  const bobPhase = useRef(0);
  const eyeH = useRef(EYE_HEIGHT);

  // Drag state
  const dragging = useRef(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const dragMoved = useRef(false);
  const isDragging = useStore((s) => s.isDragging);
  const setIsDragging = useStore((s) => s.setIsDragging);

  const reducedMotion = useStore((s) => s.reducedMotion);

  // Init camera
  useEffect(() => {
    camera.position.set(0, EYE_HEIGHT, 2);
    euler.current.setFromQuaternion(camera.quaternion);
  }, [camera]);

  // Keyboard
  useEffect(() => {
    const down = (e) => {
      keys.current[e.code] = true;
      if (e.code === 'KeyC') crouching.current = !crouching.current;
    };
    const up = (e) => { keys.current[e.code] = false; };
    window.addEventListener('keydown', down);
    window.addEventListener('keyup', up);
    return () => { window.removeEventListener('keydown', down); window.removeEventListener('keyup', up); };
  }, []);

  // Mouse drag-to-look on the canvas element
  useEffect(() => {
    const canvas = gl.domElement;

    const onDown = (e) => {
      if (e.button !== 0) return; // left button only
      dragging.current = true;
      dragMoved.current = false;
      dragStart.current = { x: e.clientX, y: e.clientY };
    };

    const onMove = (e) => {
      if (!dragging.current) return;

      const dx = e.clientX - dragStart.current.x;
      const dy = e.clientY - dragStart.current.y;

      // Only count as a drag if moved more than 3px
      if (Math.abs(dx) > 3 || Math.abs(dy) > 3) {
        if (!dragMoved.current) {
          dragMoved.current = true;
          setIsDragging(true);
        }
      }

      if (dragMoved.current) {
        euler.current.y -= e.movementX * LOOK_SPEED;
        euler.current.x -= e.movementY * LOOK_SPEED;
        euler.current.x = Math.max(-Math.PI / 2.5, Math.min(Math.PI / 2.5, euler.current.x));
        camera.quaternion.setFromEuler(euler.current);
      }
    };

    const onUp = () => {
      dragging.current = false;
      // Small delay so R3F click handlers can check isDragging
      setTimeout(() => setIsDragging(false), 50);
    };

    canvas.addEventListener('mousedown', onDown);
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);

    return () => {
      canvas.removeEventListener('mousedown', onDown);
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
  }, [camera, gl.domElement, setIsDragging]);

  // Touch support: drag to look
  useEffect(() => {
    const canvas = gl.domElement;
    let touchId = null;
    let lastTouch = { x: 0, y: 0 };

    const onStart = (e) => {
      if (touchId !== null) return;
      const t = e.changedTouches[0];
      touchId = t.identifier;
      lastTouch = { x: t.clientX, y: t.clientY };
      setIsDragging(true);
    };
    const onMoveT = (e) => {
      for (const t of e.changedTouches) {
        if (t.identifier !== touchId) continue;
        const dx = t.clientX - lastTouch.x;
        const dy = t.clientY - lastTouch.y;
        euler.current.y -= dx * LOOK_SPEED;
        euler.current.x -= dy * LOOK_SPEED;
        euler.current.x = Math.max(-Math.PI / 2.5, Math.min(Math.PI / 2.5, euler.current.x));
        camera.quaternion.setFromEuler(euler.current);
        lastTouch = { x: t.clientX, y: t.clientY };
      }
    };
    const onEnd = (e) => {
      for (const t of e.changedTouches) {
        if (t.identifier === touchId) { touchId = null; setIsDragging(false); }
      }
    };

    canvas.addEventListener('touchstart', onStart, { passive: true });
    canvas.addEventListener('touchmove', onMoveT, { passive: true });
    canvas.addEventListener('touchend', onEnd);

    return () => {
      canvas.removeEventListener('touchstart', onStart);
      canvas.removeEventListener('touchmove', onMoveT);
      canvas.removeEventListener('touchend', onEnd);
    };
  }, [camera, gl.domElement, setIsDragging]);

  // Movement loop
  useFrame((_, delta) => {
    const k = keys.current;
    const wk = k.KeyW || k.ArrowUp;
    const sk = k.KeyS || k.ArrowDown;
    const ak = k.KeyA || k.ArrowLeft;
    const dk = k.KeyD || k.ArrowRight;
    const run = (k.ShiftLeft || k.ShiftRight) && !crouching.current;
    const moving = wk || sk || ak || dk;

    // Height
    const targetH = crouching.current ? CROUCH_HEIGHT : EYE_HEIGHT;
    eyeH.current += (targetH - eyeH.current) * 0.1;

    if (moving) {
      const speed = crouching.current ? CROUCH_SPEED : run ? RUN_SPEED : WALK_SPEED;
      const fwd = new THREE.Vector3();
      camera.getWorldDirection(fwd);
      fwd.y = 0; fwd.normalize();
      const right = new THREE.Vector3().crossVectors(fwd, camera.up).normalize();

      const move = new THREE.Vector3();
      if (wk) move.add(fwd);
      if (sk) move.sub(fwd);
      if (dk) move.add(right);
      if (ak) move.sub(right);
      move.normalize().multiplyScalar(speed * delta);

      const nx = THREE.MathUtils.clamp(camera.position.x + move.x, BOUNDS.minX, BOUNDS.maxX);
      const nz = THREE.MathUtils.clamp(camera.position.z + move.z, BOUNDS.minZ, BOUNDS.maxZ);

      if (!collides(nx, nz)) {
        camera.position.x = nx;
        camera.position.z = nz;
      } else if (!collides(nx, camera.position.z)) {
        camera.position.x = nx;
      } else if (!collides(camera.position.x, nz)) {
        camera.position.z = nz;
      }

      // Head bob
      if (!reducedMotion) {
        const amt = run ? HEAD_BOB_AMOUNT * 2 : HEAD_BOB_AMOUNT;
        bobPhase.current += delta * (run ? HEAD_BOB_SPEED * 1.3 : HEAD_BOB_SPEED);
        camera.position.y = eyeH.current + Math.sin(bobPhase.current) * amt;
      } else {
        camera.position.y = eyeH.current;
      }
    } else {
      camera.position.y += (eyeH.current - camera.position.y) * 0.12;
      bobPhase.current = 0;
    }
  });

  return null; // No PointerLockControls — just logic
}

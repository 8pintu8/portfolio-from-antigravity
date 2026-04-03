/**
 * ╔══════════════════════════════════════════════════════════════════╗
 * ║  WalkController.jsx — First-person camera for the 3D balcony   ║
 * ╚══════════════════════════════════════════════════════════════════╝
 *
 * HOW IT WORKS:
 *   Desktop:  Click-drag on canvas to look around. WASD / Arrow keys to walk.
 *   Mobile:   Single-finger drag to pan the camera. No keyboard needed.
 *   Both:     Click (without dragging) triggers R3F's normal raycasting,
 *             so PortfolioObject onClick handlers fire naturally.
 *
 * CONTROLS:
 *   Mouse drag / Touch drag  →  Rotate camera (look around)
 *   WASD / Arrow keys        →  Walk relative to camera heading
 *   Shift                    →  Run (faster speed)
 *   C                        →  Toggle crouch (lower eye-height, slower)
 *
 * HOW TO EDIT:
 *   - Change WALK_SPEED, RUN_SPEED, CROUCH_SPEED below to adjust movement feel
 *   - Change BOUNDS to expand/shrink the walkable area
 *   - Add new furniture collision boxes to the COLLIDERS array
 *   - Change LOOK_SPEED to make camera rotation faster/slower
 *   - Change EYE_HEIGHT / CROUCH_HEIGHT to adjust camera vertical position
 *
 * MOBILE BEHAVIOR:
 *   On touch devices, `isMobile` auto-detects and enables:
 *   - Gentle auto-orbit so the scene doesn't feel static
 *   - Single-finger drag rotates the camera
 *   - Tap (without drag) triggers object clicks via R3F
 *   - No on-screen joystick — clean, intuitive
 */

import { useRef, useEffect, useMemo } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import useStore from '../../store/useStore';

// ─────────────────────────────────────────────
// CONFIGURATION — edit these values to tune feel
// ─────────────────────────────────────────────

/** Walkable area boundaries (matches balcony railing/walls) */
const BOUNDS = { minX: -5.2, maxX: 5.2, minZ: -3.0, maxZ: 4.2 };

/** Movement speeds (units per second) */
const WALK_SPEED = 3.2;
const RUN_SPEED = 5.5;
const CROUCH_SPEED = 1.6;

/** Camera eye heights */
const EYE_HEIGHT = 1.7;
const CROUCH_HEIGHT = 1.05;

/** Mouse/touch look sensitivity (radians per pixel of drag) */
const LOOK_SPEED = 0.003;

/** Head bob (walking animation) */
const HEAD_BOB_SPEED = 9;
const HEAD_BOB_AMOUNT = 0.02;

/** Mobile auto-orbit speed (radians per second, very gentle) */
const AUTO_ORBIT_SPEED = 0.04;

// ─────────────────────────────────────────────
// COLLISION BOXES — add new furniture here
// ─────────────────────────────────────────────
// Each box: { x, z, hw, hd }
//   x, z    = center position on the floor
//   hw      = half-width along X axis
//   hd      = half-depth along Z axis
//
// HOW TO ADD: when you place a new mesh in the scene,
// add an entry here with its position and approximate size.

const COLLIDERS = [
  { x: -2.5, z: -1.5, hw: 0.45, hd: 0.45 },   // Product design pedestal
  { x: 1.8,  z: -2.0, hw: 0.45, hd: 0.45 },   // Kinetic sculpture pedestal
  { x: 3.5,  z: 1.5,  hw: 0.45, hd: 0.45 },   // Research pedestal
  { x: -4.0, z: 2.5,  hw: 0.8,  hd: 0.35 },   // Wooden bench
  { x: -1.0, z: -0.5, hw: 0.35, hd: 0.35 },   // Side table
  { x: 4.2,  z: 0.0,  hw: 0.3,  hd: 0.45 },   // Bookshelf
  { x: 0.0,  z: 3.8,  hw: 0.3,  hd: 0.3 },    // Large plant pot
];

/**
 * Check if position (px, pz) collides with any box.
 * Uses closest-point-on-AABB distance check with player radius.
 */
function collides(px, pz, r = 0.3) {
  for (const b of COLLIDERS) {
    const cx = Math.max(b.x - b.hw, Math.min(px, b.x + b.hw));
    const cz = Math.max(b.z - b.hd, Math.min(pz, b.z + b.hd));
    const dx = px - cx;
    const dz = pz - cz;
    if (dx * dx + dz * dz < r * r) return true;
  }
  return false;
}

// ─────────────────────────────────────────────
// COMPONENT
// ─────────────────────────────────────────────

export default function WalkController() {
  const { camera, gl } = useThree();

  // Camera rotation stored as Euler angles (YXZ = yaw first, then pitch)
  const euler = useRef(new THREE.Euler(0, 0, 0, 'YXZ'));

  // Currently pressed keys (keyed by e.code)
  const keys = useRef({});
  const crouching = useRef(false);
  const bobPhase = useRef(0);
  const eyeH = useRef(EYE_HEIGHT);

  // Drag-to-look state
  const dragging = useRef(false);
  const lastDragPos = useRef({ x: 0, y: 0 });
  const dragMoved = useRef(false);

  // Store bindings
  const setIsDragging = useStore((s) => s.setIsDragging);
  const reducedMotion = useStore((s) => s.reducedMotion);

  // Detect touch device (for auto-orbit on mobile)
  const isMobile = useMemo(() => {
    return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  }, []);

  // ── Initialize camera position ──
  useEffect(() => {
    camera.position.set(0, EYE_HEIGHT, 2);
    euler.current.setFromQuaternion(camera.quaternion);
  }, [camera]);

  // ── Keyboard listeners (desktop only) ──
  useEffect(() => {
    const down = (e) => {
      keys.current[e.code] = true;
      if (e.code === 'KeyC') crouching.current = !crouching.current;
    };
    const up = (e) => {
      keys.current[e.code] = false;
    };
    window.addEventListener('keydown', down);
    window.addEventListener('keyup', up);
    return () => {
      window.removeEventListener('keydown', down);
      window.removeEventListener('keyup', up);
    };
  }, []);

  // ── Mouse drag-to-look (desktop) ──
  useEffect(() => {
    const canvas = gl.domElement;

    const onDown = (e) => {
      if (e.button !== 0) return; // Left button only
      dragging.current = true;
      dragMoved.current = false;
      lastDragPos.current = { x: e.clientX, y: e.clientY };
    };

    const onMove = (e) => {
      if (!dragging.current) return;

      // Calculate how far mouse moved since last frame
      const deltaX = e.clientX - lastDragPos.current.x;
      const deltaY = e.clientY - lastDragPos.current.y;

      // Only count as drag if moved more than 3px total (avoids accidental drags)
      if (!dragMoved.current && (Math.abs(deltaX) > 3 || Math.abs(deltaY) > 3)) {
        dragMoved.current = true;
        setIsDragging(true);
      }

      if (dragMoved.current) {
        // Rotate camera based on mouse delta
        euler.current.y -= deltaX * LOOK_SPEED;
        euler.current.x -= deltaY * LOOK_SPEED;
        // Clamp vertical look to prevent flipping
        euler.current.x = Math.max(-Math.PI / 2.5, Math.min(Math.PI / 2.5, euler.current.x));
        camera.quaternion.setFromEuler(euler.current);
      }

      // Update for next frame's delta calculation
      lastDragPos.current = { x: e.clientX, y: e.clientY };
    };

    const onUp = () => {
      dragging.current = false;
      // Small delay so R3F onClick handlers can check isDragging before it clears
      setTimeout(() => setIsDragging(false), 60);
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

  // ── Touch drag-to-look (mobile) ──
  useEffect(() => {
    const canvas = gl.domElement;
    let touchId = null;
    let lastTouch = { x: 0, y: 0 };
    let touchStartTime = 0;

    const onStart = (e) => {
      if (touchId !== null) return; // Only track one finger
      const t = e.changedTouches[0];
      touchId = t.identifier;
      lastTouch = { x: t.clientX, y: t.clientY };
      touchStartTime = Date.now();
      dragMoved.current = false;
    };

    const onMoveT = (e) => {
      for (const t of e.changedTouches) {
        if (t.identifier !== touchId) continue;
        const dx = t.clientX - lastTouch.x;
        const dy = t.clientY - lastTouch.y;

        if (!dragMoved.current && (Math.abs(dx) > 5 || Math.abs(dy) > 5)) {
          dragMoved.current = true;
          setIsDragging(true);
        }

        if (dragMoved.current) {
          euler.current.y -= dx * LOOK_SPEED;
          euler.current.x -= dy * LOOK_SPEED;
          euler.current.x = Math.max(-Math.PI / 2.5, Math.min(Math.PI / 2.5, euler.current.x));
          camera.quaternion.setFromEuler(euler.current);
        }

        lastTouch = { x: t.clientX, y: t.clientY };
      }
    };

    const onEnd = (e) => {
      for (const t of e.changedTouches) {
        if (t.identifier === touchId) {
          touchId = null;
          setTimeout(() => setIsDragging(false), 60);
        }
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

  // ── Per-frame update: movement + head bob + auto-orbit ──
  useFrame((_, delta) => {
    const k = keys.current;
    const wk = k.KeyW || k.ArrowUp;
    const sk = k.KeyS || k.ArrowDown;
    const ak = k.KeyA || k.ArrowLeft;
    const dk = k.KeyD || k.ArrowRight;
    const run = (k.ShiftLeft || k.ShiftRight) && !crouching.current;
    const moving = wk || sk || ak || dk;

    // ── Smooth height transition (standing ↔ crouching) ──
    const targetH = crouching.current ? CROUCH_HEIGHT : EYE_HEIGHT;
    eyeH.current += (targetH - eyeH.current) * 0.1;

    if (moving) {
      // ── WASD movement (desktop) ──
      const speed = crouching.current ? CROUCH_SPEED : run ? RUN_SPEED : WALK_SPEED;

      // Get camera forward vector projected onto XZ plane
      const fwd = new THREE.Vector3();
      camera.getWorldDirection(fwd);
      fwd.y = 0;
      fwd.normalize();
      const right = new THREE.Vector3().crossVectors(fwd, camera.up).normalize();

      // Combine input
      const move = new THREE.Vector3();
      if (wk) move.add(fwd);
      if (sk) move.sub(fwd);
      if (dk) move.add(right);
      if (ak) move.sub(right);
      move.normalize().multiplyScalar(speed * delta);

      // Apply bounds clamping
      const nx = THREE.MathUtils.clamp(camera.position.x + move.x, BOUNDS.minX, BOUNDS.maxX);
      const nz = THREE.MathUtils.clamp(camera.position.z + move.z, BOUNDS.minZ, BOUNDS.maxZ);

      // Wall-slide collision: try both axes, then each individually
      if (!collides(nx, nz)) {
        camera.position.x = nx;
        camera.position.z = nz;
      } else if (!collides(nx, camera.position.z)) {
        camera.position.x = nx; // Slide along X
      } else if (!collides(camera.position.x, nz)) {
        camera.position.z = nz; // Slide along Z
      }

      // ── Head bob animation ──
      if (!reducedMotion) {
        const amt = run ? HEAD_BOB_AMOUNT * 2 : HEAD_BOB_AMOUNT;
        bobPhase.current += delta * (run ? HEAD_BOB_SPEED * 1.3 : HEAD_BOB_SPEED);
        camera.position.y = eyeH.current + Math.sin(bobPhase.current) * amt;
      } else {
        camera.position.y = eyeH.current;
      }
    } else {
      // ── Idle — settle to standing height ──
      camera.position.y += (eyeH.current - camera.position.y) * 0.12;
      bobPhase.current = 0;

      // ── Mobile auto-orbit (gentle rotation when idle) ──
      if (isMobile && !dragging.current && !reducedMotion) {
        euler.current.y += AUTO_ORBIT_SPEED * delta;
        camera.quaternion.setFromEuler(euler.current);
      }
    }
  });

  // This component is pure logic — no JSX elements rendered
  return null;
}

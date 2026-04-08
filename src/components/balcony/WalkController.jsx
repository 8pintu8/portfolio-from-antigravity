/**
 * ╔══════════════════════════════════════════════════════════════════╗
 * ║  WalkController.jsx — First-person camera for the 3D balcony   ║
 * ╚══════════════════════════════════════════════════════════════════╝
 *
 * HOW IT WORKS:
 *   Desktop:  Click-drag to look. WASD / Arrow keys to walk.
 *   Mobile:   Two-zone touch system:
 *             - Left half of screen  = virtual joystick (move)
 *             - Right half of screen = drag to look around
 *             - Tap anywhere = object interaction
 *
 * CONTROLS (Desktop):
 *   Mouse drag         →  Rotate camera (INVERTED X & Y)
 *   WASD / Arrow keys  →  Walk relative to camera heading
 *   Shift              →  Run (faster speed)
 *   C (hold)           →  Crouch (lower eye-height, only while held)
 *
 * CONTROLS (Mobile):
 *   Left-half drag     →  Move (like a joystick, relative to camera)
 *   Right-half drag    →  Look around (INVERTED)
 *   Tap                →  Interact with 3D objects
 *
 * AXIS INVERSION:
 *   Both X and Y axes are inverted for look controls.
 *   Drag right → camera looks LEFT. Drag down → camera looks UP.
 *   This applies to BOTH desktop mouse and mobile touch.
 *
 * NO AUTO-ROTATION:
 *   The camera never moves unless the user provides input.
 *
 * HOW TO EDIT:
 *   - Change WALK_SPEED, RUN_SPEED, CROUCH_SPEED to adjust movement
 *   - Change BOUNDS to expand/shrink the walkable area
 *   - Add collision boxes to COLLIDERS array
 *   - Change LOOK_SPEED for faster/slower camera rotation
 *   - Change EYE_HEIGHT / CROUCH_HEIGHT for camera position
 *   - Set INVERT_X / INVERT_Y to false to un-invert an axis
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

/** Mobile look sensitivity (slightly lower for touch precision) */
const MOBILE_LOOK_SPEED = 0.004;

/** Mobile move sensitivity (joystick-style, pixels to speed ratio) */
const MOBILE_MOVE_SENSITIVITY = 0.015;

/** Head bob (walking animation) */
const HEAD_BOB_SPEED = 9;
const HEAD_BOB_AMOUNT = 0.02;

/**
 * AXIS INVERSION — set to true to invert
 * When true: drag right → look left, drag down → look up
 * Applies to ALL devices (desktop, laptop, mobile, tablet)
 */
const INVERT_X = true;
const INVERT_Y = true;

// ─────────────────────────────────────────────
// COLLISION BOXES — add new furniture here
// ─────────────────────────────────────────────
// Each box: { x, z, hw, hd }
//   x, z    = center position on the floor
//   hw      = half-width along X axis
//   hd      = half-depth along Z axis

const COLLIDERS = [
  { x: -2.5, z: -1.5, hw: 0.45, hd: 0.45 },   // Product design pedestal
  { x: 1.8,  z: -2.0, hw: 0.45, hd: 0.45 },   // Kinetic sculpture pedestal
  { x: 3.5,  z: 1.5,  hw: 0.45, hd: 0.45 },   // Research pedestal
  { x: -3.5, z: 2.0,  hw: 0.45, hd: 0.45 },   // About pedestal
  { x: -1.5, z: 3.2,  hw: 0.45, hd: 0.45 },   // Diary pedestal
  { x: 2.5,  z: 3.2,  hw: 0.45, hd: 0.45 },   // Contact pedestal
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
  const bobPhase = useRef(0);
  const eyeH = useRef(EYE_HEIGHT);

  // Drag-to-look state (desktop)
  const dragging = useRef(false);
  const lastDragPos = useRef({ x: 0, y: 0 });
  const dragMoved = useRef(false);

  // Mobile touch state
  const moveTouch = useRef(null);      // Left-half finger (movement)
  const lookTouch = useRef(null);      // Right-half finger (look)
  const moveTouchStart = useRef({ x: 0, y: 0 });
  const lookTouchLast = useRef({ x: 0, y: 0 });
  const mobileMove = useRef({ x: 0, z: 0 }); // Normalized movement vector
  const lookTouchMoved = useRef(false);

  // Store bindings
  const setIsDragging = useStore((s) => s.setIsDragging);
  const reducedMotion = useStore((s) => s.reducedMotion);

  // Detect touch device
  const isMobile = useMemo(() => {
    return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  }, []);

  // ── Initialize camera position — looking STRAIGHT AHEAD ──
  useEffect(() => {
    camera.position.set(0, EYE_HEIGHT, 2);
    // Set euler to (0, 0, 0) = looking horizontally forward along -Z
    euler.current.set(0, 0, 0, 'YXZ');
    camera.quaternion.setFromEuler(euler.current);
  }, [camera]);

  // ── Keyboard listeners (desktop) ──
  useEffect(() => {
    const down = (e) => {
      keys.current[e.code] = true;
      // Crouch is HOLD, not toggle — handled in useFrame via keys.current
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

  // ── Mouse drag-to-look (desktop) — INVERTED AXES ──
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

      const deltaX = e.clientX - lastDragPos.current.x;
      const deltaY = e.clientY - lastDragPos.current.y;

      // Only count as drag if moved more than 3px (avoids accidental drags)
      if (!dragMoved.current && (Math.abs(deltaX) > 3 || Math.abs(deltaY) > 3)) {
        dragMoved.current = true;
        setIsDragging(true);
      }

      if (dragMoved.current) {
        // Apply inversion: positive = inverted direction
        const xSign = INVERT_X ? 1 : -1;
        const ySign = INVERT_Y ? 1 : -1;
        euler.current.y += deltaX * LOOK_SPEED * xSign;
        euler.current.x += deltaY * LOOK_SPEED * ySign;
        // Clamp vertical look to prevent flipping
        euler.current.x = Math.max(-Math.PI / 2.5, Math.min(Math.PI / 2.5, euler.current.x));
        camera.quaternion.setFromEuler(euler.current);
      }

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

  // ── Touch controls (mobile) — TWO-ZONE: left=move, right=look ──
  useEffect(() => {
    const canvas = gl.domElement;
    const halfWidth = () => window.innerWidth / 2;

    const onStart = (e) => {
      for (const t of e.changedTouches) {
        if (t.clientX < halfWidth() && moveTouch.current === null) {
          // LEFT HALF → movement joystick
          moveTouch.current = t.identifier;
          moveTouchStart.current = { x: t.clientX, y: t.clientY };
          mobileMove.current = { x: 0, z: 0 };
        } else if (t.clientX >= halfWidth() && lookTouch.current === null) {
          // RIGHT HALF → look camera
          lookTouch.current = t.identifier;
          lookTouchLast.current = { x: t.clientX, y: t.clientY };
          lookTouchMoved.current = false;
        }
      }
    };

    const onMoveT = (e) => {
      for (const t of e.changedTouches) {
        // ── Movement touch (left side) ──
        if (t.identifier === moveTouch.current) {
          const dx = t.clientX - moveTouchStart.current.x;
          const dy = t.clientY - moveTouchStart.current.y;
          // Normalize to -1..1 range (deadzone of 10px)
          const mag = Math.sqrt(dx * dx + dy * dy);
          if (mag > 10) {
            const norm = Math.min(mag, 100) / 100; // Cap at 100px radius
            mobileMove.current = {
              x: (dx / mag) * norm,
              z: (dy / mag) * norm,
            };
          } else {
            mobileMove.current = { x: 0, z: 0 };
          }
        }

        // ── Look touch (right side) — INVERTED ──
        if (t.identifier === lookTouch.current) {
          const dx = t.clientX - lookTouchLast.current.x;
          const dy = t.clientY - lookTouchLast.current.y;

          if (!lookTouchMoved.current && (Math.abs(dx) > 5 || Math.abs(dy) > 5)) {
            lookTouchMoved.current = true;
            setIsDragging(true);
          }

          if (lookTouchMoved.current) {
            const xSign = INVERT_X ? 1 : -1;
            const ySign = INVERT_Y ? 1 : -1;
            euler.current.y += dx * MOBILE_LOOK_SPEED * xSign;
            euler.current.x += dy * MOBILE_LOOK_SPEED * ySign;
            euler.current.x = Math.max(-Math.PI / 2.5, Math.min(Math.PI / 2.5, euler.current.x));
            camera.quaternion.setFromEuler(euler.current);
          }

          lookTouchLast.current = { x: t.clientX, y: t.clientY };
        }
      }
    };

    const onEnd = (e) => {
      for (const t of e.changedTouches) {
        if (t.identifier === moveTouch.current) {
          moveTouch.current = null;
          mobileMove.current = { x: 0, z: 0 };
        }
        if (t.identifier === lookTouch.current) {
          lookTouch.current = null;
          setTimeout(() => setIsDragging(false), 60);
        }
      }
    };

    canvas.addEventListener('touchstart', onStart, { passive: true });
    canvas.addEventListener('touchmove', onMoveT, { passive: true });
    canvas.addEventListener('touchend', onEnd);
    canvas.addEventListener('touchcancel', onEnd);

    return () => {
      canvas.removeEventListener('touchstart', onStart);
      canvas.removeEventListener('touchmove', onMoveT);
      canvas.removeEventListener('touchend', onEnd);
      canvas.removeEventListener('touchcancel', onEnd);
    };
  }, [camera, gl.domElement, setIsDragging]);

  // ── Per-frame update: movement + head bob ──
  useFrame((_, delta) => {
    const k = keys.current;
    const wk = k.KeyW || k.ArrowUp;
    const sk = k.KeyS || k.ArrowDown;
    const ak = k.KeyA || k.ArrowLeft;
    const dk = k.KeyD || k.ArrowRight;
    const run = (k.ShiftLeft || k.ShiftRight);

    // Crouch is HOLD — only active while C is held down
    const crouching = k.KeyC || false;

    const kbMoving = wk || sk || ak || dk;
    const mobileMoving = Math.abs(mobileMove.current.x) > 0.01 || Math.abs(mobileMove.current.z) > 0.01;
    const moving = kbMoving || mobileMoving;

    // ── Smooth height transition (standing ↔ crouching) ──
    const targetH = crouching ? CROUCH_HEIGHT : EYE_HEIGHT;
    eyeH.current += (targetH - eyeH.current) * 0.1;

    if (moving) {
      const speed = crouching ? CROUCH_SPEED : run ? RUN_SPEED : WALK_SPEED;

      // Get camera forward/right vectors projected onto XZ plane
      const fwd = new THREE.Vector3();
      camera.getWorldDirection(fwd);
      fwd.y = 0;
      fwd.normalize();
      const right = new THREE.Vector3().crossVectors(fwd, camera.up).normalize();

      const move = new THREE.Vector3();

      if (kbMoving) {
        // ── Desktop WASD movement ──
        if (wk) move.add(fwd);
        if (sk) move.sub(fwd);
        if (dk) move.add(right);
        if (ak) move.sub(right);
      } else if (mobileMoving) {
        // ── Mobile joystick movement ──
        // mobileMove.x = left/right, mobileMove.z = forward/backward
        move.addScaledVector(right, mobileMove.current.x);
        move.addScaledVector(fwd, -mobileMove.current.z); // Negative because drag-down = move forward
      }

      move.normalize().multiplyScalar(speed * delta);

      // Apply bounds clamping
      const nx = THREE.MathUtils.clamp(camera.position.x + move.x, BOUNDS.minX, BOUNDS.maxX);
      const nz = THREE.MathUtils.clamp(camera.position.z + move.z, BOUNDS.minZ, BOUNDS.maxZ);

      // Wall-slide collision: try both axes, then each individually
      if (!collides(nx, nz)) {
        camera.position.x = nx;
        camera.position.z = nz;
      } else if (!collides(nx, camera.position.z)) {
        camera.position.x = nx;
      } else if (!collides(camera.position.x, nz)) {
        camera.position.z = nz;
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
      // NO auto-orbit — camera only moves on user input
    }
  });

  return null;
}

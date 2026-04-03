# Design Decisions — The Balcony (Spatial Portfolio) — V2

> Updated design document reflecting all V2 changes: campus, cozy environment, collision, run/crouch, cloud animation, time/weather overrides, and Tiny Glade inspiration.

---

## V2 Changes Summary

| Change | What was done |
|--------|---------------|
| **Z-fighting fix** | Replaced `planeGeometry` floor with `boxGeometry` (0.15 thick) at y=0.02. Tile lines offset to y=0.105. No more z-fighting. |
| **Run & Crouch** | Shift = run (5.5 m/s), C = toggle crouch (1.0m eye height, 1.5 m/s). Running has exaggerated head bob. |
| **Animated clouds** | Replaced static billboard planes with drei `<Cloud>` components that drift and morph. Count/opacity responds to weather. |
| **Cozy balcony** | String lights (catenary wire with glowing bulbs), potted plants (layered spheres), bench with cushion, floor rug, lanterns, side table, bookshelf with books. Lights auto-activate at dusk. |
| **Campus environment** | Courtyard below, neighboring buildings with roofs/windows, stone path, 12 trees (layered canopy style), hedges, lamp posts, outdoor bench. The balcony is part of a building with a back wall, windows, and a door. |
| **Organic placement** | Product Design near the rug area, Kinetic Sculpture near front railing (visible landmark), Research near the bookshelf (thematic). |
| **Collision detection** | AABB collision system checks player position against 7 defined boxes (pedestals, furniture). Wall-sliding lets you move along blocked axes. |
| **Mode switching** | Click interactable → exits pointer lock, shows cursor (interact mode). Esc → re-locks pointer (explore mode). Info panel only visible in interact mode. |
| **No location display** | Badge shows only weather emoji + temperature + time. No city/country. |
| **Time/Weather overrides** | 🌦️ button opens panel with time slider (0-24h) and weather grid (7 options). Auto reset button (🔄) returns to real values. |
| **Tiny Glade inspiration** | Warm stone/wood materials, layered sphere tree canopies, wrought iron railings, cozy string lights, terracotta/earthy palette. |

---

## Architecture (unchanged from V1)

See the original DESIGN_DECISIONS.md in the parent folder for:
- Why React Three Fiber over raw Three.js
- Performance tier breakdown (High/Medium/Low)
- SunCalc + Open-Meteo integration
- Geolocation strategy
- Theme system
- Audio system
- Accessibility approach
- Hosting on Hostinger

---

## Collision System

### Approach: Simple AABB (Axis-Aligned Bounding Box)

Each collidable object has a defined box: `{ x, z, halfWidth, halfDepth }`.

Before moving the camera, we test the proposed position against all boxes using closest-point distance:
```javascript
const closestX = clamp(newX, box.x - box.hw, box.x + box.hw);
const closestZ = clamp(newZ, box.z - box.hd, box.z + box.hd);
const dist = sqrt(dx*dx + dz*dz);
if (dist < playerRadius) → blocked
```

**Wall-sliding**: If both axes are blocked, we try each axis independently. This lets players "slide" along walls rather than getting stuck.

### Why not physics (Rapier/Cannon)?
Full physics would add 200-400KB to the bundle and significant per-frame CPU cost. Since we have a flat floor with no jumping or gravity, AABB checks are sufficient and cost almost nothing.

---

## Mode System

```
┌──────────────┐    Click Object    ┌──────────────────┐
│  EXPLORE     │ ─────────────────→ │  INTERACT        │
│  Pointer     │                    │  Cursor visible   │
│  Locked      │ ←───────────────── │  Info panel shown │
│  WASD moves  │    Press Escape    │  Mouse works      │
└──────────────┘                    └──────────────────┘
```

- **Explore mode**: PointerLockControls active, WASD movement, crosshair visible
- **Interact mode**: Pointer unlocked, cursor visible, info panel shown, UI fully interactive

---

## Time & Weather Override System

### Time Override
- Stored as `timeOverride: null | 0-24` in Zustand
- When non-null, `computeSun()` creates a modified `Date` with the override hour
- All sky, lighting, and ambient effects respond immediately
- Slider goes 0-24 in 15-minute steps (0.25 increment)
- 🔄 button resets to `null` (auto/real time)

### Weather Override  
- Stored as `weatherOverride: null | 'clear' | 'clouds' | ...`
- When non-null, the `weather` state uses the live weather data but replaces `.condition`
- All weather effects (particles, fog, sky turbidity, cloud count) respond immediately
- 🔄 ("Auto") button resets to real weather

---

## Future Recommendations (updated)

### Already recommended in V1 (still valid):
1. Telescope, Gramophone, Dynamic vegetation, Contact mailbox
2. GLTF model support, Volumetric fog, Water feature, Custom skybox
3. Seasonal changes, Bird flocks, Interactive bookshelf, AR mode

### New recommendations for V2+:
16. **Interior room**: Make the door on the back wall openable, revealing an interior room
17. **NPC characters**: Small stylized figures walking in the campus courtyard
18. **Day/night cycle animation**: Let the time scrubber animate in real-time (timelapse mode)
19. **Ambient campus sounds**: Different audio zones (birds near trees, fountain sounds from courtyard)
20. **Procedural vegetation**: GPU-instanced grass blades with wind animation on the campus ground
21. **Shadow softening**: Contact-hardening shadows for more realistic shadow falloff
22. **Photo mode**: Hide all UI and let users capture screenshots with custom camera angles

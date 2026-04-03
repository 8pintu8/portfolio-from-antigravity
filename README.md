# The Balcony — A Spatial Portfolio

An immersive 3D portfolio experience built with React Three Fiber. Instead of a flat page, your portfolio is a **balcony** — a warm, cozy space overlooking a distant horizon, where your work is displayed as interactive 3D objects.

---

## Quick Start

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

---

## Project Structure

```
src/
├── data/                   ← ⭐ EDIT THESE to update your content
│   ├── portfolio.js        ← Projects, bio, skills, social links, contact
│   └── diary.js            ← Digital diary / scrapbook entries
│
├── config/
│   └── theme.js            ← Color palettes (warmTerra, coolMidnight, forestMoss)
│
├── store/
│   └── useStore.js         ← Zustand state management
│
├── utils/
│   ├── geolocation.js      ← Browser → IP → Bhopal fallback
│   ├── weather.js          ← Open-Meteo API (free, no key)
│   └── sunCalc.js          ← Real sun position from lat/lon
│
├── components/
│   ├── SceneController.jsx ← 3D scene orchestrator
│   ├── balcony/             ← Balcony structure, furniture, portfolio objects
│   │   ├── WalkController   ← Camera movement (drag-to-look + WASD)
│   │   ├── BalconyStructure ← Floor, railings, walls
│   │   ├── CozyElements     ← Plants, bench, lights, bookshelf
│   │   ├── PortfolioObject  ← Interactive 3D items
│   │   ├── DisplayPedestal  ← Glowing pedestals
│   │   └── items/           ← 3D representations (ProductDesign, etc.)
│   ├── environment/         ← Sky, lighting, campus, weather particles
│   ├── horizon/             ← Terrain, atmospheric fog
│   ├── extras/              ← Fireflies, shooting stars, city lights
│   ├── audio/               ← Procedural soundscape (Web Audio API)
│   ├── overlay/             ← HTML HUD, loading screen, settings
│   ├── ui/                  ← Info panel, navigation orbs
│   └── portfolio/           ← Portfolio overlay (About, Projects, Diary, Contact)
│
├── App.jsx                  ← Root component
├── main.jsx                 ← Entry point
└── index.css                ← All styles (mobile-first, responsive)
```

---

## How to Update Your Portfolio

### 1. Edit your bio and projects
Open `src/data/portfolio.js`. Everything is labeled with `← EDIT` comments:

```js
export const ABOUT = {
  name: 'Your Name',           // ← EDIT
  tagline: 'Your Title',       // ← EDIT
  bio: ['Your bio paragraph'], // ← EDIT
  profileImage: '/profile.jpg', // Place in /public/
  resumeUrl: '/resume.pdf',     // Place in /public/
};
```

### 2. Add diary entries
Open `src/data/diary.js`. Copy the template at the top and paste at the beginning of the array:

```js
{
  id: 'my-new-entry',
  date: '2026-04-04',
  title: 'New Sketch',
  type: 'sketch',
  tags: ['art', 'concept'],
  content: 'Description of your sketch...',
  image: '/diary/my-sketch.jpg', // Place in /public/diary/
  mood: '🎨',
},
```

### 3. Set up contact form
1. Go to [formspree.io](https://formspree.io) and create a free form
2. Copy the form ID (e.g., `xpznqkdl`)
3. Set `CONTACT.formspreeId` in `src/data/portfolio.js`

Without Formspree, the form falls back to a `mailto:` link.

### 4. Change the color palette
In `src/config/theme.js`, change `ACTIVE_PALETTE`:

```js
const ACTIVE_PALETTE = 'coolMidnight'; // warmTerra | coolMidnight | forestMoss
```

---

## Deployment (Hostinger)

1. Run `npm run build`
2. Upload the contents of the `dist/` folder to your Hostinger public_html
3. Make sure your domain points to the correct folder

---

## Controls

| Input | Action |
|-------|--------|
| Mouse drag | Look around |
| WASD / Arrow keys | Walk |
| Shift | Run |
| C | Toggle crouch |
| Click objects | Inspect portfolio items |
| ☰ button | Open portfolio panel |
| ⚙️ button | Settings (time, weather, quality) |
| Esc | Close panels |

**Mobile**: Swipe to pan, tap objects to interact. Auto-orbit when idle.

---

## Dependencies

| Package | Purpose |
|---------|---------|
| `three` | 3D rendering engine |
| `@react-three/fiber` | React renderer for Three.js |
| `@react-three/drei` | Useful R3F helpers (Sky, Stars, Text, Float) |
| `@react-three/postprocessing` | Bloom, vignette, tone mapping |
| `zustand` | Lightweight state management |
| `suncalc` | Sun position from date/location |

**Removed**: `howler` (audio), `gsap` (animation) — see `package.json` `_notes_removed_deps` for reinstall instructions.

---

## Technical Notes

- **Weather**: Uses [Open-Meteo](https://open-meteo.com/) — free, no API key needed
- **Geolocation**: Browser GPS → IP fallback (ipapi.co) → Bhopal, India
- **Performance**: `PerformanceMonitor` auto-scales quality (High → Medium → Low)
- **Collision**: AABB-based collision checks in `WalkController.jsx`
- **Audio**: Procedural Web Audio API tones (no audio files needed)

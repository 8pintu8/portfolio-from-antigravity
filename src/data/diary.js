/**
 * ╔════════════════════════════════════════════════════════════════╗
 * ║  diary.js — Your Digital Diary / Scrapbook entries            ║
 * ╚════════════════════════════════════════════════════════════════╝
 *
 * HOW TO ADD A NEW ENTRY:
 *   1. Copy the template below
 *   2. Paste it at the TOP of the DIARY_ENTRIES array (newest first)
 *   3. Fill in the fields
 *   4. Save — the site will automatically show it
 *
 * TEMPLATE (copy this):
 *
 *   {
 *     id: 'unique-slug',            // URL-safe ID, must be unique
 *     date: '2026-04-04',           // YYYY-MM-DD format
 *     title: 'Entry Title',         // Short title
 *     type: 'sketch',              // One of: sketch, idea, render, thought, wip, note
 *     tags: ['tag1', 'tag2'],       // Freeform tags for filtering
 *     content: 'Your text here. Supports **markdown** formatting.',
 *     image: null,                  // Path to image: '/diary/my-sketch.jpg' (put file in /public/diary/)
 *     mood: '🌤️',                  // Optional emoji to set the mood
 *   },
 *
 * ENTRY TYPES (used for filtering + visual style):
 *   'sketch'   → 🎨  Quick drawings, doodles
 *   'idea'     → 💡  Concepts, brainstorms
 *   'render'   → 🖼️  3D renders, final visuals
 *   'thought'  → 💭  Reflections, musings
 *   'wip'      → 🔧  Work-in-progress updates
 *   'note'     → 📝  General notes
 */

export const DIARY_ENTRY_TYPES = {
  sketch:  { label: 'Sketch',  emoji: '🎨' },
  idea:    { label: 'Idea',    emoji: '💡' },
  render:  { label: 'Render',  emoji: '🖼️' },
  thought: { label: 'Thought', emoji: '💭' },
  wip:     { label: 'WIP',     emoji: '🔧' },
  note:    { label: 'Note',    emoji: '📝' },
};

// ═══════════════════════════════════════
// DIARY ENTRIES — newest first
// ═══════════════════════════════════════
// Just add new objects to this array. The site handles everything else.

export const DIARY_ENTRIES = [
  // ─── Example entries (replace with your own) ───
  {
    id: 'balcony-concept-v2',
    date: '2026-04-04',
    title: 'The Balcony — Spatial Portfolio Concept',
    type: 'idea',
    tags: ['portfolio', 'webgl', 'spatial-design'],
    content: 'Exploring the idea of a portfolio as a **physical space** rather than a flat page. The balcony metaphor works well — it\'s a place to observe, reflect, and display work. The horizon represents everything I haven\'t yet explored.',
    image: null,
    mood: '🌅',
  },
  {
    id: 'first-render-test',
    date: '2026-04-03',
    title: 'First Render Test',
    type: 'render',
    tags: ['3d', 'three.js', 'r3f'],
    content: 'Got the basic scene running. Stone floor, wrought iron railings, cozy string lights. The Tiny Glade aesthetic is coming through nicely. Need to work on tree canopies next — they\'re z-fighting.',
    image: null,
    mood: '✨',
  },
  {
    id: 'kinetic-sculpture-idea',
    date: '2026-04-02',
    title: 'Nested Ring Sculpture',
    type: 'sketch',
    tags: ['kinetic', 'sculpture', 'mechanical'],
    content: 'Three concentric torus rings rotating on different axes. The inner icosahedron pulses with emissive light. Inspired by gimbal mechanisms and armillary spheres.',
    image: null,
    mood: '⚙️',
  },
  {
    id: 'weather-system-notes',
    date: '2026-04-01',
    title: 'Live Weather Integration Notes',
    type: 'note',
    tags: ['api', 'weather', 'open-meteo'],
    content: 'Using Open-Meteo API — completely free, no key needed. Maps weather codes to scene conditions. Rain spawns particle effects, clouds change turbidity, fog adjusts scene density. The goal: the portfolio reflects the viewer\'s real-world conditions.',
    image: null,
    mood: '🌧️',
  },

  // ─── ADD YOUR NEW ENTRIES ABOVE THIS LINE ───
];

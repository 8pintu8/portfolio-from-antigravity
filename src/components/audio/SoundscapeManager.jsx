/**
 * ╔═══════════════════════════════════════════════════════════════════╗
 * ║  SoundscapeManager.jsx — Spatial audio system with proximity     ║
 * ╚═══════════════════════════════════════════════════════════════════╝
 *
 * HOW IT WORKS:
 *   1. Each interactive element on the balcony has a unique sound.
 *   2. Sounds use Web Audio API's PannerNode for 3D spatial positioning.
 *   3. As the user walks near an element, its sound gets louder.
 *   4. When no object is nearby, ambient environment + weather sounds play.
 *   5. Master volume is controlled via the volume slider in the UI.
 *
 * HOW TO EDIT:
 *   - Change SOUND_SOURCES to add/remove spatial sounds
 *   - Each source has: position, frequency, type, maxDist (falloff radius)
 *   - Change AMBIENT_CONFIG for background sound levels
 *   - The volume slider is in Overlay.jsx, stored as `masterVolume` in the store
 *
 * SOUND DESIGN:
 *   - Product Design:    high metallic shimmer (resonant sine)
 *   - Kinetic Sculpture: mechanical whirring (sawtooth + filter)
 *   - Research Paper:    soft page-turn hum (triangle wave)
 *   - About:             warm harmonic tone (sine chord)
 *   - Diary:             writing/pen scratch (filtered noise)
 *   - Contact:           digital notification ping (plucky sine)
 *   - Ambient:           wind noise + low drone + weather-reactive layer
 */

import { useEffect, useRef, useCallback } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import useStore from '../../store/useStore';

// ─── Spatial sound source definitions ───
// Each source corresponds to an interactive 3D object on the balcony.
// position: [x, y, z] — must match the object's world position
// freq: base frequency of the procedural tone
// type: oscillator waveform (sine, triangle, sawtooth, square)
// maxDist: maximum distance at which the sound is audible
// gain: base volume (0–1 scale)
const SOUND_SOURCES = [
  { id: 'product-design',    pos: [-2.5, 1.0, -1.5], freq: 520,  type: 'sine',     maxDist: 4, gain: 0.06, filterFreq: 800  },
  { id: 'kinetic-sculpture', pos: [1.8,  1.0, -2.0], freq: 180,  type: 'sawtooth', maxDist: 4, gain: 0.03, filterFreq: 400  },
  { id: 'research-papers',   pos: [3.5,  1.0,  1.5], freq: 330,  type: 'triangle', maxDist: 4, gain: 0.05, filterFreq: 600  },
  { id: 'about-trigger',     pos: [-3.5, 1.0,  2.0], freq: 440,  type: 'sine',     maxDist: 3.5, gain: 0.04, filterFreq: 700 },
  { id: 'diary-trigger',     pos: [-1.5, 1.0,  3.2], freq: 0,    type: 'noise',    maxDist: 3.5, gain: 0.04, filterFreq: 500 },
  { id: 'contact-trigger',   pos: [2.5,  1.0,  3.2], freq: 660,  type: 'sine',     maxDist: 3.5, gain: 0.05, filterFreq: 900 },
];

const AMBIENT_GAIN = 0.12;

export default function SoundscapeManager() {
  const { camera } = useThree();
  const isMuted = useStore((s) => s.isMuted);
  const masterVolume = useStore((s) => s.masterVolume);
  const weather = useStore((s) => s.weather);

  const ctxRef = useRef(null);
  const masterGainRef = useRef(null);
  const spatialNodesRef = useRef([]);    // { source, gain, panner }
  const ambientNodesRef = useRef(null);  // { drone, wind, weatherLayer }
  const initRef = useRef(false);

  // ── Create audio context and all nodes on first user interaction ──
  const initAudio = useCallback(() => {
    if (initRef.current) return;
    initRef.current = true;

    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      ctxRef.current = ctx;

      // Tell the spatial audio engine: listener faces -Z, up is Y
      if (ctx.listener.positionX) {
        ctx.listener.positionX.value = 0;
        ctx.listener.positionY.value = 1.7;
        ctx.listener.positionZ.value = 2;
      }

      // Master gain — controlled by masterVolume + mute state
      const master = ctx.createGain();
      master.gain.value = isMuted ? 0 : masterVolume;
      master.connect(ctx.destination);
      masterGainRef.current = master;

      // ── Create spatial sources ──
      const spatialNodes = SOUND_SOURCES.map((src) => {
        // Panner for 3D positioning
        const panner = ctx.createPanner();
        panner.panningModel = 'HRTF';
        panner.distanceModel = 'inverse';
        panner.refDistance = 0.5;
        panner.maxDistance = src.maxDist;
        panner.rolloffFactor = 2;
        panner.positionX.value = src.pos[0];
        panner.positionY.value = src.pos[1];
        panner.positionZ.value = src.pos[2];

        // Per-source gain
        const gain = ctx.createGain();
        gain.gain.value = src.gain;

        // Low-pass filter (gives each source a distinct character)
        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = src.filterFreq;
        filter.Q.value = 2;

        let sourceNode;
        if (src.type === 'noise') {
          // Filtered noise for diary "pen scratch" sound
          const bufLen = ctx.sampleRate * 2;
          const buf = ctx.createBuffer(1, bufLen, ctx.sampleRate);
          const data = buf.getChannelData(0);
          for (let i = 0; i < bufLen; i++) data[i] = Math.random() * 2 - 1;
          sourceNode = ctx.createBufferSource();
          sourceNode.buffer = buf;
          sourceNode.loop = true;
        } else {
          sourceNode = ctx.createOscillator();
          sourceNode.type = src.type;
          sourceNode.frequency.value = src.freq;
        }

        sourceNode.connect(filter);
        filter.connect(gain);
        gain.connect(panner);
        panner.connect(master);
        sourceNode.start();

        return { source: sourceNode, gain, panner, config: src };
      });
      spatialNodesRef.current = spatialNodes;

      // ── Create ambient layer ──
      // Low drone
      const drone = ctx.createOscillator();
      drone.type = 'sine';
      drone.frequency.value = 65;
      const droneGain = ctx.createGain();
      droneGain.gain.value = 0.06;

      // Wind noise
      const windBufLen = ctx.sampleRate * 2;
      const windBuf = ctx.createBuffer(1, windBufLen, ctx.sampleRate);
      const windData = windBuf.getChannelData(0);
      for (let i = 0; i < windBufLen; i++) windData[i] = Math.random() * 2 - 1;
      const windSource = ctx.createBufferSource();
      windSource.buffer = windBuf;
      windSource.loop = true;
      const windFilter = ctx.createBiquadFilter();
      windFilter.type = 'lowpass';
      windFilter.frequency.value = 250;
      const windGain = ctx.createGain();
      windGain.gain.value = 0.05;

      // Weather-reactive high layer (rain → louder, clear → quieter)
      const weatherOsc = ctx.createOscillator();
      weatherOsc.type = 'triangle';
      weatherOsc.frequency.value = 120;
      const weatherGain = ctx.createGain();
      weatherGain.gain.value = 0.0; // Set reactively in useFrame

      // Connect ambient chain
      drone.connect(droneGain).connect(master);
      windSource.connect(windFilter).connect(windGain).connect(master);
      weatherOsc.connect(weatherGain).connect(master);

      drone.start();
      windSource.start();
      weatherOsc.start();

      ambientNodesRef.current = { drone, droneGain, windSource, windGain, windFilter, weatherOsc, weatherGain };

    } catch (err) {
      console.warn('Audio init failed:', err);
    }
  }, [isMuted, masterVolume]);

  // ── Initialize on first user gesture ──
  useEffect(() => {
    const events = ['click', 'keydown', 'touchstart'];
    const handler = () => initAudio();
    events.forEach((e) => document.addEventListener(e, handler, { once: true }));
    return () => events.forEach((e) => document.removeEventListener(e, handler));
  }, [initAudio]);

  // ── Update master volume reactively ──
  useEffect(() => {
    if (!masterGainRef.current || !ctxRef.current) return;
    const ctx = ctxRef.current;
    masterGainRef.current.gain.cancelScheduledValues(ctx.currentTime);
    masterGainRef.current.gain.linearRampToValueAtTime(
      isMuted ? 0 : masterVolume,
      ctx.currentTime + 0.3
    );
  }, [isMuted, masterVolume]);

  // ── Update weather-reactive ambient sounds ──
  useEffect(() => {
    if (!ambientNodesRef.current) return;
    const { windGain, windFilter, weatherGain } = ambientNodesRef.current;
    const cond = weather.condition;

    // Wind reacts to weather
    const windVol = cond === 'thunderstorm' ? 0.12 : cond === 'rain' ? 0.08 : cond === 'fog' ? 0.03 : 0.05;
    const windCutoff = cond === 'thunderstorm' ? 400 : cond === 'rain' ? 350 : 250;
    windGain.gain.value = windVol;
    windFilter.frequency.value = windCutoff;

    // Weather layer (audible during rain/thunder/snow)
    const weatherVol = (cond === 'rain' || cond === 'thunderstorm' || cond === 'snow') ? 0.03 : 0.0;
    weatherGain.gain.value = weatherVol;
  }, [weather.condition]);

  // ── Per-frame: update listener position for spatial audio ──
  const fwdVecRef = useRef(new THREE.Vector3());
  useFrame(() => {
    if (!ctxRef.current) return;
    const ctx = ctxRef.current;

    // Update Web Audio listener to match camera position/orientation
    if (ctx.listener.positionX) {
      ctx.listener.positionX.value = camera.position.x;
      ctx.listener.positionY.value = camera.position.y;
      ctx.listener.positionZ.value = camera.position.z;

      // Forward direction
      const fwd = camera.getWorldDirection(fwdVecRef.current);
      ctx.listener.forwardX.value = fwd.x;
      ctx.listener.forwardY.value = fwd.y;
      ctx.listener.forwardZ.value = fwd.z;
      ctx.listener.upX.value = 0;
      ctx.listener.upY.value = 1;
      ctx.listener.upZ.value = 0;
    }
  });

  // ── Cleanup on unmount ──
  useEffect(() => {
    return () => {
      spatialNodesRef.current.forEach(({ source }) => {
        try { source.stop(); } catch {}
      });
      if (ambientNodesRef.current) {
        try { ambientNodesRef.current.drone.stop(); } catch {}
        try { ambientNodesRef.current.windSource.stop(); } catch {}
        try { ambientNodesRef.current.weatherOsc.stop(); } catch {}
      }
      if (ctxRef.current) ctxRef.current.close().catch(() => {});
    };
  }, []);

  return null;
}

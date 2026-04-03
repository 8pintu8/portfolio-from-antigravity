import { useEffect, useRef } from 'react';
import useStore from '../../store/useStore';

/**
 * Procedural ambient soundscape using Web Audio API.
 * No external audio files needed — generates tones programmatically.
 */
export default function SoundscapeManager() {
  const isMuted = useStore((s) => s.isMuted);
  const isNight = useStore((s) => s.isNight);
  const weather = useStore((s) => s.weather);
  const audioCtxRef = useRef(null);
  const gainRef = useRef(null);
  const nodesRef = useRef([]);

  useEffect(() => {
    // Create AudioContext on first user interaction
    const initAudio = () => {
      if (audioCtxRef.current) return;

      try {
        const ctx = new (window.AudioContext || window.webkitAudioContext)();
        audioCtxRef.current = ctx;

        // Master gain
        const gain = ctx.createGain();
        gain.gain.value = isMuted ? 0 : 0.15;
        gain.connect(ctx.destination);
        gainRef.current = gain;

        // Ambient drone — a soft low-frequency oscillator
        const drone = ctx.createOscillator();
        drone.type = 'sine';
        drone.frequency.value = 80;
        const droneGain = ctx.createGain();
        droneGain.gain.value = 0.08;
        drone.connect(droneGain);
        droneGain.connect(gain);
        drone.start();
        nodesRef.current.push(drone);

        // Soft high-frequency shimmer
        const shimmer = ctx.createOscillator();
        shimmer.type = 'sine';
        shimmer.frequency.value = 440;
        const shimmerGain = ctx.createGain();
        shimmerGain.gain.value = 0.02;
        shimmer.connect(shimmerGain);
        shimmerGain.connect(gain);
        shimmer.start();
        nodesRef.current.push(shimmer);

        // Wind noise via filtered noise buffer
        const bufferSize = ctx.sampleRate * 2;
        const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const output = noiseBuffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
          output[i] = Math.random() * 2 - 1;
        }
        const noise = ctx.createBufferSource();
        noise.buffer = noiseBuffer;
        noise.loop = true;

        const windFilter = ctx.createBiquadFilter();
        windFilter.type = 'lowpass';
        windFilter.frequency.value = 300;
        windFilter.Q.value = 1;

        const windGain = ctx.createGain();
        windGain.gain.value = 0.06;

        noise.connect(windFilter);
        windFilter.connect(windGain);
        windGain.connect(gain);
        noise.start();
        nodesRef.current.push(noise);
      } catch (err) {
        console.warn('Audio init failed:', err);
      }
    };

    // Wait for user interaction to initialize (browser policy)
    const events = ['click', 'keydown', 'touchstart'];
    events.forEach((e) => document.addEventListener(e, initAudio, { once: false }));

    return () => {
      events.forEach((e) => document.removeEventListener(e, initAudio));
      nodesRef.current.forEach((node) => {
        try { node.stop(); } catch {}
      });
      if (audioCtxRef.current) {
        audioCtxRef.current.close().catch(() => {});
      }
    };
  }, []);

  // Mute/unmute
  useEffect(() => {
    if (gainRef.current && audioCtxRef.current) {
      const ctx = audioCtxRef.current;
      gainRef.current.gain.cancelScheduledValues(ctx.currentTime);
      gainRef.current.gain.linearRampToValueAtTime(
        isMuted ? 0 : 0.15,
        ctx.currentTime + 0.5
      );
    }
  }, [isMuted]);

  return null; // Audio-only component
}

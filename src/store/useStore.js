import { create } from 'zustand';

const useStore = create((set) => ({
  // ── Location ──
  userLocation: null,
  setUserLocation: (loc) => set({ userLocation: loc }),

  // ── Time & Sun ──
  sunPosition: [100, 20, 100],
  setSunPosition: (pos) => set({ sunPosition: pos }),
  timeOfDay: 0.5,
  setTimeOfDay: (t) => set({ timeOfDay: t }),
  isNight: false,
  setIsNight: (v) => set({ isNight: v }),

  // ── Manual overrides ──
  timeOverride: null,
  setTimeOverride: (v) => set({ timeOverride: v }),
  weatherOverride: null,
  setWeatherOverride: (v) => set({ weatherOverride: v }),

  // ── Weather ──
  weather: { condition: 'clear', temperature: 25, humidity: 50, windSpeed: 3, cloudCover: 0 },
  liveWeather: null,
  setWeather: (w) => set({ weather: w }),
  setLiveWeather: (w) => set({ liveWeather: w }),

  // ── Quality ──
  qualityLevel: 'high',
  setQualityLevel: (q) => set({ qualityLevel: q }),
  autoQuality: true,
  setAutoQuality: (v) => set({ autoQuality: v }),
  reducedMotion: false,
  setReducedMotion: (v) => set({ reducedMotion: v }),

  // ── Audio ──
  isMuted: true,
  setIsMuted: (v) => set({ isMuted: v }),
  toggleMute: () => set((s) => ({ isMuted: !s.isMuted })),

  // ── Interaction ──
  activeObject: null,
  setActiveObject: (obj) => set({ activeObject: obj }),
  clearActiveObject: () => set({ activeObject: null }),
  hoveredObject: null,
  setHoveredObject: (id) => set({ hoveredObject: id }),

  // ── Drag state (used by WalkController to suppress clicks during drag) ──
  isDragging: false,
  setIsDragging: (v) => set({ isDragging: v }),

  // ── Loading ──
  isLoaded: false,
  setIsLoaded: (v) => set({ isLoaded: v }),
  loadingProgress: 0,
  setLoadingProgress: (p) => set({ loadingProgress: p }),
}));

export default useStore;

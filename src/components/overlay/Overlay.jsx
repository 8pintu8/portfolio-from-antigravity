/**
 * ╔═══════════════════════════════════════════════════════════╗
 * ║  Overlay.jsx — HUD elements always visible on screen      ║
 * ╚═══════════════════════════════════════════════════════════╝
 *
 * Contains:
 *   - Weather + time badge (top-right)
 *   - Controls hint (bottom-left, auto-fades)
 *   - Action buttons: Portfolio, Mute, Settings (bottom-right)
 *   - Settings panel (centered modal)
 */

import { useState, useEffect } from 'react';
import useStore from '../../store/useStore';

const WEATHER_OPTIONS = [
  { value: null,           label: 'Auto',  emoji: '🔄' },
  { value: 'clear',        label: 'Clear', emoji: '☀️' },
  { value: 'clouds',       label: 'Cloudy', emoji: '☁️' },
  { value: 'rain',         label: 'Rain',  emoji: '🌧️' },
  { value: 'snow',         label: 'Snow',  emoji: '❄️' },
  { value: 'fog',          label: 'Fog',   emoji: '🌫️' },
  { value: 'thunderstorm', label: 'Storm', emoji: '⛈️' },
];

export default function Overlay({ onOpenPortfolio }) {
  const isMuted = useStore((s) => s.isMuted);
  const toggleMute = useStore((s) => s.toggleMute);
  const qualityLevel = useStore((s) => s.qualityLevel);
  const setQualityLevel = useStore((s) => s.setQualityLevel);
  const setAutoQuality = useStore((s) => s.setAutoQuality);
  const reducedMotion = useStore((s) => s.reducedMotion);
  const setReducedMotion = useStore((s) => s.setReducedMotion);
  const weather = useStore((s) => s.weather);
  const timeOverride = useStore((s) => s.timeOverride);
  const setTimeOverride = useStore((s) => s.setTimeOverride);
  const weatherOverride = useStore((s) => s.weatherOverride);
  const setWeatherOverride = useStore((s) => s.setWeatherOverride);

  const [showSettings, setShowSettings] = useState(false);

  // Respect system reduce-motion preference
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (mq.matches) setReducedMotion(true);
    const h = (e) => setReducedMotion(e.matches);
    mq.addEventListener('change', h);
    return () => mq.removeEventListener('change', h);
  }, [setReducedMotion]);

  // Weather emoji map
  const weatherEmoji = {
    clear: '☀️', clouds: '☁️', fog: '🌫️', rain: '🌧️',
    drizzle: '🌦️', snow: '❄️', thunderstorm: '⛈️',
  };

  const formatTime = () => {
    if (timeOverride !== null) {
      const h = Math.floor(timeOverride);
      const m = Math.floor((timeOverride % 1) * 60);
      return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
    }
    return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <>
      {/* ═══ HUD: Weather + Time (top-right) ═══ */}
      <div className="hud-top">
        <div className="hud-weather">
          <span className="hud-emoji">{weatherEmoji[weather.condition] || '🌤️'}</span>
          <span className="hud-temp">{Math.round(weather.temperature)}°</span>
        </div>
        <div className="hud-time">{formatTime()}</div>
      </div>

      {/* ═══ HUD: Controls hint (bottom-left, auto-fades) ═══ */}
      <div className="hud-controls-hint">
        <span>Drag to look · WASD to walk · Click objects</span>
      </div>

      {/* ═══ HUD: Action buttons (bottom-right) ═══ */}
      <div className="hud-actions">
        <button
          className="hud-btn portfolio-btn"
          onClick={onOpenPortfolio}
          aria-label="Open portfolio"
          title="Portfolio"
        >
          ☰
        </button>
        <button
          className={`hud-btn ${!isMuted ? 'active' : ''}`}
          onClick={toggleMute}
          aria-label={isMuted ? 'Unmute' : 'Mute'}
          title={isMuted ? 'Unmute' : 'Mute'}
        >
          {isMuted ? '🔇' : '🔊'}
        </button>
        <button
          className={`hud-btn ${showSettings ? 'active' : ''}`}
          onClick={() => setShowSettings(!showSettings)}
          aria-label="Settings"
          title="Settings"
        >
          ⚙️
        </button>
      </div>

      {/* ═══ Settings Panel (centered modal) ═══ */}
      {showSettings && (
        <>
          <div className="settings-panel-backdrop" onClick={() => setShowSettings(false)} />
          <div className="settings-panel" onClick={(e) => e.stopPropagation()}>
            <div className="sp-header">
              <span className="sp-title">Settings</span>
              <button className="sp-close" onClick={() => setShowSettings(false)}>✕</button>
            </div>

            {/* Time of day */}
            <div className="sp-section">
              <div className="sp-label">
                Time of Day
                <span className="sp-value">{timeOverride !== null ? formatTime() : 'Real time'}</span>
              </div>
              <div className="sp-row">
                <span className="sp-icon">🌅</span>
                <input
                  type="range" min="0" max="24" step="0.25"
                  value={timeOverride ?? 12}
                  onChange={(e) => setTimeOverride(parseFloat(e.target.value))}
                  className="sp-slider"
                />
                <span className="sp-icon">🌙</span>
              </div>
              <button className="sp-reset" onClick={() => setTimeOverride(null)}>
                Reset to real time
              </button>
            </div>

            {/* Weather */}
            <div className="sp-section">
              <div className="sp-label">Weather</div>
              <div className="sp-weather-grid">
                {WEATHER_OPTIONS.map((opt) => (
                  <button
                    key={opt.label}
                    className={`sp-weather-btn ${
                      (weatherOverride === opt.value) ||
                      (opt.value === null && weatherOverride === null) ? 'active' : ''
                    }`}
                    onClick={() => setWeatherOverride(opt.value)}
                  >
                    <span>{opt.emoji}</span>
                    <span className="sp-weather-name">{opt.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Quality */}
            <div className="sp-section">
              <div className="sp-label">Graphics Quality</div>
              <div className="sp-quality-row">
                {['low', 'medium', 'high'].map((lv) => (
                  <button
                    key={lv}
                    className={`sp-quality-btn ${qualityLevel === lv ? 'active' : ''}`}
                    onClick={() => { setQualityLevel(lv); setAutoQuality(false); }}
                  >
                    {lv.charAt(0).toUpperCase() + lv.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Reduce motion */}
            <div className="sp-section sp-toggle-row">
              <span className="sp-label" style={{ marginBottom: 0 }}>Reduce Motion</span>
              <button
                className={`sp-toggle ${reducedMotion ? 'on' : ''}`}
                onClick={() => setReducedMotion(!reducedMotion)}
              >
                <span className="sp-toggle-knob" />
              </button>
            </div>
          </div>
        </>
      )}
    </>
  );
}

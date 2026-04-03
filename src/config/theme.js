/**
 * Theme Configuration — The Balcony Spatial Portfolio
 * 
 * Change palettes here to restyle the entire experience.
 * Each palette defines colors for both CSS (hex strings) and Three.js (hex integers).
 */

const palettes = {
  // Default: warm architectural terracotta
  warmTerra: {
    name: 'Warm Terra',
    primary:       '#D4A574',   // warm sand
    primaryInt:    0xD4A574,
    secondary:     '#8B6F47',   // dark wood
    secondaryInt:  0x8B6F47,
    accent:        '#E8C4A0',   // light peach
    accentInt:     0xE8C4A0,
    highlight:     '#FF9F6B',   // warm orange glow
    highlightInt:  0xFF9F6B,
    emissive:      '#FFD4A8',   // emissive glow
    emissiveInt:   0xFFD4A8,
    ground:        '#3D2B1F',   // dark earth
    groundInt:     0x3D2B1F,
    metal:         '#B8A89A',   // brushed metal
    metalInt:      0xB8A89A,
    glass:         '#C4D4E0',   // frosted glass
    glassInt:      0xC4D4E0,
    text:          '#F5E6D3',   // warm white
    textInt:       0xF5E6D3,
    fogDay:        '#E8D5C4',
    fogDayInt:     0xE8D5C4,
    fogNight:      '#1A1A2E',
    fogNightInt:   0x1A1A2E,
    skyNight:      '#0D1B2A',
    skyNightInt:   0x0D1B2A,
    moonlight:     '#C4D4FF',
    moonlightInt:  0xC4D4FF,
    sunGolden:     '#FFB347',
    sunGoldenInt:  0xFFB347,
    uiBackground:  'rgba(30, 20, 15, 0.75)',
    uiBorder:      'rgba(212, 165, 116, 0.3)',
  },

  // Alternative: cool midnight blue
  coolMidnight: {
    name: 'Cool Midnight',
    primary:       '#6B8FA3',
    primaryInt:    0x6B8FA3,
    secondary:     '#3D5A6E',
    secondaryInt:  0x3D5A6E,
    accent:        '#A0C4D4',
    accentInt:     0xA0C4D4,
    highlight:     '#6BC5FF',
    highlightInt:  0x6BC5FF,
    emissive:      '#A8D4FF',
    emissiveInt:   0xA8D4FF,
    ground:        '#1F2D3D',
    groundInt:     0x1F2D3D,
    metal:         '#9AA8B8',
    metalInt:      0x9AA8B8,
    glass:         '#D0E0F0',
    glassInt:      0xD0E0F0,
    text:          '#D3E6F5',
    textInt:       0xD3E6F5,
    fogDay:        '#C4D5E8',
    fogDayInt:     0xC4D5E8,
    fogNight:      '#0A1628',
    fogNightInt:   0x0A1628,
    skyNight:      '#0A1628',
    skyNightInt:   0x0A1628,
    moonlight:     '#C4D4FF',
    moonlightInt:  0xC4D4FF,
    sunGolden:     '#FFD47B',
    sunGoldenInt:  0xFFD47B,
    uiBackground:  'rgba(15, 20, 30, 0.75)',
    uiBorder:      'rgba(107, 143, 163, 0.3)',
  },

  // Alternative: forest green
  forestMoss: {
    name: 'Forest Moss',
    primary:       '#7A9E7E',
    primaryInt:    0x7A9E7E,
    secondary:     '#4A6B4E',
    secondaryInt:  0x4A6B4E,
    accent:        '#A8C4A0',
    accentInt:     0xA8C4A0,
    highlight:     '#6BFF8F',
    highlightInt:  0x6BFF8F,
    emissive:      '#A8FFD4',
    emissiveInt:   0xA8FFD4,
    ground:        '#1F2D1F',
    groundInt:     0x1F2D1F,
    metal:         '#8A9A88',
    metalInt:      0x8A9A88,
    glass:         '#D0E8D4',
    glassInt:      0xD0E8D4,
    text:          '#E6F5E3',
    textInt:       0xE6F5E3,
    fogDay:        '#D4E8D0',
    fogDayInt:     0xD4E8D0,
    fogNight:      '#0A1A0E',
    fogNightInt:   0x0A1A0E,
    skyNight:      '#0A160E',
    skyNightInt:   0x0A160E,
    moonlight:     '#D4FFC4',
    moonlightInt:  0xD4FFC4,
    sunGolden:     '#FFD47B',
    sunGoldenInt:  0xFFD47B,
    uiBackground:  'rgba(15, 25, 15, 0.75)',
    uiBorder:      'rgba(122, 158, 126, 0.3)',
  },
};

// ═══════════════════════════════════════════
// ACTIVE PALETTE — Change this to swap themes
// ═══════════════════════════════════════════
const ACTIVE_PALETTE = 'warmTerra';

export const theme = palettes[ACTIVE_PALETTE];
export const allPalettes = palettes;
export const activePaletteName = ACTIVE_PALETTE;

// Helper: interpolate between two hex colors
export function lerpColor(hex1, hex2, t) {
  const r1 = (hex1 >> 16) & 0xff, g1 = (hex1 >> 8) & 0xff, b1 = hex1 & 0xff;
  const r2 = (hex2 >> 16) & 0xff, g2 = (hex2 >> 8) & 0xff, b2 = hex2 & 0xff;
  const r = Math.round(r1 + (r2 - r1) * t);
  const g = Math.round(g1 + (g2 - g1) * t);
  const b = Math.round(b1 + (b2 - b1) * t);
  return (r << 16) | (g << 8) | b;
}

// Helper: apply theme as CSS custom properties
export function applyThemeToDOM(palette = theme) {
  const root = document.documentElement;
  root.style.setProperty('--color-primary', palette.primary);
  root.style.setProperty('--color-secondary', palette.secondary);
  root.style.setProperty('--color-accent', palette.accent);
  root.style.setProperty('--color-highlight', palette.highlight);
  root.style.setProperty('--color-text', palette.text);
  root.style.setProperty('--color-ui-bg', palette.uiBackground);
  root.style.setProperty('--color-ui-border', palette.uiBorder);
}

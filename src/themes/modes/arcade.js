import { createModeTiers } from '../paletteHelpers.js';

// ── ARCADE — Retro gaming / pixel art / neon cabinet ───────────
// T1: Off         — dark CRT screen, muted pixels
// T2: Insert Coin — vibrant purple/magenta/cyan arcade palette
// T3: Playing     — pixel sparkles, score popups
// T4: Combo       — neon trails, power-up flashes
// T5: High Score  — full pixel rain, rainbow combos, boss effects

const t2 = {
  bgBase: '#08040C',
  accent: '#CC00FF',
  dotGridColor: 'rgba(204,0,255,0.04)',
  cat: {
    ALKALI:     { bg: 'rgba(204,0,255,0.09)',    border: '#CC00FF', text: '#DD22FF', glow: 'rgba(204,0,255,0.45)' },
    ALKALINE:   { bg: 'rgba(255,0,128,0.09)',    border: '#FF0080', text: '#FF2090', glow: 'rgba(255,0,128,0.40)' },
    TRANSITION: { bg: 'rgba(0,200,255,0.09)',    border: '#00C8FF', text: '#20D8FF', glow: 'rgba(0,200,255,0.45)' },
    HALOGEN:    { bg: 'rgba(255,100,0,0.09)',    border: '#FF6400', text: '#FF7820', glow: 'rgba(255,100,0,0.40)' },
    NOBLE:      { bg: 'rgba(100,0,200,0.09)',    border: '#6400C8', text: '#7810D8', glow: 'rgba(100,0,200,0.45)' },
    LANTHANIDE: { bg: 'rgba(255,0,200,0.09)',    border: '#FF00C8', text: '#FF20D8', glow: 'rgba(255,0,200,0.40)' },
    POST:       { bg: 'rgba(80,0,160,0.07)',     border: '#5000A0', text: '#6410B0', glow: 'rgba(80,0,160,0.30)' },
    METALLOID:  { bg: 'rgba(0,160,200,0.07)',    border: '#00A0C8', text: '#10B0D8', glow: 'rgba(0,160,200,0.30)' },
    NONMETAL:   { bg: 'rgba(200,150,255,0.07)',  border: '#C896FF', text: '#D8A6FF', glow: 'rgba(200,150,255,0.25)' },
    ACTINIDE:   { bg: 'rgba(120,0,180,0.07)',    border: '#7800B4', text: '#8810C4', glow: 'rgba(120,0,180,0.30)' },
    PNICTOGEN:  { bg: 'rgba(255,50,150,0.09)',   border: '#FF3296', text: '#FF50A6', glow: 'rgba(255,50,150,0.45)' },
    CHALCOGEN:  { bg: 'rgba(0,255,200,0.09)',    border: '#00FFC8', text: '#20FFD8', glow: 'rgba(0,255,200,0.40)' },
  },
};

const sceneConfig = {
  particles: [
    {
      id: 'pixel',
      behavior: 'fall',
      render: 'dot',
      spawnRate: [0, 0, 0.26, 0.7, 1.0],
      speed: [1, 4],
      size: [1, 3],
      color: '#CC00FF',
      opacity: 1.0,
      lifetime: [40, 120],
    },
    {
      id: 'powerUp',
      behavior: 'flash',
      render: 'glow',
      spawnRate: [0, 0, 0.05, 0.14, 0.32],
      size: [3, 6],
      glowRadius: 12,
      color: '#FF00C8',
      opacity: 1.0,
      lifetime: [15, 30],
    },
    {
      id: 'neonTrail',
      behavior: 'linear',
      render: 'trail',
      spawnRate: [0, 0, 0, 0.09, 0.26],
      speed: [3, 7],
      angle: [160, 200],
      size: [0.5, 1.5],
      trailLength: 10,
      color: '#00C8FF',
      opacity: 0.975,
      lifetime: [12, 25],
    },
    {
      id: 'scorePopup',
      behavior: 'rise',
      render: 'dot',
      spawnRate: [0, 0, 0, 0.05, 0.14],
      speed: [0.5, 1.5],
      size: [1, 2],
      color: '#FFD700',
      opacity: 1.0,
      lifetime: [30, 60],
      cascade: true,
    },
    {
      id: 'coinSpin',
      behavior: 'fall',
      render: 'glow',
      spawnRate: [0, 0, 0, 0.05, 0.14],
      speed: [1, 3],
      size: [2, 4],
      glowRadius: 6,
      color: '#FFD700',
      opacity: 0.9,
      lifetime: [25, 55],
    },
    {
      id: 'glitchLine',
      behavior: 'flash',
      render: 'line',
      spawnRate: [0, 0, 0, 0.04, 0.12],
      size: [2, 5],
      color: '#FF00FF',
      opacity: 0.75,
      lifetime: [3, 8],
    },
    {
      id: 'levelUp',
      behavior: 'rise',
      render: 'glow',
      spawnRate: [0, 0, 0, 0.03, 0.1],
      speed: [0.5, 1.5],
      size: [2, 4],
      glowRadius: 8,
      color: '#00FF80',
      opacity: 1.0,
      lifetime: [20, 45],
    },
  ],
};

export default createModeTiers('ARCADE', {
  tierNames: ['Off', 'Insert Coin', 'Playing', 'Combo', 'High Score'],
  tierTooltips: [
    'Dark CRT screen',
    'Vibrant neon arcade palette',
    'Pixel sparkles and score popups',
    'Neon trails and power-up flashes',
    'Full pixel rain and rainbow combos',
  ],
  t1: { bgBase: '#080410', accent: '#887799', dotGridColor: 'rgba(136,119,153,0.03)' },
  t2,
  sceneConfig,
  flavorHue: 285,
});

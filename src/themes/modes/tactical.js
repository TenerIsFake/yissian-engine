import { createModeTiers } from '../paletteHelpers.js';

// ── TACTICAL — Military ops center / night-vision HUD ──────────
// T1: Standby     — dark grey with green tint
// T2: Alert       — military green/olive NVG palette
// T3: Engaged     — scan lines, faint radar sweep
// T4: Combat      — pulse markers, active targeting
// T5: Warzone     — full HUD, tracer rounds, radar pings

const t2 = {
  bgBase: '#060A06',
  accent: '#00CC66',
  dotGridColor: 'rgba(0,204,102,0.03)',
  cat: {
    ALKALI:     { bg: 'rgba(0,204,102,0.09)',    border: '#00CC66', text: '#00DD77', glow: 'rgba(0,204,102,0.45)' },
    ALKALINE:   { bg: 'rgba(0,180,80,0.09)',     border: '#00B450', text: '#00C060', glow: 'rgba(0,180,80,0.40)' },
    TRANSITION: { bg: 'rgba(0,150,60,0.09)',     border: '#00963C', text: '#00A84C', glow: 'rgba(0,150,60,0.45)' },
    HALOGEN:    { bg: 'rgba(40,200,100,0.09)',   border: '#28C864', text: '#38D874', glow: 'rgba(40,200,100,0.40)' },
    NOBLE:      { bg: 'rgba(0,100,50,0.09)',     border: '#006432', text: '#007842', glow: 'rgba(0,100,50,0.45)' },
    LANTHANIDE: { bg: 'rgba(0,220,90,0.09)',     border: '#00DC5A', text: '#00EC6A', glow: 'rgba(0,220,90,0.40)' },
    POST:       { bg: 'rgba(20,120,50,0.07)',    border: '#147832', text: '#1C8840', glow: 'rgba(20,120,50,0.30)' },
    METALLOID:  { bg: 'rgba(30,180,80,0.07)',    border: '#1EB450', text: '#28C060', glow: 'rgba(30,180,80,0.30)' },
    NONMETAL:   { bg: 'rgba(100,220,140,0.07)',  border: '#64DC8C', text: '#78E8A0', glow: 'rgba(100,220,140,0.25)' },
    ACTINIDE:   { bg: 'rgba(0,140,60,0.07)',     border: '#008C3C', text: '#00A04C', glow: 'rgba(0,140,60,0.30)' },
    PNICTOGEN:  { bg: 'rgba(0,255,100,0.09)',    border: '#00FF64', text: '#20FF78', glow: 'rgba(0,255,100,0.45)' },
    CHALCOGEN:  { bg: 'rgba(60,200,120,0.09)',   border: '#3CC878', text: '#50D888', glow: 'rgba(60,200,120,0.40)' },
  },
};

const sceneConfig = {
  particles: [
    {
      id: 'radarPing',
      behavior: 'flash',
      render: 'glow',
      spawnRate: [0, 0, 0.07, 0.18, 0.35],
      size: [2, 5],
      glowRadius: 15,
      color: '#00CC66',
      opacity: 1.0,
      lifetime: [15, 30],
      cascade: true,
    },
    {
      id: 'dataStream',
      behavior: 'fall',
      render: 'trail',
      spawnRate: [0, 0, 0.18, 0.44, 0.88],
      speed: [2, 5],
      size: [0.5, 1],
      trailLength: 12,
      color: '#00FF88',
      opacity: 0.75,
      lifetime: [30, 60],
    },
    {
      id: 'scanDot',
      behavior: 'linear',
      render: 'dot',
      spawnRate: [0, 0, 0, 0.09, 0.26],
      speed: [1, 3],
      angle: [0, 360],
      size: [1, 2],
      color: '#00DD66',
      opacity: 0.6,
      lifetime: [40, 100],
    },
    {
      id: 'targetLock',
      behavior: 'flash',
      render: 'glow',
      spawnRate: [0, 0, 0, 0.06, 0.15],
      size: [2, 4],
      glowRadius: 10,
      color: '#FF4444',
      opacity: 1.0,
      lifetime: [8, 18],
    },
    {
      id: 'commsBeam',
      behavior: 'linear',
      render: 'trail',
      spawnRate: [0, 0, 0, 0.04, 0.12],
      speed: [3, 6],
      angle: [0, 360],
      size: [0.5, 1],
      trailLength: 15,
      color: '#00FFAA',
      opacity: 0.525,
      lifetime: [12, 25],
      cascade: true,
    },
    {
      id: 'scopeDot',
      behavior: 'orbit',
      render: 'dot',
      spawnRate: [0, 0, 0, 0.03, 0.1],
      speed: [1, 2],
      size: [1, 2],
      color: '#00EE77',
      opacity: 0.675,
      lifetime: [50, 120],
    },
  ],
};

export default createModeTiers('TACTICAL', {
  tierNames: ['Standby', 'Alert', 'Engaged', 'Combat', 'Warzone'],
  tierTooltips: [
    'Dark grey with green tint',
    'Military green NVG palette',
    'Faint radar sweep lines',
    'Pulse markers and targeting',
    'Full HUD and tracer rounds',
  ],
  t1: { bgBase: '#080A08', accent: '#669966', dotGridColor: 'rgba(102,153,102,0.03)' },
  t2,
  sceneConfig,
  flavorHue: 145,
});

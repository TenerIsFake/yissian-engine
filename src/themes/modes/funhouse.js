import { createModeTiers } from '../paletteHelpers.js';

// ── FUNHOUSE — Carnival / amusement park / sideshow ─────────────
// T1: Closed      — rainy dark fairground, muted neon
// T2: Open        — bright carnival colors, warm lights
// T3: Busy        — ride sounds, ticket flutters
// T4: Peak Night  — neon flashes, crowd buzz, prize confetti
// T5: Grand Finale— fireworks, all rides maxed, rainbow chaos

const t2 = {
  bgBase: '#0C0610',
  accent: '#FF6B9D',
  dotGridColor: 'rgba(255,107,157,0.04)',
  cat: {
    ALKALI:     { bg: 'rgba(255,107,157,0.09)',   border: '#FF6B9D', text: '#FF85B0', glow: 'rgba(255,107,157,0.45)' },
    ALKALINE:   { bg: 'rgba(255,200,50,0.09)',    border: '#FFC832', text: '#FFD850', glow: 'rgba(255,200,50,0.40)' },
    TRANSITION: { bg: 'rgba(100,200,255,0.09)',   border: '#64C8FF', text: '#80D8FF', glow: 'rgba(100,200,255,0.45)' },
    HALOGEN:    { bg: 'rgba(255,140,50,0.09)',    border: '#FF8C32', text: '#FFA050', glow: 'rgba(255,140,50,0.40)' },
    NOBLE:      { bg: 'rgba(180,100,255,0.09)',   border: '#B464FF', text: '#C480FF', glow: 'rgba(180,100,255,0.45)' },
    LANTHANIDE: { bg: 'rgba(50,220,150,0.09)',    border: '#32DC96', text: '#48ECA6', glow: 'rgba(50,220,150,0.40)' },
    POST:       { bg: 'rgba(200,80,120,0.07)',    border: '#C85078', text: '#D86088', glow: 'rgba(200,80,120,0.30)' },
    METALLOID:  { bg: 'rgba(80,180,220,0.07)',    border: '#50B4DC', text: '#60C4EC', glow: 'rgba(80,180,220,0.30)' },
    NONMETAL:   { bg: 'rgba(255,220,150,0.07)',   border: '#FFDC96', text: '#FFE8B0', glow: 'rgba(255,220,150,0.25)' },
    ACTINIDE:   { bg: 'rgba(160,60,100,0.07)',    border: '#A03C64', text: '#B04C74', glow: 'rgba(160,60,100,0.30)' },
    PNICTOGEN:  { bg: 'rgba(255,150,200,0.09)',   border: '#FF96C8', text: '#FFAAD8', glow: 'rgba(255,150,200,0.45)' },
    CHALCOGEN:  { bg: 'rgba(150,255,100,0.09)',   border: '#96FF64', text: '#AAFF80', glow: 'rgba(150,255,100,0.40)' },
  },
};

const sceneConfig = {
  particles: [
    {
      id: 'confetti',
      behavior: 'fall',
      render: 'dot',
      spawnRate: [0, 0, 0.26, 0.7, 1.0],
      speed: [0.5, 2],
      size: [1, 3],
      color: '#FF6B9D',
      opacity: 0.98,
      lifetime: [50, 120],
      driftFreq: 0.04,
      driftAmplitude: 20,
    },
    {
      id: 'marqueeLight',
      behavior: 'flash',
      render: 'glow',
      spawnRate: [0, 0, 0.09, 0.21, 0.44],
      size: [2, 5],
      glowRadius: 10,
      color: '#FFC832',
      opacity: 1.0,
      lifetime: [10, 25],
    },
    {
      id: 'firework',
      behavior: 'rise',
      render: 'trail',
      spawnRate: [0, 0, 0, 0.06, 0.2],
      speed: [2, 5],
      size: [0.5, 1],
      trailLength: 8,
      color: '#64C8FF',
      opacity: 1.0,
      lifetime: [15, 30],
      cascade: true,
    },
    {
      id: 'balloonPop',
      behavior: 'flash',
      render: 'glow',
      spawnRate: [0, 0, 0, 0.05, 0.15],
      size: [3, 6],
      glowRadius: 12,
      color: '#FF6B9D',
      opacity: 1.0,
      lifetime: [5, 12],
    },
    {
      id: 'glitterFall',
      behavior: 'fall',
      render: 'dot',
      spawnRate: [0, 0, 0.08, 0.2, 0.4],
      speed: [0.3, 1],
      size: [0.5, 1.5],
      color: '#FFE040',
      opacity: 0.68,
      lifetime: [40, 100],
      driftFreq: 0.06,
      driftAmplitude: 15,
    },
    {
      id: 'prizeLight',
      behavior: 'orbit',
      render: 'glow',
      spawnRate: [0, 0, 0, 0.04, 0.1],
      speed: [0.5, 1.5],
      size: [1, 3],
      glowRadius: 8,
      color: '#B464FF',
      opacity: 0.75,
      lifetime: [30, 70],
    },
  ],
};

export default createModeTiers('FUNHOUSE', {
  tierNames: ['Closed', 'Open', 'Busy', 'Peak Night', 'Grand Finale'],
  tierTooltips: [
    'Dark rainy fairground',
    'Bright carnival colors',
    'Ride sounds and ticket flutters',
    'Neon flashes and confetti',
    'Fireworks and rainbow chaos',
  ],
  t1: { bgBase: '#0A0610', accent: '#998877', dotGridColor: 'rgba(153,136,119,0.03)' },
  t2,
  sceneConfig,
  flavorHue: 335,
});

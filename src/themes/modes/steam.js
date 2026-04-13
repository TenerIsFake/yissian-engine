import { createModeTiers } from '../paletteHelpers.js';

// ── STEAM — Victorian steampunk / brass & copper machinery ─────
// T1: Dormant     — cold grey-brown, tarnished brass
// T2: Warming     — warm copper/brass/sepia palette
// T3: Pressured   — rising steam wisps, piston sounds
// T4: Full Steam  — steam clouds, gear sparks, pressure hiss
// T5: Overdrive   — full steam eruption, brass lightning

const t2 = {
  bgBase: '#0A0806',
  accent: '#B8860B',
  dotGridColor: 'rgba(184,134,11,0.04)',
  cat: {
    ALKALI:     { bg: 'rgba(184,134,11,0.09)',   border: '#B8860B', text: '#C89620', glow: 'rgba(184,134,11,0.45)' },
    ALKALINE:   { bg: 'rgba(205,133,63,0.09)',   border: '#CD853F', text: '#D89550', glow: 'rgba(205,133,63,0.40)' },
    TRANSITION: { bg: 'rgba(160,100,20,0.09)',   border: '#A06414', text: '#B07424', glow: 'rgba(160,100,20,0.45)' },
    HALOGEN:    { bg: 'rgba(218,165,32,0.09)',   border: '#DAA520', text: '#E8B530', glow: 'rgba(218,165,32,0.40)' },
    NOBLE:      { bg: 'rgba(139,90,43,0.09)',    border: '#8B5A2B', text: '#9B6A3B', glow: 'rgba(139,90,43,0.45)' },
    LANTHANIDE: { bg: 'rgba(210,150,50,0.09)',   border: '#D29632', text: '#E0A640', glow: 'rgba(210,150,50,0.40)' },
    POST:       { bg: 'rgba(120,80,30,0.07)',    border: '#78501E', text: '#88602E', glow: 'rgba(120,80,30,0.30)' },
    METALLOID:  { bg: 'rgba(180,120,40,0.07)',   border: '#B47828', text: '#C48838', glow: 'rgba(180,120,40,0.30)' },
    NONMETAL:   { bg: 'rgba(220,180,120,0.07)',  border: '#DCB478', text: '#E8C490', glow: 'rgba(220,180,120,0.25)' },
    ACTINIDE:   { bg: 'rgba(140,90,25,0.07)',    border: '#8C5A19', text: '#A06A28', glow: 'rgba(140,90,25,0.30)' },
    PNICTOGEN:  { bg: 'rgba(190,140,30,0.09)',   border: '#BE8C1E', text: '#CE9C2E', glow: 'rgba(190,140,30,0.45)' },
    CHALCOGEN:  { bg: 'rgba(225,190,80,0.09)',   border: '#E1BE50', text: '#F0CE60', glow: 'rgba(225,190,80,0.40)' },
  },
};

const sceneConfig = {
  particles: [
    {
      id: 'steamWisp',
      behavior: 'rise',
      render: 'glow',
      spawnRate: [0, 0, 0.21, 0.53, 1.0],
      speed: [0.3, 1.2],
      size: [2, 5],
      glowRadius: 10,
      color: 'rgba(200,200,200,0.3)',
      opacity: 0.6,
      lifetime: [80, 200],
      driftFreq: 0.03,
      driftAmplitude: 30,
    },
    {
      id: 'gearSpark',
      behavior: 'linear',
      render: 'trail',
      spawnRate: [0, 0, 0.04, 0.14, 0.35],
      speed: [2, 6],
      angle: [200, 340],
      size: [0.5, 1],
      trailLength: 6,
      color: '#DAA520',
      opacity: 1.0,
      lifetime: [8, 20],
      cascade: true,
    },
    {
      id: 'pressureDrop',
      behavior: 'fall',
      render: 'dot',
      spawnRate: [0, 0, 0, 0.06, 0.18],
      speed: [0.5, 2],
      size: [1, 2],
      color: '#B8860B',
      opacity: 0.83,
      lifetime: [50, 120],
      cascade: true,
    },
    {
      id: 'pistonBurst',
      behavior: 'flash',
      render: 'glow',
      spawnRate: [0, 0, 0, 0.05, 0.15],
      size: [2, 5],
      glowRadius: 10,
      color: '#E8B530',
      opacity: 1.0,
      lifetime: [6, 15],
    },
    {
      id: 'copperGlint',
      behavior: 'twinkle',
      render: 'dot',
      spawnRate: [0, 0, 0.06, 0.15, 0.3],
      size: [0.5, 2],
      color: '#CD853F',
      opacity: 0.75,
      lifetime: [20, 60],
    },
    {
      id: 'valveSteam',
      behavior: 'rise',
      render: 'glow',
      spawnRate: [0, 0, 0, 0.08, 0.2],
      speed: [0.4, 1],
      size: [1, 3],
      glowRadius: 6,
      color: 'rgba(220,210,190,0.3)',
      opacity: 0.45,
      lifetime: [50, 120],
    },
  ],
};

export default createModeTiers('STEAM', {
  tierNames: ['Dormant', 'Warming', 'Pressured', 'Full Steam', 'Overdrive'],
  tierTooltips: [
    'Tarnished brass and cold grey',
    'Warm copper and sepia palette',
    'Rising steam wisps',
    'Steam clouds and gear sparks',
    'Full steam eruption',
  ],
  t1: { bgBase: '#090807', accent: '#998877', dotGridColor: 'rgba(153,136,119,0.03)' },
  t2,
  sceneConfig,
  flavorHue: 28,
});

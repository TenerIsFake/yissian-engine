import { createModeTiers } from '../paletteHelpers.js';

// ── SAFARI — Zoo / wildlife park / nature reserve ───────────────
// T1: Dawn        — grey misty savanna, muted earth
// T2: Daylight    — warm amber/green African palette
// T3: Active      — animal calls, rustling grass
// T4: Feeding     — splashing, dust clouds, movement
// T5: Migration   — full herd movement, predator chase

const t2 = {
  bgBase: '#0A0C06',
  accent: '#C8A050',
  dotGridColor: 'rgba(200,160,80,0.04)',
  cat: {
    ALKALI:     { bg: 'rgba(200,160,80,0.09)',    border: '#C8A050', text: '#D8B060', glow: 'rgba(200,160,80,0.45)' },
    ALKALINE:   { bg: 'rgba(140,100,60,0.09)',    border: '#8C643C', text: '#9C744C', glow: 'rgba(140,100,60,0.40)' },
    TRANSITION: { bg: 'rgba(120,140,80,0.09)',    border: '#788C50', text: '#889C60', glow: 'rgba(120,140,80,0.45)' },
    HALOGEN:    { bg: 'rgba(180,130,60,0.09)',    border: '#B4823C', text: '#C4924C', glow: 'rgba(180,130,60,0.40)' },
    NOBLE:      { bg: 'rgba(80,100,60,0.09)',     border: '#50643C', text: '#60744C', glow: 'rgba(80,100,60,0.45)' },
    LANTHANIDE: { bg: 'rgba(160,140,80,0.09)',    border: '#A08C50', text: '#B09C60', glow: 'rgba(160,140,80,0.40)' },
    POST:       { bg: 'rgba(60,80,100,0.07)',     border: '#3C5064', text: '#4C6074', glow: 'rgba(60,80,100,0.30)' },
    METALLOID:  { bg: 'rgba(100,80,60,0.07)',     border: '#64503C', text: '#74604C', glow: 'rgba(100,80,60,0.30)' },
    NONMETAL:   { bg: 'rgba(180,180,150,0.07)',   border: '#B4B496', text: '#C4C4A8', glow: 'rgba(180,180,150,0.25)' },
    ACTINIDE:   { bg: 'rgba(120,90,50,0.07)',     border: '#785A32', text: '#886A42', glow: 'rgba(120,90,50,0.30)' },
    PNICTOGEN:  { bg: 'rgba(150,120,60,0.09)',    border: '#96783C', text: '#A6884C', glow: 'rgba(150,120,60,0.45)' },
    CHALCOGEN:  { bg: 'rgba(100,130,70,0.09)',    border: '#648246', text: '#749256', glow: 'rgba(100,130,70,0.40)' },
  },
};

const sceneConfig = {
  particles: [
    {
      id: 'dustMote',
      behavior: 'fall',
      render: 'dot',
      spawnRate: [0, 0, 0.18, 0.44, 0.88],
      speed: [0.3, 1],
      size: [1, 2],
      color: '#C8A050',
      opacity: 0.6,
      lifetime: [60, 150],
      driftFreq: 0.02,
      driftAmplitude: 15,
    },
    {
      id: 'firefly',
      behavior: 'flash',
      render: 'glow',
      spawnRate: [0, 0, 0.07, 0.18, 0.35],
      size: [1, 3],
      glowRadius: 6,
      color: '#FFE080',
      opacity: 0.975,
      lifetime: [20, 50],
      cascade: true,
    },
    {
      id: 'leaf',
      behavior: 'fall',
      render: 'dot',
      spawnRate: [0, 0, 0, 0.09, 0.21],
      speed: [0.2, 0.8],
      size: [2, 3],
      color: '#788C50',
      opacity: 0.75,
      lifetime: [80, 200],
      driftFreq: 0.03,
      driftAmplitude: 30,
    },
    {
      id: 'pollenDrift',
      behavior: 'drift',
      render: 'dot',
      spawnRate: [0, 0, 0, 0.06, 0.16],
      speed: [0.1, 0.5],
      size: [1, 2],
      color: '#E8D080',
      opacity: 0.45,
      lifetime: [80, 200],
    },
    {
      id: 'heatWave',
      behavior: 'wave',
      render: 'glow',
      spawnRate: [0, 0, 0, 0.04, 0.12],
      speed: [0.3, 0.8],
      size: [3, 6],
      glowRadius: 10,
      color: '#E8C060',
      opacity: 0.4,
      lifetime: [60, 140],
      cascade: true,
    },
    {
      id: 'birdShadow',
      behavior: 'linear',
      render: 'shape',
      spawnRate: [0, 0, 0, 0.02, 0.06],
      speed: [2, 4],
      angle: [170, 190],
      size: [3, 5],
      color: '#4A4030',
      opacity: 0.4,
      lifetime: [40, 90],
    },
  ],
};

export default createModeTiers('SAFARI', {
  tierNames: ['Dawn', 'Daylight', 'Active', 'Feeding', 'Migration'],
  tierTooltips: [
    'Misty grey savanna',
    'Warm amber African palette',
    'Animal calls and rustling',
    'Dust clouds and movement',
    'Full herd migration',
  ],
  t1: { bgBase: '#090A07', accent: '#998877', dotGridColor: 'rgba(153,136,119,0.03)' },
  t2,
  sceneConfig,
  flavorHue: 58,
});

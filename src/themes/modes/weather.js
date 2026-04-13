import { createModeTiers } from '../paletteHelpers.js';

// ── WEATHER — Atmospheric / meteorological / storm ───────────
// T1: Calm    — pale grey, still air
// T2: Forecast — sky blue + storm grey + lightning yellow
// T3: Breeze  — gentle cloud drift, light drizzle
// T4: Storm   — heavier rain, more clouds, occasional lightning
// T5: Tempest — downpour, frequent lightning, wind streaks

const t2 = {
  bgBase: '#080A0E',
  accent: '#4488CC',
  dotGridColor: 'rgba(68,136,204,0.04)',
  cat: {
    ALKALI:     { bg: 'rgba(68,136,204,0.09)',    border: '#4488CC', text: '#6AAEDD', glow: 'rgba(68,136,204,0.45)' },
    ALKALINE:   { bg: 'rgba(96,125,139,0.09)',    border: '#607D8B', text: '#90A4AE', glow: 'rgba(96,125,139,0.40)' },
    TRANSITION: { bg: 'rgba(55,125,185,0.09)',    border: '#377DB9', text: '#64A8D8', glow: 'rgba(55,125,185,0.40)' },
    HALOGEN:    { bg: 'rgba(255,214,0,0.09)',     border: '#FFD600', text: '#FFE54C', glow: 'rgba(255,214,0,0.40)' },
    NOBLE:      { bg: 'rgba(100,181,246,0.09)',   border: '#64B5F6', text: '#90CAF9', glow: 'rgba(100,181,246,0.45)' },
    LANTHANIDE: { bg: 'rgba(129,212,250,0.08)',   border: '#81D4FA', text: '#B3E5FC', glow: 'rgba(129,212,250,0.35)' },
    POST:       { bg: 'rgba(120,120,130,0.07)',   border: '#787882', text: '#A0A0AA', glow: 'rgba(120,120,130,0.25)' },
    METALLOID:  { bg: 'rgba(79,195,247,0.07)',    border: '#4FC3F7', text: '#81D4FA', glow: 'rgba(79,195,247,0.30)' },
    NONMETAL:   { bg: 'rgba(176,190,197,0.07)',   border: '#B0BEC5', text: '#CFD8DC', glow: 'rgba(176,190,197,0.20)' },
    ACTINIDE:   { bg: 'rgba(48,63,80,0.08)',      border: '#303F50', text: '#546E7A', glow: 'rgba(48,63,80,0.35)' },
    PNICTOGEN:  { bg: 'rgba(41,182,246,0.09)',    border: '#29B6F6', text: '#4FC3F7', glow: 'rgba(41,182,246,0.40)' },
    CHALCOGEN:  { bg: 'rgba(255,235,59,0.09)',    border: '#FFEB3B', text: '#FFF176', glow: 'rgba(255,235,59,0.40)' },
  },
};

const sceneConfig = {
  particles: [
    {
      id: 'raindrop',
      behavior: 'fall',
      render: 'trail',
      spawnRate: [0, 0, 0.18, 0.52, 1.0],
      speed: [3, 7],
      angle: [260, 275],
      size: [0.5, 1.5],
      trailLength: 8,
      color: '#64B5F6',
      opacity: [0.4, 0.8],
      lifetime: [30, 70],
    },
    {
      id: 'cloud',
      behavior: 'drift',
      render: 'glow',
      count: [0, 0, 100, 210, 320],
      size: [8, 18],
      glowRadius: 25,
      color: '#607D8B',
      opacity: [0.4, 0.8],
      driftSpeed: [0.15, 0.5],
      lifetime: Infinity,
    },
    {
      id: 'lightning',
      behavior: 'flash',
      render: 'glow',
      spawnRate: [0, 0, 0, 0.06, 0.23],
      size: [3, 6],
      glowRadius: 35,
      color: '#FFD600',
      opacity: 1.0,
      cascade: true,
      lifetime: [3, 8],
    },
    {
      id: 'windStreak',
      behavior: 'linear',
      render: 'trail',
      spawnRate: [0, 0, 0, 0, 0.3],
      speed: [10, 18],
      angle: [175, 190],
      size: [0.5, 1],
      trailLength: 20,
      color: '#B0BEC5',
      opacity: 0.75,
      lifetime: [15, 30],
    },
    {
      id: 'hailstone',
      behavior: 'fall',
      render: 'dot',
      spawnRate: [0, 0, 0, 0.08, 0.2],
      speed: [5, 12],
      angle: [265, 280],
      size: [1.5, 3],
      color: '#CFD8DC',
      opacity: [0.5, 0.9],
      lifetime: [20, 45],
    },
    {
      id: 'fogBank',
      behavior: 'drift',
      render: 'glow',
      count: [0, 0, 0, 80, 180],
      size: [15, 30],
      glowRadius: 35,
      color: '#90A4AE',
      opacity: [0.4, 0.8],
      driftSpeed: [0.05, 0.2],
      lifetime: Infinity,
    },
    {
      id: 'sunbeam',
      behavior: 'linear',
      render: 'glow',
      spawnRate: [0, 0, 0.03, 0.06, 0.1],
      speed: [0.5, 1.5],
      angle: [240, 260],
      size: [2, 5],
      glowRadius: 10,
      color: '#FFF176',
      opacity: [0.4, 0.8],
      lifetime: [80, 200],
    },
  ],
};

export default createModeTiers('WEATHER', {
  tierNames: ['Calm', 'Forecast', 'Breeze', 'Storm', 'Tempest'],
  tierTooltips: [
    'Pale grey — still air',
    'Sky blue, storm grey, lightning yellow',
    'Gentle cloud drift with light drizzle',
    'Heavier rain, more clouds, occasional lightning',
    'Downpour, frequent lightning, wind streaks',
  ],
  t1: { bgBase: '#0B0B0D', accent: '#B0B4B8', dotGridColor: 'rgba(176,180,184,0.03)' },
  t2,
  sceneConfig,
  flavorHue: 210,
});

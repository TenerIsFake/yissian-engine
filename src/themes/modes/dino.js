import { createModeTiers } from '../paletteHelpers.js';

// ── DINO — Fossil / paleontology / prehistoric ───────────────
// T1: Petrified   — stone grey with warm cast
// T2: Excavation  — earthy amber/ochre/sandstone
// T3: Dig Site    — slow dust drift, faint fossil glimmer
// T4: Eruption    — volcanic ash falling, dust clouds, amber glow
// T5: Extinction  — ash storm, meteor streaks, volcanic flares

const t2 = {
  bgBase: '#0E0A06',
  accent: '#CC8833',
  dotGridColor: 'rgba(204,136,51,0.04)',
  cat: {
    ALKALI:     { bg: 'rgba(204,136,51,0.09)',   border: '#CC8833', text: '#DDA855', glow: 'rgba(204,136,51,0.40)' },
    ALKALINE:   { bg: 'rgba(180,140,70,0.08)',    border: '#B48C46', text: '#CCA866', glow: 'rgba(180,140,70,0.35)' },
    TRANSITION: { bg: 'rgba(170,110,40,0.09)',    border: '#AA6E28', text: '#CC9450', glow: 'rgba(170,110,40,0.40)' },
    HALOGEN:    { bg: 'rgba(200,160,80,0.08)',    border: '#C8A050', text: '#DABB77', glow: 'rgba(200,160,80,0.35)' },
    NOBLE:      { bg: 'rgba(160,130,80,0.09)',    border: '#A08250', text: '#BDA070', glow: 'rgba(160,130,80,0.40)' },
    LANTHANIDE: { bg: 'rgba(190,150,90,0.08)',    border: '#BE965A', text: '#D4B27A', glow: 'rgba(190,150,90,0.35)' },
    POST:       { bg: 'rgba(140,125,100,0.07)',   border: '#8C7D64', text: '#A89880', glow: 'rgba(140,125,100,0.25)' },
    METALLOID:  { bg: 'rgba(175,135,75,0.07)',    border: '#AF874B', text: '#C8A56A', glow: 'rgba(175,135,75,0.30)' },
    NONMETAL:   { bg: 'rgba(210,195,170,0.07)',   border: '#D2C3AA', text: '#E4D8C4', glow: 'rgba(210,195,170,0.20)' },
    ACTINIDE:   { bg: 'rgba(140,90,30,0.08)',     border: '#8C5A1E', text: '#B07A3E', glow: 'rgba(140,90,30,0.35)' },
    PNICTOGEN:  { bg: 'rgba(185,120,50,0.09)',    border: '#B97832', text: '#D49855', glow: 'rgba(185,120,50,0.40)' },
    CHALCOGEN:  { bg: 'rgba(220,170,60,0.09)',    border: '#DCAA3C', text: '#ECC45E', glow: 'rgba(220,170,60,0.40)' },
  },
};

const sceneConfig = {
  particles: [
    {
      id: 'dust',
      behavior: 'drift',
      render: 'dot',
      count: [0, 0, 600, 950, 1400],
      size: [0.5, 2.0],
      color: '#CCAA77',
      opacity: [0.4, 0.9],
      speed: [0.3, 1.2],
      angle: [80, 110],
      lifetime: Infinity,
    },
    {
      id: 'fossilGlimmer',
      behavior: 'twinkle',
      render: 'dot',
      count: [0, 0, 350, 500, 700],
      size: [0.5, 1.5],
      color: '#FFE8AA',
      opacity: [0.4, 0.8],
      twinkleSpeed: [0.005, 0.02],
      lifetime: Infinity,
    },
    {
      id: 'volcanicAsh',
      behavior: 'fall',
      render: 'dot',
      spawnRate: [0, 0, 0, 0.18, 0.53],
      speed: [0.8, 2.5],
      size: [0.8, 2.0],
      color: '#888078',
      opacity: [0.4, 0.8],
      lifetime: [80, 200],
    },
    {
      id: 'meteorStreak',
      behavior: 'linear',
      render: 'trail',
      spawnRate: [0, 0, 0, 0.06, 0.23],
      speed: [6, 14],
      angle: [200, 250],
      size: [1, 1.5],
      trailLength: 20,
      color: '#FFAA44',
      opacity: 1.0,
      lifetime: [30, 70],
    },
    {
      id: 'volcanicFlare',
      behavior: 'flash',
      render: 'glow',
      spawnRate: [0, 0, 0, 0, 0.09],
      size: [3, 7],
      glowRadius: 14,
      color: '#FF6622',
      opacity: [0.75, 1.0],
      lifetime: [8, 20],
      flashInterval: [50, 100],
      cascade: true,
    },
    {
      id: 'amberDrop',
      behavior: 'fall',
      render: 'glow',
      spawnRate: [0, 0, 0, 0.08, 0.2],
      speed: [0.6, 1.8],
      size: [1.5, 3.5],
      glowRadius: 8,
      color: '#FFAA33',
      opacity: [0.4, 0.9],
      lifetime: [100, 250],
    },
    {
      id: 'fossilSpark',
      behavior: 'flash',
      render: 'dot',
      spawnRate: [0, 0, 0.06, 0.12, 0.25],
      size: [0.5, 1.5],
      color: '#FFE0AA',
      opacity: [0.6, 1.0],
      lifetime: [3, 8],
      flashInterval: [30, 70],
    },
    {
      id: 'ashCloud',
      behavior: 'drift',
      render: 'glow',
      spawnRate: [0, 0, 0, 0.06, 0.15],
      speed: [0.2, 0.8],
      size: [4, 10],
      glowRadius: 12,
      color: '#777068',
      opacity: [0.4, 0.8],
      angle: [80, 110],
      lifetime: [150, 350],
    },
  ],
};

export default createModeTiers('DINO', {
  tierNames: ['Petrified', 'Excavation', 'Dig Site', 'Eruption', 'Extinction'],
  tierTooltips: [
    'Stone grey with warm cast — silent fossils',
    'Earthy amber/ochre/sandstone palette',
    'Slow dust drift, faint fossil glimmer',
    'Volcanic ash falling, dust clouds, amber glow',
    'Ash storm, meteor streaks, volcanic flares',
  ],
  t1: { bgBase: '#0B0A09', accent: '#B0A898', dotGridColor: 'rgba(176,168,152,0.03)' },
  t2,
  sceneConfig,
  flavorHue: 15,
});

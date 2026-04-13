import { createModeTiers } from '../paletteHelpers.js';

// ── MOLECULE — Molecular / chemical bonds / atoms ────────────
// T1: Inert       — cool grey, stable and quiet
// T2: Bonded      — cyan/blue molecular palette, teal-green bonds
// T3: Reactive    — slow electron orbits, faint bond shimmer
// T4: Catalyzed   — more electrons, bond formations (flash), vibrating atoms
// T5: Chain Reaction — dense electrons, rapid bonds, reaction cascades

const t2 = {
  bgBase: '#040E0C',
  accent: '#06D6A0',
  dotGridColor: 'rgba(6,214,160,0.04)',
  cat: {
    ALKALI:     { bg: 'rgba(6,214,160,0.09)',    border: '#06D6A0', text: '#34E8BA', glow: 'rgba(6,214,160,0.45)' },
    ALKALINE:   { bg: 'rgba(0,188,212,0.09)',     border: '#00BCD4', text: '#4DD0E1', glow: 'rgba(0,188,212,0.40)' },
    TRANSITION: { bg: 'rgba(38,166,154,0.09)',    border: '#26A69A', text: '#4DB6AC', glow: 'rgba(38,166,154,0.40)' },
    HALOGEN:    { bg: 'rgba(0,230,118,0.09)',     border: '#00E676', text: '#69F0AE', glow: 'rgba(0,230,118,0.40)' },
    NOBLE:      { bg: 'rgba(3,169,244,0.09)',     border: '#03A9F4', text: '#4FC3F7', glow: 'rgba(3,169,244,0.45)' },
    LANTHANIDE: { bg: 'rgba(100,255,218,0.08)',   border: '#64FFDA', text: '#A7FFEB', glow: 'rgba(100,255,218,0.35)' },
    POST:       { bg: 'rgba(96,125,139,0.07)',    border: '#607D8B', text: '#90A4AE', glow: 'rgba(96,125,139,0.25)' },
    METALLOID:  { bg: 'rgba(0,150,136,0.07)',     border: '#009688', text: '#4DB6AC', glow: 'rgba(0,150,136,0.30)' },
    NONMETAL:   { bg: 'rgba(178,235,242,0.07)',   border: '#B2EBF2', text: '#E0F7FA', glow: 'rgba(178,235,242,0.20)' },
    ACTINIDE:   { bg: 'rgba(0,121,107,0.08)',     border: '#00796B', text: '#26A69A', glow: 'rgba(0,121,107,0.35)' },
    PNICTOGEN:  { bg: 'rgba(29,233,182,0.09)',    border: '#1DE9B6', text: '#64FFDA', glow: 'rgba(29,233,182,0.40)' },
    CHALCOGEN:  { bg: 'rgba(0,229,255,0.09)',     border: '#00E5FF', text: '#18FFFF', glow: 'rgba(0,229,255,0.40)' },
  },
};

const sceneConfig = {
  particles: [
    {
      id: 'electron',
      behavior: 'orbit',
      render: 'dot',
      count: [0, 0, 500, 950, 1400],
      size: [1, 2],
      color: '#06D6A0',
      opacity: [0.4, 0.85],
      orbitSpeed: [0.005, 0.02],
      orbitRadius: [20, 80],
      lifetime: Infinity,
    },
    {
      id: 'bondShimmer',
      behavior: 'twinkle',
      render: 'dot',
      count: [0, 0, 450, 700, 1050],
      size: [0.5, 1.5],
      color: '#00BCD4',
      opacity: [0.4, 0.8],
      twinkleSpeed: [0.006, 0.018],
      lifetime: Infinity,
    },
    {
      id: 'bondFormation',
      behavior: 'flash',
      render: 'glow',
      spawnRate: [0, 0, 0, 0.15, 0.38],
      size: [2, 4],
      glowRadius: 10,
      color: '#64FFDA',
      opacity: 1.0,
      cascade: true,
      lifetime: [15, 35],
    },
    {
      id: 'atomVibration',
      behavior: 'twinkle',
      render: 'dot',
      count: [0, 0, 0, 350, 800],
      size: [1.5, 3],
      color: '#1DE9B6',
      opacity: [0.4, 0.8],
      twinkleSpeed: [0.03, 0.06],
      lifetime: Infinity,
    },
    {
      id: 'ionTrail',
      behavior: 'linear',
      render: 'trail',
      spawnRate: [0, 0, 0, 0.08, 0.2],
      speed: [3, 8],
      angle: [0, 360],
      size: [0.5, 1.5],
      trailLength: 12,
      color: '#00E5FF',
      opacity: [0.4, 0.9],
      lifetime: [30, 70],
    },
    {
      id: 'valenceShell',
      behavior: 'orbit',
      render: 'glow',
      count: [0, 0, 0, 100, 250],
      size: [2, 4],
      glowRadius: 6,
      color: '#00E676',
      opacity: [0.4, 0.8],
      orbitSpeed: [0.003, 0.012],
      orbitRadius: [30, 100],
      lifetime: Infinity,
    },
    {
      id: 'reactionBubble',
      behavior: 'rise',
      render: 'dot',
      count: [0, 0, 0, 120, 300],
      size: [1.5, 4],
      color: '#B2EBF2',
      opacity: [0.4, 0.8],
      speed: [0.2, 0.6],
      wobble: true,
      wobbleAmount: 3,
      lifetime: [180, 400],
    },
  ],
};

export default createModeTiers('MOLECULE', {
  tierNames: ['Inert', 'Bonded', 'Reactive', 'Catalyzed', 'Chain Reaction'],
  tierTooltips: [
    'Cool grey — stable and quiet',
    'Cyan/teal molecular bond palette',
    'Slow electron orbits, faint bond shimmer',
    'More electrons, bond formations, vibrating atoms',
    'Dense electrons, rapid bonds, reaction cascades',
  ],
  t1: { bgBase: '#0A0C0B', accent: '#A0A8A6', dotGridColor: 'rgba(160,168,166,0.03)' },
  t2,
  sceneConfig,
  flavorHue: 160,
});

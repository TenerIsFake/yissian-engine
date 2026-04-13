import { createModeTiers } from '../paletteHelpers.js';

// ── AIRPORT — Aviation / departure board / air traffic ───────
// T1: Grounded    — flat grey, no activity
// T2: Terminal    — aviation blue + signal white + warm amber
// T3: Taxiing     — runway lights drifting, faint radar sweep
// T4: Airborne    — more lights, plane silhouettes crossing, radar pulses
// T5: Rush Hour   — dense traffic, frequent planes, tower searchlights

const t2 = {
  bgBase: '#060A10',
  accent: '#4488CC',
  dotGridColor: 'rgba(68,136,204,0.04)',
  cat: {
    ALKALI:     { bg: 'rgba(68,136,204,0.09)',   border: '#4488CC', text: '#6EAADD', glow: 'rgba(68,136,204,0.40)' },
    ALKALINE:   { bg: 'rgba(90,160,220,0.08)',    border: '#5AA0DC', text: '#7DB8E8', glow: 'rgba(90,160,220,0.35)' },
    TRANSITION: { bg: 'rgba(50,110,180,0.09)',    border: '#326EB4', text: '#5A94D0', glow: 'rgba(50,110,180,0.40)' },
    HALOGEN:    { bg: 'rgba(220,180,80,0.08)',    border: '#DCB450', text: '#E8CC77', glow: 'rgba(220,180,80,0.35)' },
    NOBLE:      { bg: 'rgba(100,170,230,0.09)',   border: '#64AAE6', text: '#8AC2F0', glow: 'rgba(100,170,230,0.40)' },
    LANTHANIDE: { bg: 'rgba(120,180,240,0.08)',   border: '#78B4F0', text: '#9CCAF5', glow: 'rgba(120,180,240,0.35)' },
    POST:       { bg: 'rgba(140,150,165,0.07)',   border: '#8C96A5', text: '#A8B2BF', glow: 'rgba(140,150,165,0.25)' },
    METALLOID:  { bg: 'rgba(80,145,210,0.07)',    border: '#5091D2', text: '#72ADE0', glow: 'rgba(80,145,210,0.30)' },
    NONMETAL:   { bg: 'rgba(200,210,225,0.07)',   border: '#C8D2E1', text: '#DEE4EE', glow: 'rgba(200,210,225,0.20)' },
    ACTINIDE:   { bg: 'rgba(40,85,150,0.08)',     border: '#285596', text: '#4A7BBE', glow: 'rgba(40,85,150,0.35)' },
    PNICTOGEN:  { bg: 'rgba(60,120,195,0.09)',    border: '#3C78C3', text: '#6298D8', glow: 'rgba(60,120,195,0.40)' },
    CHALCOGEN:  { bg: 'rgba(200,160,60,0.09)',    border: '#C8A03C', text: '#DDB85E', glow: 'rgba(200,160,60,0.40)' },
  },
};

const sceneConfig = {
  particles: [
    {
      id: 'runwayLight',
      behavior: 'twinkle',
      render: 'dot',
      count: [0, 0, 700, 1050, 1600],
      size: [0.8, 2.0],
      color: '#FFEEBB',
      opacity: [0.4, 0.8],
      twinkleSpeed: [0.01, 0.03],
      lifetime: Infinity,
    },
    {
      id: 'radarSweep',
      behavior: 'orbit',
      render: 'arc',
      spawnRate: [0, 0, 0.05, 0.14, 0.26],
      speed: [1.0, 2.5],
      size: [30, 60],
      arcAngle: 30,
      color: '#44CC66',
      opacity: [0.4, 0.8],
      lifetime: [80, 160],
    },
    {
      id: 'planeSilhouette',
      behavior: 'drift',
      render: 'shape',
      spawnRate: [0, 0, 0, 0.075, 0.27],
      speed: [1.5, 4],
      angle: [160, 200],
      size: [4, 8],
      color: '#AABBCC',
      opacity: [0.5, 0.8],
      lifetime: [120, 300],
    },
    {
      id: 'towerLight',
      behavior: 'flash',
      render: 'glow',
      spawnRate: [0, 0, 0, 0.06, 0.18],
      size: [3, 6],
      glowRadius: 15,
      color: '#FFFFFF',
      opacity: [0.75, 1.0],
      cascade: true,
      lifetime: [10, 25],
      flashInterval: [60, 120],
    },
    {
      id: 'contrail',
      behavior: 'linear',
      render: 'trail',
      spawnRate: [0, 0, 0, 0.04, 0.12],
      speed: [2, 5],
      angle: [165, 195],
      size: [0.5, 1.5],
      trailLength: 30,
      color: '#C8D2E1',
      opacity: [0.4, 0.8],
      lifetime: [100, 250],
    },
    {
      id: 'beaconPulse',
      behavior: 'flash',
      render: 'glow',
      spawnRate: [0, 0, 0.02, 0.05, 0.12],
      size: [2, 5],
      glowRadius: 12,
      color: '#FF4444',
      opacity: 1.0,
      cascade: true,
      lifetime: [5, 15],
    },
    {
      id: 'taxiLight',
      behavior: 'drift',
      render: 'dot',
      count: [0, 0, 0, 120, 280],
      size: [1, 2.5],
      color: '#DCB450',
      opacity: [0.4, 0.83],
      driftSpeed: [0.1, 0.35],
      lifetime: Infinity,
    },
  ],
};

export default createModeTiers('AIRPORT', {
  tierNames: ['Grounded', 'Terminal', 'Taxiing', 'Airborne', 'Rush Hour'],
  tierTooltips: [
    'Flat grey — no activity',
    'Aviation blue + signal white + warm amber',
    'Runway lights drifting, faint radar sweep',
    'More lights, plane silhouettes, radar pulses',
    'Dense traffic, frequent planes, tower searchlights',
  ],
  t1: { bgBase: '#0A0A0B', accent: '#A0A5B0', dotGridColor: 'rgba(160,165,176,0.03)' },
  t2,
  sceneConfig,
  flavorHue: 210,
});

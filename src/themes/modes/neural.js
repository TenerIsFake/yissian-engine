import { createModeTiers } from '../paletteHelpers.js';

// ── NEURAL — Neural network / cyberpunk brain ─────────────────
// T1: Dormant   — dark grey with faint cyan tint
// T2: Synapse   — magenta/cyan/purple neon palette
// T3: Impulse   — data packets flowing, faint synapses
// T4: Cascade   — more packets, synapse flashes, pulse waves
// T5: Overload  — dense traffic, frequent flashes, orbital data rings

const t2 = {
  bgBase: '#08060F',
  accent: '#FF2D78',
  dotGridColor: 'rgba(255,45,120,0.04)',
  cat: {
    ALKALI:     { bg: 'rgba(255,45,120,0.08)',   border: '#FF2D78', text: '#FF5A96', glow: 'rgba(255,45,120,0.45)' },
    ALKALINE:   { bg: 'rgba(0,220,255,0.08)',    border: '#00DCFF', text: '#33E4FF', glow: 'rgba(0,220,255,0.40)' },
    TRANSITION: { bg: 'rgba(180,80,255,0.08)',   border: '#B450FF', text: '#C77AFF', glow: 'rgba(180,80,255,0.40)' },
    HALOGEN:    { bg: 'rgba(255,100,200,0.08)',  border: '#FF64C8', text: '#FF80D5', glow: 'rgba(255,100,200,0.40)' },
    NOBLE:      { bg: 'rgba(100,60,230,0.08)',   border: '#643CE6', text: '#8060F0', glow: 'rgba(100,60,230,0.40)' },
    LANTHANIDE: { bg: 'rgba(0,255,200,0.08)',    border: '#00FFC8', text: '#33FFD6', glow: 'rgba(0,255,200,0.35)' },
    POST:       { bg: 'rgba(120,90,200,0.07)',   border: '#785AC8', text: '#9A7CE0', glow: 'rgba(120,90,200,0.30)' },
    METALLOID:  { bg: 'rgba(0,180,255,0.07)',    border: '#00B4FF', text: '#33C4FF', glow: 'rgba(0,180,255,0.30)' },
    NONMETAL:   { bg: 'rgba(240,200,255,0.07)',  border: '#F0C8FF', text: '#F0C8FF', glow: 'rgba(240,200,255,0.20)' },
    ACTINIDE:   { bg: 'rgba(255,0,100,0.08)',    border: '#FF0064', text: '#FF3388', glow: 'rgba(255,0,100,0.40)' },
    PNICTOGEN:  { bg: 'rgba(220,100,255,0.08)',  border: '#DC64FF', text: '#E680FF', glow: 'rgba(220,100,255,0.35)' },
    CHALCOGEN:  { bg: 'rgba(0,255,255,0.08)',    border: '#00FFFF', text: '#44FFFF', glow: 'rgba(0,255,255,0.40)' },
  },
};

const sceneConfig = {
  particles: [
    {
      id: 'dataPacket',
      behavior: 'drift',
      render: 'dot',
      count: [0, 0, 700, 1150, 1750],
      size: [1, 3],
      color: '#00DCFF',
      opacity: [0.4, 1.0],
      speed: [0.5, 2.0],
      lifetime: [150, 350],
    },
    {
      id: 'synapse',
      behavior: 'flash',
      render: 'glow',
      spawnRate: [0, 0, 0.05, 0.18, 0.38],
      size: [3, 8],
      glowRadius: 10,
      color: '#FF2D78',
      opacity: 1.0,
      lifetime: [6, 15],
    },
    {
      id: 'pulse',
      behavior: 'wave',
      render: 'glow',
      spawnRate: [0, 0, 0, 0.08, 0.22],
      size: [10, 25],
      glowRadius: 15,
      color: '#B450FF',
      opacity: [0.4, 0.8],
      speed: [1, 3],
      lifetime: [60, 150],
      cascade: true,
    },
    {
      id: 'dataRing',
      behavior: 'orbit',
      render: 'shape',
      spawnRate: [0, 0, 0, 0, 0.05],
      size: [4, 8],
      orbitRadius: [40, 80],
      orbitSpeed: [0.01, 0.03],
      color: '#00FFFF',
      opacity: 0.75,
      lifetime: [200, 400],
    },
    {
      id: 'dendrite',
      behavior: 'curve',
      render: 'trail',
      spawnRate: [0, 0, 0, 0.06, 0.15],
      speed: [0.8, 2],
      angle: [0, 360],
      size: [0.8, 1.5],
      trailLength: 20,
      color: '#B450FF',
      opacity: 0.75,
      lifetime: [80, 200],
      curveFactor: [-0.008, 0.008],
    },
    {
      id: 'neurotransmitter',
      behavior: 'fall',
      render: 'dot',
      count: [0, 0, 0, 200, 500],
      size: [0.5, 1.5],
      color: '#FF5A96',
      opacity: [0.4, 0.8],
      speed: [0.3, 1.0],
      lifetime: [100, 250],
    },
    {
      id: 'brainWave',
      behavior: 'wave',
      render: 'line',
      spawnRate: [0, 0, 0, 0.03, 0.1],
      size: [1, 2],
      color: '#00DCFF',
      opacity: [0.4, 0.8],
      speed: [1.5, 4],
      lifetime: [80, 180],
    },
  ],
};

export default createModeTiers('NEURAL', {
  tierNames: ['Dormant', 'Synapse', 'Impulse', 'Cascade', 'Overload'],
  tierTooltips: [
    'Dark grey with faint cyan tint',
    'Magenta/cyan/purple neon synapses',
    'Data packets flowing with faint synapses',
    'Dense packets, synapse flashes, pulse waves',
    'Full neural overload with orbital data rings',
  ],
  t1: { bgBase: '#0A0A0E', accent: '#8899AA', dotGridColor: 'rgba(136,153,170,0.03)' },
  t2,
  sceneConfig,
  flavorHue: 345,
});

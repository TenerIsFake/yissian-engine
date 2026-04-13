import { createModeTiers } from '../paletteHelpers.js';

// ── BIO — Biological / cellular / organic ─────────────────────
// T1: Dormant Cell — grey-green muted
// T2: Living       — toxic lime/green palette
// T3: Mitosis      — floating cell particles, slow spore drift
// T4: Bloom        — more cells, DNA-like rising helixes, budding flashes
// T5: Outbreak     — dense organism swarm, rapid budding, bioluminescent pulses

const t2 = {
  bgBase: '#040804',
  accent: '#7FFF00',
  dotGridColor: 'rgba(127,255,0,0.04)',
  cat: {
    ALKALI:     { bg: 'rgba(127,255,0,0.08)',    border: '#7FFF00', text: '#8FFF22', glow: 'rgba(127,255,0,0.42)' },
    ALKALINE:   { bg: 'rgba(180,255,50,0.08)',   border: '#B4FF32', text: '#C0FF55', glow: 'rgba(180,255,50,0.38)' },
    TRANSITION: { bg: 'rgba(50,255,30,0.08)',    border: '#32FF1E', text: '#55FF40', glow: 'rgba(50,255,30,0.40)' },
    HALOGEN:    { bg: 'rgba(0,255,130,0.08)',    border: '#00FF82', text: '#33FF9E', glow: 'rgba(0,255,130,0.38)' },
    NOBLE:      { bg: 'rgba(200,255,0,0.08)',    border: '#C8FF00', text: '#D4FF33', glow: 'rgba(200,255,0,0.38)' },
    LANTHANIDE: { bg: 'rgba(100,255,100,0.08)',  border: '#64FF64', text: '#80FF80', glow: 'rgba(100,255,100,0.35)' },
    POST:       { bg: 'rgba(80,200,30,0.07)',    border: '#50C81E', text: '#66DD33', glow: 'rgba(80,200,30,0.28)' },
    METALLOID:  { bg: 'rgba(0,210,130,0.07)',    border: '#00D282', text: '#22E09A', glow: 'rgba(0,210,130,0.28)' },
    NONMETAL:   { bg: 'rgba(220,255,220,0.07)',  border: '#DCFFDC', text: '#DCFFDC', glow: 'rgba(220,255,220,0.20)' },
    ACTINIDE:   { bg: 'rgba(160,255,50,0.08)',   border: '#A0FF32', text: '#B0FF55', glow: 'rgba(160,255,50,0.35)' },
    PNICTOGEN:  { bg: 'rgba(0,255,80,0.08)',     border: '#00FF50', text: '#33FF70', glow: 'rgba(0,255,80,0.40)' },
    CHALCOGEN:  { bg: 'rgba(220,255,0,0.08)',    border: '#DCFF00', text: '#E4FF33', glow: 'rgba(220,255,0,0.38)' },
  },
};

const sceneConfig = {
  particles: [
    {
      id: 'cell',
      behavior: 'drift',
      render: 'dot',
      count: [0, 0, 600, 1000, 1600],
      size: [2, 6],
      color: '#7FFF00',
      opacity: [0.4, 0.83],
      speed: [0.2, 0.8],
      lifetime: [200, 450],
    },
    {
      id: 'spore',
      behavior: 'rise',
      render: 'dot',
      count: [0, 0, 250, 550, 900],
      size: [1, 3],
      color: '#00FF82',
      opacity: [0.4, 0.8],
      speed: [0.15, 0.5],
      wobble: true,
      wobbleAmount: 2,
      lifetime: [250, 500],
    },
    {
      id: 'dnaHelix',
      behavior: 'wave',
      render: 'glow',
      spawnRate: [0, 0, 0, 0.06, 0.15],
      size: [3, 6],
      glowRadius: 8,
      color: '#B4FF32',
      opacity: [0.4, 0.8],
      speed: [0.5, 1.5],
      lifetime: [120, 250],
    },
    {
      id: 'budFlash',
      behavior: 'flash',
      render: 'glow',
      spawnRate: [0, 0, 0, 0.075, 0.27],
      size: [6, 14],
      glowRadius: 10,
      color: '#64FF64',
      opacity: 1.0,
      cascade: true,
      lifetime: [8, 18],
    },
    {
      id: 'bioLumPulse',
      behavior: 'flash',
      render: 'glow',
      spawnRate: [0, 0, 0, 0, 0.06],
      size: [18, 30],
      glowRadius: 22,
      color: '#DCFFDC',
      opacity: 0.75,
      lifetime: [12, 28],
    },
    {
      id: 'mitosis',
      behavior: 'flash',
      render: 'glow',
      spawnRate: [0, 0, 0, 0.04, 0.12],
      size: [4, 10],
      glowRadius: 12,
      color: '#A0FF50',
      opacity: 1.0,
      cascade: true,
      lifetime: [10, 22],
    },
    {
      id: 'enzyme',
      behavior: 'orbit',
      render: 'dot',
      count: [0, 0, 0, 150, 350],
      size: [1, 2],
      color: '#C8FF00',
      opacity: [0.4, 0.8],
      orbitSpeed: [0.008, 0.025],
      orbitRadius: [10, 40],
      lifetime: Infinity,
    },
    {
      id: 'membrane',
      behavior: 'wave',
      render: 'line',
      spawnRate: [0, 0, 0, 0.04, 0.1],
      size: [2, 5],
      color: '#00FF50',
      opacity: [0.4, 0.8],
      speed: [0.3, 0.8],
      waveAmplitude: [10, 30],
      waveFrequency: [0.015, 0.04],
      lifetime: [150, 300],
    },
  ],
};

export default createModeTiers('BIO', {
  tierNames: ['Dormant Cell', 'Living', 'Mitosis', 'Bloom', 'Outbreak'],
  tierTooltips: [
    'Grey-green muted cellular dormancy',
    'Toxic lime/green living palette',
    'Floating cells and slow spore drift',
    'DNA helixes and budding flashes',
    'Dense organism swarm with bioluminescent pulses',
  ],
  t1: { bgBase: '#0A0C0A', accent: '#90A088', dotGridColor: 'rgba(144,160,136,0.03)' },
  t2,
  sceneConfig,
  flavorHue: 90,
});

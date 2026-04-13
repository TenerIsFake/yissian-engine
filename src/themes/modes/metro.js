import { createModeTiers } from '../paletteHelpers.js';

// ── METRO — Subway / transit system / underground map ───────────
// T1: Closed      — grey tunnels, no service
// T2: Running     — colorful transit line palette
// T3: Rush Hour   — station announcements, crowd buzz
// T4: Express     — fast-moving train lights, wind trails
// T5: System Map  — full animated transit network, train particles

const t2 = {
  bgBase: '#06060F',
  accent: '#4488FF',
  dotGridColor: 'rgba(68,136,255,0.03)',
  cat: {
    ALKALI:     { bg: 'rgba(255,51,51,0.09)',     border: '#FF3333', text: '#FF5555', glow: 'rgba(255,51,51,0.45)' },
    ALKALINE:   { bg: 'rgba(51,153,255,0.09)',    border: '#3399FF', text: '#55AAFF', glow: 'rgba(51,153,255,0.40)' },
    TRANSITION: { bg: 'rgba(255,215,0,0.09)',     border: '#FFD700', text: '#FFE040', glow: 'rgba(255,215,0,0.45)' },
    HALOGEN:    { bg: 'rgba(255,136,51,0.09)',    border: '#FF8833', text: '#FFA055', glow: 'rgba(255,136,51,0.40)' },
    NOBLE:      { bg: 'rgba(170,102,255,0.09)',   border: '#AA66FF', text: '#BB80FF', glow: 'rgba(170,102,255,0.45)' },
    LANTHANIDE: { bg: 'rgba(51,204,102,0.09)',    border: '#33CC66', text: '#55DD80', glow: 'rgba(51,204,102,0.40)' },
    POST:       { bg: 'rgba(200,80,80,0.07)',     border: '#C85050', text: '#D86060', glow: 'rgba(200,80,80,0.30)' },
    METALLOID:  { bg: 'rgba(60,160,200,0.07)',    border: '#3CA0C8', text: '#50B0D8', glow: 'rgba(60,160,200,0.30)' },
    NONMETAL:   { bg: 'rgba(200,200,220,0.07)',   border: '#C8C8DC', text: '#D8D8EC', glow: 'rgba(200,200,220,0.25)' },
    ACTINIDE:   { bg: 'rgba(140,60,60,0.07)',     border: '#8C3C3C', text: '#A04C4C', glow: 'rgba(140,60,60,0.30)' },
    PNICTOGEN:  { bg: 'rgba(100,200,100,0.09)',   border: '#64C864', text: '#78D878', glow: 'rgba(100,200,100,0.45)' },
    CHALCOGEN:  { bg: 'rgba(255,180,80,0.09)',    border: '#FFB450', text: '#FFC470', glow: 'rgba(255,180,80,0.40)' },
  },
};

const sceneConfig = {
  particles: [
    {
      id: 'trainLight',
      behavior: 'linear',
      render: 'trail',
      spawnRate: [0, 0, 0.14, 0.35, 0.7],
      speed: [3, 8],
      angle: [170, 190],
      size: [0.5, 1.5],
      trailLength: 15,
      color: '#FFD700',
      opacity: 0.83,
      lifetime: [15, 30],
    },
    {
      id: 'stationPing',
      behavior: 'flash',
      render: 'glow',
      spawnRate: [0, 0, 0.09, 0.21, 0.44],
      size: [2, 4],
      glowRadius: 10,
      color: '#4488FF',
      opacity: 0.98,
      lifetime: [12, 25],
      cascade: true,
    },
    {
      id: 'commuter',
      behavior: 'fall',
      render: 'dot',
      spawnRate: [0, 0, 0, 0.06, 0.18],
      speed: [0.5, 1.5],
      size: [1, 2],
      color: '#33CC66',
      opacity: 0.6,
      lifetime: [40, 100],
    },
    {
      id: 'sparkTrail',
      behavior: 'linear',
      render: 'trail',
      spawnRate: [0, 0, 0, 0.05, 0.15],
      speed: [4, 10],
      angle: [160, 200],
      size: [0.3, 1],
      trailLength: 12,
      color: '#FF8833',
      opacity: 0.75,
      lifetime: [8, 18],
    },
    {
      id: 'tunnelDust',
      behavior: 'drift',
      render: 'dot',
      spawnRate: [0, 0, 0.06, 0.15, 0.3],
      speed: [0.1, 0.5],
      size: [0.5, 2],
      color: '#C8C8DC',
      opacity: 0.4,
      lifetime: [60, 150],
    },
    {
      id: 'signalBlink',
      behavior: 'flash',
      render: 'glow',
      spawnRate: [0, 0, 0, 0.04, 0.12],
      size: [1, 3],
      glowRadius: 6,
      color: '#FF3333',
      opacity: 0.9,
      lifetime: [6, 15],
    },
  ],
};

export default createModeTiers('METRO', {
  tierNames: ['Closed', 'Running', 'Rush Hour', 'Express', 'System Map'],
  tierTooltips: [
    'Grey tunnels, no service',
    'Colorful transit lines',
    'Station announcements and crowds',
    'Fast-moving train lights',
    'Full animated transit network',
  ],
  t1: { bgBase: '#080810', accent: '#778899', dotGridColor: 'rgba(119,136,153,0.03)' },
  t2,
  sceneConfig,
  flavorHue: 220,
});

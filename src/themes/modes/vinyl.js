import { createModeTiers } from '../paletteHelpers.js';

// ── VINYL — Record collection / turntable / retro audio ──────
// T1: Mono        — grey with warm tone, silent
// T2: Analog      — warm orange/magenta vinyl warmth
// T3: Side A      — slow sound wave oscillations, faint vinyl crackle sparks
// T4: Groove      — more waves, groove particles orbiting, note drifts
// T5: Live Session — dense waves, frequent crackle, music note shower

const t2 = {
  bgBase: '#0C0806',
  accent: '#FF6633',
  dotGridColor: 'rgba(255,102,51,0.04)',
  cat: {
    ALKALI:     { bg: 'rgba(255,102,51,0.09)',   border: '#FF6633', text: '#FF8855', glow: 'rgba(255,102,51,0.40)' },
    ALKALINE:   { bg: 'rgba(230,120,70,0.08)',    border: '#E67846', text: '#F09566', glow: 'rgba(230,120,70,0.35)' },
    TRANSITION: { bg: 'rgba(220,80,40,0.09)',     border: '#DC5028', text: '#EE7750', glow: 'rgba(220,80,40,0.40)' },
    HALOGEN:    { bg: 'rgba(240,140,90,0.08)',    border: '#F08C5A', text: '#F5A87A', glow: 'rgba(240,140,90,0.35)' },
    NOBLE:      { bg: 'rgba(200,90,55,0.09)',     border: '#C85A37', text: '#E07E5A', glow: 'rgba(200,90,55,0.40)' },
    LANTHANIDE: { bg: 'rgba(245,130,80,0.08)',    border: '#F58250', text: '#F8A070', glow: 'rgba(245,130,80,0.35)' },
    POST:       { bg: 'rgba(160,130,115,0.07)',   border: '#A08273', text: '#BB9E8E', glow: 'rgba(160,130,115,0.25)' },
    METALLOID:  { bg: 'rgba(210,100,60,0.07)',    border: '#D2643C', text: '#E4885E', glow: 'rgba(210,100,60,0.30)' },
    NONMETAL:   { bg: 'rgba(225,200,185,0.07)',   border: '#E1C8B9', text: '#F0DDD0', glow: 'rgba(225,200,185,0.20)' },
    ACTINIDE:   { bg: 'rgba(180,65,30,0.08)',     border: '#B4411E', text: '#D4663E', glow: 'rgba(180,65,30,0.35)' },
    PNICTOGEN:  { bg: 'rgba(235,110,60,0.09)',    border: '#EB6E3C', text: '#F59060', glow: 'rgba(235,110,60,0.40)' },
    CHALCOGEN:  { bg: 'rgba(255,150,100,0.09)',   border: '#FF9664', text: '#FFB488', glow: 'rgba(255,150,100,0.40)' },
  },
};

const sceneConfig = {
  particles: [
    {
      id: 'soundWave',
      behavior: 'wave',
      render: 'arc',
      count: [0, 0, 140, 280, 450],
      size: [20, 50],
      arcAngle: 180,
      color: '#FF8855',
      opacity: [0.4, 0.8],
      speed: [0.5, 1.5],
      lifetime: Infinity,
    },
    {
      id: 'vinylCrackle',
      behavior: 'flash',
      render: 'dot',
      spawnRate: [0, 0, 0.08, 0.23, 0.6],
      size: [0.5, 1.5],
      color: '#FFFFFF',
      opacity: [0.6, 1.0],
      lifetime: [3, 8],
      flashInterval: [20, 60],
    },
    {
      id: 'grooveRing',
      behavior: 'orbit',
      render: 'arc',
      spawnRate: [0, 0, 0, 0.09, 0.21],
      speed: [0.8, 2.0],
      size: [15, 35],
      arcAngle: 60,
      color: '#CC5533',
      opacity: [0.4, 0.8],
      lifetime: [100, 250],
      cascade: true,
    },
    {
      id: 'musicNote',
      behavior: 'fall',
      render: 'shape',
      spawnRate: [0, 0, 0, 0.06, 0.24],
      speed: [0.4, 1.2],
      size: [3, 6],
      color: '#FFAA66',
      opacity: [0.4, 0.8],
      lifetime: [120, 300],
    },
    {
      id: 'bassHit',
      behavior: 'flash',
      render: 'glow',
      spawnRate: [0, 0, 0, 0.04, 0.12],
      size: [6, 14],
      glowRadius: 20,
      color: '#CC3300',
      opacity: [0.5, 1.0],
      lifetime: [5, 12],
      flashInterval: [40, 90],
    },
    {
      id: 'trebleNote',
      behavior: 'rise',
      render: 'dot',
      spawnRate: [0, 0, 0, 0.06, 0.16],
      speed: [0.3, 1.0],
      size: [1, 2.5],
      color: '#FFDD88',
      opacity: [0.4, 0.9],
      lifetime: [80, 200],
    },
    {
      id: 'staticCrackle',
      behavior: 'flash',
      render: 'dot',
      spawnRate: [0, 0, 0.04, 0.1, 0.25],
      size: [0.3, 1.0],
      color: '#FFEECC',
      opacity: [0.5, 1.0],
      lifetime: [2, 5],
      flashInterval: [15, 40],
    },
  ],
};

export default createModeTiers('VINYL', {
  tierNames: ['Mono', 'Analog', 'Side A', 'Groove', 'Live Session'],
  tierTooltips: [
    'Grey with warm tone — silent',
    'Warm orange/magenta vinyl warmth',
    'Slow sound wave oscillations, faint vinyl crackle',
    'More waves, groove particles orbiting, note drifts',
    'Dense waves, frequent crackle, music note shower',
  ],
  t1: { bgBase: '#0B0A09', accent: '#B0A090', dotGridColor: 'rgba(176,160,144,0.03)' },
  t2,
  sceneConfig,
  flavorHue: 15,
});

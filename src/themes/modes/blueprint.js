import { createModeTiers } from '../paletteHelpers.js';

// ── BLUEPRINT — Architectural drafting / technical drawing ──────
// T1: Sketch      — pencil grey on dark paper
// T2: Drafted     — crisp blue-white lines on deep blue
// T3: Annotated   — dimension markers pulse, notes appear
// T4: Under Review — redline marks, revision clouds
// T5: Approved    — full animated construction sequence

const t2 = {
  bgBase: '#060810',
  accent: '#508CFF',
  dotGridColor: 'rgba(80,140,255,0.04)',
  cat: {
    ALKALI:     { bg: 'rgba(80,140,255,0.09)',    border: '#508CFF', text: '#6CA0FF', glow: 'rgba(80,140,255,0.45)' },
    ALKALINE:   { bg: 'rgba(60,120,220,0.09)',    border: '#3C78DC', text: '#5090EC', glow: 'rgba(60,120,220,0.40)' },
    TRANSITION: { bg: 'rgba(100,160,255,0.09)',   border: '#64A0FF', text: '#80B4FF', glow: 'rgba(100,160,255,0.45)' },
    HALOGEN:    { bg: 'rgba(40,100,200,0.09)',    border: '#2864C8', text: '#3878D8', glow: 'rgba(40,100,200,0.40)' },
    NOBLE:      { bg: 'rgba(120,180,255,0.09)',   border: '#78B4FF', text: '#90C8FF', glow: 'rgba(120,180,255,0.45)' },
    LANTHANIDE: { bg: 'rgba(70,130,240,0.09)',    border: '#4682F0', text: '#5A96FF', glow: 'rgba(70,130,240,0.40)' },
    POST:       { bg: 'rgba(50,90,180,0.07)',     border: '#325AB4', text: '#426AC4', glow: 'rgba(50,90,180,0.30)' },
    METALLOID:  { bg: 'rgba(80,150,230,0.07)',    border: '#5096E6', text: '#60A6F0', glow: 'rgba(80,150,230,0.30)' },
    NONMETAL:   { bg: 'rgba(140,190,255,0.07)',   border: '#8CBEFF', text: '#A0CEFF', glow: 'rgba(140,190,255,0.25)' },
    ACTINIDE:   { bg: 'rgba(40,80,160,0.07)',     border: '#2850A0', text: '#3860B0', glow: 'rgba(40,80,160,0.30)' },
    PNICTOGEN:  { bg: 'rgba(90,150,255,0.09)',    border: '#5A96FF', text: '#70AAFF', glow: 'rgba(90,150,255,0.45)' },
    CHALCOGEN:  { bg: 'rgba(110,170,255,0.09)',   border: '#6EAAFF', text: '#84BEFF', glow: 'rgba(110,170,255,0.40)' },
  },
};

const sceneConfig = {
  particles: [
    {
      id: 'dimensionMark',
      behavior: 'flash',
      render: 'dot',
      spawnRate: [0, 0, 0.18, 0.44, 0.88],
      size: [1, 2],
      color: '#508CFF',
      opacity: 0.83,
      lifetime: [20, 50],
    },
    {
      id: 'annotationLine',
      behavior: 'linear',
      render: 'trail',
      spawnRate: [0, 0, 0.09, 0.26, 0.53],
      speed: [1, 3],
      angle: [0, 90],
      size: [0.5, 1],
      trailLength: 8,
      color: '#6CA0FF',
      opacity: 0.6,
      lifetime: [30, 70],
    },
    {
      id: 'redlineMark',
      behavior: 'flash',
      render: 'glow',
      spawnRate: [0, 0, 0, 0.08, 0.26],
      size: [2, 4],
      glowRadius: 8,
      color: '#FF4444',
      opacity: 0.98,
      lifetime: [10, 25],
      cascade: true,
    },
    {
      id: 'gridSnap',
      behavior: 'flash',
      render: 'dot',
      spawnRate: [0, 0, 0.06, 0.15, 0.3],
      size: [0.5, 1.5],
      color: '#80B4FF',
      opacity: 0.6,
      lifetime: [8, 20],
    },
    {
      id: 'measureTick',
      behavior: 'drift',
      render: 'line',
      spawnRate: [0, 0, 0, 0.05, 0.12],
      speed: [0.1, 0.4],
      size: [2, 5],
      color: '#508CFF',
      opacity: 0.45,
      lifetime: [40, 100],
    },
    {
      id: 'eraserDust',
      behavior: 'fall',
      render: 'dot',
      spawnRate: [0, 0, 0, 0.04, 0.1],
      speed: [0.2, 0.8],
      size: [0.5, 1.5],
      color: '#C8C8DC',
      opacity: 0.4,
      lifetime: [30, 80],
    },
  ],
};

export default createModeTiers('BLUEPRINT', {
  tierNames: ['Sketch', 'Drafted', 'Annotated', 'Under Review', 'Approved'],
  tierTooltips: [
    'Pencil grey on dark paper',
    'Crisp blue-white technical lines',
    'Dimension markers and notes',
    'Redline marks and revisions',
    'Full construction animation',
  ],
  t1: { bgBase: '#080808', accent: '#8899AA', dotGridColor: 'rgba(136,153,170,0.03)' },
  t2,
  sceneConfig,
  flavorHue: 220,
});

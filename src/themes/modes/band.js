import { createModeTiers } from '../paletteHelpers.js';

// ── BAND — Rock band / concert / stage performance ───────────
// T1: Soundcheck  — muted near-black
// T2: Stage       — neon magenta/cyan concert lighting
// T3: Opening Act — slow stage light beams, faint confetti
// T4: Headliner   — colored light beams, more confetti, strobe flashes
// T5: Encore      — intense lights, confetti rain, pyrotechnic flashes

const t2 = {
  bgBase: '#08040A',
  accent: '#FF2D78',
  dotGridColor: 'rgba(255,45,120,0.04)',
  cat: {
    ALKALI:     { bg: 'rgba(255,45,120,0.09)',   border: '#FF2D78', text: '#FF6099', glow: 'rgba(255,45,120,0.45)' },
    ALKALINE:   { bg: 'rgba(200,50,200,0.08)',    border: '#C832C8', text: '#DD66DD', glow: 'rgba(200,50,200,0.35)' },
    TRANSITION: { bg: 'rgba(230,30,90,0.09)',     border: '#E61E5A', text: '#F04E7E', glow: 'rgba(230,30,90,0.40)' },
    HALOGEN:    { bg: 'rgba(0,200,230,0.08)',     border: '#00C8E6', text: '#44DDEE', glow: 'rgba(0,200,230,0.35)' },
    NOBLE:      { bg: 'rgba(180,40,255,0.09)',    border: '#B428FF', text: '#CC66FF', glow: 'rgba(180,40,255,0.40)' },
    LANTHANIDE: { bg: 'rgba(255,80,150,0.08)',    border: '#FF5096', text: '#FF80B4', glow: 'rgba(255,80,150,0.35)' },
    POST:       { bg: 'rgba(130,120,140,0.07)',   border: '#82788C', text: '#A098AA', glow: 'rgba(130,120,140,0.25)' },
    METALLOID:  { bg: 'rgba(220,50,160,0.07)',    border: '#DC32A0', text: '#EE66BB', glow: 'rgba(220,50,160,0.30)' },
    NONMETAL:   { bg: 'rgba(220,200,225,0.07)',   border: '#DCC8E1', text: '#EEE0F0', glow: 'rgba(220,200,225,0.20)' },
    ACTINIDE:   { bg: 'rgba(150,20,80,0.08)',     border: '#B42868', text: '#D04888', glow: 'rgba(150,20,80,0.35)' },
    PNICTOGEN:  { bg: 'rgba(240,40,110,0.09)',    border: '#F0286E', text: '#F56090', glow: 'rgba(240,40,110,0.40)' },
    CHALCOGEN:  { bg: 'rgba(50,220,220,0.09)',    border: '#32DCDC', text: '#66EEEE', glow: 'rgba(50,220,220,0.40)' },
  },
};

const sceneConfig = {
  particles: [
    {
      id: 'stageLight',
      behavior: 'linear',
      render: 'glow',
      spawnRate: [0, 0, 0.07, 0.18, 0.44],
      speed: [1.5, 4],
      angle: [260, 280],
      size: [3, 7],
      glowRadius: 18,
      color: '#FF2D78',
      colorVariants: ['#FF2D78', '#00C8E6', '#B428FF', '#FFD700'],
      opacity: [0.4, 1.0],
      lifetime: [60, 150],
    },
    {
      id: 'confetti',
      behavior: 'fall',
      render: 'shape',
      spawnRate: [0, 0, 0.05, 0.21, 0.61],
      speed: [0.5, 1.8],
      size: [2, 5],
      color: '#FFFFFF',
      colorVariants: ['#FF2D78', '#00C8E6', '#FFD700', '#B428FF', '#44FF88'],
      opacity: [0.5, 1.0],
      tumble: true,
      tumbleSpeed: [0.02, 0.08],
      lifetime: [120, 300],
    },
    {
      id: 'strobeFlash',
      behavior: 'flash',
      render: 'glow',
      spawnRate: [0, 0, 0, 0.09, 0.3],
      size: [5, 12],
      glowRadius: 25,
      color: '#FFFFFF',
      opacity: [0.9, 1.0],
      lifetime: [2, 6],
      flashInterval: [30, 80],
    },
    {
      id: 'pyro',
      behavior: 'rise',
      render: 'dot',
      spawnRate: [0, 0, 0, 0, 0.18],
      speed: [3, 8],
      size: [1, 3],
      color: '#FFDD44',
      colorVariants: ['#FFDD44', '#FF6633', '#FFFFFF'],
      opacity: [0.75, 1.0],
      lifetime: [15, 40],
      cascade: true,
    },
    {
      id: 'drumHit',
      behavior: 'flash',
      render: 'glow',
      spawnRate: [0, 0, 0, 0.05, 0.15],
      size: [4, 10],
      glowRadius: 16,
      color: '#FF8844',
      opacity: [0.6, 1.0],
      lifetime: [4, 10],
      flashInterval: [25, 60],
    },
    {
      id: 'guitarRiff',
      behavior: 'wave',
      render: 'trail',
      spawnRate: [0, 0, 0, 0.04, 0.12],
      speed: [1.5, 4],
      size: [0.8, 1.5],
      trailLength: 15,
      color: '#FF2D78',
      colorVariants: ['#FF2D78', '#00C8E6', '#FFD700'],
      opacity: [0.4, 0.9],
      lifetime: [60, 150],
    },
    {
      id: 'crowdWave',
      behavior: 'wave',
      render: 'dot',
      count: [0, 0, 0, 100, 250],
      speed: [0.3, 1.0],
      size: [1, 2.5],
      color: '#FFFFFF',
      colorVariants: ['#FF2D78', '#00C8E6', '#B428FF'],
      opacity: [0.4, 0.8],
      lifetime: Infinity,
    },
  ],
};

export default createModeTiers('BAND', {
  tierNames: ['Soundcheck', 'Stage', 'Opening Act', 'Headliner', 'Encore'],
  tierTooltips: [
    'Muted near-black — silence before the show',
    'Neon magenta/cyan concert lighting',
    'Slow stage light beams, faint confetti',
    'Colored light beams, more confetti, strobe flashes',
    'Intense lights, confetti rain, pyrotechnic flashes',
  ],
  t1: { bgBase: '#090809', accent: '#A898A8', dotGridColor: 'rgba(168,152,168,0.03)' },
  t2,
  sceneConfig,
  flavorHue: 345,
});

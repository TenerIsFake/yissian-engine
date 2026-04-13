import { createModeTiers } from '../paletteHelpers.js';

// ── ARCANE — Arcane / mystical / grimoire ─────────────────────
// T1: Dormant Tome — near-black with faint violet tint
// T2: Grimoire     — deep purple/amethyst/violet palette
// T3: Incantation  — slow-drifting magic dust, faint rune glows
// T4: Ritual       — more dust, orbiting spell fragments, occasional rune flash
// T5: Unleashed    — dense dust, spell circles, frequent rune bursts, rare sigil flash

const t2 = {
  bgBase: '#0A0410',
  accent: '#9B59B6',
  dotGridColor: 'rgba(155,89,182,0.04)',
  cat: {
    ALKALI:     { bg: 'rgba(155,89,182,0.08)',   border: '#9B59B6', text: '#B070D0', glow: 'rgba(155,89,182,0.40)' },
    ALKALINE:   { bg: 'rgba(120,60,180,0.08)',   border: '#783CB4', text: '#9060CC', glow: 'rgba(120,60,180,0.38)' },
    TRANSITION: { bg: 'rgba(100,50,160,0.08)',   border: '#6432A0', text: '#7E4EBB', glow: 'rgba(100,50,160,0.38)' },
    HALOGEN:    { bg: 'rgba(180,100,220,0.08)',  border: '#B464DC', text: '#CC88EE', glow: 'rgba(180,100,220,0.35)' },
    NOBLE:      { bg: 'rgba(75,40,130,0.08)',    border: '#4B2882', text: '#6644AA', glow: 'rgba(75,40,130,0.35)' },
    LANTHANIDE: { bg: 'rgba(160,80,200,0.08)',   border: '#A050C8', text: '#BB70DD', glow: 'rgba(160,80,200,0.35)' },
    POST:       { bg: 'rgba(90,60,120,0.07)',    border: '#5A3C78', text: '#745090', glow: 'rgba(90,60,120,0.25)' },
    METALLOID:  { bg: 'rgba(140,80,180,0.07)',   border: '#8C50B4', text: '#A668CC', glow: 'rgba(140,80,180,0.25)' },
    NONMETAL:   { bg: 'rgba(200,180,220,0.07)',  border: '#C8B4DC', text: '#DDD0EE', glow: 'rgba(200,180,220,0.20)' },
    ACTINIDE:   { bg: 'rgba(80,30,120,0.07)',    border: '#501E78', text: '#6A3898', glow: 'rgba(80,30,120,0.28)' },
    PNICTOGEN:  { bg: 'rgba(130,60,180,0.08)',   border: '#823CB4', text: '#9C58CC', glow: 'rgba(130,60,180,0.38)' },
    CHALCOGEN:  { bg: 'rgba(200,150,240,0.08)',  border: '#C896F0', text: '#DDB8FF', glow: 'rgba(200,150,240,0.35)' },
  },
};

const sceneConfig = {
  particles: [
    {
      id: 'magicDust',
      behavior: 'drift',
      render: 'dot',
      count: [0, 0, 600, 950, 1500],
      size: [1, 3],
      color: '#9B59B6',
      opacity: [0.4, 0.9],
      speed: [0.2, 0.8],
      lifetime: [200, 500],
    },
    {
      id: 'runeGlow',
      behavior: 'twinkle',
      render: 'glow',
      count: [0, 0, 200, 450, 700],
      size: [2, 5],
      glowRadius: 6,
      color: '#CC88EE',
      opacity: [0.4, 0.9],
      twinkleSpeed: [0.006, 0.02],
      lifetime: Infinity,
    },
    {
      id: 'spellCircle',
      behavior: 'orbit',
      render: 'shape',
      spawnRate: [0, 0, 0, 0.06, 0.15],
      size: [3, 6],
      orbitRadius: [30, 60],
      orbitSpeed: [0.008, 0.02],
      color: '#A050C8',
      opacity: 0.75,
      lifetime: [180, 350],
    },
    {
      id: 'runeBurst',
      behavior: 'flash',
      render: 'glow',
      spawnRate: [0, 0, 0, 0.05, 0.18],
      size: [8, 15],
      glowRadius: 12,
      color: '#DDB8FF',
      opacity: 1.0,
      lifetime: [8, 18],
      cascade: true,
    },
    {
      id: 'sigilFlash',
      behavior: 'flash',
      render: 'glow',
      spawnRate: [0, 0, 0, 0, 0.03],
      size: [20, 35],
      glowRadius: 25,
      color: '#FFFFFF',
      opacity: 0.9,
      lifetime: [10, 25],
    },
    {
      id: 'manaOrb',
      behavior: 'orbit',
      render: 'glow',
      spawnRate: [0, 0, 0, 0.04, 0.12],
      size: [3, 7],
      orbitRadius: [20, 50],
      orbitSpeed: [0.012, 0.035],
      glowRadius: 10,
      color: '#7B40E0',
      opacity: 0.825,
      lifetime: [150, 300],
    },
    {
      id: 'spellWeave',
      behavior: 'wave',
      render: 'trail',
      spawnRate: [0, 0, 0, 0.03, 0.1],
      speed: [1, 3],
      size: [0.8, 1.5],
      trailLength: 15,
      color: '#CC88EE',
      opacity: [0.4, 0.8],
      lifetime: [80, 200],
    },
    {
      id: 'voidRipple',
      behavior: 'flash',
      render: 'glow',
      spawnRate: [0, 0, 0, 0.02, 0.08],
      size: [12, 28],
      glowRadius: 20,
      color: '#5520AA',
      opacity: 0.75,
      lifetime: [10, 25],
    },
  ],
};

export default createModeTiers('ARCANE', {
  tierNames: ['Dormant Tome', 'Grimoire', 'Incantation', 'Ritual', 'Unleashed'],
  tierTooltips: [
    'Near-black with warm sepia tint',
    'Warm gold/amber/copper palette',
    'Slow-drifting magic dust and faint rune glows',
    'Orbiting spell fragments with rune flashes',
    'Dense arcane chaos with sigil bursts',
  ],
  t1: { bgBase: '#0A080C', accent: '#6A5880', dotGridColor: 'rgba(106,88,128,0.03)' },
  t2,
  sceneConfig,
  flavorHue: 270,
});

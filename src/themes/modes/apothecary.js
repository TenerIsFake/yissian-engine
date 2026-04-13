import { createModeTiers } from '../paletteHelpers.js';

// ── APOTHECARY — Medieval pharmacy / potion brewing ─────────────
// T1: Closed      — dusty, muted herb tones
// T2: Open        — warm amber/green apothecary palette
// T3: Brewing     — steam wisps, bubbling sounds
// T4: Volatile    — potion colors shifting, vapors rising
// T5: Masterwork  — full cauldron eruption, ingredient sparks

const t2 = {
  bgBase: '#0A0806',
  accent: '#8B6B2F',
  dotGridColor: 'rgba(139,107,47,0.04)',
  cat: {
    ALKALI:     { bg: 'rgba(139,107,47,0.09)',    border: '#8B6B2F', text: '#A07B3F', glow: 'rgba(139,107,47,0.45)' },
    ALKALINE:   { bg: 'rgba(80,130,60,0.09)',     border: '#50823C', text: '#60924C', glow: 'rgba(80,130,60,0.40)' },
    TRANSITION: { bg: 'rgba(160,100,40,0.09)',    border: '#A06428', text: '#B07438', glow: 'rgba(160,100,40,0.45)' },
    HALOGEN:    { bg: 'rgba(100,160,80,0.09)',    border: '#64A050', text: '#74B060', glow: 'rgba(100,160,80,0.40)' },
    NOBLE:      { bg: 'rgba(120,80,140,0.09)',    border: '#78508C', text: '#886098', glow: 'rgba(120,80,140,0.45)' },
    LANTHANIDE: { bg: 'rgba(180,130,50,0.09)',    border: '#B48232', text: '#C49242', glow: 'rgba(180,130,50,0.40)' },
    POST:       { bg: 'rgba(90,70,40,0.07)',      border: '#5A4628', text: '#6A5638', glow: 'rgba(90,70,40,0.30)' },
    METALLOID:  { bg: 'rgba(60,110,50,0.07)',     border: '#3C6E32', text: '#4C7E42', glow: 'rgba(60,110,50,0.30)' },
    NONMETAL:   { bg: 'rgba(180,160,120,0.07)',   border: '#B4A078', text: '#C4B090', glow: 'rgba(180,160,120,0.25)' },
    ACTINIDE:   { bg: 'rgba(100,60,30,0.07)',     border: '#643C1E', text: '#784C2E', glow: 'rgba(100,60,30,0.30)' },
    PNICTOGEN:  { bg: 'rgba(140,110,40,0.09)',    border: '#8C6E28', text: '#9C7E38', glow: 'rgba(140,110,40,0.45)' },
    CHALCOGEN:  { bg: 'rgba(70,150,70,0.09)',     border: '#469646', text: '#56A656', glow: 'rgba(70,150,70,0.40)' },
  },
};

const sceneConfig = {
  particles: [
    {
      id: 'brewSteam',
      behavior: 'rise',
      render: 'glow',
      spawnRate: [0, 0, 0.18, 0.53, 1.0],
      speed: [0.2, 0.8],
      size: [2, 4],
      glowRadius: 8,
      color: 'rgba(180,160,120,0.25)',
      opacity: 0.525,
      lifetime: [60, 150],
      driftFreq: 0.02,
      driftAmplitude: 25,
    },
    {
      id: 'ingredientSpark',
      behavior: 'flash',
      render: 'dot',
      spawnRate: [0, 0, 0.07, 0.18, 0.44],
      size: [1, 3],
      color: '#8B6B2F',
      opacity: 1.0,
      lifetime: [10, 30],
      cascade: true,
    },
    {
      id: 'potionDrip',
      behavior: 'fall',
      render: 'dot',
      spawnRate: [0, 0, 0, 0.09, 0.21],
      speed: [0.5, 1.5],
      size: [1, 2],
      color: '#50823C',
      opacity: 0.75,
      lifetime: [40, 100],
    },
    {
      id: 'herbDust',
      behavior: 'fall',
      render: 'dot',
      spawnRate: [0, 0, 0, 0.06, 0.15],
      speed: [0.2, 0.6],
      size: [1, 2],
      color: '#A09060',
      opacity: 0.45,
      lifetime: [50, 130],
      driftFreq: 0.025,
      driftAmplitude: 20,
    },
    {
      id: 'elixirBubble',
      behavior: 'rise',
      render: 'glow',
      spawnRate: [0, 0, 0, 0.05, 0.14],
      speed: [0.3, 0.9],
      size: [2, 4],
      glowRadius: 6,
      color: '#60C050',
      opacity: 0.6,
      lifetime: [30, 80],
      cascade: true,
    },
    {
      id: 'mortarSpark',
      behavior: 'flash',
      render: 'glow',
      spawnRate: [0, 0, 0, 0.04, 0.12],
      size: [1, 3],
      glowRadius: 8,
      color: '#D4A040',
      opacity: 0.975,
      lifetime: [6, 15],
    },
  ],
};

export default createModeTiers('APOTHECARY', {
  tierNames: ['Closed', 'Open', 'Brewing', 'Volatile', 'Masterwork'],
  tierTooltips: [
    'Dusty muted herb tones',
    'Warm amber and green palette',
    'Steam wisps and bubbling',
    'Potion colors shifting',
    'Full cauldron eruption',
  ],
  t1: { bgBase: '#090806', accent: '#887766', dotGridColor: 'rgba(136,119,102,0.03)' },
  t2,
  sceneConfig,
  flavorHue: 75,
});

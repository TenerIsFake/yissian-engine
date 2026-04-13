import { createModeTiers } from '../paletteHelpers.js';

// ── CHEM — Chemistry Lab / periodic table ─────────────────────
// T1: Bleached    — washed-out grey, lab fluorescent feel
// T2: Lab         — original multi-hue CHEM_LAB palette (cyan accent)
// T3: Reaction    — bubbling: slow rising circles
// T4: Volatile    — more bubbles, vapor wisps rising
// T5: Meltdown    — rapid bubbles, vapor, occasional bright flashes

const t2 = {
  bgBase: '#0F1117',
  accent: '#06B6D4',
  dotGridColor: 'rgba(255,255,255,0.035)',
  cat: {
    ALKALI:     { bg: 'rgba(255,107,107,0.08)', border: '#FF6B6B', text: '#FF8E8E', glow: 'rgba(255,107,107,0.35)' },
    ALKALINE:   { bg: 'rgba(254,202,87,0.08)',  border: '#FECA57', text: '#FFD93D', glow: 'rgba(254,202,87,0.35)'  },
    TRANSITION: { bg: 'rgba(72,219,251,0.08)',  border: '#48DBFB', text: '#54D5F0', glow: 'rgba(72,219,251,0.35)'  },
    HALOGEN:    { bg: 'rgba(255,159,243,0.08)', border: '#FF9FF3', text: '#F368E0', glow: 'rgba(255,159,243,0.35)' },
    NOBLE:      { bg: 'rgba(162,155,254,0.08)', border: '#A29BFE', text: '#8C7FFF', glow: 'rgba(162,155,254,0.35)' },
    LANTHANIDE: { bg: 'rgba(85,239,196,0.08)',  border: '#55EFC4', text: '#00D2A3', glow: 'rgba(85,239,196,0.35)'  },
    POST:       { bg: 'rgba(178,190,195,0.06)', border: '#B2BEC3', text: '#A0AAB0', glow: 'rgba(178,190,195,0.25)' },
    METALLOID:  { bg: 'rgba(116,185,255,0.06)', border: '#74B9FF', text: '#5EA7EE', glow: 'rgba(116,185,255,0.25)' },
    NONMETAL:   { bg: 'rgba(129,236,236,0.06)', border: '#81ECEC', text: '#55EFC4', glow: 'rgba(129,236,236,0.25)' },
    ACTINIDE:   { bg: 'rgba(255,234,167,0.06)', border: '#FFEAA7', text: '#FDCB6E', glow: 'rgba(255,234,167,0.25)' },
    PNICTOGEN:  { bg: 'rgba(253,150,68,0.08)',  border: '#FD9644', text: '#FA8231', glow: 'rgba(253,150,68,0.35)'  },
    CHALCOGEN:  { bg: 'rgba(196,229,56,0.08)',  border: '#C4E538', text: '#A3CB38', glow: 'rgba(196,229,56,0.35)'  },
  },
};

const sceneConfig = {
  particles: [
    {
      id: 'bubble',
      behavior: 'rise',
      render: 'dot',
      count: [0, 0, 550, 900, 1400],
      size: [2, 6],
      color: '#06B6D4',
      opacity: [0.4, 0.8],
      speed: [0.3, 1.0],
      wobble: true,
      wobbleAmount: 1.5,
      lifetime: [200, 400],
    },
    {
      id: 'vapor',
      behavior: 'rise',
      render: 'glow',
      count: [0, 0, 0, 250, 550],
      size: [8, 20],
      color: '#FFFFFF',
      opacity: [0.4, 0.8],
      speed: [0.1, 0.4],
      lifetime: [300, 600],
    },
    {
      id: 'reactionFlash',
      behavior: 'flash',
      render: 'glow',
      spawnRate: [0, 0, 0, 0, 0.25],
      size: [15, 30],
      glowRadius: 20,
      color: '#FECA57',
      opacity: 1.0,
      lifetime: [8, 20],
      cascade: true,
    },
    {
      id: 'labSteam',
      behavior: 'rise',
      render: 'glow',
      count: [0, 0, 0, 100, 250],
      size: [10, 25],
      color: '#E0F0FF',
      opacity: [0.4, 0.8],
      speed: [0.08, 0.3],
      lifetime: [250, 500],
    },
    {
      id: 'catalystSpark',
      behavior: 'flash',
      render: 'glow',
      spawnRate: [0, 0, 0, 0.05, 0.18],
      size: [4, 10],
      glowRadius: 8,
      color: '#FFE066',
      opacity: 1.0,
      lifetime: [5, 12],
      cascade: true,
    },
    {
      id: 'precipitate',
      behavior: 'fall',
      render: 'dot',
      count: [0, 0, 0, 150, 350],
      size: [0.8, 2],
      color: '#A0D8E8',
      opacity: [0.4, 0.8],
      speed: [0.2, 0.7],
      lifetime: [150, 350],
    },
  ],
};

export default createModeTiers('CHEM', {
  tierNames: ['Bleached', 'Lab', 'Reaction', 'Volatile', 'Meltdown'],
  tierTooltips: [
    'Washed-out grey — lab fluorescent feel',
    'Original multi-hue chemistry palette',
    'Slow bubbling reactions',
    'More bubbles with rising vapor wisps',
    'Rapid bubbles, vapor, and bright flashes',
  ],
  t1: { bgBase: '#0C0C0E', accent: '#A0A0A8', dotGridColor: 'rgba(160,160,168,0.03)' },
  t2,
  sceneConfig,
  flavorHue: 187,
});

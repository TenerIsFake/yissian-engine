import { createModeTiers } from '../paletteHelpers.js';

// ── SCHLENK — Wet chemistry / Schlenk-line ──────────────────────
// T1: Schematic    — line-art borosilicate, no color, static
// T2: Canonical    — full ABC blend (A structural, B warm, C gas-coded cat palette)
// T3: Bubbling     — argon bubbles rise from reactive categories
// T4: Reflux       — bubbles + warm oil droplets + pale vapor (capped for Phase 1)
// T5: Bumping      — bubbles + droplets + occasional plasma-discharge flashes

// A — Borosilicate structural anchors
const A_ACCENT = '#4FB8D4';
const A_BG     = '#08101A';
const A_GLASS  = '#C0D4DB';
// B — Vacuum Oil warm tones
const B_ACCENT = '#D4A04F';
const B_DEEP   = '#8B6B2F';
// C — Gas-coded palette (per-category)
const C_AR = '#B47FE8';
const C_N2 = '#5FD4A8';
const C_H2 = '#E8789A';
const C_O2 = '#FFB866';

const t2 = {
  bgBase: A_BG,
  accent: A_ACCENT,
  dotGridColor: 'rgba(79,184,212,0.04)',
  cat: {
    // Each category tinted by its characteristic gas (C palette) on A structural base
    ALKALI:     { bg: 'rgba(232,120,154,0.08)', border: C_H2,     text: '#F59AB5', glow: 'rgba(232,120,154,0.35)' },
    ALKALINE:   { bg: 'rgba(95,212,168,0.08)',  border: C_N2,     text: '#7BE0B8', glow: 'rgba(95,212,168,0.30)' },
    TRANSITION: { bg: 'rgba(180,127,232,0.08)', border: C_AR,     text: '#C89FF0', glow: 'rgba(180,127,232,0.35)' },
    HALOGEN:    { bg: 'rgba(255,184,102,0.08)', border: C_O2,     text: '#FFC88B', glow: 'rgba(255,184,102,0.35)' },
    NOBLE:      { bg: 'rgba(79,184,212,0.08)',  border: A_ACCENT, text: '#7ACDE0', glow: 'rgba(79,184,212,0.35)' },
    LANTHANIDE: { bg: 'rgba(180,127,232,0.10)', border: C_AR,     text: '#C89FF0', glow: 'rgba(180,127,232,0.40)' },
    POST:       { bg: 'rgba(212,160,79,0.08)',  border: B_ACCENT, text: '#E8B870', glow: 'rgba(212,160,79,0.30)' },
    METALLOID:  { bg: 'rgba(122,155,174,0.08)', border: '#7A9BAE', text: '#94B8C4', glow: 'rgba(122,155,174,0.28)' },
    NONMETAL:   { bg: 'rgba(192,212,219,0.08)', border: A_GLASS,  text: '#D4E2E8', glow: 'rgba(192,212,219,0.28)' },
    ACTINIDE:   { bg: 'rgba(212,160,79,0.10)',  border: B_ACCENT, text: '#E8B870', glow: 'rgba(212,160,79,0.38)' },
    PNICTOGEN:  { bg: 'rgba(95,212,168,0.10)',  border: C_N2,     text: '#7BE0B8', glow: 'rgba(95,212,168,0.32)' },
    CHALCOGEN:  { bg: 'rgba(255,184,102,0.10)', border: C_O2,     text: '#FFC88B', glow: 'rgba(255,184,102,0.38)' },
  },
};

// Scene config — escalating argon chemistry at T3+
const sceneConfig = {
  particles: [
    {
      id: 'argonBubble',
      behavior: 'rise',
      render: 'dot',
      count: [0, 0, 450, 750, 1100],
      size: [2, 5],
      color: C_AR,
      opacity: [0.4, 0.8],
      speed: [0.3, 0.9],
      wobble: true,
      wobbleAmount: 1.2,
      lifetime: [220, 420],
    },
    {
      id: 'oilDroplet',
      behavior: 'fall',
      render: 'dot',
      count: [0, 0, 0, 160, 320],
      size: [1.5, 3],
      color: B_ACCENT,
      opacity: [0.4, 0.85],
      speed: [0.3, 0.8],
      lifetime: [180, 360],
    },
    {
      id: 'vaporMist',
      behavior: 'rise',
      render: 'glow',
      count: [0, 0, 0, 110, 240],
      size: [9, 20],
      color: A_GLASS,
      opacity: [0.3, 0.65],
      speed: [0.08, 0.28],
      lifetime: [280, 520],
    },
    {
      id: 'plasmaFlash',
      behavior: 'flash',
      render: 'glow',
      spawnRate: [0, 0, 0, 0, 0.18],
      size: [16, 32],
      glowRadius: 22,
      color: C_AR,
      opacity: 1.0,
      lifetime: [8, 18],
      cascade: true,
    },
    {
      id: '_megaPrimary',
      behavior: 'ripple',
      render: 'ring',
      count: [0, 0, 3, 7, 12],
      size: [1, 2],
      color: 'accent',
      opacity: [0.4, 0.85],
      speed: [0.4, 0.9],
      lifetime: [140, 260],
    },
    {
      id: '_megaSecondary',
      behavior: 'scatter',
      render: 'glow',
      spawnRate: [0, 0, 0.04, 0.11, 0.20],
      size: [1.5, 3.5],
      color: 'accent',
      opacity: [0.5, 1],
      speed: [1.4, 3.0],
      glowRadius: 10,
      lifetime: [40, 90],
      cascade: true,
    },
  ],
};

export default createModeTiers('SCHLENK', {
  tierNames: ['Schematic', 'Canonical', 'Bubbling', 'Reflux', 'Bumping'],
  tierTooltips: [
    'Line-art schematic on near-black — no color, no motion',
    'Full ABC-blend palette — borosilicate frames, gas-coded cards, brass accents',
    'Argon bubbles rise from reactive categories',
    'Bubbles + oil droplets + pale vapor drift',
    'Full chemistry with occasional plasma-discharge flashes',
  ],
  t1: { bgBase: '#08080C', accent: '#6A8895', dotGridColor: 'rgba(106,136,149,0.03)' },
  t2,
  sceneConfig,
  flavorHue: 195, // borosilicate cyan
});

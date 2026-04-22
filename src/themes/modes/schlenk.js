import { createModeTiers } from '../paletteHelpers.js';
import { COMPOUND_CATEGORIES } from '../../dashboards/schlenk/compoundCategories.js';

// ── SCHLENK — Wet chemistry / Schlenk-line ──────────────────────
// T1: Schematic    — line-art borosilicate, no color, static
// T2: Canonical    — compound-colored category palette (CuSO₄ azure, I₂ violet, etc.)
// T3: Bubbling     — Sprint 5 adds per-card CSS bubble-train animation
// T4: Reflux       — Sprint 5 adds per-card CSS reflux + mantle glow
// T5: Bumping      — Sprint 5 adds per-card CSS exotherm + crack

// A-palette structural anchors (Borosilicate)
const A_BG     = '#08101A';
const A_ACCENT = '#4FB8D4';

const t2 = {
  bgBase: A_BG,
  accent: A_ACCENT,
  dotGridColor: 'rgba(79,184,212,0.04)',
  cat: COMPOUND_CATEGORIES,
};

// Sprint 5 adds per-card CSS tier animations. For now, no global particle scene —
// the existing CHEM-shared AnimatedBackground will render the dot-grid and theme bg.
const sceneConfig = {
  particles: [],
};

export default createModeTiers('SCHLENK', {
  tierNames: ['Schematic', 'Canonical', 'Bubbling', 'Reflux', 'Bumping'],
  tierTooltips: [
    'Line-art schematic on near-black — no color, no motion',
    'Full compound-color palette — CuSO₄ azure, I₂ violet, uranyl fluor, real lab pigments',
    'Per-card argon bubble trains (Sprint 5)',
    'Per-card reflux + heating-mantle glow (Sprint 5)',
    'Per-card exotherm + flask crack + spray (Sprint 5)',
  ],
  t1: { bgBase: '#08080C', accent: '#6A8895', dotGridColor: 'rgba(106,136,149,0.03)' },
  t2,
  sceneConfig,
  flavorHue: 195, // borosilicate cyan
});

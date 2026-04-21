// ─────────────────────────────────────────────────────────────────
// THEME CONFIG — NH-42 Animated Theme Tier System
//
// 85 themes total: 17 modes × 5 tiers each
// Tier 1: Bare-bones (no animation, desaturated)
// Tier 2: Static rich (full color, no animation)
// Tier 3: Subtle ambient animation
// Tier 4: Moderate animation
// Tier 5: Dramatic full scene
//
// Each mode file in ./modes/ exports 5 theme entries via createModeTiers()
// ─────────────────────────────────────────────────────────────────

// ── Mode theme imports ─────────────────────────────────────────
import chemThemes from './modes/chem.js';
import spaceThemes from './modes/space.js';
import neuralThemes from './modes/neural.js';
import arcaneThemes from './modes/arcane.js';
import bioThemes from './modes/bio.js';
import moleculeThemes from './modes/molecule.js';
import planetThemes from './modes/planet.js';
import weatherThemes from './modes/weather.js';
import airportThemes from './modes/airport.js';
import dinoThemes from './modes/dino.js';
import noirThemes from './modes/noir.js';
import vinylThemes from './modes/vinyl.js';
import bandThemes from './modes/band.js';
import particleThemes from './modes/particle.js';
import globeThemes from './modes/globe.js';
import forgeThemes from './modes/forge.js';
import oceanThemes from './modes/ocean.js';
import tacticalThemes from './modes/tactical.js';
import steamThemes from './modes/steam.js';
import arcadeThemes from './modes/arcade.js';
import blueprintThemes from './modes/blueprint.js';
import apothecaryThemes from './modes/apothecary.js';
import funhouseThemes from './modes/funhouse.js';
import metroThemes from './modes/metro.js';
import safariThemes from './modes/safari.js';
import heistThemes from './modes/heist.js';
import aquariumThemes from './modes/aquarium.js';
import gardenThemes from './modes/garden.js';
import brewThemes from './modes/brew.js';
import libraryThemes from './modes/library.js';
import schlenkThemes from './modes/schlenk.js';

// ── Scene configs (for AnimatedBackground) ─────────────────────
// Extracted from mode files for direct lookup by mode ID
const SCENE_CONFIGS = {};
const ALL_MODE_THEMES = [
  chemThemes, spaceThemes, neuralThemes, arcaneThemes, bioThemes,
  moleculeThemes, planetThemes, weatherThemes, airportThemes, dinoThemes,
  noirThemes, vinylThemes, bandThemes, particleThemes, globeThemes,
  forgeThemes, oceanThemes,
  tacticalThemes, steamThemes, arcadeThemes,
  blueprintThemes, apothecaryThemes, funhouseThemes,
  metroThemes, safariThemes,
  heistThemes, aquariumThemes, gardenThemes, brewThemes, libraryThemes,
  schlenkThemes,
];

// ── Build unified THEMES object ────────────────────────────────
export const THEMES = {};

for (const modeThemes of ALL_MODE_THEMES) {
  for (const [id, theme] of Object.entries(modeThemes)) {
    THEMES[id] = theme;
    // Extract scene configs from animated tiers
    if (theme.animation?.scene && !SCENE_CONFIGS[theme.animation.scene]) {
      // We'll populate scene configs from mode files below
    }
  }
}

// ── Category labels (theme-invariant) ──────────────────────────
export const CATEGORY_LABELS = {
  ALKALI:     'Alkali Metal',
  ALKALINE:   'Alkaline Earth',
  TRANSITION: 'Transition Metal',
  HALOGEN:    'Halogen',
  NOBLE:      'Noble Gas',
  LANTHANIDE: 'Lanthanide',
  POST:       'Post-Transition',
  METALLOID:  'Metalloid',
  NONMETAL:   'Nonmetal',
  ACTINIDE:   'Actinide',
  PNICTOGEN:  'Pnictogen',
  CHALCOGEN:  'Chalcogen',
};

// ── Theme ID list ──────────────────────────────────────────────
export const THEME_IDS = Object.keys(THEMES);

// ── Default theme ──────────────────────────────────────────────
export const DEFAULT_THEME = 'CHEM_T2';

// ── Per-mode theme list (5 tiers each) ─────────────────────────
const MODES = [
  'CHEM', 'SPACE', 'NEURAL', 'ARCANE', 'BIO', 'MOLECULE', 'PLANET',
  'WEATHER', 'AIRPORT', 'DINO', 'NOIR', 'VINYL', 'BAND', 'PARTICLE',
  'GLOBE', 'FORGE', 'OCEAN', 'TACTICAL', 'STEAM', 'ARCADE',
  'BLUEPRINT', 'APOTHECARY', 'FUNHOUSE', 'METRO', 'SAFARI',
  'HEIST', 'AQUARIUM', 'GARDEN', 'BREW', 'LIBRARY', 'SCHLENK',
];

export const MODE_THEMES = {};
for (const mode of MODES) {
  MODE_THEMES[mode] = [
    `${mode}_T1`, `${mode}_T2`, `${mode}_T3`, `${mode}_T4`, `${mode}_T5`,
  ];
}

// ── Default theme per mode (always T2) ─────────────────────────
export const MODE_DEFAULT_THEME = {};
for (const mode of MODES) {
  MODE_DEFAULT_THEME[mode] = `${mode}_T2`;
}

// ── Scene config lookup for AnimatedBackground ─────────────────
const _sceneCache = {};
for (const [id, theme] of Object.entries(THEMES)) {
  if (theme.animation?.scene && theme._sceneConfig) {
    _sceneCache[theme.animation.scene] = theme._sceneConfig;
  }
}

/** Returns the particle scene config for a mode, used by AnimatedBackground */
export function getSceneConfig(modeId) {
  return _sceneCache[modeId] || null;
}

// ── Legacy theme migration ─────────────────────────────────────
import { migrateLegacyTheme } from './paletteHelpers.js';

/**
 * Resolve a theme ID — handles legacy IDs from pre-NH-42 localStorage.
 * Returns a valid new-system theme ID.
 */
export function resolveThemeId(storedId, currentMode = 'CHEM') {
  if (THEME_IDS.includes(storedId)) return storedId;
  return migrateLegacyTheme(storedId, currentMode);
}

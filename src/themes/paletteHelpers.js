// ─────────────────────────────────────────────────────────────────
// Palette Helpers — color utilities + tier derivation for NH-42
// ─────────────────────────────────────────────────────────────────

// ── Hex ↔ HSL conversion ───────────────────────────────────────

export function hexToHSL(hex) {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0;
  const l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
    else if (max === g) h = ((b - r) / d + 2) / 6;
    else h = ((r - g) / d + 4) / 6;
  }
  return [Math.round(h * 360), Math.round(s * 100), Math.round(l * 100)];
}

function hue2rgb(p, q, t) {
  if (t < 0) t += 1;
  if (t > 1) t -= 1;
  if (t < 1 / 6) return p + (q - p) * 6 * t;
  if (t < 1 / 2) return q;
  if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
  return p;
}

export function hslToHex(h, s, l) {
  h /= 360; s /= 100; l /= 100;
  let r, g, b;
  if (s === 0) { r = g = b = l; }
  else {
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }
  const toHex = (v) => Math.round(v * 255).toString(16).padStart(2, '0');
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`.toUpperCase();
}

// ── RGBA string utilities ──────────────────────────────────────

function parseRgba(rgba) {
  const m = rgba.match(/rgba?\((\d+),\s*(\d+),\s*(\d+),?\s*([\d.]+)?\)/);
  if (!m) return { r: 0, g: 0, b: 0, a: 0 };
  return { r: +m[1], g: +m[2], b: +m[3], a: m[4] !== undefined ? +m[4] : 1 };
}

function rgbaStr(r, g, b, a) {
  return `rgba(${Math.round(r)},${Math.round(g)},${Math.round(b)},${a})`;
}

function rgbToHsl(r, g, b) {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0;
  const l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
    else if (max === g) h = ((b - r) / d + 2) / 6;
    else h = ((r - g) / d + 4) / 6;
  }
  return [h * 360, s * 100, l * 100];
}

function hslToRgb(h, s, l) {
  h /= 360; s /= 100; l /= 100;
  let r, g, b;
  if (s === 0) { r = g = b = l; }
  else {
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }
  return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
}

// ── Desaturation (for T1 bare-bones) ──────────────────────────

/** Desaturate a hex color. flavorHue shifts the grey toward a mode color. */
export function desaturateHex(hex, satTarget = 8, flavorHue = null) {
  const [h, , l] = hexToHSL(hex);
  return hslToHex(flavorHue ?? h, satTarget, l);
}

/** Desaturate an rgba() string */
function desaturateRgba(rgba, satTarget = 8, flavorHue = null) {
  const { r, g, b, a } = parseRgba(rgba);
  const [h, , l] = rgbToHsl(r, g, b);
  const [nr, ng, nb] = hslToRgb(flavorHue ?? h, satTarget, l);
  return rgbaStr(nr, ng, nb, a);
}

/** Desaturate an entire cat palette. Returns a low-saturation palette with optional hue flavor. */
export function desaturatePalette(cat, flavorHue = null, satTarget = 8) {
  const result = {};
  for (const [key, val] of Object.entries(cat)) {
    result[key] = {
      bg:     desaturateRgba(val.bg, satTarget, flavorHue),
      border: desaturateHex(val.border, satTarget, flavorHue),
      text:   desaturateHex(val.text, satTarget + 4, flavorHue), // slightly more sat for readability
      glow:   'rgba(0,0,0,0)', // T1 = no glow
    };
  }
  return result;
}

// ── Intensification (for T5 dramatic) ─────────────────────────

/** Boost saturation + glow intensity of a hex color */
export function intensifyHex(hex, satBoost = 15) {
  const [h, s, l] = hexToHSL(hex);
  return hslToHex(h, Math.min(100, s + satBoost), l);
}

/** Boost glow alpha in an rgba() glow value */
function intensifyGlow(rgba, boost = 0.15) {
  const { r, g, b, a } = parseRgba(rgba);
  return rgbaStr(r, g, b, Math.min(1, a + boost));
}

/** Intensify an entire cat palette — more saturated, brighter glows. */
export function intensifyPalette(cat) {
  const result = {};
  for (const [key, val] of Object.entries(cat)) {
    result[key] = {
      bg:     val.bg, // keep bg opacity the same
      border: intensifyHex(val.border),
      text:   intensifyHex(val.text, 10),
      glow:   intensifyGlow(val.glow),
    };
  }
  return result;
}

// ── Tier factory ──────────────────────────────────────────────

/**
 * createModeTiers — generates 5 theme entries for a mode.
 *
 * @param {string} modeId — e.g. 'SPACE'
 * @param {object} config
 *   .tierNames   — [T1 name, T2 name, T3 name, T4 name, T5 name]
 *   .tierTooltips — [T1 tooltip, ...]
 *   .t1 — { bgBase, accent, dotGridColor } — T1 overrides (colors derived from t2 if omitted)
 *   .t2 — full theme definition (the base creative palette)
 *   .t5Overrides — optional partial cat palette overrides for T5
 *   .sceneConfig — particle scene config (used by AnimatedBackground)
 *   .flavorHue — hue for T1 desaturation (defaults to t2 accent hue)
 * @returns {object} — { SPACE_T1: {...}, SPACE_T2: {...}, ... }
 */
export function createModeTiers(modeId, config) {
  const { tierNames, tierTooltips, t2, sceneConfig, flavorHue } = config;

  // Derive T1 from T2 via desaturation
  const accentHsl = hexToHSL(t2.accent);
  const fHue = flavorHue ?? accentHsl[0];
  const t1BgBase = config.t1?.bgBase ?? '#0A0A0A';
  const t1Accent = config.t1?.accent ?? desaturateHex(t2.accent, 15, fHue);
  const t1DotGrid = config.t1?.dotGridColor ?? `rgba(128,128,128,0.03)`;
  const t1Cat = desaturatePalette(t2.cat, fHue);

  // Derive T5 from T2 via intensification
  const t5Cat = config.t5Overrides
    ? { ...intensifyPalette(t2.cat), ...config.t5Overrides }
    : intensifyPalette(t2.cat);

  const base = (tier, name, tooltip, overrides = {}) => ({
    id: `${modeId}_T${tier}`,
    name,
    mode: modeId,
    tier,
    tooltip: tooltip || name,
    ...overrides,
  });

  return {
    [`${modeId}_T1`]: base(1, tierNames[0], tierTooltips?.[0], {
      bgBase: t1BgBase,
      accent: t1Accent,
      dotGridColor: t1DotGrid,
      features: { lowPower: true, animatedBg: false },
      cat: t1Cat,
      animation: null,
    }),
    [`${modeId}_T2`]: base(2, tierNames[1], tierTooltips?.[1], {
      bgBase: t2.bgBase,
      accent: t2.accent,
      dotGridColor: t2.dotGridColor,
      features: { lowPower: false, animatedBg: false },
      cat: t2.cat,
      animation: null,
    }),
    [`${modeId}_T3`]: base(3, tierNames[2], tierTooltips?.[2], {
      bgBase: t2.bgBase,
      accent: t2.accent,
      dotGridColor: t2.dotGridColor,
      features: { lowPower: false, animatedBg: true },
      cat: t2.cat,
      animation: { scene: modeId, tier: 3 },
      _sceneConfig: sceneConfig,
    }),
    [`${modeId}_T4`]: base(4, tierNames[3], tierTooltips?.[3], {
      bgBase: t2.bgBase,
      accent: t2.accent,
      dotGridColor: t2.dotGridColor,
      features: { lowPower: false, animatedBg: true },
      cat: t2.cat,
      animation: { scene: modeId, tier: 4 },
      _sceneConfig: sceneConfig,
    }),
    [`${modeId}_T5`]: base(5, tierNames[4], tierTooltips?.[4], {
      bgBase: t2.bgBase,
      accent: intensifyHex(t2.accent, 10),
      dotGridColor: t2.dotGridColor,
      features: { lowPower: false, animatedBg: true },
      cat: t5Cat,
      animation: { scene: modeId, tier: 5 },
      _sceneConfig: sceneConfig,
    }),
  };
}

// ── Old theme ID migration ────────────────────────────────────

const LEGACY_THEME_MAP = {
  CHEM_LAB:        'CHEM_T2',
  RADIOACTIVE:     'MOLECULE_T2',
  PLASMA:          'VINYL_T2',
  SYNTHWAVE:       'BAND_T2',
  DEEP_OCEAN:      'OCEAN_T2',
  AMBER_TERMINAL:  'DINO_T2',
  NEON_TOKYO:      'NEURAL_T2',
  CANDLELIGHT:     'ARCANE_T2',
  PHOSPHOR_CELL:   'BIO_T2',
  MOBILE_MONO:     null, // → current mode T1
  LOW_POWER:       null, // → current mode T1
  FORGE_FIRE:      'FORGE_T2',
  ABYSSAL:         'OCEAN_T2',
  ACTIVE_GRID:     null, // → current mode T5
};

/**
 * Migrate a legacy theme ID to the new tier system.
 * Returns the new theme ID, or null if mode-dependent fallback is needed.
 */
export function migrateLegacyTheme(oldId, currentMode) {
  if (oldId in LEGACY_THEME_MAP) {
    const mapped = LEGACY_THEME_MAP[oldId];
    if (mapped) return mapped;
    // Mode-dependent: MOBILE_MONO → T1, ACTIVE_GRID → T5
    if (oldId === 'MOBILE_MONO' || oldId === 'LOW_POWER') return `${currentMode}_T1`;
    if (oldId === 'ACTIVE_GRID') return `${currentMode}_T5`;
  }
  return `${currentMode}_T2`; // ultimate fallback
}

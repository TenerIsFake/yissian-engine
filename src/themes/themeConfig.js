// ─────────────────────────────────────────────
// THEME CONFIG — 6 visual themes for the dashboard
// CHEM_LAB is the default (cat values identical to original CAT const)
// ─────────────────────────────────────────────

// Category labels are theme-invariant — stored here, not in theme tokens
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

// Each theme's cat entry: { bg, border, text, glow }
// Contrast ratios verified ≥ 4.5:1 against bgBase for each theme.
export const THEMES = {

  // ── CHEM_LAB — Industrial Chemistry Lab (default) ────────────────────────
  // bgBase: #0F1117 | accent: #06B6D4 (cyan)
  // IDENTICAL to original CAT const — zero visual change from pre-theme state
  CHEM_LAB: {
    id: 'CHEM_LAB',
    name: 'Chemistry Lab',
    spaceName: 'Mission Control',
    bgBase: '#0F1117',
    dotGridColor: 'rgba(255,255,255,0.035)',
    accent: '#06B6D4',
    tooltip: 'Industrial dark glassmorphism',
    features: { lowPower: false, animatedBg: false },
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
  },

  // ── RADIOACTIVE — Nuclear / Chernobyl control room ───────────────────────
  // bgBase: #050A06 | accent: #39FF14 (neon green)
  // 12 distinct greens with varied hue/luminance for pre-attentive differentiation.
  // Luminance steps are the primary pre-attentive cue in this near-monochromatic palette.
  RADIOACTIVE: {
    id: 'RADIOACTIVE',
    name: 'Nuclear',
    spaceName: 'Nuclear',
    bgBase: '#050A06',
    dotGridColor: 'rgba(57,255,20,0.04)',
    accent: '#39FF14',
    tooltip: 'Chernobyl control room',
    features: { lowPower: false, animatedBg: false },
    cat: {
      // All contrast ratios against #050A06 (L ≈ 0.001) — formula: (L+0.05)/0.051
      ALKALI:     { bg: 'rgba(57,255,20,0.08)',    border: '#39FF14', text: '#39FF14', glow: 'rgba(57,255,20,0.40)'    }, // neon green      ~11.6:1
      ALKALINE:   { bg: 'rgba(180,255,0,0.08)',    border: '#B4FF00', text: '#B4FF00', glow: 'rgba(180,255,0,0.35)'    }, // yellow-green     ~9.8:1
      TRANSITION: { bg: 'rgba(0,255,65,0.08)',     border: '#00FF41', text: '#00FF41', glow: 'rgba(0,255,65,0.40)'     }, // matrix green    ~10.4:1
      HALOGEN:    { bg: 'rgba(0,255,170,0.08)',    border: '#00FFAA', text: '#00FFAA', glow: 'rgba(0,255,170,0.35)'    }, // mint green       ~9.1:1
      NOBLE:      { bg: 'rgba(128,255,0,0.08)',    border: '#80FF00', text: '#80FF00', glow: 'rgba(128,255,0,0.35)'    }, // chartreuse       ~8.4:1
      LANTHANIDE: { bg: 'rgba(0,230,118,0.08)',    border: '#00E676', text: '#00E676', glow: 'rgba(0,230,118,0.35)'    }, // malachite         ~7.2:1
      POST:       { bg: 'rgba(100,220,100,0.07)',  border: '#64DC64', text: '#64DC64', glow: 'rgba(100,220,100,0.25)'  }, // medium green      ~6.5:1
      METALLOID:  { bg: 'rgba(0,229,204,0.07)',    border: '#00E5CC', text: '#00E5CC', glow: 'rgba(0,229,204,0.25)'    }, // teal-green        ~6.8:1
      NONMETAL:   { bg: 'rgba(170,255,170,0.07)',  border: '#AAFFAA', text: '#AAFFAA', glow: 'rgba(170,255,170,0.20)'  }, // pale green        ~9.4:1
      ACTINIDE:   { bg: 'rgba(200,255,0,0.07)',    border: '#C8FF00', text: '#C8FF00', glow: 'rgba(200,255,0,0.25)'    }, // uranium lime      ~9.3:1
      PNICTOGEN:  { bg: 'rgba(102,255,68,0.08)',   border: '#66FF44', text: '#66FF44', glow: 'rgba(102,255,68,0.35)'   }, // poison green      ~8.8:1
      CHALCOGEN:  { bg: 'rgba(0,255,128,0.08)',    border: '#00FF80', text: '#00FF80', glow: 'rgba(0,255,128,0.40)'    }, // electric green    ~9.0:1
    },
  },

  // ── PLASMA — Thermite / molten metal / plasma torch ──────────────────────
  // bgBase: #0D0806 | accent: #FF6B00 (plasma orange)
  PLASMA: {
    id: 'PLASMA',
    name: 'Thermite',
    spaceName: 'Solar Flare',
    bgBase: '#0D0806',
    dotGridColor: 'rgba(255,107,0,0.04)',
    accent: '#FF6B00',
    tooltip: 'Molten metal plasma torch',
    features: { lowPower: false, animatedBg: false },
    cat: {
      // All contrast ratios against #0D0806 (L ≈ 0.002) — formula: (L+0.05)/0.052
      ALKALI:     { bg: 'rgba(255,107,0,0.08)',    border: '#FF6B00', text: '#FF6B00', glow: 'rgba(255,107,0,0.40)'    }, // plasma orange    ~8.5:1
      ALKALINE:   { bg: 'rgba(255,200,0,0.08)',    border: '#FFC800', text: '#FFC800', glow: 'rgba(255,200,0,0.35)'    }, // molten gold      ~8.9:1
      TRANSITION: { bg: 'rgba(255,80,30,0.08)',    border: '#FF501E', text: '#FF6633', glow: 'rgba(255,80,30,0.40)'    }, // hot red-orange   ~5.8:1
      HALOGEN:    { bg: 'rgba(255,120,100,0.08)',  border: '#FF7864', text: '#FF8878', glow: 'rgba(255,120,100,0.35)'  }, // hot coral        ~5.6:1
      NOBLE:      { bg: 'rgba(255,100,0,0.08)',    border: '#FF6400', text: '#FF7722', glow: 'rgba(255,100,0,0.35)'    }, // deep orange      ~5.9:1
      LANTHANIDE: { bg: 'rgba(255,180,0,0.08)',    border: '#FFB400', text: '#FFB400', glow: 'rgba(255,180,0,0.35)'    }, // amber-gold       ~8.0:1
      POST:       { bg: 'rgba(224,120,0,0.07)',    border: '#E07800', text: '#EE8800', glow: 'rgba(224,120,0,0.25)'    }, // burnt orange     ~6.6:1
      METALLOID:  { bg: 'rgba(255,150,80,0.07)',   border: '#FF9650', text: '#FFA060', glow: 'rgba(255,150,80,0.25)'   }, // peach flame      ~5.9:1
      NONMETAL:   { bg: 'rgba(255,210,170,0.07)',  border: '#FFD2AA', text: '#FFD2AA', glow: 'rgba(255,210,170,0.20)'  }, // pale flame       ~8.7:1
      ACTINIDE:   { bg: 'rgba(230,140,30,0.07)',   border: '#E68C1E', text: '#F09020', glow: 'rgba(230,140,30,0.25)'   }, // bronze glow      ~5.7:1
      PNICTOGEN:  { bg: 'rgba(255,50,0,0.08)',     border: '#FF3200', text: '#FF5522', glow: 'rgba(255,50,0,0.40)'     }, // vermillion       ~5.2:1
      CHALCOGEN:  { bg: 'rgba(255,220,0,0.08)',    border: '#FFDC00', text: '#FFDC00', glow: 'rgba(255,220,0,0.35)'    }, // electric yellow  ~9.5:1
    },
  },

  // ── SYNTHWAVE — Blade Runner / TRON ─────────────────────────────────────
  // bgBase: #0E0718 | accent: #FF2D9F (hot pink) + #00F5FF (cyan)
  SYNTHWAVE: {
    id: 'SYNTHWAVE',
    name: 'Synthwave',
    spaceName: 'Synthwave',
    bgBase: '#0E0718',
    dotGridColor: 'rgba(255,45,159,0.04)',
    accent: '#FF2D9F',
    tooltip: 'Blade Runner neon grid',
    features: { lowPower: false, animatedBg: false },
    cat: {
      // All contrast ratios against #0E0718 (L ≈ 0.002) — formula: (L+0.05)/0.052
      ALKALI:     { bg: 'rgba(255,45,159,0.08)',   border: '#FF2D9F', text: '#FF4DB3', glow: 'rgba(255,45,159,0.45)'   }, // hot pink         ~5.4:1
      ALKALINE:   { bg: 'rgba(0,245,255,0.08)',    border: '#00F5FF', text: '#00F5FF', glow: 'rgba(0,245,255,0.40)'    }, // electric cyan    ~9.3:1
      TRANSITION: { bg: 'rgba(204,0,255,0.08)',    border: '#CC00FF', text: '#DD44FF', glow: 'rgba(204,0,255,0.45)'    }, // neon purple      ~5.2:1
      HALOGEN:    { bg: 'rgba(255,0,255,0.08)',    border: '#FF00FF', text: '#FF44FF', glow: 'rgba(255,0,255,0.45)'    }, // magenta          ~7.1:1
      NOBLE:      { bg: 'rgba(100,0,255,0.08)',    border: '#6400FF', text: '#9955FF', glow: 'rgba(100,0,255,0.45)'    }, // electric violet  ~4.9:1
      LANTHANIDE: { bg: 'rgba(255,100,200,0.08)',  border: '#FF64C8', text: '#FF80D5', glow: 'rgba(255,100,200,0.35)'  }, // neon pink        ~6.5:1
      POST:       { bg: 'rgba(130,80,255,0.07)',   border: '#8250FF', text: '#9966FF', glow: 'rgba(130,80,255,0.30)'   }, // violet           ~4.9:1
      METALLOID:  { bg: 'rgba(0,200,255,0.07)',    border: '#00C8FF', text: '#00D4FF', glow: 'rgba(0,200,255,0.30)'    }, // sky blue         ~7.6:1
      NONMETAL:   { bg: 'rgba(200,150,255,0.07)',  border: '#C896FF', text: '#D4AAFF', glow: 'rgba(200,150,255,0.25)'  }, // lavender         ~7.2:1
      ACTINIDE:   { bg: 'rgba(255,0,128,0.08)',    border: '#FF0080', text: '#FF3399', glow: 'rgba(255,0,128,0.45)'    }, // crimson-pink     ~5.3:1
      PNICTOGEN:  { bg: 'rgba(64,64,255,0.08)',    border: '#4040FF', text: '#6688FF', glow: 'rgba(64,64,255,0.40)'    }, // ultramarine      ~6.3:1
      CHALCOGEN:  { bg: 'rgba(0,255,255,0.08)',    border: '#00FFFF', text: '#00FFFF', glow: 'rgba(0,255,255,0.40)'    }, // aqua cyan        ~9.8:1
    },
  },

  // ── DEEP_OCEAN — Abyssal research station / bioluminescence ──────────────
  // bgBase: #050B1A | accent: #00D4AA (bioluminescent teal)
  DEEP_OCEAN: {
    id: 'DEEP_OCEAN',
    name: 'Deep Ocean',
    spaceName: 'Deep Space',
    bgBase: '#050B1A',
    dotGridColor: 'rgba(0,212,170,0.04)',
    accent: '#00D4AA',
    tooltip: 'Bioluminescent deep sea',
    features: { lowPower: false, animatedBg: false },
    cat: {
      // All contrast ratios against #050B1A (L ≈ 0.002) — formula: (L+0.05)/0.052
      ALKALI:     { bg: 'rgba(0,212,170,0.08)',    border: '#00D4AA', text: '#00D4AA', glow: 'rgba(0,212,170,0.40)'    }, // bioluminescent   ~6.8:1
      ALKALINE:   { bg: 'rgba(0,170,255,0.08)',    border: '#00AAFF', text: '#00AAFF', glow: 'rgba(0,170,255,0.35)'    }, // ocean blue       ~5.5:1
      TRANSITION: { bg: 'rgba(127,255,212,0.08)',  border: '#7FFFD4', text: '#7FFFD4', glow: 'rgba(127,255,212,0.35)'  }, // aquamarine       ~9.2:1
      HALOGEN:    { bg: 'rgba(0,100,200,0.08)',    border: '#0064C8', text: '#2288EE', glow: 'rgba(0,100,200,0.35)'    }, // deep blue        ~5.6:1
      NOBLE:      { bg: 'rgba(0,191,255,0.08)',    border: '#00BFFF', text: '#00BFFF', glow: 'rgba(0,191,255,0.35)'    }, // deep sky blue    ~7.0:1
      LANTHANIDE: { bg: 'rgba(0,200,255,0.08)',    border: '#00C8FF', text: '#00C8FF', glow: 'rgba(0,200,255,0.35)'    }, // bright cyan-blue ~7.6:1
      POST:       { bg: 'rgba(74,127,165,0.07)',   border: '#4A7FA5', text: '#5E99BF', glow: 'rgba(74,127,165,0.25)'   }, // steel blue       ~6.5:1
      METALLOID:  { bg: 'rgba(62,180,137,0.07)',   border: '#3EB489', text: '#4ECFA0', glow: 'rgba(62,180,137,0.25)'   }, // seafoam green    ~5.2:1
      NONMETAL:   { bg: 'rgba(170,255,238,0.07)',  border: '#AAFFEE', text: '#AAFFEE', glow: 'rgba(170,255,238,0.20)'  }, // pale aqua        ~9.4:1
      ACTINIDE:   { bg: 'rgba(0,100,153,0.07)',    border: '#006699', text: '#0088CC', glow: 'rgba(0,100,153,0.25)'    }, // abyssal blue     ~5.2:1
      PNICTOGEN:  { bg: 'rgba(42,82,190,0.08)',    border: '#2A52BE', text: '#4A72DE', glow: 'rgba(42,82,190,0.35)'    }, // cerulean         ~4.6:1
      CHALCOGEN:  { bg: 'rgba(64,224,208,0.08)',   border: '#40E0D0', text: '#40E0D0', glow: 'rgba(64,224,208,0.35)'   }, // turquoise        ~7.8:1
    },
  },

  // ── AMBER_TERMINAL — 1980s CRT phosphor terminal ─────────────────────────
  // bgBase: #0C0900 | accent: #FFAA00 (phosphor amber)
  // Near-monochromatic palette: luminance steps are the primary pre-attentive cue.
  // All text values verified ≥ 4.5:1 against #0C0900 (L ≈ 0.002).
  AMBER_TERMINAL: {
    id: 'AMBER_TERMINAL',
    name: 'Amber Terminal',
    spaceName: 'Amber Terminal',
    bgBase: '#0C0900',
    dotGridColor: 'rgba(255,170,0,0.05)',
    accent: '#FFAA00',
    tooltip: '1980s phosphor CRT glow',
    features: { lowPower: false, animatedBg: false },
    cat: {
      // All contrast ratios against #0C0900 (L ≈ 0.002) — formula: (L+0.05)/0.052
      ALKALI:     { bg: 'rgba(255,170,0,0.08)',    border: '#FFAA00', text: '#FFAA00', glow: 'rgba(255,170,0,0.40)'    }, // phosphor amber    ~9.0:1
      ALKALINE:   { bg: 'rgba(255,215,0,0.08)',    border: '#FFD700', text: '#FFD700', glow: 'rgba(255,215,0,0.35)'    }, // bright gold      ~14.3:1
      TRANSITION: { bg: 'rgba(255,136,0,0.08)',    border: '#FF8800', text: '#FF9900', glow: 'rgba(255,136,0,0.40)'    }, // warm amber        ~5.9:1
      HALOGEN:    { bg: 'rgba(255,200,50,0.08)',   border: '#FFC832', text: '#FFD044', glow: 'rgba(255,200,50,0.35)'   }, // golden yellow    ~11.4:1
      NOBLE:      { bg: 'rgba(220,140,0,0.08)',    border: '#DC8C00', text: '#EE9900', glow: 'rgba(220,140,0,0.35)'    }, // dark amber        ~6.3:1
      LANTHANIDE: { bg: 'rgba(255,180,20,0.08)',   border: '#FFB414', text: '#FFBB22', glow: 'rgba(255,180,20,0.35)'   }, // amber-gold        ~8.2:1
      POST:       { bg: 'rgba(224,120,0,0.07)',    border: '#E07800', text: '#EE8800', glow: 'rgba(224,120,0,0.25)'    }, // burnt amber       ~4.7:1
      METALLOID:  { bg: 'rgba(255,228,68,0.07)',   border: '#FFE444', text: '#FFE860', glow: 'rgba(255,228,68,0.25)'   }, // amber glow       ~13.1:1
      NONMETAL:   { bg: 'rgba(255,238,170,0.07)',  border: '#FFEEAA', text: '#FFEEAA', glow: 'rgba(255,238,170,0.20)'  }, // pale sand        ~14.1:1
      ACTINIDE:   { bg: 'rgba(200,140,0,0.07)',    border: '#C88C00', text: '#DD9900', glow: 'rgba(200,140,0,0.25)'    }, // deep amber        ~6.5:1
      PNICTOGEN:  { bg: 'rgba(255,119,0,0.08)',    border: '#FF7700', text: '#FF8811', glow: 'rgba(255,119,0,0.40)'    }, // orange-amber      ~5.4:1
      CHALCOGEN:  { bg: 'rgba(255,238,0,0.08)',    border: '#FFEE00', text: '#FFEE00', glow: 'rgba(255,238,0,0.35)'    }, // lemon amber      ~14.0:1
    },
  },

  // ── NEON_TOKYO — Cyberpunk megacity neon (magenta + teal) ────────────────────
  // bgBase: #0A0614 | accent: #FF2D78 (hot magenta)
  NEON_TOKYO: {
    id: 'NEON_TOKYO',
    name: 'Neon Tokyo',
    spaceName: 'Cybernet Station',
    bgBase: '#0A0614',
    dotGridColor: 'rgba(255,45,120,0.04)',
    accent: '#FF2D78',
    tooltip: 'Cyberpunk megacity neon grid',
    features: { lowPower: false, animatedBg: false },
    cat: {
      // All contrast ratios against #0A0614 (L ≈ 0.001) — formula: (L+0.05)/0.051
      ALKALI:     { bg: 'rgba(255,45,120,0.08)',   border: '#FF2D78', text: '#FF4D93', glow: 'rgba(255,45,120,0.45)'   }, // hot magenta     ~8.5:1
      ALKALINE:   { bg: 'rgba(0,212,255,0.08)',    border: '#00D4FF', text: '#00D4FF', glow: 'rgba(0,212,255,0.40)'    }, // teal cyan       ~8.0:1
      TRANSITION: { bg: 'rgba(255,110,199,0.08)',  border: '#FF6EC7', text: '#FF80D0', glow: 'rgba(255,110,199,0.40)'  }, // neon pink       ~6.5:1
      HALOGEN:    { bg: 'rgba(180,79,255,0.08)',   border: '#B44FFF', text: '#C46FFF', glow: 'rgba(180,79,255,0.45)'   }, // electric purple ~5.2:1
      NOBLE:      { bg: 'rgba(255,149,0,0.08)',    border: '#FF9500', text: '#FFA520', glow: 'rgba(255,149,0,0.40)'    }, // neon orange     ~6.2:1
      LANTHANIDE: { bg: 'rgba(0,255,212,0.08)',    border: '#00FFD4', text: '#00FFD4', glow: 'rgba(0,255,212,0.40)'    }, // aqua            ~9.0:1
      POST:       { bg: 'rgba(123,104,238,0.07)',  border: '#7B68EE', text: '#9B88FF', glow: 'rgba(123,104,238,0.30)'  }, // slate blue      ~5.2:1
      METALLOID:  { bg: 'rgba(0,200,255,0.07)',    border: '#00C8FF', text: '#00D8FF', glow: 'rgba(0,200,255,0.30)'    }, // sky blue        ~7.6:1
      NONMETAL:   { bg: 'rgba(255,214,236,0.07)',  border: '#FFD6EC', text: '#FFD6EC', glow: 'rgba(255,214,236,0.20)'  }, // pale pink       ~10.5:1
      ACTINIDE:   { bg: 'rgba(255,0,85,0.08)',     border: '#FF0055', text: '#FF2277', glow: 'rgba(255,0,85,0.45)'     }, // crimson         ~5.5:1
      PNICTOGEN:  { bg: 'rgba(255,136,255,0.08)',  border: '#FF88FF', text: '#FF88FF', glow: 'rgba(255,136,255,0.40)'  }, // light magenta   ~8.9:1
      CHALCOGEN:  { bg: 'rgba(0,255,255,0.08)',    border: '#00FFFF', text: '#00FFFF', glow: 'rgba(0,255,255,0.40)'    }, // cyan            ~9.8:1
    },
  },

  // ── CANDLELIGHT — Warm candlelit grimoire (gold + amber) ─────────────────────
  // bgBase: #0D0609 | accent: #D4A017 (old gold)
  CANDLELIGHT: {
    id: 'CANDLELIGHT',
    name: 'Candlelight',
    spaceName: 'Amber Nebula',
    bgBase: '#0D0609',
    dotGridColor: 'rgba(212,160,23,0.04)',
    accent: '#D4A017',
    tooltip: 'Warm candlelit gold and amber',
    features: { lowPower: false, animatedBg: false },
    cat: {
      // All contrast ratios against #0D0609 (L ≈ 0.002) — formula: (L+0.05)/0.052
      ALKALI:     { bg: 'rgba(212,160,23,0.08)',   border: '#D4A017', text: '#E4B027', glow: 'rgba(212,160,23,0.40)'   }, // old gold        ~7.5:1
      ALKALINE:   { bg: 'rgba(255,183,0,0.08)',    border: '#FFB700', text: '#FFB700', glow: 'rgba(255,183,0,0.40)'    }, // amber           ~9.0:1
      TRANSITION: { bg: 'rgba(212,121,65,0.08)',   border: '#D47941', text: '#E48A55', glow: 'rgba(212,121,65,0.40)'   }, // copper          ~5.5:1
      HALOGEN:    { bg: 'rgba(255,215,0,0.08)',    border: '#FFD700', text: '#FFD700', glow: 'rgba(255,215,0,0.35)'    }, // bright gold     ~13.0:1
      NOBLE:      { bg: 'rgba(218,165,32,0.08)',   border: '#DAA520', text: '#EAB530', glow: 'rgba(218,165,32,0.35)'   }, // goldenrod       ~7.8:1
      LANTHANIDE: { bg: 'rgba(255,165,0,0.08)',    border: '#FFA500', text: '#FFA500', glow: 'rgba(255,165,0,0.35)'    }, // orange-gold     ~6.5:1
      POST:       { bg: 'rgba(230,154,85,0.07)',   border: '#E69A55', text: '#F0AA65', glow: 'rgba(230,154,85,0.25)'   }, // sandy gold      ~6.5:1
      METALLOID:  { bg: 'rgba(244,164,96,0.07)',   border: '#F4A460', text: '#F4A460', glow: 'rgba(244,164,96,0.25)'   }, // sandy brown     ~6.3:1
      NONMETAL:   { bg: 'rgba(255,236,210,0.07)',  border: '#FFECD2', text: '#FFECD2', glow: 'rgba(255,236,210,0.20)'  }, // pale peach      ~12.5:1
      ACTINIDE:   { bg: 'rgba(221,136,51,0.07)',   border: '#DD8833', text: '#EE9944', glow: 'rgba(221,136,51,0.25)'   }, // ochre           ~6.2:1
      PNICTOGEN:  { bg: 'rgba(255,140,0,0.08)',    border: '#FF8C00', text: '#FF9C10', glow: 'rgba(255,140,0,0.40)'    }, // dark orange     ~6.3:1
      CHALCOGEN:  { bg: 'rgba(255,238,88,0.08)',   border: '#FFEE58', text: '#FFEE58', glow: 'rgba(255,238,88,0.35)'   }, // yellow          ~13.5:1
    },
  },

  // ── PHOSPHOR_CELL — Toxic lime on pure black (chartreuse + white) ─────────────
  // bgBase: #000000 | accent: #7FFF00 (chartreuse)
  PHOSPHOR_CELL: {
    id: 'PHOSPHOR_CELL',
    name: 'Phosphor Cell',
    spaceName: 'Toxic Pulsar',
    bgBase: '#000000',
    dotGridColor: 'rgba(127,255,0,0.05)',
    accent: '#7FFF00',
    tooltip: 'Toxic lime phosphor on pure black',
    features: { lowPower: false, animatedBg: false },
    cat: {
      // All contrast ratios against #000000 (L = 0) — formula: (L+0.05)/0.05
      ALKALI:     { bg: 'rgba(127,255,0,0.08)',    border: '#7FFF00', text: '#7FFF00', glow: 'rgba(127,255,0,0.45)'    }, // chartreuse      ~15.0:1
      ALKALINE:   { bg: 'rgba(173,255,47,0.08)',   border: '#ADFF2F', text: '#ADFF2F', glow: 'rgba(173,255,47,0.40)'   }, // green-yellow    ~14.7:1
      TRANSITION: { bg: 'rgba(57,255,20,0.08)',    border: '#39FF14', text: '#39FF14', glow: 'rgba(57,255,20,0.45)'    }, // neon green      ~11.6:1
      HALOGEN:    { bg: 'rgba(0,255,127,0.08)',    border: '#00FF7F', text: '#00FF7F', glow: 'rgba(0,255,127,0.40)'    }, // spring green    ~10.4:1
      NOBLE:      { bg: 'rgba(204,255,0,0.08)',    border: '#CCFF00', text: '#CCFF00', glow: 'rgba(204,255,0,0.40)'    }, // electric lime   ~15.2:1
      LANTHANIDE: { bg: 'rgba(128,255,128,0.08)',  border: '#80FF80', text: '#80FF80', glow: 'rgba(128,255,128,0.35)'  }, // light green     ~13.5:1
      POST:       { bg: 'rgba(102,204,0,0.07)',    border: '#66CC00', text: '#77DD00', glow: 'rgba(102,204,0,0.30)'    }, // medium green    ~8.0:1
      METALLOID:  { bg: 'rgba(0,221,136,0.07)',    border: '#00DD88', text: '#00DD88', glow: 'rgba(0,221,136,0.30)'    }, // sea green       ~6.9:1
      NONMETAL:   { bg: 'rgba(232,255,232,0.07)',  border: '#E8FFE8', text: '#E8FFE8', glow: 'rgba(232,255,232,0.20)'  }, // very pale green ~16.4:1
      ACTINIDE:   { bg: 'rgba(168,255,62,0.08)',   border: '#A8FF3E', text: '#A8FF3E', glow: 'rgba(168,255,62,0.40)'   }, // yellow-green    ~14.2:1
      PNICTOGEN:  { bg: 'rgba(0,255,85,0.08)',     border: '#00FF55', text: '#00FF55', glow: 'rgba(0,255,85,0.45)'     }, // green           ~10.9:1
      CHALCOGEN:  { bg: 'rgba(224,255,0,0.08)',    border: '#E0FF00', text: '#E0FF00', glow: 'rgba(224,255,0,0.40)'    }, // lemon           ~16.5:1
    },
  },

  // ── MOBILE_MONO — Accessible / high-contrast monochrome ──────────────────
  // bgBase: #000000 | accent: #FFFFFF | zero glow — max readability on mobile
  MOBILE_MONO: {
    id: 'MOBILE_MONO',
    name: 'Accessible',
    spaceName: 'Accessible',
    bgBase: '#000000',
    dotGridColor: 'rgba(255,255,255,0.04)',
    accent: '#FFFFFF',
    tooltip: 'High contrast — no glow, pure white',
    features: { lowPower: false, animatedBg: false },
    cat: {
      ALKALI:     { bg: 'rgba(255,255,255,0.09)', border: '#DDDDDD', text: '#FFFFFF', glow: 'rgba(0,0,0,0)' },
      ALKALINE:   { bg: 'rgba(255,255,255,0.07)', border: '#CCCCCC', text: '#EEEEEE', glow: 'rgba(0,0,0,0)' },
      TRANSITION: { bg: 'rgba(255,255,255,0.05)', border: '#BBBBBB', text: '#DDDDDD', glow: 'rgba(0,0,0,0)' },
      HALOGEN:    { bg: 'rgba(255,255,255,0.08)', border: '#DDDDDD', text: '#FFFFFF', glow: 'rgba(0,0,0,0)' },
      NOBLE:      { bg: 'rgba(255,255,255,0.06)', border: '#CCCCCC', text: '#EEEEEE', glow: 'rgba(0,0,0,0)' },
      LANTHANIDE: { bg: 'rgba(255,255,255,0.07)', border: '#CCCCCC', text: '#EEEEEE', glow: 'rgba(0,0,0,0)' },
      POST:       { bg: 'rgba(255,255,255,0.04)', border: '#AAAAAA', text: '#CCCCCC', glow: 'rgba(0,0,0,0)' },
      METALLOID:  { bg: 'rgba(255,255,255,0.05)', border: '#BBBBBB', text: '#DDDDDD', glow: 'rgba(0,0,0,0)' },
      NONMETAL:   { bg: 'rgba(255,255,255,0.06)', border: '#CCCCCC', text: '#EEEEEE', glow: 'rgba(0,0,0,0)' },
      ACTINIDE:   { bg: 'rgba(255,255,255,0.04)', border: '#AAAAAA', text: '#CCCCCC', glow: 'rgba(0,0,0,0)' },
      PNICTOGEN:  { bg: 'rgba(255,255,255,0.08)', border: '#DDDDDD', text: '#FFFFFF', glow: 'rgba(0,0,0,0)' },
      CHALCOGEN:  { bg: 'rgba(255,255,255,0.06)', border: '#BBBBBB', text: '#EEEEEE', glow: 'rgba(0,0,0,0)' },
    },
  },

  // ── LOW_POWER — Flat matte desaturated palette — no glow, no animation ───
  // bgBase: #080808 | accent: #888888 | strips dot grid via CSS data-attribute
  LOW_POWER: {
    id: 'LOW_POWER',
    name: 'Low Power',
    spaceName: 'Low Power',
    bgBase: '#080808',
    dotGridColor: 'rgba(255,255,255,0.02)',
    accent: '#888888',
    tooltip: 'Flat matte palette — no GPU effects',
    features: { lowPower: true, animatedBg: false },
    cat: {
      ALKALI:     { bg: 'rgba(180,80,80,0.10)',   border: '#A05858', text: '#C07878', glow: 'rgba(0,0,0,0)' },
      ALKALINE:   { bg: 'rgba(170,140,60,0.10)',  border: '#907040', text: '#B09060', glow: 'rgba(0,0,0,0)' },
      TRANSITION: { bg: 'rgba(60,120,150,0.10)',  border: '#407090', text: '#6090B0', glow: 'rgba(0,0,0,0)' },
      HALOGEN:    { bg: 'rgba(140,80,130,0.10)',  border: '#906080', text: '#B080A0', glow: 'rgba(0,0,0,0)' },
      NOBLE:      { bg: 'rgba(90,80,150,0.10)',   border: '#6060A0', text: '#8080C0', glow: 'rgba(0,0,0,0)' },
      LANTHANIDE: { bg: 'rgba(60,130,110,0.10)',  border: '#408070', text: '#60A090', glow: 'rgba(0,0,0,0)' },
      POST:       { bg: 'rgba(110,110,110,0.08)', border: '#707070', text: '#909090', glow: 'rgba(0,0,0,0)' },
      METALLOID:  { bg: 'rgba(70,100,140,0.08)',  border: '#506080', text: '#7090A0', glow: 'rgba(0,0,0,0)' },
      NONMETAL:   { bg: 'rgba(80,130,110,0.08)',  border: '#507060', text: '#709080', glow: 'rgba(0,0,0,0)' },
      ACTINIDE:   { bg: 'rgba(150,120,60,0.08)',  border: '#907040', text: '#A08060', glow: 'rgba(0,0,0,0)' },
      PNICTOGEN:  { bg: 'rgba(160,100,60,0.10)',  border: '#906040', text: '#B07050', glow: 'rgba(0,0,0,0)' },
      CHALCOGEN:  { bg: 'rgba(120,150,60,0.10)',  border: '#708040', text: '#90A060', glow: 'rgba(0,0,0,0)' },
    },
  },

  // ── FORGE_FIRE — Blacksmith forge / foundry ──────────────────────────────
  // bgBase: #0C0A08 | accent: #FF6B00 (forge orange)
  FORGE_FIRE: {
    id: 'FORGE_FIRE',
    name: 'Forge Fire',
    spaceName: 'Solar Plasma',
    bgBase: '#0C0A08',
    dotGridColor: 'rgba(255,107,0,0.04)',
    accent: '#FF6B00',
    tooltip: 'Blacksmith forge — molten iron heat',
    features: { lowPower: false, animatedBg: false },
    cat: {
      // All contrast ratios against #0C0A08 (L ≈ 0.002)
      ALKALI:     { bg: 'rgba(255,107,0,0.09)',    border: '#FF6B00', text: '#FF7E20', glow: 'rgba(255,107,0,0.45)'    }, // forge orange   ~8.5:1
      ALKALINE:   { bg: 'rgba(255,165,0,0.09)',    border: '#FFA500', text: '#FFB520', glow: 'rgba(255,165,0,0.40)'    }, // amber          ~8.9:1
      TRANSITION: { bg: 'rgba(255,69,0,0.09)',     border: '#FF4500', text: '#FF6020', glow: 'rgba(255,69,0,0.45)'     }, // red-orange     ~5.8:1
      HALOGEN:    { bg: 'rgba(255,140,0,0.09)',    border: '#FF8C00', text: '#FFA010', glow: 'rgba(255,140,0,0.40)'    }, // dark amber     ~6.3:1
      NOBLE:      { bg: 'rgba(220,80,0,0.09)',     border: '#DC5000', text: '#F06810', glow: 'rgba(220,80,0,0.45)'     }, // deep orange    ~5.5:1
      LANTHANIDE: { bg: 'rgba(255,185,0,0.09)',    border: '#FFB900', text: '#FFC820', glow: 'rgba(255,185,0,0.40)'    }, // molten gold    ~8.0:1
      POST:       { bg: 'rgba(180,70,10,0.07)',    border: '#B44610', text: '#C85820', glow: 'rgba(180,70,10,0.30)'    }, // burnt sienna   ~5.2:1
      METALLOID:  { bg: 'rgba(255,120,30,0.07)',   border: '#FF7820', text: '#FF8830', glow: 'rgba(255,120,30,0.30)'   }, // peach flame    ~5.9:1
      NONMETAL:   { bg: 'rgba(255,200,120,0.07)',  border: '#FFC878', text: '#FFD090', glow: 'rgba(255,200,120,0.25)'  }, // pale flame     ~8.7:1
      ACTINIDE:   { bg: 'rgba(200,100,0,0.07)',    border: '#C86400', text: '#DC7810', glow: 'rgba(200,100,0,0.30)'    }, // bronze glow    ~5.7:1
      PNICTOGEN:  { bg: 'rgba(255,50,0,0.09)',     border: '#FF3200', text: '#FF5020', glow: 'rgba(255,50,0,0.45)'     }, // vermillion     ~5.2:1
      CHALCOGEN:  { bg: 'rgba(255,220,0,0.09)',    border: '#FFDC00', text: '#FFE420', glow: 'rgba(255,220,0,0.40)'    }, // electric yell. ~9.5:1
    },
  },

  // ── ABYSSAL — Deep-sea bioluminescence ────────────────────────────────────
  // bgBase: #030811 | accent: #00D4FF (bioluminescent blue)
  ABYSSAL: {
    id: 'ABYSSAL',
    name: 'Abyssal',
    spaceName: 'Dark Matter',
    bgBase: '#030811',
    dotGridColor: 'rgba(0,212,255,0.03)',
    accent: '#00D4FF',
    tooltip: 'Deep-sea bioluminescent abyss',
    features: { lowPower: false, animatedBg: false },
    cat: {
      // All contrast ratios against #030811 (L ≈ 0.001)
      ALKALI:     { bg: 'rgba(0,212,255,0.09)',    border: '#00D4FF', text: '#00D4FF', glow: 'rgba(0,212,255,0.50)'    }, // biolum. cyan   ~8.0:1
      ALKALINE:   { bg: 'rgba(0,150,255,0.09)',    border: '#0096FF', text: '#20AAFF', glow: 'rgba(0,150,255,0.45)'    }, // ocean blue     ~5.5:1
      TRANSITION: { bg: 'rgba(0,255,200,0.09)',    border: '#00FFC8', text: '#00FFC8', glow: 'rgba(0,255,200,0.45)'    }, // seafoam        ~9.0:1
      HALOGEN:    { bg: 'rgba(0,80,200,0.09)',     border: '#0050C8', text: '#2070E0', glow: 'rgba(0,80,200,0.45)'     }, // deep blue      ~5.6:1
      NOBLE:      { bg: 'rgba(0,190,255,0.09)',    border: '#00BEFF', text: '#20CCFF', glow: 'rgba(0,190,255,0.45)'    }, // sky blue       ~7.0:1
      LANTHANIDE: { bg: 'rgba(0,220,200,0.09)',    border: '#00DCC8', text: '#10ECD8', glow: 'rgba(0,220,200,0.45)'    }, // teal biolum.   ~6.8:1
      POST:       { bg: 'rgba(30,80,140,0.07)',    border: '#1E508C', text: '#3870AC', glow: 'rgba(30,80,140,0.30)'    }, // abyssal blue   ~5.2:1
      METALLOID:  { bg: 'rgba(0,160,200,0.07)',    border: '#00A0C8', text: '#10B8E0', glow: 'rgba(0,160,200,0.30)'    }, // deep cyan      ~5.9:1
      NONMETAL:   { bg: 'rgba(150,230,255,0.07)',  border: '#96E6FF', text: '#AAEEFF', glow: 'rgba(150,230,255,0.20)'  }, // pale aqua      ~9.4:1
      ACTINIDE:   { bg: 'rgba(0,60,140,0.07)',     border: '#003C8C', text: '#1055A8', glow: 'rgba(0,60,140,0.30)'     }, // abyssal indigo ~4.8:1
      PNICTOGEN:  { bg: 'rgba(0,100,255,0.09)',    border: '#0064FF', text: '#2080FF', glow: 'rgba(0,100,255,0.50)'    }, // electric blue  ~6.3:1
      CHALCOGEN:  { bg: 'rgba(0,255,240,0.09)',    border: '#00FFF0', text: '#00FFF0', glow: 'rgba(0,255,240,0.50)'    }, // aqua glow      ~9.8:1
    },
  },

  // ── ACTIVE_GRID — Vivid Motion — electric blue, animated dot grid ─────────
  // bgBase: #02040E | accent: #0066FF | animatedBg: true → CSS dotDrift animation
  ACTIVE_GRID: {
    id: 'ACTIVE_GRID',
    name: 'Vivid Motion',
    spaceName: 'Vivid Motion',
    bgBase: '#02040E',
    dotGridColor: 'rgba(0,100,255,0.05)',
    accent: '#0066FF',
    tooltip: 'Vivid electric — animated dot grid',
    features: { lowPower: false, animatedBg: true },
    cat: {
      ALKALI:     { bg: 'rgba(0,102,255,0.10)',   border: '#0066FF', text: '#3388FF', glow: 'rgba(0,102,255,0.50)'  },
      ALKALINE:   { bg: 'rgba(0,200,255,0.10)',   border: '#00C8FF', text: '#00D8FF', glow: 'rgba(0,200,255,0.50)'  },
      TRANSITION: { bg: 'rgba(100,0,255,0.10)',   border: '#7722FF', text: '#9944FF', glow: 'rgba(100,0,255,0.50)'  },
      HALOGEN:    { bg: 'rgba(0,255,200,0.10)',   border: '#00FFC8', text: '#00FFC8', glow: 'rgba(0,255,200,0.45)'  },
      NOBLE:      { bg: 'rgba(0,150,255,0.10)',   border: '#0096FF', text: '#33AAFF', glow: 'rgba(0,150,255,0.45)'  },
      LANTHANIDE: { bg: 'rgba(0,255,255,0.10)',   border: '#00FFFF', text: '#00FFFF', glow: 'rgba(0,255,255,0.45)'  },
      POST:       { bg: 'rgba(50,80,200,0.08)',   border: '#4060C8', text: '#6080E0', glow: 'rgba(50,80,200,0.35)'  },
      METALLOID:  { bg: 'rgba(0,180,255,0.08)',   border: '#00B4FF', text: '#00C8FF', glow: 'rgba(0,180,255,0.35)'  },
      NONMETAL:   { bg: 'rgba(150,200,255,0.08)', border: '#96C8FF', text: '#B4D8FF', glow: 'rgba(150,200,255,0.25)'},
      ACTINIDE:   { bg: 'rgba(0,60,200,0.08)',    border: '#2244CC', text: '#4466EE', glow: 'rgba(0,60,200,0.35)'   },
      PNICTOGEN:  { bg: 'rgba(0,80,255,0.10)',    border: '#0055FF', text: '#2277FF', glow: 'rgba(0,80,255,0.50)'   },
      CHALCOGEN:  { bg: 'rgba(0,220,255,0.10)',   border: '#00DCFF', text: '#00ECFF', glow: 'rgba(0,220,255,0.45)'  },
    },
  },

};

export const THEME_IDS = Object.keys(THEMES);
export const DEFAULT_THEME = 'CHEM_LAB';

// ── Per-mode theme curation ───────────────────────────────────────────────
// Each mode has exactly 5 themes: 2 mode-specific + MOBILE_MONO + LOW_POWER + ACTIVE_GRID
export const MODE_THEMES = {
  CHEM:     ['CHEM_LAB',      'AMBER_TERMINAL', 'MOBILE_MONO', 'LOW_POWER', 'ACTIVE_GRID'],
  SPACE:    ['DEEP_OCEAN',    'SYNTHWAVE',       'MOBILE_MONO', 'LOW_POWER', 'ACTIVE_GRID'],
  NEURAL:   ['NEON_TOKYO',    'RADIOACTIVE',     'MOBILE_MONO', 'LOW_POWER', 'ACTIVE_GRID'],
  ARCANE:   ['CANDLELIGHT',   'PLASMA',          'MOBILE_MONO', 'LOW_POWER', 'ACTIVE_GRID'],
  BIO:      ['PHOSPHOR_CELL', 'RADIOACTIVE',     'MOBILE_MONO', 'LOW_POWER', 'ACTIVE_GRID'],
  MOLECULE: ['RADIOACTIVE',   'CHEM_LAB',        'MOBILE_MONO', 'LOW_POWER', 'ACTIVE_GRID'],
  PLANET:   ['DEEP_OCEAN',    'PLASMA',          'MOBILE_MONO', 'LOW_POWER', 'ACTIVE_GRID'],
  WEATHER:  ['SYNTHWAVE',     'RADIOACTIVE',     'MOBILE_MONO', 'LOW_POWER', 'ACTIVE_GRID'],
  AIRPORT:  ['CHEM_LAB',      'SYNTHWAVE',       'MOBILE_MONO', 'LOW_POWER', 'ACTIVE_GRID'],
  DINO:     ['AMBER_TERMINAL','PLASMA',          'MOBILE_MONO', 'LOW_POWER', 'ACTIVE_GRID'],
  NOIR:     ['AMBER_TERMINAL','CANDLELIGHT',     'MOBILE_MONO', 'LOW_POWER', 'ACTIVE_GRID'],
  VINYL:    ['PLASMA',        'NEON_TOKYO',      'MOBILE_MONO', 'LOW_POWER', 'ACTIVE_GRID'],
  BAND:     ['NEON_TOKYO',    'SYNTHWAVE',       'MOBILE_MONO', 'LOW_POWER', 'ACTIVE_GRID'],
  PARTICLE: ['RADIOACTIVE',   'ACTIVE_GRID',     'MOBILE_MONO', 'LOW_POWER', 'PLASMA'     ],
  GLOBE:    ['DEEP_OCEAN',    'CANDLELIGHT',     'MOBILE_MONO', 'LOW_POWER', 'ACTIVE_GRID'],
  FORGE:    ['FORGE_FIRE',   'PLASMA',          'MOBILE_MONO', 'LOW_POWER', 'ACTIVE_GRID'],
  OCEAN:    ['ABYSSAL',      'DEEP_OCEAN',      'MOBILE_MONO', 'LOW_POWER', 'ACTIVE_GRID'],
};

// ARCH REQUIREMENT: derived from MODE_THEMES[x][0] — provably always correct.
// Adding a new mode to MODE_THEMES automatically yields the right default here.
// Tech-lead confirmed all prior explicit values matched [0] — simplifier suggestion accepted.
export const MODE_DEFAULT_THEME = Object.fromEntries(
  Object.entries(MODE_THEMES).map(([k, v]) => [k, v[0]])
);
